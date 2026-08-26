import fitz
from pathlib import Path


def extract_text_from_pdf(pdf_path: str):
    """
    Extract text from every page of a PDF.
    """

    document = fitz.open(pdf_path)

    pages = []

    for page_number, page in enumerate(document, start=1):

        text = page.get_text("text").strip()

        if text:
            pages.append({
                "page_number": page_number,
                "text": text
            })

    document.close()

    return pages