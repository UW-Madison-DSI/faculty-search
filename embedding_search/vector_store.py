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
    utility,
)
from multiprocessing import Pool
from tqdm import tqdm

load_dotenv()

AUTHOR_DIR = Path(os.getenv("AUTHOR_DIR"))
DEBUG = int(os.getenv("DEBUG", 0))
MILVUS_ALIAS = os.getenv("MILVUS_ALIAS", "default")
MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")


@cache
def get_author(id: str) -> Author:
    """Get author from id."""
    return Author.load(AUTHOR_DIR / f"{id}.json")


def create_articles_collection() -> None:
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


def create_authors_collection() -> None:
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


def init_milvus(n: int | None = None) -> None:
    """Initialize Milvus (assume connection exist)."""

    connections.connect(MILVUS_ALIAS, host=MILVUS_HOST, port=MILVUS_PORT)
    # Create collections

    logging.info("Creating collections...")
    create_articles_collection()
    create_authors_collection()

    # Create index setting
    index_params = {
        "metric_type": "IP",  # inner-product
        "index_type": "IVF_FLAT",
        "params": {"nlist": 1024},
    }

    article_collection.create_index("embedding", index_params)
    author_collection.create_index("embedding", index_params)


def push_data(author_id: str) -> None:
    """Push author data to Milvus.

    Note. Remember to call collection.flush() after ingestion session.
    """

    # Ingest authors
    logging.info("Ingesting authors...")
    author_data_package = make_author_data_package(author_id)
    Collection("authors", using=MILVUS_ALIAS).insert([author_data_package])

    # Ingest articles (can be quite large)
    logging.info("Ingesting articles...")
    articles_data_package = make_articles_data_packages(author_id)
    Collection("articles", using=MILVUS_ALIAS).insert(articles_data_package)
