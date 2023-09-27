from functools import cache, partial
from datetime import datetime
import altair as alt
import numpy as np
import pandas as pd
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import Collection
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

VISUALIZATION_MAX_ARTICLES = 1000

##### Basic functions #####


def sort_dict_by_value(d: dict, reversed: bool = False) -> tuple[list, list]:
    sorted_keys, sorted_values = [], []
    for k, v in sorted(d.items(), key=lambda item: item[1], reverse=reversed):
        sorted_keys.append(k)
        sorted_values.append(v)
    return sorted_keys, sorted_values


def convert_article_result(result: dict) -> dict:
    """Convert an article result to proper distance and flatten."""

    flat_result = {}
    # CAUTION: result.distance is inner-product, i.e., similarity
    flat_result["distance"] = 1 - result.distance
    flat_result["author_id"] = str(result.entity.get("author_id"))

    # throw away misleading distance (it is similarity)
    remaining_fields = set(result.entity.fields) - set(["distance", "author_id"])
    for field in remaining_fields:
        flat_result[field] = result.entity.get(field)
    return flat_result


def get_author_by_name(
    first_name: str, last_name: str, author_collection: Collection
) -> dict:
    """Get author details from Milvus."""

    first_name, last_name = first_name.title(), last_name.title()

    _query = partial(
        author_collection.query,
        output_fields=["id", "first_name", "last_name", "unit_id"],
        limit=1,
    )

    authors = _query(
        expr=f"(first_name LIKE '{first_name}') and (last_name LIKE '{last_name}')"
    )

    if not authors:
        # Fuzzy match first name and last name
        authors = _query(
            expr=f"(first_name LIKE '{first_name}%') and (last_name LIKE '{last_name}%')"
        )

    if not authors:
        # Fuzzy match first or last name
        authors = _query(
            expr=f"(first_name LIKE '{first_name}%') or (last_name LIKE '{last_name}%')"
        )

    if not authors:
        raise ValueError(f"Author with name {first_name} {last_name} not found")
    return authors[0]


def get_author_articles(
    author_id: int, since_year: int, article_collection: Collection
) -> dict:
    """Get all articles from author with author_id."""

    articles = article_collection.query(
        expr=f"author_id == {author_id} and publication_year >= {since_year}",
        output_fields=["doi", "title", "publication_year", "cited_by"],
    )

    if len(articles) == 0:
        return None
    return articles


def get_author_by_id(author_id: str, author_collection: Collection) -> dict:
    """Get author details from Milvus."""

    authors = author_collection.query(
        expr=f"id == {author_id}",
        output_fields=["first_name", "last_name", "unit_id"],
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
        output_fields=["first_name", "last_name", "id", "unit_id"],
    )

    # Sort by the original order of authors_ids
    authors = sorted(authors, key=lambda author: authors_ids.index(author["id"]))

    if len(authors) != len(authors_ids):
        raise ValueError(f"Not all authors ids can be found in {authors_ids}.")

    return [f"{author['first_name']} {author['last_name']}" for author in authors]


##### Plotting #####


def tsne_projection(
    query_embedding: np.array, article_author_embeddings: np.array
) -> dict:
    """Get 2d projection with T-SNE."""

    data = np.concatenate([[query_embedding], article_author_embeddings], axis=0)

    perplexity = min(int(data.shape[0] / 10), 30)  # avoid error in small n
    data_2d = TSNE(n_components=2, random_state=0, perplexity=perplexity).fit_transform(
        data
    )
    return {"x": data_2d[:, 0].tolist(), "y": data_2d[:, 1].tolist()}


def pca_projection(
    query_embedding: np.array, article_author_embeddings: np.array
) -> dict:
    """Get 2d projection with PCA."""

    data = np.concatenate([[query_embedding], article_author_embeddings], axis=0)
    data_2d = PCA(n_components=2).fit_transform(data)
    return {"x": data_2d[:, 0].tolist(), "y": data_2d[:, 1].tolist()}


