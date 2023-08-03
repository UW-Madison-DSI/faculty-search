import logging
from functools import cache
import numpy as np
from sklearn.manifold import TSNE
from pymilvus import Collection
from langchain.embeddings import OpenAIEmbeddings


def sort_dict_by_value(d: dict, reversed: bool = False) -> tuple[list, list]:
    sorted_keys, sorted_values = [], []
    for k, v in sorted(d.items(), key=lambda item: item[1], reverse=reversed):
        sorted_keys.append(k)
        sorted_values.append(v)
    return sorted_keys, sorted_values


def convert_article_result(result) -> dict:
    """Convert an article result to proper distance and flatten."""

    flat_result = {}
    # CAUTION: result.distance is inner-product, i.e., similarity
    flat_result["distance"] = 1 - result.distance
    for field in ["title", "author_id", "doi"]:
        flat_result[field] = result.entity.get(field)
    return flat_result


def get_author(author_id: int | str, author_collection: Collection) -> dict:
    """Get author details from Milvus."""

    authors = author_collection.query(
        expr=f"id == {author_id}",
        output_fields=["first_name", "last_name"],
        limit=1,
    )

    if not authors:
        raise ValueError(f"Author with id {author_id} not found")
    return authors[0]


def get_authors_names(
    authors_ids: list[int], author_collection: Collection
) -> list[str]:
    """Get authors' names from their ids."""

    authors = author_collection.query(
        expr=f"id in {authors_ids}",
        output_fields=["first_name", "last_name", "id"],
    )

    # Sort by the original order of authors_ids
    authors = sorted(authors, key=lambda author: authors_ids.index(author["id"]))

    if len(authors) != len(authors_ids):
        raise ValueError(f"Not all authors ids can be found in {authors_ids}.")

    return [f"{author['first_name']} {author['last_name']}" for author in authors]


class PlotDataMaker:
    def __init__(
        self,
        author_collection: Collection,
        article_collection: Collection,
    ) -> None:
        self.author_collection = author_collection
        self.article_collection = article_collection

    def get_embeddings(self, dois: list[str]) -> tuple[list, list, list, np.array]:
        """Get embeddings of articles by their DOIs."""

        articles = self.article_collection.query(
            expr=f"doi in {dois}",
            output_fields=["doi", "author_id", "title", "embedding"],
        )
        logging.debug(f"{articles=}")

        # Sort articles by the original order of DOIs
        # TODO: Improve multiple authors handling
        articles = sorted(articles, key=lambda article: dois.index(article["doi"]))

        print(f"A: {len(articles)=}")
        articles_titles = [article["title"] for article in articles]

        print(f"B: {len(articles_titles)=}")

        # Unpack article embeddings
        articles_embeddings = np.stack(
            [article["embedding"] for article in articles], axis=0
        )
        print(f"C: {articles_embeddings.shape=}")

        # Calculate author's centroid
        author_embeddings = {}
        for article in articles:
            author_id = article["author_id"]
            if author_id not in author_embeddings:
                author_embeddings[author_id] = []
            author_embeddings[author_id].append(article["embedding"])

        author_ids = []
        author_vectors = []
        for author_id, embeddings in author_embeddings.items():
            author_ids.append(author_id)
            author_vectors.append(np.mean(embeddings, axis=0))

        author_centroid = np.stack(author_vectors, axis=0)

        # Package articles and authors embeddings with metadata
        return_dois = [article["doi"] for article in articles]
        ids = return_dois + author_ids

        author_names = get_authors_names(author_ids, self.author_collection)
        labels = articles_titles + author_names

        types = ["article"] * len(return_dois) + ["author"] * len(author_ids)

        embeddings = np.concatenate([articles_embeddings, author_centroid], axis=0)

        return ids, labels, types, embeddings

    def get_2d_projection(
        self, query_embedding: np.array, article_author_embeddings: np.array
    ) -> dict:
        """Get 2d projection with T-SNE.

        Note. Returned coordinates in the first element are the query.
        """

        data = np.concatenate([[query_embedding], article_author_embeddings], axis=0)

        perplexity = min(int(data.shape[0] / 10), 30)
        data_2d = TSNE(
            n_components=2, random_state=0, perplexity=perplexity
        ).fit_transform(data)
        return {"x": data_2d[:, 0].tolist(), "y": data_2d[:, 1].tolist()}

    def make_plot_data(self, query_embedding: np.array, dois: list[str]) -> dict:
        """Convert data to a dictionary that can be used by Pandas/Altair."""

        ids, label, types, article_author_embeddings = self.get_embeddings(dois)
        output = self.get_2d_projection(query_embedding, article_author_embeddings)
        output["id"] = ["query"] + ids
        output["label"] = [None] + label  # Inject proper label later
        output["type"] = ["query"] + types
        return output


