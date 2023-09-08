import logging
import numpy as np
import pandas as pd
import altair as alt
from sklearn.manifold import TSNE
from embedding_search.utils import extract_orcid
from embedding_search.vector_store import MiniStore


class EmbeddingsProcessor:
    """Collect all author and article embeddings in the database and project to 2d with t-SNE."""

    def __init__(self, store: MiniStore) -> None:
        self.store = store
        self.tsne = TSNE(n_components=2, random_state=0)

    def query(self, query: str) -> pd.DataFrame:
        """Collect all author and article embeddings in the database."""

        # embed query
        query_embedded = self.store.embeddings.embed_query(query)
        query_embedded = np.array(query_embedded).reshape(1, -1)
        logging.debug(f"query_embedded: {query_embedded.shape}")

        # data[0] is query, data[1:] are the rest of the embeddings in the store with authors and articles
        embeddings = np.array(self.store.vectors)
        data = np.concatenate([query_embedded, embeddings])
        data_2d = self.tsne.fit_transform(data)

        df = pd.DataFrame(data_2d, columns=["x", "y"])

        # Append useful metadata for plotting
        # Row 0 is the query
        type = ["query"]
        label = [query]
        parent_orcid = [None]
        cited_by = [0]  # Make query a large circle

        # Remaining rows are the rest of the embeddings in the store with authors and articles
        for meta in self.store.metadata:
            type.append(meta["type"])
            if "cited_by" in meta:
                cited_by.append(meta["cited_by"])
            else:
                cited_by.append(0)

            if meta["type"] == "article":
                label.append(meta["title"])
                parent_orcid.append(extract_orcid(meta["orcid_path"]))
            elif meta["type"] == "author":
                label.append(f"{meta['first_name']} {meta['last_name']}")
                parent_orcid.append(meta["orcid"])

        # Add metadata to dataframe
        df["type"] = type
        df["label"] = label
        df["parent_orcid"] = parent_orcid
        df["cited_by"] = cited_by

        # Update author's cited_by with the sum of all their articles' cited_by
        author_cited_by = df.groupby("parent_orcid")["cited_by"].sum().to_dict()
        df.loc[df["type"] == "author", "cited_by"] = df.parent_orcid.map(
            author_cited_by
        )

        return df


class QueryPlotter:
    """Plot the results of a query."""

    def __init__(self, embedding_processor: EmbeddingsProcessor) -> None:
        self.embedding_processor = embedding_processor

    def plot(self, query: str) -> alt.Chart:
        """Plot the results of a query."""

        df = self.embedding_processor.query(query)
        df["size"] = np.sqrt(df.cited_by + 1)

        # make size of all author as 10
        df.loc[df["type"] == "author", "size"] = 10

        # make size of all query as 100
        df.loc[df["type"] == "query", "size"] = 100

        # df["size"] = df.type.map({"query": 100, "author": 10, "article": 3})
        selector = alt.selection_point(fields=["parent_orcid"])

        chart = (
            alt.Chart(df)
            .mark_circle()
            .encode(
                x="x",
                y="y",
                color="type",
                size=alt.Size("size", legend=None),
                opacity=alt.condition(selector, alt.value(0.8), alt.value(0.2)),
                tooltip=["label", "parent_orcid", "cited_by"],
            )
            .add_params(selector)
            .properties(width=800, height=600)
            .interactive()
        )
        return chart
