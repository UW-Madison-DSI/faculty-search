import logging
from flask import request
from embedding_search.preprocess import url_to_text


class URLController:
    @staticmethod
    def post_read() -> str:
        url = request.json.get("url")
        text = url_to_text(url)
        logging.debug(f"URL: {url}")
        logging.debug(f"Text: {text}")
        return text
