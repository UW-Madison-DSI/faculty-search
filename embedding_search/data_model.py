import json
import pickle
from dataclasses import dataclass
from embedding_search.utils import extract_orcid


@dataclass
class Article:
    orcid_path: str
    doi: str
    title: str
    url: str
    publication_year: int
    # Below are fields that are added later when the abstract is pulled from Crossref
    pulled_abstract: bool = False
    raw_abstract: str = None
    abstract: str = None
    cited_by: int = None

    @property
    def text(self) -> str:
        """Text to embed."""

        text = self.title
        if self.abstract:
            text += " "  # OpenAI embedding suggests using space as separator
            text += self.abstract
        return text

    @property
    def metadata(self) -> dict:
        """Metadata for the article."""

        return {
            "type": "article",
            "orcid_path": self.orcid_path,
            "doi": self.doi,
            "title": self.title,
            "url": self.url,
            "publication_year": self.publication_year,
            "pulled_abstract": self.pulled_abstract,
            "raw_abstract": self.raw_abstract,
            "abstract": self.abstract,
            "cited_by": self.cited_by,
        }

    @property
    def author_orcid(self) -> str:
        return extract_orcid(self.orcid_path)

    def to_dict(self) -> dict:
        return {
            "orcid_path": self.orcid_path,
            "doi": self.doi,
            "title": self.title,
            "url": self.url,
            "publication_year": self.publication_year,
            "pulled_abstract": self.pulled_abstract,
            "raw_abstract": self.raw_abstract,
            "abstract": self.abstract,
            "cited_by": self.cited_by,
        }

    def __str__(self) -> str:
        return f"{self.title} ({self.publication_year})"


@dataclass
class Author:
    """An author object."""

    def __init__(
        self,
        orcid: str,
        first_name: str,
        last_name: str,
        biography: str = None,
        articles: list[Article] | None = None,
        email: str = None,
        articles_embeddings: list[list[float]] = None,
    ) -> None:
        self.orcid = orcid
        self.first_name = first_name
        self.last_name = last_name
        self.biography = biography
        self.email = email
        self.articles_embeddings = articles_embeddings

        if articles is None:
            self.articles = []
        elif isinstance(articles[0], Article):
            self.articles = articles
        else:
            self.articles = [Article(**article) for article in articles]

    @property
    def texts(self) -> list[str]:
        """Texts to be embed."""
        return [article.text for article in self.articles]

    def add_articles(self, articles: list[Article]) -> None:
        self.articles.extend(articles)

    def to_dict(self):
        author_dict = self.__dict__.copy()
        author_dict["articles"] = [article.to_dict() for article in self.articles]
        return author_dict

    def save(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=4)

    @classmethod
    def from_pickle(cls, path: str) -> "Author":
        """(Legacy) Load author from pickle."""
        with open(path, "rb") as f:
            return pickle.load(f)

    @classmethod
    def load(cls, path: str) -> "Author":
        with open(path, "r") as f:
            return cls(**json.load(f))

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} (ORCID: {self.orcid})"
