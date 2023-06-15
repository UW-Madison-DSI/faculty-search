from langchain.embeddings import OpenAIEmbeddings
from pathlib import Path
from embedding_search.data_model import Author
from scipy.spatial.distance import cdist
import numpy as np


class MiniStore:
    """Minimal vector store for experimental purpose."""

    def __init__(
        self,
        embeddings: OpenAIEmbeddings = None,
        vectors: list[list] | None = None,
        metadata: list[dict] | None = None,
        metric: str = "cosine",
    ) -> None:
        self.embeddings = embeddings if embeddings is not None else OpenAIEmbeddings()
        self.vectors = vectors if vectors is not None else []
        self.metadata = metadata if metadata is not None else []
        self.metric = metric

    def add_author(self, author: Author) -> None:
        """Add an author to the store."""

        assert author.articles_embeddings is not None
        self.vectors.extend(author.articles_embeddings)
        self.metadata.extend([article.metadata for article in author.articles])

    def build(self, author_dir: Path = None) -> None:
        """Build entire store from jsons."""

        if author_dir is None:
            author_dir = Path("./authors")

        for json_file in author_dir.glob("*.json"):
            author = Author.load(json_file)
            self.add_author(author)

    def search(self, query: str, top_k: int = 10) -> list[dict]:
        """Search for similar articles."""

        query_embedding = self.embeddings.embed_query(query)
        distances = cdist([query_embedding], self.vectors, metric=self.metric).squeeze()
        top_k_idx = np.argsort(distances)[:top_k]

        # Package results
        results = []
        for i in top_k_idx:
            metadata = self.metadata[i]
            metadata["distance"] = distances[i]
            results.append(metadata)
        return results
