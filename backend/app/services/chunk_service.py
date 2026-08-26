def create_chunks(
    pages,
    chunk_size=1000,
    chunk_overlap=200
):
    """
    Split extracted page text into overlapping chunks.
    """

    chunks = []

    for page in pages:

        text = page["text"]
        page_number = page["page_number"]

        start = 0

        while start < len(text):

            end = start + chunk_size

            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "page_number": page_number
                })

            start += chunk_size - chunk_overlap

    return chunks