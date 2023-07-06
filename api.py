from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, validator
from embedding_search.vector_store import MiniStore
from embedding_search.data_model import Author
from dotenv import load_dotenv

load_dotenv()
cached_resources = {}


def get_vector_store():
    """Get the vector store."""
    store = MiniStore()
    store.build()
    return store


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cached resources management."""
    cached_resources["vector_store"] = get_vector_store()
    yield
    # Release resources when app stops
    cached_resources["vector_store"] = None


app = FastAPI(lifespan=lifespan)


# IO Models
class APIQuery(BaseModel):
    """Query data model."""

    query: str
    top_k: int = 3

    @validator("query")
    def query_must_not_be_empty(cls, v):
        """Validate that query is not empty."""
        if not v.strip():
            raise ValueError("query must not be empty")
        return v

    @validator("top_k")
    def top_k_must_be_positive(cls, v):
        """Validate that top_k is positive."""
        if v <= 0:
            raise ValueError("top_k must be positive")
        return v


class APIAuthor(BaseModel):
    """Author output data model."""

    first_name: str
    last_name: str
    community_name: str | None = None
    similarity: float | None = None


def to_api_author(author: Author) -> APIAuthor:
    """Convert an author to APIAuthor."""
    return APIAuthor(
        first_name=author.first_name,
        last_name=author.last_name,
        community_name=author.community_name,
        similarity=author.similarity,
    )


@app.post("/search_author")
def search_author(query: APIQuery) -> list[APIAuthor]:
    """Search an author."""

    authors = cached_resources["vector_store"].weighted_search_author(**query.dict())
    return [to_api_author(author) for author in authors]
