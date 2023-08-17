import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from embedding_search.community_map import download_datafile
from embedding_search.crossref import batch_query_cited_by
from embedding_search.academic_analytics import get_units, get_faculties, get_author
from embedding_search.data_model import Article, Author
from tqdm import tqdm
from google.cloud import storage
from datetime import datetime
import argparse

load_dotenv()

AUTHORS_DIR = os.getenv("AUTHORS_DIR")
AUTHORS_DIR = Path(AUTHORS_DIR)
print(f"{AUTHORS_DIR=}")

logging.basicConfig(filename="main.log", level=logging.INFO)

if not AUTHORS_DIR:
    raise ValueError("AUTHORS_DIR must be set in .env")

COMMUNITY_DF = download_datafile()
DEBUG = int(os.getenv("DEBUG", 0))


def list_downloaded_authors() -> list[int]:
    """List downloaded authors."""

    downloaded = AUTHORS_DIR.glob("*.json")
    return [int(author.stem) for author in downloaded]


def append_embeddings(author: Author) -> Author:
    """Get embeddings for authors' articles."""

    embeddings = OpenAIEmbeddings()
    # embed all articles in batch (m articles, n dimensions)
    author.articles_embeddings = embeddings.embed_documents(author.texts)
    return author


def parse_article(article: dict) -> Article:
    """Parse an article from the academic analytics API.

    Args:
        article: dict, article data from academic analytics API
        cited_by: bool, whether to get cited by count from crossref
    """

    article = Article(
        doi=article["digitalObjectIdentifier"],
        title=article["title"],
        abstract=article["abstract"],
        publication_year=article["journalYear"],
    )

    return article


def download_one_author(id: int) -> None:
    """Parse an author from the academic analytics API."""

    raw_author = get_author(id)
    author = Author(
        id=id,
        unit_id=raw_author["primaryUnitAffiliation"]["id"],
        first_name=raw_author["firstName"],
        last_name=raw_author["lastName"],
    )

    article_dois = [
        article["digitalObjectIdentifier"] for article in raw_author["articles"]
    ]
    cited_by_data = batch_query_cited_by(article_dois)

    valid_articles = []
    for article in tqdm(raw_author["articles"]):
        try:
            parsed_article = parse_article(article)
            parsed_article.author_id = author.id
            parsed_article.cited_by = cited_by_data.get(parsed_article.doi, 0)
            valid_articles.append(parsed_article)
        except Exception:
            continue

    author.articles = valid_articles

    if author.articles:
        author = append_embeddings(author)
        author.save(AUTHORS_DIR / f"{author.id}.json")
    else:
        logging.info(f"Skipping {author.id} because they have no articles.")


def download_authors(overwrite: bool = False) -> None:
    """Download authors from ORCID and their papers from CrossRef."""

    downloaded = [] if overwrite else list_downloaded_authors()

    units = get_units()
    logging.info(f"Found {len(units)} units.")

    for i, unit in enumerate(units):
        faculties = get_faculties(unit["unitId"])
        for j, faculty in enumerate(faculties):
            print(f"Processing unit {i+1}/{len(units)}; faculty {j+1}/{len(faculties)}")
            if int(faculty["id"]) in downloaded:
                print(f"Skipping {faculty['id']} because it's already downloaded.")
                continue
            try:
                download_one_author(id=faculty["id"])
            except Exception as e:
                print(f"Error downloading {faculty['id']}: {e}")
                continue


def upload_blob(
    bucket_name: str, source_folder: str, destination_folder: str | None = None
):
    if destination_folder is None:
        destination_folder = datetime.today().strftime("%Y-%m-%d")
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    source_path = Path(source_folder)

    for local_path in source_path.rglob("*"):
        if local_path.is_file():
            blob_path = Path(destination_folder, local_path.relative_to(source_folder))
            blob = bucket.blob(str(blob_path))
            blob.upload_from_filename(str(local_path))
            print(f"{local_path} uploaded to {blob_path}.")


def main():
    """Main crawler."""

    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--push-to-bucket", action="store_true")

    args = parser.parse_args()
    download_authors(overwrite=args.overwrite)

    if args.push_to_bucket:
        upload_blob(bucket_name="community-search-raw", source_folder=AUTHORS_DIR)


if __name__ == "__main__":
    main()
