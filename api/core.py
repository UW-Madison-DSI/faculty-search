import logging
from functools import cache


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


class Engine:
    """Search engine that talks to Milvus."""

    def __init__(self, author_collection, article_collection, embeddings):
        self.author_collection = author_collection
        self.article_collection = article_collection
        self.embeddings = embeddings

        # load collections into memory
        self.author_collection.load()
        self.article_collection.load()

    @cache
    def embed(self, text: str) -> list[float]:
        """Embed input query."""
        return self.embeddings.embed_query(text)

    def get_author(self, author_id: int | str) -> dict:
        """Get author details from Milvus."""

        authors = self.author_collection.query(
            expr=f"id == {author_id}",
            output_fields=["first_name", "last_name", "community_name"],
            limit=1,
        )

        if not authors:
            raise ValueError(f"Author with id {author_id} not found")
        return authors[0]

    def search_articles(
        self, query: str, top_k: int = 500, distance_threshold: float = 0.2
    ) -> list[dict]:
        """Search for articles by a query."""

        query_embedding = self.embed(query)
        search_params = {"metric_type": "IP", "params": {"nprobe": 16}}

        results = self.article_collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["doi", "title", "author_id"],
        )

        results = results[0]
        logging.debug(f"result before filtering: {results}")

        # filter by distance threshold
        results = [convert_article_result(result) for result in results]
        return [result for result in results if result["distance"] < distance_threshold]

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
