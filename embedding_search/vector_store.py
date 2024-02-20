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

load_dotenv()

AUTHORS_DIR = Path(os.getenv("AUTHORS_DIR"))
DEBUG = int(os.getenv("DEBUG", 0))
MILVUS_ALIAS = os.getenv("MILVUS_ALIAS", "default")
MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")

# Embedding specific index settings
INDEX_PARAMS = {
    "metric_type": "IP",  # inner-product
    "index_type": "IVF_FLAT",
    "params": {"nlist": 1024},
}


@cache
def get_author(id: str) -> Author:
    """Get author from id."""
    return Author.load(AUTHORS_DIR / f"{id}.json")


def create_article_collection(name: str = "articles") -> Collection:
    """Create a articles collection in Milvus."""

    schema = CollectionSchema(
        fields=[
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
            FieldSchema(
                name="doi", dtype=DataType.VARCHAR, max_length=256
            ),  # NOT UNIQUE: multiple authors can have the same article
            FieldSchema(
                name="author_id", dtype=DataType.INT64
            ),  # Only 1-1 mapping for now
            FieldSchema(name="journal", dtype=DataType.VARCHAR, max_length=2048),
            FieldSchema(name="publication_year", dtype=DataType.INT32),
            FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=2048),
            FieldSchema(name="abstract", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="cited_by", dtype=DataType.INT32),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
        ],
        description="Articles",
        auto_id=True,
    )

    collection = Collection(name=name, schema=schema)
    collection.create_index("embedding", INDEX_PARAMS)
    return collection


def create_author_collection(name: str = "authors") -> Collection:
    """Create a authors collection in Milvus."""

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
    collection = Collection(name=name, schema=schema)
    collection.create_index("embedding", INDEX_PARAMS)
    return collection


def make_author_data_package(author_id: str) -> dict:
    """Convert into data package that fits Milvus schema."""

    author = get_author(author_id)
    data = author.model_dump(
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
        if article.doi is None:
            continue

        data = article.model_dump().copy()
        data["author_id"] = author.id
        if data["abstract"] is None:
            data["abstract"] = ""
        if data["journal"] is None:
            data["journal"] = ""
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
    print(utility.get_server_version())


def init_milvus() -> None:
    """Initialize Milvus (assume connection exist)."""

    # Create collections
    logging.info("Creating collections...")
    create_article_collection()
    create_author_collection()


def push_data(
    author_id: str, author_collection: Collection, article_collection: Collection
) -> None:
    """Push author data to Milvus.

    Note. Remember to call collection.flush() after ingestion session.
    """

    # Ingest authors
    logging.info(f"Ingesting author {author_id}...")
    author_data_package = make_author_data_package(author_id)
    author_collection.insert([author_data_package])

    # Ingest articles (can be quite large)
    articles_data_package = make_articles_data_packages(author_id)
    article_collection.insert(articles_data_package)


def print_collections() -> None:
    """Print collections and their number of entities."""

    for collection_name in utility.list_collections():
        collection = Collection(collection_name)
        print(collection_name, collection.num_entities)
