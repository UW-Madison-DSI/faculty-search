import requests
import logging
import re
from bs4 import BeautifulSoup
from embedding_search.crossref import query_crossref

SEARCH_INPUT_TYPES = ["Text", "DOI", "URL"]


def to_text(url: str) -> str:
    """Convert a URL to plain text with minimal parsing."""

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0"
    }

    response = requests.get(url, headers=headers)

    # Make sure the request was successful
    if response.status_code != 200:
        raise ValueError(f"Failed to retrieve page: {response.status_code}")

    # Create a BeautifulSoup object and specify the parser
    soup = BeautifulSoup(response.text, "html.parser")

    # Use the get_text method to extract all text from the page
    plain_text = soup.get_text()

    # Remove new lines and extra spaces
    plain_text = re.sub(r"\s+", " ", plain_text)
    plain_text = re.sub(r"\n+", " ", plain_text)
    return plain_text.strip()


def preprocess_search_input(search_with: str, input: str) -> str:
    """Pre-process search input based on search type."""

    assert search_with in SEARCH_INPUT_TYPES

    if search_with == "Text":
        return input

    if search_with == "DOI":
        data = query_crossref(input, ["title", "abstract"])
        if data is None:
            return None
        logging.debug(f"Crossref data: {data}")

        output = " ".join([v for v in data.values() if v is not None])
        logging.info(f"Preprocessed text: {output}")
        return output

    if search_with == "URL":
        output = to_text(input)
        logging.info(f"Preprocessed text: {output}")
        return output
