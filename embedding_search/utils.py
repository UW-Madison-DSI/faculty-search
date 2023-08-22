from time import sleep
import re
import os
from pathlib import Path
from dotenv import load_dotenv
from google.cloud import storage
from datetime import datetime

load_dotenv()
AUTHORS_DIR = Path(os.getenv("AUTHORS_DIR"))
DEBUG = int(os.getenv("DEBUG", 0))


def timeout(func, duration=0.5):
    """Delay the execution of a function to prevent blockage."""

    def wrapper(*args, **kwargs):
        sleep(duration)
        return func(*args, **kwargs)

    return wrapper


def extract_orcid(text: str) -> str:
    """Extract ORCID from text."""

    orcid_patterns = re.findall(r"\d{4}-\d{4}-\d{4}-\d{3}[0-9X]", text)
    return orcid_patterns[0]


def sort_key_by_value(d: dict, reversed: bool = False):
    return [k for k, _ in sorted(d.items(), key=lambda item: item[1], reverse=reversed)]


def list_downloaded_authors() -> list[int]:
    """List downloaded authors."""

    downloaded = AUTHORS_DIR.glob("*.json")
    return [int(author.stem) for author in downloaded]


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
