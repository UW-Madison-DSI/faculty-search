import logging
from pathlib import Path

import numpy as np
from langchain.embeddings import OpenAIEmbeddings
from scipy.spatial.distance import cdist
from tqdm import tqdm

from embedding_search.data_model import Article, Author
from embedding_search.utils import sort_key_by_value


def get_author(orcid: str) -> Author:
    """Get author from orcid."""

    return Author.load(Path("./authors") / f"{orcid}.json")


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

        # process articles
        self.vectors.extend(author.articles_embeddings)
        self.metadata.extend([article.metadata for article in author.articles])

        # process author (centroid of articles)
        author_embedding = np.mean(author.articles_embeddings, axis=0)
        self.vectors.append(author_embedding.tolist())
        self.metadata.append(
            {
                "type": "author",
                "orcid": author.orcid,
                "first_name": author.first_name,
                "last_name": author.last_name,
                "biography": author.biography,
                "email": author.email,
            }
        )

    def build(self, author_dir: Path = None) -> None:
        """Build entire store from jsons."""

        if author_dir is None:
            author_dir = Path("./authors")

        for json_file in tqdm(author_dir.glob("*.json")):
            author = Author.load(json_file)
            self.add_author(author)

    @property
    def authors_idx(self) -> list[int]:
        """Get indices of authors."""

        return [i for i, meta in enumerate(self.metadata) if meta["type"] == "author"]

    @property
    def articles_idx(self) -> list[int]:
        """Get indices of articles."""

        return [i for i, meta in enumerate(self.metadata) if meta["type"] == "article"]

    def _search(
        self, query: str, top_k: int, ignore_idx: list[int], constructor_fn: callable
    ) -> list[Article | Author]:
        """Internal search function."""

        # Compute distances over entire vector store
        query_embedding = self.embeddings.embed_query(query)
        distances = cdist([query_embedding], self.vectors, metric=self.metric).squeeze()

        # Filter out embeddings that is not of the same type
        distances[ignore_idx] = np.inf

        top_k_idx = np.argsort(distances)[:top_k]

        # Package results
        outputs = []
        for i in top_k_idx:
            metadata = self.metadata[i]
            logging.info(metadata)
            output = constructor_fn(
                **{k: v for k, v in metadata.items() if k != "type"}
            )
            output.distance = distances[i]
            outputs.append(output)
        return outputs

    def search(self, query: str, type: str, top_k: int = 10) -> list[Article | Author]:
        """Search for similar articles or author."""

        assert type in ["article", "author"]

        if type == "article":
            ignore_idx = self.authors_idx
            constructor_fn = Article
        else:
            ignore_idx = self.articles_idx
            constructor_fn = Author

        return self._search(query, top_k, ignore_idx, constructor_fn)

    def weighted_search_author(
        self, query: str, top_k: int = 3, n_pool: int = 30
    ) -> list[Author]:
        """Search for community user who published most related articles."""

        # Create a pool of articles
        articles = self.search(query, type="article", top_k=n_pool)

        author_counts = {}
        for article in articles:
            orcid = article.author_orcid
            author_counts[orcid] = author_counts.get(orcid, 0) + 1
        logging.info(author_counts)

        sorted_authors = sort_key_by_value(author_counts, reversed=True)
        return [get_author(orcid) for orcid in sorted_authors[:top_k]]
