from dotenv import load_dotenv
from orcid import download_author
from pathlib import Path
import pandas as pd

load_dotenv()

AUTHORS_DIR = Path("authors/")


def list_downloaded_authors() -> list[str]:
    """List downloaded authors."""

    downloaded = AUTHORS_DIR.glob("*.pickle")
    return [author.stem for author in downloaded]


def main():
    """Download authors."""

    df = pd.read_parquet("tmp/df.parquet")
    orcids = df["Orchid id"].dropna().tolist()

    # Remaining authors
    downloaded = list_downloaded_authors()
    orcids = [orcid for orcid in orcids if orcid not in downloaded]

    for i, orcid in enumerate(orcids):
        print(f"Downloading {i+1}/{len(orcids)}: {orcid}")
        author = download_author(orcid)
        author.save(AUTHORS_DIR / f"{author.orcid}.pickle")


if __name__ == "__main__":
    main()
