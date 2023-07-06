import json
from pydantic import BaseModel, validator


class Article(BaseModel):
    author_id: str | None = None
    doi: str | None = None
    publication_year: int | None = None
    title: str | None = None
    abstract: str | None = None
    url: str | None = None
    cited_by: int | None = None

    @property
    def text(self) -> str:
        """Text to embed."""

        text = self.title
        if self.abstract:
            text += " " + self.abstract
        return text


class Author(BaseModel):
    """An author object."""

    id: int | None = None
    unit_id: int | None = None
    first_name: str | None = None
    last_name: str | None = None
    community_name: str | None = None
    articles: list[Article] | None = None
    articles_embeddings: list[list[float]] | None = None
    similarity: float | None = None

    @validator("first_name", pre=True)
    def first_name_title_case(cls, v):
        return v.title()

    @validator("last_name", pre=True)
    def last_name_title_case(cls, v):
        return v.title()

    @property
    def texts(self) -> list[str]:
        """Texts to embed."""
        return [article.text for article in self.articles]

    def save(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self.dict(skip_defaults=True), f, indent=4)

    @classmethod
    def load(cls, path: str) -> "Author":
        with open(path, "r") as f:
            return cls(**json.load(f))
