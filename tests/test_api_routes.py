import requests


def test_search_articles(search_articles_route):
    data = {"query": "covid-19", "top_k": 3}
    response = requests.post(search_articles_route, json=data, verify=False)
    assert response.status_code == 200

    data = response.json()
    assert "articles" in data
    assert "plot_json" not in data

    # Check length is less than or equal to top_k
    assert len(data["articles"]) <= 3


def test_search_articles_with_plot(search_articles_route):
    data = {"query": "covid-19", "top_k": 3, "with_plot": True}

    response = requests.post(search_articles_route, json=data, verify=False)
    assert response.status_code == 200

    data = response.json()
    assert "articles" in data
    assert "plot_json" in data

    plot_json = data["plot_json"]
    assert isinstance(plot_json, str)


def test_search_authors(search_authors_route):
    data = {"query": "covid-19", "top_k": 3}
    response = requests.post(search_authors_route, json=data, verify=False)
    assert response.status_code == 200

    data = response.json()
    assert "authors" in data
    assert "plot_json" not in data

    # Check length is less than or equal to top_k
    assert len(data["authors"]) <= 3


def test_search_authors_with_plot(search_authors_route):
    data = {"query": "covid-19", "top_k": 3, "with_plot": True}
    response = requests.post(search_authors_route, json=data, verify=False)
    assert response.status_code == 200

    data = response.json()
    assert "authors" in data
    assert "plot_json" in data

    plot_json = data["plot_json"]
    assert isinstance(plot_json, str)


def test_get_author(get_author_route):
    data = {"first_name": "Kyle", "last_name": "Cranmer"}
    response = requests.post(get_author_route, json=data, verify=False)
    assert response.status_code == 200

    data = response.json()
    assert "author" in data
    assert "articles" in data


def test_get_author_by_id(get_author_by_id_route):
    test_id = "106927"
    data = {"author_id": test_id}
    response = requests.post(get_author_by_id_route, json=data, verify=False)
    assert response.status_code == 200

    data = response.json()
    assert "author" in data
    assert data["author"]["id"] == int(test_id)
