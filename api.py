import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, validator
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import connections, Collection

load_dotenv()

cached_resources = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cached resources management."""

    connections.connect(
        alias=os.getenv("MILVUS_ALIAS", "default"),
        host=os.getenv("MILVUS_HOST", "localhost"),
        port=os.getenv("MILVUS_PORT", "19530"),
    )

    cached_resources["articles_collection"] = Collection(name="articles")
    cached_resources["articles_collection"].load()

    # cached_resources["authors_collection"] = Collection(name="authors")
    # cached_resources["authors_collection"].load()

    cached_resources["embeddings"] = OpenAIEmbeddings()
    yield
    # Release resources when app stops
    # cached_resources["authors_collection"].release()
    cached_resources["articles_collection"].release()
    cached_resources.clear()
    connections.disconnect(alias=os.getenv("MILVUS_ALIAS", "default"))


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


def search(
    query: str, top_k: int = 3, distance_threshold: float = 0.2, pow: float = 3.0
) -> list:
    """Search for articles by query."""

    search_vector = cached_resources["embeddings"].embed_query(query)
    logging.debug(search_vector)

    search_params = {"metric_type": "IP", "params": {"nprobe": 16}}
    results = cached_resources["articles_collection"].search(
        data=[search_vector],
        anns_field="embedding",
        param=search_params,
        limit=top_k,
        output_fields=["title", "author_id"],
    )

    return [result.__dict__ for result in results[0]]


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "is running."}


@app.post("/search_paper/")
def search_author(query: APIQuery) -> list[dict]:
    """Search an author."""

    return search(query.query, query.top_k)
