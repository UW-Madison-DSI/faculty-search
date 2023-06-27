import re
import requests
from embedding_search.utils import timeout


@timeout
def query_crossref(doi: str) -> tuple[str | None, int | None]:
    """Get abstract from Crossref."""
    api_url = f"https://api.crossref.org/works/{doi}"
    response = requests.get(api_url)

    if response.status_code != 200:
        return None, None

    data = response.json()

    if "message" not in data:
        return None, None

    if "abstract" not in data["message"]:
        abstract = None
    else:
        abstract = data["message"]["abstract"]

    if "is-referenced-by-count" not in data["message"]:
        cited_by = None
    else:
        cited_by = data["message"]["is-referenced-by-count"]

    return abstract, cited_by


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
