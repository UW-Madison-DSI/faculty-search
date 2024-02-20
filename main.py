import argparse
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from pymilvus import utility, Collection
from tqdm import tqdm

from embedding_search.vector_store import (
    connect_milvus,
    create_article_collection,
    create_author_collection,
    init_milvus,
    push_data,
    print_collections,
)

load_dotenv()

AUTHORS_DIR = os.getenv("AUTHORS_DIR")
MILVUS_ALIAS = os.getenv("MILVUS_ALIAS", "default")
AUTHORS_DIR = Path(AUTHORS_DIR)
print(f"{AUTHORS_DIR=}")

logging.basicConfig(filename="main.log", level=logging.INFO)


def ingest(init: bool = False, debug: bool = False) -> None:
    """Ingest data to Milvus."""

    connect_milvus()

    if init:
        init_milvus()

    author_ids = [file.stem for file in AUTHORS_DIR.glob("*.json")]

    # Create new staging collections
    author_collection = create_author_collection(name="staging_authors")
    article_collection = create_article_collection(name="staging_articles")

    # Ingest data
    if debug:
        author_ids = author_ids[:100]

    for author_id in tqdm(author_ids):
        try:
            push_data(author_id, author_collection, article_collection)
        except Exception as e:
            logging.error(f"Error pushing {author_id}: {e}")

    # Flush data to make sure everything is persisted
    author_collection.flush()
    article_collection.flush()

    # Swap staging collections with production collections
    utility.rename_collection("authors", "old_authors")
    utility.rename_collection("articles", "old_articles")
    utility.rename_collection("staging_authors", "authors")
    utility.rename_collection("staging_articles", "articles")

    # Reload collections
    Collection("authors").load()
    Collection("articles").load()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--init", action="store_true", help="Initialize Milvus")
    parser.add_argument("--debug", action="store_true", help="Debug mode")
    args = parser.parse_args()
    ingest(init=args.init, debug=args.debug)
    print_collections()


if __name__ == "__main__":
    main()
