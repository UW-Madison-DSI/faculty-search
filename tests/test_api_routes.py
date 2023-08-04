import requests


def test_search_articles(search_articles_route):
    data = {"query": "covid-19", "top_k": 3}
    response = requests.post(search_articles_route, json=data)
    assert response.status_code == 200

    data = response.json()
    assert "articles" in data
    assert "plot_data" not in data

    # Check length is less than or equal to top_k
    assert len(data["articles"]) <= 3


def test_search_articles_with_plot(search_articles_route):
    data = {"query": "covid-19", "top_k": 3, "with_plot": True}

    response = requests.post(search_articles_route, json=data)
    assert response.status_code == 200

    data = response.json()
    assert "articles" in data
    assert "plot_data" in data

    plot_data = data["plot_data"]
    assert isinstance(plot_data, dict)

    # Check all lengths are the same
    data_lengths = [len(data) for data in plot_data.values()]
    assert len(set(data_lengths)) == 1


def test_search_authors(search_authors_route):
    data = {"query": "covid-19", "top_k": 3}
    response = requests.post(search_authors_route, json=data)
    assert response.status_code == 200

    data = response.json()
    assert "authors" in data
    assert "plot_data" not in data

    # Check length is less than or equal to top_k
    assert len(data["authors"]) <= 3


def test_search_authors_with_plot(search_authors_route):
    data = {"query": "covid-19", "top_k": 3, "with_plot": True}
    response = requests.post(search_authors_route, json=data)
    assert response.status_code == 200

    data = response.json()
    assert "authors" in data
    assert "plot_data" in data

    plot_data = data["plot_data"]
    assert isinstance(plot_data, dict)

    # Check all lengths are the same
    data_lengths = [len(data) for data in plot_data.values()]
    assert len(set(data_lengths)) == 1
