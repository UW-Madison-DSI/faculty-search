import json
import numpy as np
from typing import Optional
from pydantic import BaseModel, validator


class Article(BaseModel):
    author_id: Optional[str] = None
    doi: Optional[str] = None
    publication_year: Optional[int] = None
    title: Optional[str] = None
    abstract: Optional[str] = None
    cited_by: Optional[int] = None

    @property
    def text(self) -> str:
        """Text to embed."""

        if not self.title and not self.abstract:
            raise ValueError("No text to embed.")

        text = ""
        if self.title:
            text += self.title

        if self.abstract:
            text += " " + self.abstract

        return text


class Author(BaseModel):
    """An author object."""

    id: Optional[int] = None
    unit_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    community_name: Optional[str] = None
    articles: Optional[list[Article]] = None
    articles_embeddings: Optional[list[list[float]]] = None
    similarity: Optional[float] = None

    @validator("first_name", pre=True)
    def first_name_title_case(cls, v):
        return v.title()

    @validator("last_name", pre=True)
    def last_name_title_case(cls, v):
        return v.title()

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

    def save(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self.dict(skip_defaults=True), f, indent=4)

    @classmethod
    def load(cls, path: str) -> "Author":
        with open(path, "r") as f:
            return cls(**json.load(f))
