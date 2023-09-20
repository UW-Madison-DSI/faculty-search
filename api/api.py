import os
import logging
import requests
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from pymilvus import connections, Collection
from core import Engine, get_author_by_id
from fastapi.middleware.cors import CORSMiddleware
from data_model import (
    APIAuthor,
    APIArticle,
    GetAuthorInput,
    GetAuthorByIdInput,
    SearchAuthorsInputs,
    SearchArticlesInputs,
)

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


@app.get("/")
def root():
    """Root endpoint (for health check)."""
    return {"api": "is running."}


@app.get("/get_units/")
def get_units() -> dict[int, str]:
    """Get all units from the academic analytics API.

    returns:
        dict[int, str]: unit_id -> unit_name
    """
    headers = {
        "Content-Type": "application/json",
    }
    url = "https://wisc.discovery.academicanalytics.com/api/units/GetInstitutionUnitsForInstitutions"
    uw_id = 14
    response = requests.post(url, headers=headers, json={"InstitutionIds": [uw_id]})

    if response.status_code != 200:
        raise Exception(
            f"Error getting units from academic analytics API: {response.status_code}"
        )

    all_units = response.json()
    return {
        unit["unitId"]: unit["unit"]["name"]
        for unit in all_units
        if not unit["unit"]["isAdministrator"]
    }


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
