from functools import cache
import os
import pandas as pd
import urllib.parse
import requests


def parse_df(df: pd.DataFrame) -> pd.DataFrame:
    """Parse dataframe to get texts for embeddings and its metadatas."""

    # Rename columns
    name_mapping = {
        "Orchid id": "orcid",
        "First name": "first_name",
        "Last name": "last_name",
        "Email address": "email",
    }
    df = df.rename(columns=name_mapping)
    selected_columns = list(name_mapping.values())

    df = df[selected_columns]
    df = df.dropna()

    df["community_name"] = df["first_name"] + " " + df["last_name"]
    return df


def get_community_map_url(name: str) -> str | None:
    """Generate a URL to the community map for a given author."""
    url = "https://maps.datascience.wisc.edu/?query="

    if name is None:
        return None

    return url + urllib.parse.quote(name)


@cache
def download_datafile(parse: bool = True) -> pd.DataFrame:
    """Download raw data file from community map API."""

    api_key = os.getenv("COMMUNITY_MAP_KEY")
    url = f"https://maps.datascience.wisc.edu/apis/authentication/public/api/contact-info?password={api_key}&format=csv"

    df = pd.read_csv(url)
    if not parse:
        return df
    return parse_df(df)


@cache
def download_json() -> dict:
    """Download raw json from community map API."""

    api_key = os.getenv("COMMUNITY_MAP_KEY")
    url = f"https://maps.datascience.wisc.edu/apis/authentication/public/api/contact-info?password={api_key}&format=json"

    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(
            f"Error getting community tag from community map API: {response.status_code}"
        )
    return response.json()


def get_community_tags(academic_analytic_id: str) -> str | None:
    """Get community tag from community map API."""

    data = download_json()
    for item in data:
        if item["aaid"] == academic_analytic_id:
            return item["communities"]
    return None
