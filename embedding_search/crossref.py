import re
import requests
from embedding_search.utils import timeout
from time import sleep


@timeout
def query_crossref(doi: str, fields: list[str]) -> dict | None:
    """Get abstract from Crossref."""
    api_url = f"https://api.crossref.org/works/{doi}"
    response = requests.get(api_url)

    if response.status_code != 200:
        return None

    data = response.json()
    if "message" not in data:
        return None

    def _flatten(x: list) -> any:
        if isinstance(x, list) and len(x) == 1:
            return x[0]
        else:
            return x

    def _get_field(field_name):
        if field_name not in data["message"]:
            return None
        else:
            return _flatten(data["message"][field_name])

    output = {}
    for field in fields:
        value = _get_field(field)
        output[field] = value if value else None

    return output


def batch_query_cited_by(dois: list[str], batch_size: int = 80) -> dict:
    """Query crossref in batches."""

    # Clean DOIs
    dois = [doi for doi in dois if not doi.startswith("nodoi")]

    @timeout
    def query_cited_by(batch: list[str]) -> dict:
        url = "https://api.crossref.org/works"
        params = {
            "rows": batch_size,
            "filter": ",".join([f"doi:{doi}" for doi in batch]),
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(
                f"Crossref API returned status code {response.status_code}. {params}"
            )

        data = response.json()

        cited_by = {}
        for item in data["message"]["items"]:
            cited_by[item["DOI"]] = item["is-referenced-by-count"]

        return cited_by

    output = {}
    for i in range(0, len(dois), batch_size):
        batch = dois[i : i + batch_size]
        cited_by = query_cited_by(batch)
        output.update(cited_by)

    # Return combined results
    return output


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
