import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np
from pydantic import BaseModel, Field, validator
from tqdm import tqdm
from langchain.embeddings import OpenAIEmbeddings

from .academic_analytics import get_author
from .crossref import batch_query_cited_by
from .utils import AUTHORS_DIR


class Article(BaseModel):
    author_id: Optional[str | int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    publication_year: Optional[int] = None
    title: Optional[str] = None
    abstract: Optional[str] = None
    cited_by: Optional[int] = None

    @validator("doi", pre=True)
    def doi_lower_case(cls, v):
        return v.lower()

    @property
    def text(self) -> str:
        """Text to be embed."""

        if not self.title and not self.abstract:
            raise ValueError("No text to embed.")

        text = ""
        if self.title:
            text += self.title

        if self.journal:
            text += f" published in: {self.journal}"

        if self.abstract:
            text += f" abstract: {self.abstract}"

        return text


def parse_article(article: dict) -> Article:
    """Parse an article from the academic analytics API.

    Args:
        article: dict, article data from academic analytics API
        cited_by: bool, whether to get cited by count from crossref
    """

    article = Article(
        journal=article["journalName"],
        doi=article["digitalObjectIdentifier"],
        title=article["title"],
        abstract=article["abstract"],
        publication_year=article["journalYear"],
    )

    return article


class Author(BaseModel):
    """An author object."""

    id: Optional[str | int] = None
    unit_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    community_name: Optional[str] = None
    articles: list[Article] = Field(default_factory=list)
    articles_embeddings: list[list[float]] = Field(default_factory=list)
    similarity: Optional[float] = None

    @validator("first_name", pre=True)
    def first_name_title_case(cls, v):
        return v.title()

    @validator("last_name", pre=True)
    def last_name_title_case(cls, v):
        return v.title()

    @property
    def dois(self) -> list[str]:
        """DOIs of articles."""
        if self.articles is None:
            return []
        return [article.doi for article in self.articles]

    @property
    def texts(self) -> list[str]:
        """Texts to embed."""
        if self.articles is None:
            return []
        return [article.text for article in self.articles]

    @property
    def embedding(self) -> list[float]:
        """Embedding of author."""
        if self.articles_embeddings is None:
            raise ValueError("No embeddings.")

        embeddings = [x for x in self.articles_embeddings if len(x) == 1536]
        return np.mean(embeddings, axis=0).tolist()

    def save(self, path: str | Path | None = None) -> None:
        """Save author to json."""
        if path is None:
            path = AUTHORS_DIR / f"{self.id}.json"

        with open(path, "w") as f:
            f.write(self.model_dump_json(exclude_defaults=False, indent=4))

    @classmethod
    def load(cls, path: str) -> "Author":
        with open(path, "r") as f:
            return cls(**json.load(f))

    def update_citation_counts(self) -> None:
        """Update citation counts for articles."""

        cited_by_data = batch_query_cited_by(self.dois)
        for article in self.articles:
            article.cited_by = cited_by_data.get(article.doi, None)

        self.save()

    def update_articles(self) -> None:
        """Pull latest articles data from academic analytics."""
        raw_author = get_author(self.id)

        # Subset to articles with DOIs
        new_articles = []
        for article in tqdm(raw_author["articles"]):
            try:
                parsed_article = parse_article(article)
                parsed_article.author_id = self.id
                if parsed_article.doi not in self.dois:
                    new_articles.append(parsed_article)
            except Exception as e:
                logging.error(f"Error parsing article: {e}")
                continue

        # Append embeddings to new articles
        if new_articles:
            embeddings = OpenAIEmbeddings()
            new_texts = [article.text for article in new_articles]
            new_embeddings = embeddings.embed_documents(new_texts)

            # Update author object with new articles info
            self.articles.extend(new_articles)
            self.articles_embeddings.extend(new_embeddings)

        self.save()

    def update(self) -> None:
        """Convenience method to update all author data."""

        self.update_articles()  # This must be first
        self.update_citation_counts()
