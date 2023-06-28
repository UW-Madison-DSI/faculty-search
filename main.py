import logging
from pathlib import Path
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from embedding_search.orcid import Author, download_author
from embedding_search.community_map import download_datafile

load_dotenv()

AUTHORS_DIR = Path("authors/")
COMMUNITY_DF = download_datafile()


def list_downloaded_authors() -> list[str]:
    """List downloaded authors."""

    downloaded = AUTHORS_DIR.glob("*.json")
    return [author.stem for author in downloaded]


def append_community_info(author: Author) -> Author:
    """Add email address and community name to author."""

    id_to_community_name = {
        row.orcid: row.community_name for row in COMMUNITY_DF.itertuples()
    }
    id_to_email = {row.orcid: row.email for row in COMMUNITY_DF.itertuples()}
    author.email = id_to_email[author.orcid]
    author.community_name = id_to_community_name[author.orcid]
    return author


def append_embeddings(author: Author) -> Author:
    """Get embeddings for authors' articles."""

    embeddings = OpenAIEmbeddings()
    # embed all articles in batch (m articles, n dimensions)
    author.articles_embeddings = embeddings.embed_documents(author.texts)
    return author


def download_one_author(orcid: str) -> None:
    """Download one author."""

    author = download_author(orcid)
    author = append_community_info(author)
    if author.articles:
        author = append_embeddings(author)
        author.save(AUTHORS_DIR / f"{author.orcid}.json")
    else:
        logging.info(f"Skipping {author.orcid} because they have no articles.")


def download_authors(overwrite: bool = False) -> None:
    """Download authors from ORCID and their papers from CrossRef."""

    orcids = COMMUNITY_DF.orcid.tolist()

    if not overwrite:
        # Skip downloaded authors
        downloaded = list_downloaded_authors()
        orcids = [orcid for orcid in orcids if orcid not in downloaded]

    for i, orcid in enumerate(orcids):
        try:
            print(f"Downloading {i+1}/{len(orcids)}: {orcid}")
            download_one_author(orcid)
        except Exception as e:
            print(f"Error downloading {orcid}: {e}")
            continue


def main() -> None:
    """Main function."""
    download_authors(overwrite=False)


if __name__ == "__main__":
    main()
