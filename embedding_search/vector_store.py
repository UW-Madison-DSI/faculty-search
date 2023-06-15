import pickle
from langchain.embeddings import OpenAIEmbeddings
from pathlib import Path
from embedding_search.data_model import Author


class MiniStore:
    """Minimal vector store for experimental purpose."""

    def __init__(self, embeddings: OpenAIEmbeddings = None) -> None:
        self.embeddings = embeddings if embeddings is not None else OpenAIEmbeddings()
        self.vectors = []
        self.metadata = []

    def add_author(self, author: Author) -> None:
        """Add an author to the store."""

        assert author.articles_embeddings is not None
        self.vectors.extend(author.articles_embeddings)
        self.metadata.extend([article.metadata for article in author.articles])

    @classmethod
    def from_pickles(cls, author_dir: Path) -> "MiniStore":
        """Load from pickles."""

        store = cls()
        for pickle_path in author_dir.glob("*.pickle"):
            with open(pickle_path, "rb") as f:
                author = pickle.load(f)
                store.add_author(author)
        return store
