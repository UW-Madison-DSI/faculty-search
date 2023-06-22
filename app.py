from dotenv import load_dotenv

load_dotenv()
import streamlit as st
from embedding_search.data_model import Article, Author
from embedding_search.vector_store import MiniStore, get_author
from embedding_search.visualize import EmbeddingsProcessor, QueryPlotter

st.set_page_config(
    page_title="Data Science @ UW Community search.", page_icon="🔎", layout="wide"
)


@st.cache_resource
def build_vector_store():
    store = MiniStore()
    store.build()
    return store


@st.cache_resource
def get_plotter(_vector_store):
    processor = EmbeddingsProcessor(_vector_store)
    return QueryPlotter(processor)


VECTOR_STORE = build_vector_store()
PLOTTER = get_plotter(VECTOR_STORE)


def results_formatter(results: list[Article, Author]) -> None:
    """Format results for display in streamlit."""

    if isinstance(results[0], Article):
        st.write(f"Found {len(results)} articles.")
        for result in results:
            _author = get_author(result.author_orcid)
            _citation = f"{_author.first_name} {_author.last_name} ({result.publication_year}). {result.title}"
            with st.expander(_citation):
                st.write(result)
    else:
        st.write(f"Found {len(results)} authors.")
        for result in results:
            with st.expander(f"{str(result)}"):
                st.write(result)


# Sidebar
with st.sidebar:
    st.title("Search options")
    query = st.text_input("Search", value="")
    search_type = st.radio("Authors or articles?", ("Authors", "Articles"), index=0)
    top_k = st.number_input("How many results?", value=3, min_value=1)

    if search_type == "Authors":
        weighted = st.checkbox(
            "Weighted results by no. of relevant publications?", value=True
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
    results_formatter(_results)

    st.header("Visualization")
    with st.spinner("Loading visualization..."):
        st.altair_chart(PLOTTER.plot(query), theme=None)