class Engine:
    """Search engine that talks to Milvus."""

    def __init__(
        self,
        author_collection: Collection,
        article_collection: Collection,
        embeddings: OpenAIEmbeddings,
    ) -> None:
        self.author_collection = author_collection
        self.article_collection = article_collection
        self.embeddings = embeddings

        # load collections into memory
        self.author_collection.load()
        self.article_collection.load()
        self.plot_maker = PlotDataMaker(self.author_collection, self.article_collection)

    @cache
    def embed(self, text: str) -> list[float]:
        """Embed input query."""
        return self.embeddings.embed_query(text)

    def search_articles(
        self,
        query: str,
        top_k: int,
        distance_threshold: float = 0.2,
        plot_data: bool = False,
    ) -> dict:
        """Search for articles by a query."""

        query_embedding = self.embed(query)

        results = self.article_collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param={"metric_type": "IP", "params": {"nprobe": 16}},
            limit=top_k,
            output_fields=["doi", "title", "author_id"],
        )[0]

        logging.debug(f"result before filtering: {results}")
        results = [convert_article_result(result) for result in results]
        results = [
            result for result in results if result["distance"] < distance_threshold
        ]

        if not plot_data:
            return {"results": results}

        # Add plot data
        dois = [result["doi"] for result in results]
        plot_data = self.plot_maker.make_plot_data(query_embedding, dois)
        return {"results": results, "plot_data": plot_data}

    def search_authors(
        self,
        query: str,
        top_k: int,
        n: int = 500,
        distance_threshold: float = 0.2,
        pow: float = 3.0,
    ) -> tuple[list[int], list[float]]:
        """Search for author by a query.
        
        Each author is given by a score, defined as:
        $$ S_j = \sum_{i=1}^n (1 - d_{i,j})^p $$

        where $d_{i,j}$ is the distance between the query and the $i$-th article of the $j$-th author.
        The value $d$ is discarded if it is larger than the `distance_threshold` $t$, i.e.,

        $$
        d = 
        \begin{cases} 
        d & \text{if } d \leq t \\
        1 & \text{if } d > t 
        \end{cases}
        $$

        Args:
            query (str): Query string.
            top_k (int, optional): Number of authors to return. 
            n (int, optional): Number of articles $n$ in the weighting pool. Defaults to 500.
            distance_threshold (float, optional): Distance threshold. Defaults to 0.2.
            pow (float, optional): Power in weighting function $p$. Defaults to 3.0.

        Returns:
            list[dict]: key: author_id; value: their scores.
        """

        author_scores: dict[str, float] = {}
        articles = self.search_articles(
            query, top_k=n, distance_threshold=distance_threshold
        )

        for article in articles:
            author_id = article["author_id"]
            article["weight"] = (1 - article["distance"]) ** pow
            author_scores[author_id] = (
                author_scores.get(author_id, 0) + article["weight"]
            )

        logging.debug(f"{author_scores=}")
        top_ids, top_scores = sort_dict_by_value(author_scores, reversed=True)
        top_ids, top_scores = top_ids[:top_k], top_scores[:top_k]

        logging.debug(f"{top_ids=}, {top_scores=}")

        return top_ids, top_scores
