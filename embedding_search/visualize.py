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

        # data[0] is query, data[1:] are the rest of the embeddings in the store with authors and articles
        embeddings = np.array(self.store.vectors)
        data = np.concatenate([query_embedded, embeddings])
        data_2d = self.tsne.fit_transform(data)

        df = pd.DataFrame(data_2d, columns=["x", "y"])

        # Append useful metadata for plotting
        df["type"] = ["query"] + [metadata["type"] for metadata in self.store.metadata]

        label = [query]
        parent_orcid = [None]

        for meta in self.store.metadata:
            if meta["type"] == "article":
                label.append(meta["title"])
                parent_orcid.append(extract_orcid(meta["orcid_path"]))
            elif meta["type"] == "author":
                label.append(f"{meta['first_name']} {meta['last_name']}")
                parent_orcid.append(meta["orcid"])

        df["label"] = label
        df["parent_orcid"] = parent_orcid
        return df


class QueryPlotter:
    """Plot the results of a query."""

    def __init__(self, embedding_processor: EmbeddingsProcessor) -> None:
        self.embedding_processor = embedding_processor

    def plot(self, query: str) -> alt.Chart:
        """Plot the results of a query."""

        df = self.embedding_processor.query(query)
        df["size"] = df.type.map({"query": 100, "author": 10, "article": 3})
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
                tooltip=["label", "parent_orcid"],
            )
            .add_params(selector)
            .properties(width=800, height=600)
            .interactive()
        )
        return chart
