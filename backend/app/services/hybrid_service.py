from rank_bm25 import BM25Okapi

from app.services.vector_service import collection, embedding_model


def get_all_documents(filename=None):
    """
    Get all indexed chunks from ChromaDB.
    """
    if filename:
        results = collection.get(
            where={"filename": filename},
            include=["documents", "metadatas"]
        )
    else: 
     results = collection.get(
        include=["documents", "metadatas"]
    )

    documents = results.get("documents", [])
    metadatas = results.get("metadatas", [])
    ids = results.get("ids", [])

    return documents, metadatas, ids


def bm25_search(query, top_k=5, filename=None):
    """
    Perform keyword-based BM25 search.
    """

    documents, metadatas, ids = get_all_documents(filename=filename)

    if not documents:
        return []

    tokenized_documents = [
        document.lower().split()
        for document in documents
    ]

    bm25 = BM25Okapi(tokenized_documents)

    query_tokens = query.lower().split()

    scores = bm25.get_scores(query_tokens)

    ranked_indexes = sorted(
        range(len(scores)),
        key=lambda index: scores[index],
        reverse=True
    )

    results = []

    for index in ranked_indexes[:top_k]:

        results.append({
            "id": ids[index],
            "text": documents[index],
            "filename": metadatas[index].get("filename"),
            "page_number": metadatas[index].get("page_number"),
            "score": float(scores[index])
        })

    return results


def vector_search(query, top_k=5, filename=None):
    """
    Perform semantic vector search.
    """

    query_embedding = embedding_model.encode(
        [query],
        convert_to_numpy=True
    ).tolist()

    if filename:
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where={"filename": filename}
        )

    else:
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    ids = results.get("ids", [[]])[0]

    vector_results = []

    for document, metadata, distance, result_id in zip(
        documents,
        metadatas,
        distances,
        ids
    ):
        vector_results.append({
            "id": result_id,
            "text": document,
            "filename": metadata.get("filename"),
            "page_number": metadata.get("page_number"),
            "distance": float(distance)
        })

    return vector_results


def hybrid_search(query, top_k=5, filename=None):
    """
    Combine Vector Search and BM25 Search.
    """

    vector_results = vector_search(
        query,
        top_k=top_k,
        filename=filename
    )

    bm25_results = bm25_search(
        query,
        top_k=top_k,
        filename=filename
    )

    combined = {}

    # Add vector results
    for rank, result in enumerate(
        vector_results,
        start=1
    ):

        result_id = result["id"]

        combined[result_id] = {
            "id": result_id,
            "text": result["text"],
            "filename": result["filename"],
            "page_number": result["page_number"],
            "vector_rank": rank,
            "bm25_rank": None
        }

    # Add BM25 results
    for rank, result in enumerate(
        bm25_results,
        start=1
    ):

        result_id = result["id"]

        if result_id not in combined:

            combined[result_id] = {
                "id": result_id,
                "text": result["text"],
                "filename": result["filename"],
                "page_number": result["page_number"],
                "vector_rank": None,
                "bm25_rank": rank
            }

        else:

            combined[result_id]["bm25_rank"] = rank

    # Reciprocal Rank Fusion
    for result in combined.values():

        vector_rank = result["vector_rank"]
        bm25_rank = result["bm25_rank"]

        score = 0.0

        if vector_rank:
            score += 1 / (60 + vector_rank)

        if bm25_rank:
            score += 1 / (60 + bm25_rank)

        result["hybrid_score"] = score

    final_results = sorted(
        combined.values(),
        key=lambda item: item["hybrid_score"],
        reverse=True
    )

    return final_results[:top_k]