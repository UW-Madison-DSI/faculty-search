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

    def build(self, author_dir: Path = None) -> None:
        """Build entire store from jsons."""

        if author_dir is None:
            author_dir = Path("./authors")

        for json_file in author_dir.glob("*.json"):
            author = Author.load(json_file)
            self.add_author(author)
