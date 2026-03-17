import PyPDF2
import io


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract text from PDF or plain text files."""
    if filename.lower().endswith(".pdf"):
        return _extract_from_pdf(file_bytes)
    else:
        return file_bytes.decode("utf-8", errors="ignore")


def _extract_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts)
