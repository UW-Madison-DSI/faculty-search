import logging
import os
import argparse

from pathlib import Path
from dotenv import load_dotenv
from embedding_search.vector_store import connect_milvus, init_milvus, push_data
from pymilvus import Collection
from tqdm import tqdm


load_dotenv()

AUTHORS_DIR = os.getenv("AUTHORS_DIR")
DEBUG = int(os.getenv("DEBUG", 0))
MILVUS_ALIAS = os.getenv("MILVUS_ALIAS", "default")
AUTHORS_DIR = Path(AUTHORS_DIR)
print(f"{AUTHORS_DIR=}")

logging.basicConfig(filename="main.log", level=logging.INFO)


def ingest(init: bool = False) -> None:
    """Ingest data to Milvus."""

    connect_milvus()

    if init:
        init_milvus()

    author_ids = [file.stem for file in AUTHORS_DIR.glob("*.json")]
    author_collection = Collection("authors")
    article_collection = Collection("articles")

    if DEBUG:
        author_ids = author_ids[:100]

    for author_id in tqdm(author_ids):
        try:
            push_data(author_id, author_collection, article_collection)
        except Exception as e:
            logging.error(f"Error pushing {author_id}: {e}")

    # Flush data to make sure everything is persisted
    author_collection.flush()
    article_collection.flush()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--init", action="store_true", help="Initialize Milvus")
    args = parser.parse_args()
    ingest(init=args.init)


if __name__ == "__main__":
    main()
