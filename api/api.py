import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, validator
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import connections, Collection
from core import Engine

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

    cached_resources["engine"] = Engine(
        article_collection=Collection(name="articles"),
        author_collection=Collection(name="authors"),
        embeddings=OpenAIEmbeddings(),
    )
    yield

    # Release resources when app stops
    cached_resources.clear()
    connections.disconnect(alias=os.getenv("MILVUS_ALIAS", "default"))


app = FastAPI(title="Scholar Search API", lifespan=lifespan)


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

    id: str
    first_name: str
    last_name: str
    community_name: str | None = None
    score: float | None = None


class APIArticle(BaseModel):
    """Article output data model."""

    doi: str
    title: str
    author_id: str
    distance: float | None = None


@app.get("/")
def root():
    """Root endpoint (for health check)."""
    return {"api": "is running."}


@app.post("/search_author/")
def search_author(query: APIQuery) -> list[APIAuthor]:
    """Search an author."""

    author_ids, scores = cached_resources["engine"].search_authors(
        query=query.query, top_k=query.top_k
    )
    logging.debug(f"{author_ids=}, {scores=}")

    output = []
    for author_id, score in zip(author_ids, scores):
        author_details = cached_resources["engine"].get_author(author_id)
        author_details["score"] = score  # inject score to author details
        output.append(APIAuthor(**author_details))

    return output


@app.post("/search_article/")
def search_article(query: APIQuery) -> list[APIArticle]:
    """Search an article."""

    results = cached_resources["engine"].search_articles(
        query=query.query, top_k=query.top_k
    )
    return [APIArticle(**result) for result in results]
