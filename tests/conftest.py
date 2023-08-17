import pytest
import os
from pymilvus import Collection, connections, utility
from langchain.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
API_URL = os.getenv("API_URL", "http://localhost:8000")
MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
MILVUS_ALIAS = os.getenv("MILVUS_ALIAS", "default")


@pytest.fixture(scope="session", autouse=True)
def connection():
    connections.connect(MILVUS_ALIAS, host=MILVUS_HOST, port=MILVUS_PORT)
    print(utility.get_server_version())


@pytest.fixture
def author_collection():
    return Collection("authors")


@pytest.fixture
def article_collection():
    return Collection("articles")


@pytest.fixture
def embeddings():
    return OpenAIEmbeddings()


@pytest.fixture
def search_articles_route():
    return f"{API_URL}/search_articles"


@pytest.fixture
def search_authors_route():
    return f"{API_URL}/search_authors"


@pytest.fixture
def get_author_route():
    return f"{API_URL}/get_author"
