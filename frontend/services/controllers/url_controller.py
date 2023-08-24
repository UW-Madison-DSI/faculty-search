from flask import request
from embedding_search.preprocess import url_to_text


class URLController:
    @staticmethod
    def post_read() -> str:
        url = request.json.get("url")
        return url_to_text(url)
