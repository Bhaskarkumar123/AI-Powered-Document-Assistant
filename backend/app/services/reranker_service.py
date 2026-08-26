from sentence_transformers import CrossEncoder


# Reranker model
reranker_model = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)


def rerank_results(query, results, top_k=5):
    """
    Rerank retrieved chunks using a CrossEncoder.
    """

    if not results:
        return []

    pairs = [
        [query, result["text"]]
        for result in results
    ]

    scores = reranker_model.predict(pairs)

    reranked_results = []

    for result, score in zip(results, scores):

        updated_result = result.copy()

        updated_result["rerank_score"] = float(score)

        reranked_results.append(updated_result)

    reranked_results.sort(
        key=lambda item: item["rerank_score"],
        reverse=True
    )

    return reranked_results[:top_k]