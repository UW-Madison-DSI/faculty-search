import os
import pandas as pd


def download_datafile() -> pd.DataFrame:
    """Download raw data file from community map API."""

    api_key = os.getenv("COMMUNITY_MAP_KEY")
    url = f"https://maps.datascience.wisc.edu/apis/authentication/public/api/contact-info?password={api_key}&format=csv"
    return pd.read_csv(url)


def parse(df: pd.DataFrame) -> tuple[list, list[dict]]:
    """Parse dataframe to get texts for embeddings and its metadatas."""

    # Rename columns
    name_mapping = {
        "Orchid id": "orcid",
        "First name": "first_name",
        "Last name": "last_name",
        "Email address": "email",
        "Research summary": "summary",
    }
    data = df.rename(columns=name_mapping)
    selected_columns = list(name_mapping.values())

    data = data[selected_columns]
    data = data.dropna(subset=[c for c in selected_columns if c != "orcid"])

    texts = data["summary"].tolist()
    metadatas = data[["orcid", "first_name", "last_name", "email"]].to_dict(
        orient="records"
    )

    # Append `user` type to metadata
    for metadata in metadatas:
        metadata["type"] = "user"

    return texts, metadatas


def extract_metadata(metadatas: list[dict], key: str) -> list:
    """Extract metadata values."""

    values = []
    for metadata in metadatas:
        values.append(metadata[key])
    return values
