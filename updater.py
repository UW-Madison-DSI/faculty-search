from embedding_search.vector_store import get_author
from embedding_search.utils import AUTHORS_DIR, list_downloaded_authors
from tqdm import tqdm
from embedding_search.crossref import batch_query_cited_by


def update_cited_by() -> None:
    """Update all cited by counts in local author json."""

    author_ids = list_downloaded_authors()

    for author_id in tqdm(author_ids):
        author = get_author(author_id)
        article_dois = [article.doi for article in author.articles]
        cited_by_data = batch_query_cited_by(article_dois)

        for article in author.articles:
            article.cited_by = cited_by_data.get(article.doi, None)

        author.save(AUTHORS_DIR / f"{author.id}.json")


def main():
    update_cited_by()


if __name__ == "__main__":
    main()