class PlotDataMaker:
    def __init__(
        self,
        author_collection: Collection,
        article_collection: Collection,
        projection_function: callable,
    ) -> None:
        self.author_collection = author_collection
        self.article_collection = article_collection
        self.projection_function = projection_function

    def get_embeddings(
        self, dois: list[str]
    ) -> tuple[list, list, list, list, np.array]:
        """Get embeddings of articles by their DOIs.

        Args:
            dois (list[str]): List of article DOIs.

        Returns:
            ids (list): List of article DOIs or author ids.
            parent_ids (list): List of parent ids (author ids).
            labels (list): List of article titles or author names.
            types (list): List of types (article or author).
            embeddings (np.array): Embeddings of articles or authors (centroid).
        """

        articles = self.article_collection.query(
            expr=f"doi in {dois}",
            output_fields=["doi", "author_id", "title", "embedding"],
        )

        # Sort articles by the original order of DOIs
        # TODO: Improve multiple authors handling
        articles = sorted(articles, key=lambda article: dois.index(article["doi"]))
        articles_titles = [article["title"] for article in articles]

        # Unpack article embeddings
        articles_embeddings = np.stack(
            [article["embedding"] for article in articles], axis=0
        )

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
        ids = [article["doi"] for article in articles] + author_ids

        parent_ids = [article["author_id"] for article in articles] + author_ids

        author_names = get_authors_names(author_ids, self.author_collection)
        labels = articles_titles + author_names

        types = ["article"] * len(articles) + ["author"] * len(author_ids)

        embeddings = np.concatenate([articles_embeddings, author_centroid], axis=0)

        return ids, parent_ids, labels, types, embeddings

    def make_plot_data(self, query_embedding: np.array, dois: list[str]) -> dict:
        """Convert data to a dictionary that can be consumed by Pandas."""
        ids, parent_ids, label, types, article_author_embeddings = self.get_embeddings(
            dois
        )

        # Obtain x, y
        output = self.projection_function(query_embedding, article_author_embeddings)

        # Add metadata
        output["id"] = ["query"] + ids
        output["parent_id"] = [0] + parent_ids
        output["label"] = [None] + label  # Inject proper label later
        output["type"] = ["query"] + types
        return output


def apply_font_sizes(
    chart: alt.Chart,
    title_font_size: int = 20,
    element_title_font_size: int = 14,
    label_font_size: int = 12,
) -> alt.Chart:
    """Apply font sizes to the chart elements."""

    return (
        chart.configure_title(fontSize=title_font_size)
        .configure_axis(
            titleFontSize=element_title_font_size, labelFontSize=label_font_size
        )
        .configure_legend(
            titleFontSize=element_title_font_size, labelFontSize=label_font_size
        )
    )


