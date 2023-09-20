# IO Models
from datetime import datetime
from pydantic import BaseModel, validator


class SearchArticlesInputs(BaseModel):
    """Query data model."""

    query: str
    top_k: int = 3
    distance_threshold: float = 0.2
    since_year: int = 1900
    with_plot: bool = False

    @validator("query")
    def query_must_not_be_empty(cls, v):
        """Validate that query is not empty."""
        if not v.strip():
            raise ValueError("query must not be empty")
        return v

    @validator("top_k")
    def top_k_must_be_positive(cls, v):
        """Validate that top_k is positive."""
        if v <= 0:
            raise ValueError("top_k must be positive")
        return v

    @validator("distance_threshold")
    def distance_threshold_must_be_zero_to_one(cls, v):
        """Validate that distance_threshold is between 0 and 1."""
        if v < 0 or v > 1:
            raise ValueError("distance_threshold must be between 0 and 1")
        return v

    @validator("since_year")
    def since_year_must_be_past(cls, v):
        """Validate that since_year is in the past."""
        current_year = datetime.now().year
        if v > current_year:
            raise ValueError("since_year must be in the past")
        return v


class SearchAuthorsInputs(BaseModel):
    """Query data model."""

    query: str
    top_k: int = 3
    n: int = 500
    m: int = 5
    since_year: int = 1900
    distance_threshold: float = 0.2
    pow: float = 3.0
    ks: float = 1.0
    ka: float = 1.0
    kr: float = 1.0
    filter_unit: str | None = None
    with_plot: bool = False
    with_evidence: bool = False

    @validator("query")
    def query_must_not_be_empty(cls, v):
        """Validate that query is not empty."""
        if not v.strip():
            raise ValueError("query must not be empty")
        return v

    @validator("top_k")
    def top_k_must_be_positive(cls, v):
        """Validate that top_k is positive."""
        if v <= 0:
            raise ValueError("top_k must be positive")
        return v

    @validator("n")
    def n_must_be_positive(cls, v):
        """Validate that n is positive."""
        if v <= 0:
            raise ValueError("n must be positive")
        return v

    @validator("m")
    def m_must_be_positive(cls, v):
        """Validate that m is positive."""
        if v <= 0:
            raise ValueError("m must be positive")
        return v

    @validator("since_year")
    def since_year_must_be_past(cls, v):
        """Validate that since_year is in the past."""
        current_year = datetime.now().year
        if v > current_year:
            raise ValueError("since_year must be in the past")
        return v

    @validator("distance_threshold")
    def distance_threshold_must_be_zero_to_one(cls, v):
        """Validate that distance_threshold is between 0 and 1."""
        if v < 0 or v > 1:
            raise ValueError("distance_threshold must be between 0 and 1")
        return v


class GetAuthorInput(BaseModel):
    first_name: str
    last_name: str

    @validator("first_name", "last_name")
    def name_must_not_be_empty(cls, v):
        """Validate that name is not empty."""
        if not v.strip():
            raise ValueError("name must not be empty")
        return v


class GetAuthorByIdInput(BaseModel):
    author_id: str


class APIPlotData(BaseModel):
    """Plot data model."""

    x: list[float]
    y: list[float]
    id: list[str | int]
    parent_id: list[int]
    label: list[str]
    type: list[str]


class APIAuthor(BaseModel):
    """Author output data model."""

    id: str | int
    first_name: str
    last_name: str
    community_name: str | None = None
    score: float | None = None


class APIArticle(BaseModel):
    """Article output data model."""

    doi: str
    title: str
    author_id: str
    distance: float | None = None
