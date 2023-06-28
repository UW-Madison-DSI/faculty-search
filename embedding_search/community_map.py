from functools import cache
import os
import pandas as pd


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


@cache
def download_datafile(parse: bool = True) -> pd.DataFrame:
    """Download raw data file from community map API."""

    api_key = os.getenv("COMMUNITY_MAP_KEY")
    url = f"https://maps.datascience.wisc.edu/apis/authentication/public/api/contact-info?password={api_key}&format=csv"
    df = pd.read_csv(url)
    if not parse:
        return df
    return parse_df(df)
