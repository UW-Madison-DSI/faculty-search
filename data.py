import os
import re
import requests
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


def get_abstract(doi: str) -> str | None:
    """Get abstract from Crossref."""
    api_url = f"https://api.crossref.org/works/{doi}"
    response = requests.get(api_url)

    if response.status_code == 200:
        data = response.json()

        if "abstract" not in data["message"]:
            return None
        return data["message"]["abstract"]
    else:
        return None


# Basic abstract cleaning functions
def strip_xml_tags(text: str) -> str:
    return re.sub(r"<[^>]*>", " ", text)


def strip_latex(text: str) -> str:
    return re.sub(r"\$.*?\$", "", text)


def remove_extra_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text)


def remove_leading_spaces(text: str) -> str:
    return re.sub(r"^\s+", "", text)


def strip_words_with_backslash(text: str) -> str:
    return re.sub(r"\\[^ ]+", "", text)


def strip_curly_braces(text: str) -> str:
    return re.sub(r"\{.*?\}", "", text)


def to_plain_text(text: str) -> str:
    """Minimal text cleaning for JATS XML."""

    if text is None:
        return None

    text = strip_xml_tags(text)
    text = strip_latex(text)
    text = remove_extra_spaces(text)
    text = remove_leading_spaces(text)
    text = strip_words_with_backslash(text)
    return strip_curly_braces(text)
