from app.services.hybrid_service import hybrid_search
from app.services.reranker_service import rerank_results


def multi_document_retrieval(
    query,
    top_k=5,
    candidate_k=15,
    filename=None,
    
):
    """
    Retrieve relevant chunks from multiple documents.
    """

    # Retrieve candidates from all available documents
    candidates = hybrid_search(
        query,
        top_k=candidate_k,
        filename=filename
    )

    if not candidates:
        return []

    # Rerank candidates
    reranked_results = rerank_results(
        query,
        candidates,
        top_k=top_k
    )

    return reranked_results