import logging
from flask import request
from embedding_search.preprocess import url_to_text


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
