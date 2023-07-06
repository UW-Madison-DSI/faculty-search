---
title: Community Search
emoji: 📉
colorFrom: yellow
colorTo: yellow
sdk: docker
pinned: false
app_port: 8501
---

An experiment on embeddings.

## Purposes

- Create a search process to identify individuals with specific research interests.
- Illustrate the connections between people and their published works.
- Utilize research papers as the starting point for searches, and provide relevant individuals and papers within the UW community.

## Features

- Search for authors and articles based on research relevancy. For searching authors, there is an option to weight the results based on the number of relevant articles they have published.
- Visualize a search `query`, `authors`, and `articles` in the same 2d space.
- A REST API end-point to access the search function programmatically.

## [Demo](https://mbialo-community-search.hf.space/)

## Detail steps

Creating a vector store:

1. Retrieve all users from the community map.
1. Query the ORCID profiles of each user to obtain their journal articles.
1. Extract the abstracts of the journal articles from the CrossRef database.
1. Generate embeddings by combining the article title and abstract (if available) using OpenAI's embedding model.
1. Calculate the centroid of author embeddings by taking the average of the embeddings from all their articles.

Searching articles:

1. Accept a search query.
1. Embed the search query using OpenAI's embedding model (`text-embedding-ada-002`).
1. Retrieve documents ranked from most similar to least similar based on cosine similarity.

Searching authors:

1. Accept a search query.
1. Embed the search query using OpenAI's embedding model (`text-embedding-ada-002`).
1. Retrieve authors ranked from most similar to least similar based on cosine similarity.

Weighed authors search:

1. Use `search(type='article')` to create a pool of `n` matching documents.
1. Count the appearance of authors among the matching documents.
1. Return the `top_k` authors with the highest appearance counts.

Visualization:

1. Obtain embeddings for the articles related to the search query.
1. Append the embeddings of all authors.
1. Append the embeddings of the search query.
1. Apply t-SNE (t-Distributed Stochastic Neighbor Embedding) on all the embeddings to reduce dimensionality and create a 2D representation.
1. Plot a scatter plot in the 2D t-SNE space. With `query`, `authors`, and `articles` as different colors on the same space.
1. Add some interactivity for ease of use.
