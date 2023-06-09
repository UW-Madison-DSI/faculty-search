import pickle
import os
import re
from dataclasses import dataclass
from functools import cache
from crossref import get_abstract, to_plain_text
from tqdm import tqdm
import requests
from utils import timeout


@dataclass
class Article:
    orcid_path: str
    doi: str
    title: str
    url: str
    publication_year: int
    # Below are fields that are added later when the abstract is pulled from Crossref
    pulled_abstract: bool = False
    raw_abstract: str = None
    abstract: str = None


@dataclass
class Author:
    """An author object."""

    def __init__(
        self, orcid: str, first_name: str, last_name: str, biography: str = None
    ) -> None:
        self.orcid = orcid
        self.first_name = first_name
        self.last_name = last_name
        self.biography = biography
        self.articles = []

    def add_articles(self, articles: list[Article]) -> None:
        self.articles.extend(articles)

    def save(self, path: str) -> None:
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, path: str) -> "Author":
        with open(path, "rb") as f:
            return pickle.load(f)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.orcid})"


def get_oauth_token() -> str:
    """Get an OAuth token from ORCID."""

    client_id = os.getenv("ORCID_CLIENT_ID")
    client_secret = os.getenv("ORCID_CLIENT_SECRET")

    response = requests.post(
        "https://orcid.org/oauth/token",
        headers={"Accept": "application/json"},
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "client_credentials",
            "scope": "/read-public",
        },
    )

    if response.status_code != 200:
        raise Exception("Unable to get OAuth token from ORCID.")

    return response.json()["access_token"]


class ORCIDAuthorParser:
    """Parse the raw JSON from ORCID into an Author details."""

    @staticmethod
    def _to_orcid(path: str) -> str:
        return re.findall(r"\d{4}-\d{4}-\d{4}-\d{4}", path)[0]

    def parse(self, personal_details: dict) -> Author:
        if personal_details["biography"]:
            biography = personal_details["biography"]["content"]
        else:
            biography = None

        return Author(
            orcid=self._to_orcid(personal_details["path"]),
            first_name=personal_details["name"]["given-names"]["value"],
            last_name=personal_details["name"]["family-name"]["value"],
            biography=biography,
        )


class ORCIDWorkParser:
    """Parse the raw JSON from ORCID into a list of Article objects."""

    def parse(self, works: dict) -> list[Article]:
        work_summaries = [w["work-summary"][0] for w in works["group"]]

        outputs = []
        for work_summary in work_summaries:
            if work_summary["type"] == "journal-article":
                article = self.parse_summary(work_summary)
                outputs.append(article)
        return outputs

    def parse_summary(self, work_summary: dict) -> Article:
        return Article(
            orcid_path=self._get_orcid_path(work_summary),
            doi=self._get_doi(work_summary),
            title=self._get_title(work_summary),
            url=self._get_url(work_summary),
            publication_year=self._get_publication_year(work_summary),
        )

    @staticmethod
    def _get_orcid_path(work_summary):
        return work_summary["path"]

    @staticmethod
    def _get_doi(work_summary):
        external_ids = work_summary["external-ids"]["external-id"]
        ext_doi = [
            external_id
            for external_id in external_ids
            if external_id["external-id-type"] == "doi"
        ]
        if len(ext_doi) == 0:
            return None

        ext_doi = ext_doi[0]  # There should only be one DOI

        try:
            return ext_doi["external-id-normalized"]["value"]
        except KeyError:
            return ext_doi["external-id-value"]

    @staticmethod
    def _get_title(work_summary):
        return work_summary["title"]["title"]["value"]

    @staticmethod
    def _get_url(work_summary):
        if work_summary["url"] is None:
            return None
        return work_summary["url"]["value"]

    @staticmethod
    def _get_publication_year(work_summary):
        pub_date = work_summary["publication-date"]

        try:
            year = pub_date["year"]["value"]
        except (KeyError, TypeError):
            return None
        return int(year)


@cache
@timeout
def pull(path: str) -> dict:
    """Pull data from ORCID."""

    token = get_oauth_token()
    response = requests.get(
        f"https://pub.orcid.org/v3.0/{path}",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    if response.status_code != 200:
        raise Exception(f"Unable to get {path} from ORCID.")
    return response.json()


def download_author(orcid: str) -> Author:
    """Get author info and works from ORCID and abstracts from CrossRef."""

    # Get personal details
    personal_details = pull(f"{orcid}/person")
    author = ORCIDAuthorParser().parse(personal_details)

    # Get works
    works = pull(f"{orcid}/works")
    parsed_articles = ORCIDWorkParser().parse(works=works)
    author.add_articles(parsed_articles)

    # Get abstracts
    for article in tqdm(author.articles):
        # Avoid pulling the same abstract twice
        if article.pulled_abstract:
            continue
        article.pulled_abstract = True

        if article.doi is None:
            continue
        abstract = get_abstract(article.doi)

        if abstract is None:
            continue
        article.raw_abstract = abstract
        article.abstract = to_plain_text(abstract)

    return author
