import logging
from pathlib import Path
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from embedding_search.community_map import download_datafile
from embedding_search.crossref import query_crossref
from embedding_search.academic_analytics import get_units, get_faculties, get_articles
from embedding_search.data_model import Article, Author
from tqdm import tqdm

load_dotenv()

AUTHORS_DIR = Path("authors/")
COMMUNITY_DF = download_datafile()


def list_downloaded_authors() -> list[int]:
    """List downloaded authors."""

    downloaded = AUTHORS_DIR.glob("*.json")
    return [int(author.stem) for author in downloaded]


# def append_community_info(author: Author) -> Author:
#     """Add email address and community name to author."""

#     id_to_community_name = {
#         row.orcid: row.community_name for row in COMMUNITY_DF.itertuples()
#     }
#     id_to_email = {row.orcid: row.email for row in COMMUNITY_DF.itertuples()}
#     author.email = id_to_email[author.orcid]
#     author.community_name = id_to_community_name[author.orcid]
#     return author


def append_embeddings(author: Author) -> Author:
    """Get embeddings for authors' articles."""

    embeddings = OpenAIEmbeddings()
    # embed all articles in batch (m articles, n dimensions)
    author.articles_embeddings = embeddings.embed_documents(author.texts)
    return author


def parse_article(article: dict, cited_by: bool = False) -> Article:
    """Parse an article from the academic analytics API.

    Args:
        article: dict, article data from academic analytics API
        cited_by: bool, whether to get cited by count from crossref
    """

    article = Article(
        doi=article["digitalObjectIdentifier"],
        title=article["title"],
        abstract=article["abstract"],
    )

    # Get cited by count from crossref
    if not (cited_by and article.doi):
        return article

    # Try to get cited by count from crossref
    crossref_data = query_crossref(article.doi, fields=["is-referenced-by-count"])
    if crossref_data["is-referenced-by-count"] is not None:
        article.cited_by = crossref_data["is-referenced-by-count"]
    return article


def download_one_author(
    id: int, first_name: str, last_name: str, unit_id: int | None = None
) -> None:
    """Parse an author from the academic analytics API."""

    author = Author(id=id, unit_id=unit_id, first_name=first_name, last_name=last_name)
    articles = get_articles(author.id)

    valid_articles = []
    for article in tqdm(articles):
        try:
            valid_articles.append(parse_article(article))
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

    for i, unit in enumerate(units):
        unit_id = unit["unitId"]
        faculties = get_faculties(unit_id)
        for j, faculty in enumerate(faculties):
            print(f"Processing unit {i+1}/{len(units)}; faculty {j+1}/{len(faculties)}")
            if int(faculty["id"]) in downloaded:
                print(f"Skipping {faculty['id']} because it's already downloaded.")
                continue
            try:
                download_one_author(
                    id=faculty["id"],
                    first_name=faculty["firstName"],
                    last_name=faculty["lastName"],
                    unit_id=unit_id,
                )
            except Exception as e:
                print(f"Error downloading {faculty['id']}: {e}")
                continue


def main() -> None:
    """Main function."""
    download_authors(overwrite=False)


if __name__ == "__main__":
    main()
