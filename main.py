from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from tqdm import tqdm

from embedding_search.orcid import Author, download_author

load_dotenv()

AUTHORS_DIR = Path("authors/")


def list_downloaded_authors() -> list[str]:
    """List downloaded authors."""

    downloaded = AUTHORS_DIR.glob("*.pickle")
    return [author.stem for author in downloaded]


def download_authors() -> None:
    """Download authors from ORCID and their papers from CrossRef."""

    df = pd.read_parquet("tmp/df.parquet")
    orcids = df["Orchid id"].dropna().tolist()

    # Remaining authors
    downloaded = list_downloaded_authors()
    orcids = [orcid for orcid in orcids if orcid not in downloaded]

    for i, orcid in enumerate(orcids):
        try:
            print(f"Downloading {i+1}/{len(orcids)}: {orcid}")
            author = download_author(orcid)
            author.save(AUTHORS_DIR / f"{author.orcid}.pickle")
        except Exception as e:
            print(f"Error downloading {orcid}: {e}")
            continue


def get_embeddings() -> None:
    """Get embeddings for authors' articles."""

    embeddings = OpenAIEmbeddings()
    authors = AUTHORS_DIR.glob("*.pickle")
    for author in tqdm(authors):
        try:
            author = Author.load(author)
            author.articles_embeddings = embeddings.embed_documents(author.texts)
            author.save(AUTHORS_DIR / f"{author.orcid}.pickle")
        except Exception as e:
            print(f"Error embedding {author.orcid}: {e}")
            pass


def main() -> None:
    """Main function."""
    pass


if __name__ == "__main__":
    main()
