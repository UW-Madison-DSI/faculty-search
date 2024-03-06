import logging
from flask import request
import requests
import re
from bs4 import BeautifulSoup


def url_to_text(url: str) -> str:
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


class URLController:
    @staticmethod
    def post_read() -> str:
        url = request.json.get("url")
        try:
            text = url_to_text(url)
        except Exception as e:
            logging.error(f"Error: {e}")
            raise e
        logging.debug(f"URL: {url}")
        logging.debug(f"Text: {text}")
        return text
