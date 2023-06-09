import os
import pandas as pd


def download_datafile() -> pd.DataFrame:
    """Download raw data file from community map API."""

    api_key = os.getenv("COMMUNITY_MAP_KEY")
    url = f"https://maps.datascience.wisc.edu/apis/authentication/public/api/contact-info?password={api_key}&format=csv"
    return pd.read_csv(url)


def parse(df) -> tuple[list, list[dict]]:
    """Parse dataframe to get texts for embeddings and its metadatas."""

    data = df[["First name", "Last name", "Email address", "Research summary"]].dropna()
    data["name"] = data["First name"] + " " + data["Last name"]
    data["text"] = data["name"] + "; " + data["Research summary"]
    data.drop(["First name", "Last name", "Research summary"], axis=1, inplace=True)
    data.rename(columns={"Email address": "email"}, inplace=True)

    texts = data["text"].tolist()
    metadatas = data[["email", "name"]].to_dict(orient="records")
    return texts, metadatas


def extract_metadata(metadatas: list[dict], key: str) -> list:
    """Extract metadata values."""

    values = []
    for metadata in metadatas:
        values.append(metadata[key])
    return values
