import pytest
from pymilvus import Collection, connections, utility
from langchain.embeddings import OpenAIEmbeddings

@pytest.fixture(scope="session", autouse=True)
def connection():
    connections.connect("default", host="milvus-standalone", port="19530")
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