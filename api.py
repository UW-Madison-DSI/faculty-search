import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel, validator
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import connections, Collection
from embedding_search.utils import sort_key_by_value

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
    cached_resources["authors_collection"] = Collection(name="authors")
    cached_resources["authors_collection"].load()
    cached_resources["embeddings"] = OpenAIEmbeddings()
    yield

    # Release resources when app stops
    cached_resources["authors_collection"].release()
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


def query_author(author_id: str) -> dict:
    """Get author details from Milvus."""

    author = cached_resources["authors_collection"].query(
        expr=f"author_id == {author_id}",
        output_fields=["first_name", "last_name", "community_name"],
        limit=1,
    )
    return author[0]


def search(
    query: str,
    top_k: int,
    n: int = 1000,
    distance_threshold: float = 0.2,
    pow: float = 3.0,
) -> list:
    """Search for author by a query.
    
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

    Args:
        query (str): Query string.
        top_k (int, optional): Number of authors to return. 
        n (int, optional): Number of articles $n$ in the weighting pool. Defaults to 1000.
        distance_threshold (float, optional): Distance threshold. Defaults to 0.2.
        pow (float, optional): Power in weighting function $p$. Defaults to 3.0.
    
    """

    search_vector = cached_resources["embeddings"].embed_query(query)
    logging.debug(search_vector)

    search_params = {"metric_type": "IP", "params": {"nprobe": 16}}
    fields = ["title", "author_id", "doi"]
    results = cached_resources["articles_collection"].search(
        data=[search_vector],
        anns_field="embedding",
        param=search_params,
        limit=top_k,
        output_fields=fields,
    )
    logging.debug(f"result before filtering: {results}")

    def _flatten(result) -> dict:
        """Flatten a result."""

        flat_result = {}
        flat_result["distance"] = 1 - result.distance  # CAUTION: distance is IP

        for field in fields:
            flat_result[field] = result.entity.get(field)

        return flat_result

    # Flatten and filter by distance threshold
    results = [_flatten(result) for result in results[0]]
    results = [result for result in results if result["distance"] < distance_threshold]

    logging.debug(f"result after filtering: {results}")
    # Calculate author scores = Sum((1-distance) ** pow)

    author_scores: dict[str, float] = {}
    for result in results:
        author_id = result["author_id"]
        weight = (1 - result["distance"]) ** pow
        result["weight"] = weight
        author_scores[author_id] = author_scores.get(author_id, 0) + weight

    logging.debug(f"{author_scores=}")
    top_ids = sort_key_by_value(author_scores, reversed=True)[:top_k]

    logging.debug(f"{top_ids=}")

    return top_ids


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "is running."}


@app.post("/search_paper/")
def search_author(query: APIQuery) -> list:
    """Search an author."""

    return search(query.query, query.top_k)
