import os
import logging
from pathlib import Path
from functools import cache
import numpy as np
from langchain.embeddings import OpenAIEmbeddings
from scipy.spatial.distance import cdist
from tqdm import tqdm
from dotenv import load_dotenv
from embedding_search.data_model import Article, Author
from embedding_search.utils import sort_key_by_value

load_dotenv()
AUTHOR_DIR = Path(os.getenv("AUTHOR_DIR"))
DEBUG = int(os.getenv("DEBUG", 0))


@cache
def get_author(id: str) -> Author:
    """Get author from id."""
    return Author.load(AUTHOR_DIR / f"{id}.json")


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
        metadata = [article.dict() for article in author.articles]
        for meta in metadata:
            meta["type"] = "article"
            meta["author_id"] = author.id  # For easier access during search
        self.metadata.extend(metadata)

        # process author embedding (centroid of articles)
        logging.debug(
            f"Author {author.id} has {len(author.articles_embeddings)} articles"
        )
        logging.debug(np.array(author.articles_embeddings).shape)
        author_embedding = np.mean(author.articles_embeddings, axis=0)
        self.vectors.append(author_embedding.tolist())
        self.metadata.append(
            {
                "type": "author",
                "id": author.id,
                "first_name": author.first_name,
                "last_name": author.last_name,
            }
        )

    def build(self) -> None:
        """Build entire store from jsons."""

        for i, json_file in tqdm(enumerate(AUTHOR_DIR.glob("*.json"))):
            if DEBUG and i > 10:
                break
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
                **{
                    k: v
                    for k, v in metadata.items()
                    if k not in ("type", "author_orcid")
                }
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
        self,
        query: str,
        top_k: int = 3,
        distance_threshold: float = 0.2,
        pow: float = 3,
    ) -> list[Author]:
        """Search for community user who published most related articles.

        Each author is given by a score, defined as:
        $$ S_j = \sum_{i=1}^n (1 - d_{i,j})^p $$

        where $d_{i,j}$ is the distance between the query and the $i$-th article of the $j$-th author.
        The value $d$ is also clipped by the `distance_threshold` $t$, i.e.,

        $$
        d = 
        \begin{cases} 
        d & \text{if } d \leq t \\
        1 & \text{if } d > t 
        \end{cases}
        $$
        """

        # Calculate similarity weights = 1 - distance
        query_embedding = self.embeddings.embed_query(query)
        distances = cdist([query_embedding], self.vectors, metric=self.metric).squeeze()

        # Clip distance
        distances[distances > distance_threshold] = 1

        # Calculate weights (The large distance articles now has 0 weight)
        weights = 1 - distances

        logging.debug(f"Contributed papers: {sum(weights > 0)}")

        # Place more emphasis on the articles that are most similar
        # by drastically reducing the significance of those with smaller relevance.
        weights = weights**pow

        # Calculate weighted sum in each author
        author_scores = {}
        for metadata, weight in zip(self.metadata, weights):
            # Skip author level distance to avoid double counting
            if metadata["type"] != "article":
                continue
            id = metadata["author_id"]
            author_scores[id] = author_scores.get(id, 0) + weight

        logging.debug(author_scores)

        # Sort by score
        top_ids = sort_key_by_value(author_scores, reversed=True)[:top_k]

        # Return authors with scores
        authors = []
        for id in top_ids:
            author = get_author(id)
            author.similarity = author_scores[id]
            authors.append(author)

        return authors
