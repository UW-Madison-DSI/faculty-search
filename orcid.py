import os
from dataclasses import dataclass
from functools import cache
import requests


@dataclass
class Article:
    orcid_path: str
    doi: str
    title: str
    url: str
    publication_year: int


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


class WorkParser:
    """Parse the raw JSON from ORCID into a list of Article objects."""

    def parse(self, works) -> Article:
        work_summaries = self._get_summaries(works)

        output = []
        for work_summary in work_summaries:
            if work_summary["type"] == "journal-article":
                output.append(self.parse_summary(work_summary))
        return output

    def parse_summary(self, work_summary: dict) -> Article:
        return Article(
            orcid_path=self._get_orcid_path(work_summary),
            doi=self._get_doi(work_summary),
            title=self._get_title(work_summary),
            url=self._get_url(work_summary),
            publication_year=self._get_publication_year(work_summary),
        )

    @staticmethod
    def _get_summaries(works: dict) -> list:
        return [w["work-summary"][0] for w in works["group"]]

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
def get_works(orcid: str, as_articles: bool = True) -> dict | list[Article]:
    """Get works from ORCID.

    Args:
        orcid: The ORCID ID of the researcher.
        as_articles: If True, return a list of Article objects. If False, return raw data from ORCID.
    """

    token = get_oauth_token()

    response = requests.get(
        f"https://pub.orcid.org/v3.0/{orcid}/works",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )

    if response.status_code != 200:
        raise Exception("Unable to get works from ORCID.")

    if not as_articles:
        return response.json()

    return WorkParser().parse(response.json())
