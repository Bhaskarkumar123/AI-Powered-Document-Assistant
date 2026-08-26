import chromadb
from sentence_transformers import SentenceTransformer


# ChromaDB persistent database
chroma_client = chromadb.PersistentClient(
    path="app/chroma_db"
)

# Collection
collection = chroma_client.get_or_create_collection(
    name="enterprise_documents"
)

# Embedding model
embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def store_chunks(chunks, filename, metadata=None):
    """
    Generate embeddings and store document chunks with metadata in ChromaDB.
    """

    if not chunks:
        return 0

    metadata = metadata or {} 
    
    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = embedding_model.encode(
        texts,
        convert_to_numpy=True
    ).tolist()

    ids = [
        f"{filename}_{index}"
        for index in range(len(chunks))
    ]

    metadatas = [
        {
            "filename": filename,
            "page_number": chunk["page_number"],
            "department": metadata.get("department", ""),
            "document_type": metadata.get("document_type", ""),
            "uploaded_by": metadata.get("uploaded_by", ""),
            "upload_date": metadata.get("upload_date", "")
        }
        for chunk in chunks
    ]

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return len(chunks)


def search_similar_chunks(query, top_k=5):
    """
    Search ChromaDB for chunks similar to the user's query.
    """
def search_similar_chunks_with_filter(
    query,
    top_k=5,
    filename=None
):
    """
    Vector search with optional filename filtering.
    """

    query_embedding = embedding_model.encode(
        [query],
        convert_to_numpy=True
    ).tolist()

    where_filter = None

    if filename:
        where_filter = {
            "filename": filename
        }

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        where=where_filter
    )

    retrieved_chunks = []

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):
        retrieved_chunks.append({
            "text": document,
            "filename": metadata.get("filename"),
            "page_number": metadata.get("page_number"),
            "distance": distance
        })

    return retrieved_chunks