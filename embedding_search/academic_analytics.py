from functools import cache
import requests


@cache
def get_units(institution_id: int = 14) -> list[dict]:
    """Get all units from the academic analytics API.

    Args:
        institution_id (int, optional): Institution ID. Defaults to 14 (UW-Madison).
    """
    headers = {
        "Content-Type": "application/json",
    }
    url = "https://wisc.discovery.academicanalytics.com/api/units/GetInstitutionUnitsForInstitutions"
    response = requests.post(
        url, headers=headers, json={"InstitutionIds": [institution_id]}
    )
    return response.json()


@cache
def get_faculties(unit_id: int, institution_id: int = 14) -> list[dict]:
    """Get all faculty members in a unit."""

    url = f"https://wisc.discovery.academicanalytics.com/api/people/getbyunitids/{institution_id}/{unit_id}"
    response = requests.get(url)
    return response.json()


@cache
def get_articles(id: int) -> list[dict]:
    """Get all articles for a faculty member."""
    url = f"https://wisc.discovery.academicanalytics.com/api/people/{id}"
    response = requests.get(url)
    return response.json()["articles"]
