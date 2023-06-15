from time import sleep
import re


def timeout(func, duration=1):
    """Delay the execution of a function to prevent blockage."""

    def wrapper(*args, **kwargs):
        sleep(duration)
        return func(*args, **kwargs)

    return wrapper


def extract_orcid(text: str) -> str:
    """Extract ORCID from text."""

    orcid_patterns = re.findall(r"\d{4}-\d{4}-\d{4}-\d{3}[0-9X]", text)
    return orcid_patterns[0]


def sort_key_by_value(d: dict, reversed: bool = False):
    return [k for k, _ in sorted(d.items(), key=lambda item: item[1], reverse=reversed)]
