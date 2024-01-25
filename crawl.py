import logging
import json
from langchain.embeddings import OpenAIEmbeddings
from embedding_search.crossref import batch_query_cited_by
from embedding_search.academic_analytics import get_units, get_faculties, get_author
from embedding_search.data_model import Article, Author
from tqdm import tqdm
from embedding_search.utils import AUTHORS_DIR, list_downloaded_authors, upload_blob
import argparse

logging.basicConfig(filename="main.log", level=logging.INFO)


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
        journal=article["journalName"],
        doi=article["digitalObjectIdentifier"],
        title=article["title"],
        abstract=article["abstract"],
        publication_year=article["journalYear"],
    )

    return article


def download_one_author(id: int) -> None:
    """Parse an author from the academic analytics API."""

    if isinstance(id, str):
        id = int(id)

    raw_author = get_author(id)
    author = Author(
        id=id,
        unit_id=raw_author["primaryUnitAffiliation"]["id"],
        first_name=raw_author["firstName"],
        last_name=raw_author["lastName"],
    )
    print(author)

    # Subset to articles with DOIs
    valid_articles = []
    for article in tqdm(raw_author["articles"]):
        try:
            parsed_article = parse_article(article)
            parsed_article.author_id = author.id
            valid_articles.append(parsed_article)
        except Exception:
            continue
    author.articles = valid_articles

    # Append cited by count
    article_dois = [article.doi for article in author.articles]
    cited_by_data = batch_query_cited_by(article_dois)

    for article in author.articles:
        article.cited_by = cited_by_data.get(parsed_article.doi, None)

    if author.articles:
        author = append_embeddings(author)
        author.save(AUTHORS_DIR / f"{author.id}.json")
    else:
        logging.info(f"Skipping {author.id} because they have no articles.")


def download_all_authors_in_unit(unit: int, overwrite: bool = False) -> None:
    """Download all authors in a list of units."""

    downloaded = [] if overwrite else list_downloaded_authors()

    faculties = get_faculties(unit)
    for i, faculty in enumerate(faculties):
        # Overwrite protection
        if (not overwrite) and (int(faculty["id"]) in downloaded):
            print(f"Skipping {faculty['id']} because it's already downloaded.")
            continue
        try:
            print(f"Processing faculty {i+1}/{len(faculties)}: {faculty['id']}")
            download_one_author(faculty["id"])
        except Exception as e:
            print(f"Error downloading {faculty['id']}: {e}")
            continue


def download_authors(overwrite: bool = False, resume_from: int = 0) -> None:
    """Download authors from ORCID and their papers from CrossRef."""

    units = get_units()
    if resume_from:
        units = units[resume_from:]
    logging.info(f"Found {len(units)} units.")
    for i, unit in enumerate(units):
        print(f"Processing unit {i+1}/{len(units)}: {unit['unitId']}")
        download_all_authors_in_unit(int(unit["unitId"]))


def repair_authors() -> None:
    """Repair corrupted author files."""

    author_files = list(AUTHORS_DIR.glob("*.json"))

    for author_file in tqdm(author_files):
        try:
            with open(author_file) as f:
                _ = json.load(f)
        except json.decoder.JSONDecodeError:
            print(f"{author_file} is not a valid json file")
            author_file.unlink()
            print(f"{author_file} deleted and redownload...")
            download_one_author(author_file.stem)
            continue


def main():
    """Main crawler."""

    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--push-to-bucket", action="store_true")
    parser.add_argument("--resume-from", type=int, default=0)

    args = parser.parse_args()
    download_authors(overwrite=args.overwrite, resume_from=args.resume_from)

    if args.push_to_bucket:
        upload_blob(bucket_name="community-search-raw", source_folder=AUTHORS_DIR)


if __name__ == "__main__":
    main()
