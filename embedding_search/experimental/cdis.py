import numpy as np
from sklearn.cluster import KMeans
import pandas as pd
import altair as alt

from openai import OpenAI

alt.data_transformers.disable_max_rows()


def ask_openai(messages: list[dict]) -> dict:
    """Ask gpt with a data package.

    Example input: [{"role": "user", "content": "Hello world example in python."}]
    """

    client = OpenAI()
    chat_completion = client.chat.completions.create(
        messages=messages,
        model="gpt-4-1106-preview",
    )
    return chat_completion.choices[0].message.content


class ClusterExplore:
    """Clustering experiment manager."""

    def __init__(
        self,
        embeddings: np.array,
        df: pd.DataFrame,
        n_clusters: int,
        label: bool = False,
    ) -> None:
        self.embeddings = embeddings
        self.df = df.copy()
        self.n_clusters = n_clusters

        # Run clustering
        if "cluster" not in self.df.columns:
            self._cluster(n_clusters)

        # Get cluster label from GPT
        if label:
            self.get_clusters_label()

    def get_clusters_label(self) -> None:
        """Get label for each cluster."""

        for cluster_id in range(self.n_clusters):
            self._label_cluster(cluster_id)

    def plot(self) -> alt.Chart:
        return (self._plot_clusters() & self._plot_faculty()).resolve_scale(
            color="independent"
        )

    def cluster_faculty(self, cluster: int) -> pd.DataFrame:
        return (
            self.df.query(f"cluster == {cluster}")
            .groupby(["department", "name"])
            .agg(n_articles=("title", "count"))
            .reset_index()
        )

    # Private methods
    def _cluster(self, n: int) -> None:
        """K-means clustering."""
        k_means = KMeans(n_clusters=n, random_state=0).fit(self.embeddings)
        self.df["cluster"] = k_means.labels_

    def _label_cluster(self, cluster_id: int) -> None:
        """Use GPT to label a cluster."""
        try:
            prompt = f"Try to give a topic name to describe all the publication below: \n\n {self._get_cluster_pub_titles(cluster_id)}"
            gpt_label = ask_openai([{"role": "user", "content": prompt}])
            self.df.loc[self.df.cluster == cluster_id, "label"] = gpt_label
        except TypeError:
            pass

    def _get_cluster_pub_titles(self, cluster_id: int) -> str:
        """Get a list of publications in a cluster."""

        titles = self.df.query(f"cluster == {cluster_id}").title.to_list()
        return "\n\n ".join([t for t in titles if t is not None])

    def _plot_clusters(self) -> alt.Chart:
        self.cluster_select = alt.selection_point(fields=["cluster"])

        tooltip = [
            "title",
            "cluster",
            "doi",
            "name",
            "department",
        ]

        if "label" in self.df.columns:
            tooltip.append("label")

        chart = (
            alt.Chart(self.df)
            .mark_circle()
            .encode(
                x=f"x_tsne",
                y=f"y_tsne",
                color="cluster:N",
                opacity=alt.condition(
                    self.cluster_select, alt.value(1), alt.value(0.2)
                ),
                tooltip=tooltip,
            )
            .add_params(self.cluster_select)
        )

        return (
            (chart)
            .properties(
                width=1000,
                height=600,
                title="K-means clustering of publication embeddings projected on 2D t-SNE.",
            )
            .interactive()
        )

    def _plot_faculty(self) -> alt.Chart:
        return (
            alt.Chart(self.df)
            .mark_bar()
            .encode(
                x=alt.X("name:N", sort="-y"),
                y="count()",
                color="department:N",
                tooltip=["department", "name", "count()"],
            )
            .transform_filter(self.cluster_select)
            .properties(
                width=1000,
                height=300,
                title="Number of publication in selected cluster by faculty",
            )
        )
