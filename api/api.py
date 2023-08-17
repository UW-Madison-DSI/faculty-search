import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, validator
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import connections, Collection
from core import Engine, get_author_by_id
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


# IO Models
class APIQuery(BaseModel):
    """Query data model."""

    query: str
    top_k: int = 3
    with_plot: bool = False

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


class APIAuthorQuery(BaseModel):
    first_name: str
    last_name: str

    @validator("first_name", "last_name")
    def name_must_not_be_empty(cls, v):
        """Validate that name is not empty."""
        if not v.strip():
            raise ValueError("name must not be empty")
        return v


class APIPlotData(BaseModel):
    """Plot data model."""

    x: list[float]
    y: list[float]
    id: list[str | int]
    parent_id: list[int]
    label: list[str]
    type: list[str]


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


@app.post("/get_author/")
def get_author(query: APIAuthorQuery) -> dict[str, APIAuthor | list[dict]]:
    """Search author by name."""
    results = cached_resources["engine"].get_author(
        first_name=query.first_name, last_name=query.last_name
    )
    logging.debug(results)
    return results


@app.post("/search_authors/")
def search_authors(query: APIQuery) -> dict[str, list[APIAuthor] | str]:
    """Search an author."""

    data = cached_resources["engine"].search_authors(
        query=query.query, top_k=query.top_k, with_plot=query.with_plot
    )

    # Unpack data
    author_ids, scores = data["authors"]["author_ids"], data["authors"]["scores"]
    logging.debug(f"{author_ids=}, {scores=}")

    authors = []
    for author_id, score in zip(author_ids, scores):
        author_details = get_author_by_id(
            author_id, cached_resources["engine"].author_collection
        )
        author_details["score"] = score  # inject score to author details
        authors.append(APIAuthor(**author_details))

    output = {}
    output["authors"] = authors

    if not query.with_plot:
        return output

    # Add plot data
    # TODO: Consider validating plot json with VEGA schema
    output["plot_json"] = data["plot_json"]
    return output


@app.post("/search_articles/")
def search_articles(query: APIQuery) -> dict[str, list[APIArticle] | str]:
    """Search an article."""

    data = cached_resources["engine"].search_articles(
        query=query.query, top_k=query.top_k, with_plot=query.with_plot
    )

    output = {}
    output["articles"] = [APIArticle(**result) for result in data["articles"]]

    if not query.with_plot:
        return output

    # Add plot data
    output["plot_json"] = data["plot_json"]
    return output
