from api.core import *


def test_sort_dict_by_value():
    d = {"a": 3, "b": 1, "c": 2}
    sorted_keys, sorted_values = sort_dict_by_value(d)
    assert sorted_keys == ["b", "c", "a"]
    assert sorted_values == [1, 2, 3]

    d = {"a": 3, "b": 1, "c": 2}
    sorted_keys, sorted_values = sort_dict_by_value(d, reversed=True)
    assert sorted_keys == ["a", "c", "b"]
    assert sorted_values == [3, 2, 1]

    d = {}
    sorted_keys, sorted_values = sort_dict_by_value(d)
    assert sorted_keys == []
    assert sorted_values == []


def test_engine(author_collection, article_collection, embeddings):
    engine = Engine(author_collection, article_collection, embeddings)

    # Test the embed method
    embedded = engine.embed("test")
    assert isinstance(embedded, list)
    assert isinstance(embedded[0], float)
    assert len(embedded) == 1536

    # Test the get_author method
    author = get_author(106927, author_collection)
    assert isinstance(author, dict)
    assert author["id"] == 106927
    assert author["first_name"] == "Kyle"
    assert author["last_name"] == "Cranmer"

    # Test the search_articles method
    results = engine.search_articles("Dark Higgs Boson", top_k=3)
    assert isinstance(results, dict)
    articles = results["articles"]
    assert len(articles) <= 3
    assert isinstance(articles[0], dict)
    assert list(articles[0].keys()) == ["distance", "title", "author_id", "doi"]

    # Test the search_authors method
    authors = engine.search_authors("Dark Higgs Boson", top_k=3)["authors"]
    author_ids, scores = authors["author_ids"], authors["scores"]
    assert isinstance(author_ids, list)
    assert isinstance(scores, list)
    assert len(author_ids) <= 3
    assert len(scores) <= 3
    assert isinstance(author_ids[0], int)
    assert isinstance(scores[0], float)