def plot_2d_projection(data: dict, width: int = 800, height: int = 600) -> str:
    """Plot 2d projection of embeddings."""

    df = pd.DataFrame(data)
    df["size"] = df.type.map({"query": 100, "author": 10, "article": 5})
    color_domain = ["query", "author", "article"]
    color_range = ["#c5050c", "#ff8811", "#537dab"]

    author_selector = alt.selection_point(fields=["parent_id"])
    base = (
        alt.Chart(df)
        .mark_circle()
        .encode(
            x=alt.X("x:Q", title=None, axis=None),
            y=alt.Y("y:Q", title=None, axis=None),
            color=alt.Color("type:N")
            .scale(domain=color_domain, range=color_range)
            .legend(orient="top-left"),
            size=alt.Size("size", legend=None),
            opacity=alt.condition(author_selector, alt.value(1.0), alt.value(0.3)),
            tooltip=["label:N", "id:N", "parent_id"],
        )
        .add_params(author_selector)
        .properties(width=width, height=height)
        .interactive()
    )

    # z-ordering work around
    query = base.transform_filter(alt.datum.type == "query")
    other = base.transform_filter(alt.datum.type != "query")
    chart = other + query

    return apply_font_sizes(chart).to_json()


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

        self.plot_maker = PlotDataMaker(
            self.author_collection,
            self.article_collection,
            projection_function=pca_projection,
        )

    @cache
    def embed(self, text: str) -> list[float]:
        """Embed input query."""
        return self.embeddings.embed_query(text)

    def search_articles(
        self,
        query: str,
        top_k: int,
        distance_threshold: float = 0.2,
        since_year: int = 1900,
        with_plot: bool = False,
    ) -> dict:
        """Search for articles by a query."""

        query_embedding = self.embed(query)

        def _search(limit: int) -> list:
            raws = self.article_collection.search(
                expr=f"publication_year >= {since_year}",
                data=[query_embedding],
                anns_field="embedding",
                param={"metric_type": "IP", "params": {"nprobe": 16}},
                limit=limit,
                output_fields=[
                    "doi",
                    "title",
                    "publication_year",
                    "author_id",
                    "cited_by",
                ],
            )[0]

            return [convert_article_result(raw) for raw in raws]

        results = _search(limit=top_k)
        results = [r for r in results if r["distance"] < distance_threshold]

        if not with_plot:
            return {"articles": results}

        # Add plot data
        more_results = _search(limit=VISUALIZATION_MAX_ARTICLES)

        dois = [result["doi"] for result in more_results]
        plot_data = self.plot_maker.make_plot_data(query_embedding, dois)
        # Inject the query back into the label in plot data
        plot_data["label"][0] = query
        return {"articles": results, "plot_json": plot_2d_projection(plot_data)}

    def search_authors(
        self,
        query: str,
        top_k: int,
        n: int = 500,
        m: int = 5,
        since_year: int = 1900,
        distance_threshold: float = 0.2,
        pow: float = 3.0,
        ks: float = 1.0,
        ka: float = 1.0,
        kr: float = 1.0,
        with_plot: bool = False,
        with_evidence: bool = False,
        filter_unit: str | None = None,
    ) -> dict:
        """Search for author by a query.

        Each author is given by a score, defined as the linear combination of similarity $S$, authority $A$, and recency $R$:
        $$ Score_j = k_s * S_j + k_a * A_j + k_r * R_j $$
        See [documentation](https://docs.google.com/presentation/d/1OAPVU8E7c4vmPQZMqdPGDd37FOjUigm8nU135m1gkR4) for details.

        Args:
            query (str): Query string.
            top_k (int, optional): Number of authors to return.
            n (int, optional): Number of articles $n$ in the weighting pool. Defaults to 500.
            m (int, optional): Maximum number of articles per author. Defaults to 10.
            since_year (int, optional): Earliest year of articles to consider. Defaults to 1900.
            distance_threshold (float, optional): Distance threshold. Defaults to 0.2.
            pow (float, optional): Power in weighting function $p$. Defaults to 3.0.
            ks (float, optional): Linear scaling of similarity $S$ . Defaults to 1.0.
            ka (float, optional): Linear scaling of authority $A$ = log10(cited_by + 1). Defaults to 1.0.
            kr (float, optional): Linear scaling of recency $R$ = 1 / log10(year_now - published_year + 2). Defaults to 1.0.
            with_plot (bool, optional): Whether to return plot json. Defaults to False.
            with_evidence (bool, optional): Whether to return evidence. Defaults to False.
            filter_unit (str | None, optional): Unit id to filter by. Defaults to None.

        Returns:
            list[dict]: key: author_id; value: their scores.
        """

        author_scores: dict[str, float] = {}
        results = self.search_articles(
            query,
            top_k=n,
            distance_threshold=distance_threshold,
            since_year=since_year,
            with_plot=with_plot,
        )

        # Calculate author scores by their relevant articles
        # Similarity $S$: (1 - distance) ** pow
        # Authority $A$ = log(cited_by + 1)
        # Recency $R$ = 1 / log(year_now - published_year + 2)
        # Weight $W$ = S * A

        author_ids = [article["author_id"] for article in results["articles"]]
        c = np.array([article["cited_by"] for article in results["articles"]])
        d = np.array([article["distance"] for article in results["articles"]])
        y = np.array([article["publication_year"] for article in results["articles"]])
        s = (1 - d) ** pow
        a = np.log10(c + 1)
        r = 1 / np.log10(datetime.now().year - y + 2)
        w = ks * s + ka * a + kr * r

        unique_author_ids, idx = np.unique(author_ids, return_inverse=True)

        for i, author_id in enumerate(unique_author_ids):
            this_author_weights = w[idx == i]

            # Obtain top m articles
            top_m_idx = np.argsort(this_author_weights)[-m:]
            top_m_weights = this_author_weights[top_m_idx]

            # Calculate author score
            author_scores[author_id] = np.sum(top_m_weights)

        if filter_unit is not None:
            # Get all author ids in the unit
            filter_unit = str(filter_unit)
            in_unit_author_ids = self.author_collection.query(
                expr=f"unit_id == {filter_unit}",
                output_fields=["id"],
            )
            # Unpack
            in_unit_author_ids = [str(x["id"]) for x in in_unit_author_ids]

            # Filter
            author_scores = {
                k: v for k, v in author_scores.items() if k in in_unit_author_ids
            }

        top_ids, top_scores = sort_dict_by_value(author_scores, reversed=True)
        top_ids, top_scores = top_ids[:top_k], top_scores[:top_k]

        output = {
            "authors": {
                "author_ids": top_ids,
                "scores": top_scores,
            }
        }

        # Add plot json
        if with_plot:
            output["plot_json"] = results["plot_json"]

        if with_evidence:
            output["evidence"] = results["articles"]

        return output

    def get_author(
        self, first_name: str, last_name: str, since_year: int = 1900
    ) -> dict:
        """Get author details from Milvus."""

        output = {}
        output["author"] = get_author_by_name(
            first_name, last_name, self.author_collection
        )
        output["articles"] = get_author_articles(
            author_id=output["author"]["id"],
            since_year=since_year,
            article_collection=self.article_collection,
        )
        return output

    def get_author_by_id(self, author_id: str) -> dict:
        """Get author details from Milvus."""

        output = {}
        output["author"] = get_author_by_id(author_id, self.author_collection)
        output["articles"] = get_author_articles(
            author_id=output["author"]["id"],
            since_year=1900,
            article_collection=self.article_collection,
        )
        return output
