def build_sources(retrieved_chunks):
    """
    Create clean source information from retrieved chunks.
    """

    sources = []

    seen = set()

    for chunk in retrieved_chunks:

        filename = chunk.get("filename", "Unknown")
        page_number = chunk.get("page_number", "Unknown")

        source_key = (
            filename,
            page_number
        )

        # Avoid duplicate sources
        if source_key in seen:
            continue

        seen.add(source_key)

        sources.append({
            "source_id": len(sources) + 1,
            "filename": filename,
            "page_number": page_number
        })

    return sources