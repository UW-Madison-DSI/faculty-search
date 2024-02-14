import logging
from langchain.embeddings import OpenAIEmbeddings
from embedding_search.academic_analytics import get_units, get_faculties, get_author
from embedding_search.vector_store import get_author as get_downloaded_author
from embedding_search.utils import AUTHORS_DIR, upload_blob
from embedding_search.data_model import Author
import argparse

logging.basicConfig(filename="main.log", level=logging.INFO)


def append_embeddings(author: Author) -> Author:
    """Get embeddings for authors' articles."""

    embeddings = OpenAIEmbeddings()
    # embed all articles in batch (m articles, n dimensions)
    author.articles_embeddings = embeddings.embed_documents(author.texts)
    return author


def download_one_author(id: int | str) -> None:
    """Download or update an author json."""

    if isinstance(id, str):
        id = int(id)

    try:
        author = get_downloaded_author(id)
    except FileNotFoundError:
        raw_author = get_author(id)
        author = Author(
            id=id,
            unit_id=raw_author["primaryUnitAffiliation"]["id"],
            first_name=raw_author["firstName"],
            last_name=raw_author["lastName"],
        )
    author.update()


def download_all_authors_in_unit(unit: int) -> None:
    """Download all authors in a list of units."""

    faculties = get_faculties(unit)
    for i, faculty in enumerate(faculties):
        try:
            print(f"Processing faculty {i+1}/{len(faculties)}: {faculty['id']}")
            download_one_author(faculty["id"])
        except Exception as e:
            print(f"Error downloading {faculty['id']}: {e}")
            continue


def download_authors(resume_from: int = 0) -> None:
    """Download authors from ORCID and their papers from CrossRef."""

    units = get_units()
    if resume_from:
        units = units[resume_from:]
    logging.info(f"Found {len(units)} units.")
    for i, unit in enumerate(units):
        print(f"Processing unit {i+1}/{len(units)}: {unit['unitId']}")
        download_all_authors_in_unit(int(unit["unitId"]))


def main():
    """Main crawler."""

    parser = argparse.ArgumentParser()
    parser.add_argument("--push-to-bucket", action="store_true")
    parser.add_argument("--resume-from", type=int, default=0)

    args = parser.parse_args()
    download_authors(resume_from=args.resume_from)

    if args.push_to_bucket:
        upload_blob(bucket_name="community-search-raw", source_folder=AUTHORS_DIR)


if __name__ == "__main__":
    main()
