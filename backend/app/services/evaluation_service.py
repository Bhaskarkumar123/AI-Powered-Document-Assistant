import re


def _normalize_text(text: str) -> set[str]:
    """
    Convert text into a set of useful words.
    """

    words = re.findall(
        r"\b[a-zA-Z0-9]{3,}\b",
        text.lower()
    )

    return set(words)


def _similarity_score(
    text_a: str,
    text_b: str
) -> float:
    """
    Calculate simple word-overlap similarity.
    """

    words_a = _normalize_text(text_a)
    words_b = _normalize_text(text_b)

    if not words_a or not words_b:
        return 0.0

    intersection = words_a.intersection(words_b)

    score = len(intersection) / len(words_a)

    return round(min(score, 1.0), 2)


def evaluate_answer(
    query: str,
    answer: str,
    retrieved_chunks: list
):
    """
    Evaluate a RAG answer using retrieved context.

    Returns:
        faithfulness
        answer_relevance
        context_relevance
        overall_score
    """

    # Combine retrieved document content
    contexts = []

    for chunk in retrieved_chunks:

        if isinstance(chunk, dict):

            text = (
                chunk.get("text")
                or chunk.get("content")
                or chunk.get("document")
                or ""
            )

            if text:
                contexts.append(text)

        elif isinstance(chunk, str):
            contexts.append(chunk)

    context_text = " ".join(contexts)

    # Answer relevance
    answer_relevance = _similarity_score(
        query,
        answer
    )

    # Context relevance
    context_relevance = _similarity_score(
        query,
        context_text
    )

    # Faithfulness
    faithfulness = _similarity_score(
        answer,
        context_text
    )

    # Overall score
    overall_score = round(
        (
            faithfulness
            + answer_relevance
            + context_relevance
        ) / 3,
        2
    )

    return {
        "faithfulness": faithfulness,
        "answer_relevance": answer_relevance,
        "context_relevance": context_relevance,
        "overall_score": overall_score
    }