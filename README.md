# Community search

An experiment on embeddings.

## Purposes

- Create a search process to identify individuals with specific research interests.
- Illustrate the connections between people and their published works.
- Utilize research papers as the starting point for searches, and provide relevant individuals and papers within the UW community.

## User story

- As a faculty member, I wants to look for new collaboration
- Use OpenAI's `text-embedding-ada-002` for cheap and fast prototyping.
- How to represent a person?
  - Within the Community map database, we have `Research summary`, `Research terms`, `Research interest`, `ORCID` which can directly/indirectly get a text description of a person's research.
  - We can start with `Research summary`, `Research terms`, `Research interest` first, if the results doesn't looks good, we can consider `ORCID` API for more info.
-
