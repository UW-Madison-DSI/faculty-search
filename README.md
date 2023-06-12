# Community search

An experiment on embeddings.

## Purposes

- Create a search process to identify individuals with specific research interests.
- Illustrate the connections between people and their published works.
- Utilize research papers as the starting point for searches, and provide relevant individuals and papers within the UW community.

## Steps

Creating a vector store:

1. Retrieve all users from the community map.
1. Query the ORCID profiles of each user to obtain their journal articles.
1. Extract the abstracts of the journal articles from the CrossRef database.
1. Generate embeddings by combining the article title and abstract (if available) using OpenAI's embedding model.

Searching articles:

1. Accept a search input.
1. Embed the search query using OpenAI's embedding model.
1. Retrieve documents ranked from most similar to least similar based on cosine similarity.

Searching people:

1. Based on the search results from articles, select the top 30 documents (or apply a threshold) to create a list of matching documents.
1. Count the appearance of authors among the matching documents.
1. Return the top three authors with the highest appearance counts.

Visualization:

1. Obtain embeddings for the articles related to the search query.
1. Append the embeddings of all users.
1. Append the embeddings of the search query.
1. Apply t-SNE (t-Distributed Stochastic Neighbor Embedding) on all the embeddings to reduce dimensionality and create a 2D representation.
1. Plot a scatter plot in the 2D t-SNE space.
1. Connect each author to their articles using lines (lines can be initially invisible).
1. Optionally, color the scatter plot points based on the distance or other criteria.
1. Show the link between authors and their articles when clicking on a data point.
