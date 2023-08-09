import os
import logging
from pathlib import Path
from functools import cache
from dotenv import load_dotenv
from embedding_search.data_model import Author
from pymilvus import (
    CollectionSchema,
    FieldSchema,
    DataType,
    Collection,
    connections,
)

load_dotenv()

AUTHORS_DIR = Path(os.getenv("AUTHORS_DIR"))
DEBUG = int(os.getenv("DEBUG", 0))
MILVUS_ALIAS = os.getenv("MILVUS_ALIAS", "default")
MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")


@cache
def get_author(id: str) -> Author:
    """Get author from id."""
    return Author.load(AUTHORS_DIR / f"{id}.json")


def create_article_collection() -> None:
    """Create a collection named articles in Milvus."""

    schema = CollectionSchema(
        fields=[
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
            FieldSchema(name="doi", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="author_id", dtype=DataType.INT64),
            FieldSchema(name="publication_year", dtype=DataType.INT32),
            FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=2048),
            FieldSchema(name="abstract", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="cited_by", dtype=DataType.INT32),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
        ],
        description="Articles",
        auto_id=True,
    )

    Collection(name="articles", schema=schema, using="default")


def create_author_collection() -> None:
    """Create a collection named authors in Milvus."""

    schema = CollectionSchema(
        fields=[
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
            FieldSchema(name="unit_id", dtype=DataType.INT64),
            FieldSchema(name="first_name", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="last_name", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="community_name", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
        ],
        description="Authors",
    )

    Collection(name="authors", schema=schema, using="default")


def make_author_data_package(author_id: str) -> None:
    """Convert into data package that fits Milvus schema."""

    author = get_author(author_id)
    data = author.dict(
        include={"id", "unit_id", "first_name", "last_name", "community_name"}
    ).copy()

    # Patch None values to fit Milvus schema
    if data["community_name"] is None:
        data["community_name"] = ""

    data["embedding"] = author.embedding  # this is property
    return data


def make_articles_data_packages(author_id: str) -> list[dict]:
    """Convert into data package that fits Milvus schema."""

    author = get_author(author_id)

    data_packages = []
    for article, embedding in zip(author.articles, author.articles_embeddings):
        if len(embedding) != 1536 or article.doi is None:
            continue

        data = article.dict().copy()
        data["author_id"] = author.id
        if data["abstract"] is None:
            data["abstract"] = ""
        if data["publication_year"] is None:
            data["publication_year"] = 0
        if data["cited_by"] is None:
            data["cited_by"] = 0
        data["embedding"] = embedding
        data_packages.append(data)

    return data_packages


def connect_milvus() -> None:
    """Connect to Milvus."""
    connections.connect(MILVUS_ALIAS, host=MILVUS_HOST, port=MILVUS_PORT)


def init_milvus() -> None:
    """Initialize Milvus (assume connection exist)."""

    # Create collections
    logging.info("Creating collections...")
    create_article_collection()
    create_author_collection()

    author_collection = Collection("authors")
    article_collection = Collection("articles")

    # Create index setting
    index_params = {
        "metric_type": "IP",  # inner-product
        "index_type": "IVF_FLAT",
        "params": {"nlist": 1024},
    }

    article_collection.create_index("embedding", index_params)
    author_collection.create_index("embedding", index_params)


def push_data(
    author_id: str, author_collection: Collection, article_collection: Collection
) -> None:
    """Push author data to Milvus.

    Note. Remember to call collection.flush() after ingestion session.
    """

    author = author_collection.query(expr=f"id == {author_id}", limit=1)

    if author:
        logging.info(f"Author {author_id} already exists in Milvus. Skipping...")
        return

    # Ingest authors
    logging.info("Ingesting authors...")
    author_data_package = make_author_data_package(author_id)
    author_collection.insert([author_data_package])

    # Ingest articles (can be quite large)
    logging.info("Ingesting articles...")
    articles_data_package = make_articles_data_packages(author_id)
    article_collection.insert(articles_data_package)
