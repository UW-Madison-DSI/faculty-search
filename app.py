import urllib.parse
import streamlit as st
from dotenv import load_dotenv
from embedding_search.vector_store import MiniStore, get_author
from embedding_search.visualize import EmbeddingsProcessor, QueryPlotter
from embedding_search.crossref import query_crossref

load_dotenv()

st.set_page_config(
    page_title="Data Science @ UW Community search.", page_icon="🔎", layout="wide"
)


@st.cache_resource
def build_vector_store() -> MiniStore:
    store = MiniStore()
    store.build()
    return store


@st.cache_resource
def get_plotter(_vector_store: MiniStore) -> QueryPlotter:
    processor = EmbeddingsProcessor(_vector_store)
    return QueryPlotter(processor)


VECTOR_STORE = build_vector_store()
PLOTTER = get_plotter(VECTOR_STORE)


def get_community_map_url(community_name: str) -> str | None:
    """Generate a URL to the community map for a given author."""
    url = "https://maps.datascience.wisc.edu/?query="

    if community_name is None:
        return None

    return url + urllib.parse.quote(community_name)


def results_formatter(results: list, type: str) -> None:
    """Format results for display in streamlit."""

    if type == "article":
        # Format articles
        st.write(f"Found {len(results)} articles.")
        for result in results:
            _author = get_author(result.author_orcid)
            _citation = f"{_author.first_name} {_author.last_name} ({result.publication_year}). {result.title}"
            with st.expander(_citation):
                st.json(result.to_dict())

    elif type == "author":
        # Format authors
        markdown = f"Found {len(results)} authors: "
        authors = []
        for result in results:
            url = get_community_map_url(result.community_name)
            authors.append(f"[{result.first_name} {result.last_name}]({url})")
        st.markdown(markdown + ", ".join(authors) + ".")
    else:
        raise ValueError(f"Unknown type: {type}")


# Sidebar
with st.sidebar:
    st.title("Search options")
    search_with = st.radio("Search with", ("Text", "DOI"), index=0)

    if search_with == "DOI":
        doi = st.text_input("DOI", value="")
        data = query_crossref(doi, ["title", "abstract"])
        print(f"{data=}")
        query = " ".join([v for v in data.values() if v is not None])
    else:
        query = st.text_input("Text", value="")

    search_type = st.radio("Authors or articles?", ("Authors", "Articles"), index=0)
    top_k = st.number_input("How many results?", value=3, min_value=1)

    if search_type == "Authors":
        weighted = st.checkbox(
            "Weight results by no. of relevant publications?", value=True
        )

    submit_button_pressed = st.button("Submit")


# Main page
st.title("Data Science @ UW Community search.")
st.write("Search for authors or articles related to data science at UW-Madison.")

if submit_button_pressed:
    if search_type == "Authors":
        if weighted:
            _results = VECTOR_STORE.weighted_search_author(query, top_k=top_k)
        else:
            _results = VECTOR_STORE.search(query, type="author", top_k=top_k)
    else:
        _results = VECTOR_STORE.search(query, type="article", top_k=top_k)

    st.header("Results")

    type_mapper = {"Authors": "author", "Articles": "article"}
    results_formatter(_results, type=type_mapper[search_type])

    st.header("Visualization")
    with st.spinner("Loading visualization..."):
        st.altair_chart(PLOTTER.plot(query), theme=None)
