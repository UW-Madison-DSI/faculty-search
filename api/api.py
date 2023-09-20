import os
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import connections, Collection
from core import Engine, get_author_by_id
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

cached_resources = {}
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    filename="api.log",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cached resources management."""

    connections.connect(
        alias=os.getenv("MILVUS_ALIAS", "default"),
        host=os.getenv("MILVUS_HOST", "127.0.0.1"),
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
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


# IO Models
class SearchArticlesInputs(BaseModel):
    """Query data model."""

    query: str
    top_k: int = 3
    distance_threshold: float = 0.2
    since_year: int = 1900
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

    @validator("distance_threshold")
    def distance_threshold_must_be_zero_to_one(cls, v):
        """Validate that distance_threshold is between 0 and 1."""
        if v < 0 or v > 1:
            raise ValueError("distance_threshold must be between 0 and 1")
        return v

    @validator("since_year")
    def since_year_must_be_past(cls, v):
        """Validate that since_year is in the past."""
        current_year = datetime.now().year
        if v > current_year:
            raise ValueError("since_year must be in the past")
        return v


class SearchAuthorsInputs(BaseModel):
    """Query data model."""

    query: str
    top_k: int = 3
    n: int = 500
    m: int = 5
    since_year: int = 1900
    distance_threshold: float = 0.2
    pow: float = 3.0
    ks: float = 1.0
    ka: float = 1.0
    kr: float = 1.0
    with_plot: bool = False
    with_evidence: bool = False

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

    @validator("n")
    def n_must_be_positive(cls, v):
        """Validate that n is positive."""
        if v <= 0:
            raise ValueError("n must be positive")
        return v

    @validator("m")
    def m_must_be_positive(cls, v):
        """Validate that m is positive."""
        if v <= 0:
            raise ValueError("m must be positive")
        return v

    @validator("since_year")
    def since_year_must_be_past(cls, v):
        """Validate that since_year is in the past."""
        current_year = datetime.now().year
        if v > current_year:
            raise ValueError("since_year must be in the past")
        return v

    @validator("distance_threshold")
    def distance_threshold_must_be_zero_to_one(cls, v):
        """Validate that distance_threshold is between 0 and 1."""
        if v < 0 or v > 1:
            raise ValueError("distance_threshold must be between 0 and 1")
        return v


class GetAuthorInput(BaseModel):
    first_name: str
    last_name: str

    @validator("first_name", "last_name")
    def name_must_not_be_empty(cls, v):
        """Validate that name is not empty."""
        if not v.strip():
            raise ValueError("name must not be empty")
        return v


class GetAuthorByIdInput(BaseModel):
    author_id: str


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

    id: str | int
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
def get_author(query: GetAuthorInput) -> dict[str, APIAuthor | list[dict]]:
    """Search author by name."""

    try:
        results = cached_resources["engine"].get_author(
            first_name=query.first_name, last_name=query.last_name
        )
        # logging.debug(results)
    except ValueError:
        raise HTTPException(status_code=404, detail="Author not found.")
    return results


@app.post("/get_author_by_id/")
def get_author(query: GetAuthorByIdInput) -> dict[str, APIAuthor | list[dict]]:
    """Search author by name."""

    try:
        results = cached_resources["engine"].get_author_by_id(author_id=query.author_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Author not found.")
    return results


@app.post("/search_authors/")
def search_authors(
    query: SearchAuthorsInputs,
) -> dict[str, list[APIAuthor] | str | list]:
    """Search an author."""

    logging.debug(f"Search authors: {query.model_dump()}")
    data = cached_resources["engine"].search_authors(**query.model_dump())

    # Unpack data
    author_ids, scores = data["authors"]["author_ids"], data["authors"]["scores"]
    # logging.debug(f"{author_ids=}, {scores=}")

    authors = []
    for author_id, score in zip(author_ids, scores):
        author_details = get_author_by_id(
            author_id, cached_resources["engine"].author_collection
        )
        author_details["score"] = score  # inject score to author details
        authors.append(APIAuthor(**author_details))

    output = {}
    output["authors"] = authors

    if query.with_plot:
        output["plot_json"] = data["plot_json"]

    if query.with_evidence:
        output["evidence"] = data["evidence"]

    return output


@app.post("/search_articles/")
def search_articles(query: SearchArticlesInputs) -> dict[str, list[APIArticle] | str]:
    """Search an article."""

    data = cached_resources["engine"].search_articles(**query.model_dump())

    output = {}
    output["articles"] = [APIArticle(**result) for result in data["articles"]]

    if query.with_plot:
        output["plot_json"] = data["plot_json"]

    return output
