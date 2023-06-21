from langchain.embeddings import OpenAIEmbeddings
from pathlib import Path
from embedding_search.data_model import Author, Article
from scipy.spatial.distance import cdist
import numpy as np
from embedding_search.utils import sort_key_by_value
import logging
from tqdm import tqdm


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

    def search_articles(self, query: str, top_k: int = 10) -> list[Article]:
        """Search for similar articles."""

        query_embedding = self.embeddings.embed_query(query)
        distances = cdist([query_embedding], self.vectors, metric=self.metric).squeeze()
        top_k_idx = np.argsort(distances)[:top_k]

        # Package results
        articles = []
        for i in top_k_idx:
            metadata = self.metadata[i]
            logging.info(metadata)
            article = Article(**{k: v for k, v in metadata.items() if k != "type"})
            article.distance = distances[i]
            articles.append(article)
        return articles

    def search_people(self, query: str, top_k: int = 3) -> list[Author]:
        """Search for community user who published most related articles."""

        articles = self.search_articles(query, top_k=30)

        author_counts = {}
        for article in articles:
            orcid = article.author_orcid
            author_counts[orcid] = author_counts.get(orcid, 0) + 1
        logging.info(author_counts)

        sorted_authors = sort_key_by_value(author_counts, reversed=True)
        return [get_author(orcid) for orcid in sorted_authors[:top_k]]
