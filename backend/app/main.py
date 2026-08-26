from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi import HTTPException
import shutil

from pydantic import BaseModel
from datetime import datetime
from app.services.citation_service import build_sources
from app.services.query_service import rewrite_query
from app.services.auth_service import check_permission
from app.services.evaluation_service import evaluate_answer

from dotenv import load_dotenv
load_dotenv()

from app.services.pdf_service import extract_text_from_pdf
from app.services.chunk_service import create_chunks
from app.services.llm_service import generate_answer
from app.services.hybrid_service import hybrid_search
from app.services.multi_document_service import (
    multi_document_retrieval
)
from app.services.admin_service import (
    get_dashboard_statistics
)
from app.services.reranker_service import rerank_results
from app.services.vector_service import (
    store_chunks,
    search_similar_chunks
)
from app.services.memory_service import (
    conversations,
    get_conversation,
    add_message,
    clear_conversation
)
from app.services.metadata_service import (
    initialize_database,
    add_document,
    get_documents
)
from app.services.feedback_service import (
    initialize_feedback_table,
    add_feedback,
    get_feedback
)
from app.services.memory_service import (
    get_conversation,
    add_message,
    clear_conversation
)
from app.services.metadata_service import (
    get_documents,
    add_document,
    delete_document
)

app = FastAPI(
    title="Enterprise Knowledge Assistant",
    description="RAG-based Enterprise Knowledge Assistance API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_database()
initialize_feedback_table()

UPLOAD_DIR = Path("app/uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


@app.get("/")
def root():
    return {
        "message": "Enterprise Knowledge Assistant API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# PDF Upload endpoint is defined below 
@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    department: str = "General",
    document_type: str = "Document",
    uploaded_by: str = "User",
    role: str = "user"
):

    # RBAC permission check
    check_permission(
        role,
        "upload_document"
    )

    # Check file
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    # Check PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Save PDF
    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Extract PDF text
    pages = extract_text_from_pdf(
        str(file_path)
    )

    # Create chunks
    chunks = create_chunks(pages)

    # Create metadata
    metadata = {
        "department": department,
        "document_type": document_type,
        "uploaded_by": uploaded_by,
        "upload_date": datetime.now().strftime("%Y-%m-%d")
    }

    # Generate embeddings and store chunks
    # with metadata in ChromaDB
    stored_chunks = store_chunks(
        chunks,
        file.filename,
        metadata
    )

    # Save document metadata in SQLite
    document_id = add_document(
        filename=file.filename,
        department=department,
        document_type=document_type,
        uploaded_by=uploaded_by,
        upload_date=metadata["upload_date"]
    )

    return {
        "message": "PDF processed and indexed successfully",
        "filename": file.filename,
        "document_id": document_id,
        "department": department,
        "document_type": document_type,
        "uploaded_by": uploaded_by,
        "role": role,
        "total_pages": len(pages),
        "total_chunks": len(chunks),
        "stored_chunks": stored_chunks,
        "chunks": chunks[:3]
    }

# Document listing endpoint
@app.get("/documents")
def list_documents(
    role: str = "user",
    department: str | None = None,
    document_type: str | None = None,
    uploaded_by: str | None = None
):

    check_permission(
        role,
        "view_documents"
    )

    documents = get_documents(
        department=department,
        document_type=document_type,
        uploaded_by=uploaded_by
    )

    return {
        "total_documents": len(documents),
        "documents": documents
    }

# Documents detetion endpoint is defined below.
@app.delete("/documents/{document_id}")
def delete_document_endpoint(
    document_id: int,
    role: str = "user"
):
    # Permission check
    check_permission(
        role,
        "upload_document"
    )

    # Delete metadata from SQLite
    filename = delete_document(document_id)

    if not filename:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # Delete actual PDF file
    file_path = UPLOAD_DIR / filename

    if file_path.exists():
        file_path.unlink()

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
        "filename": filename
    }

# Search and Ask endpoints are defined below.
class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

# Search endpoint is defined below.
@app.post("/search")
def search_documents(request: SearchRequest):

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    results = search_similar_chunks(
        request.query,
        request.top_k
    )

    return {
        "query": request.query,
        "total_results": len(results),
        "results": results
    }


# The Ask endpoint is defined below.
class AskRequest(BaseModel):
    query: str
    top_k: int = 5
    session_id: str
    filename: str | None = None
    department: str | None = None
    document_type: str | None = None
    role:str = "user"


# The Ask endpoint id defined below.
@app.post("/ask")
def ask_question(request: AskRequest):

    # Validate query
    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    check_permission(
        request.role,
        "ask_question"
    )

    # Get previous conversation
    history = get_conversation(
        request.session_id
    )

    # Rewrite query using conversation context
    rewritten_query = rewrite_query(
        request.query,
        history
    )

    retrieved_chunks = multi_document_retrieval(
    rewritten_query,
    top_k=request.top_k,
    candidate_k=15,
    filename=request.filename,
    
)

    # Build citations
    sources = build_sources(
        retrieved_chunks
    )

    # Generate final answer
    result = generate_answer(
        request.query,
        retrieved_chunks,
        history
    )
    # Evaluation RAG answer
    evaluation = evaluate_answer(
        request.query,
        result["answer"],
        retrieved_chunks
    )

    # Save user message
    add_message(
        request.session_id,
        "user",
        request.query
    )

    # Save assistant answer
    add_message(
        request.session_id,
        "assistant",
        result["answer"]
    )

    return {
        "session_id": request.session_id,
        "answer": result["answer"],
        "sources": sources,
        "rewritten_query": rewritten_query,
        "evaluation": evaluation
    }
# Hybride search endpoint is defined below.
class HybridSearchRequest(BaseModel):
    query: str
    top_k: int = 5

# hybride search enspoint is defined below.
@app.post("/hybrid-search")
def hybrid_search_endpoint(
    request: HybridSearchRequest
):

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    results = hybrid_search(
        request.query,
        request.top_k
    )

    return {
        "query": request.query,
        "total_results": len(results),
        "results": results
    }

# Rerank endpoint is defined below.
class RerankRequest(BaseModel):
    query: str
    top_k: int = 5
    candidate_k: int = 10

# Rerank endpoint is defined below.
@app.post("/rerank")
def rerank_endpoint(request: RerankRequest):

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty"
        )

    # Get more candidates from hybrid search
    candidates = hybrid_search(
        request.query,
        request.candidate_k
    )

    # Rerank candidates
    results = rerank_results(
        request.query,
        candidates,
        request.top_k
    )

    return {
        "query": request.query,
        "candidate_count": len(candidates),
        "results": results
    }

# Conversation listing endpoint is defined below
@app.get("/conversations")
def list_conversations(role: str = "user"):

    check_permission(
        role,
        "ask_question"
    )

    result = []

    for session_id, messages in conversations.items():

        if not messages:
            continue

        first_user_message = next(
            (
                message["content"]
                for message in messages
                if message["role"] == "user"
            ),
            "New Conversation"
        )

        result.append({
            "session_id": session_id,
            "title": first_user_message[:60],
            "message_count": len(messages),
            "messages": messages
        })

    return {
        "total_conversations": len(result),
        "conversations": result
    }

# Clear conversation endpoint is defined below.
@app.delete("/conversation/{session_id}")
def delete_conversation(
    session_id: str, 
    role: str = "user"):

    check_permission(
        role,
        "ask_question"
    )
     
    clear_conversation(session_id)

    return {
        "message": "Conversation deleted successfully",
        "session_id": session_id
    }

# Metadata endpoint is defined below.
class DocumentMetadataRequest(BaseModel):
    filename: str
    department: str | None = None
    document_type: str | None = None
    uploaded_by: str | None = None
    upload_date: str | None = None

# Document metadata creation endpoint is defined below.
@app.post("/documents/metadata")
def create_document_metadata(
    request: DocumentMetadataRequest
):

    document_id = add_document(
        filename=request.filename,
        department=request.department,
        document_type=request.document_type,
        uploaded_by=request.uploaded_by,
        upload_date=request.upload_date
    )

    return {
        "message": "Document metadata saved successfully",
        "document_id": document_id
    }

# List documentation endpoint is defined below.
@app.get("/documents")
def list_documents(
    department: str | None = None,
    document_type: str | None = None,
    uploaded_by: str | None = None
):

    documents = get_documents(
        department=department,
        document_type=document_type,
        uploaded_by=uploaded_by
    )

    return {
        "total_documents": len(documents),
        "documents": documents
    }

# Admin dasboard endpoint is defined below.
@app.get("/admin/dashboard")
def admin_dashboard(
    role: str = "user"
):

    check_permission(
        role,
        "view_all_documents"
    )

    statistics = get_dashboard_statistics()

    return {
        "message": "Admin dashboard data",
        "statistics": statistics
    }


class FeedbackRequest(BaseModel):
    session_id: str
    query: str
    answer: str
    rating: str
    comment: str | None = None

# Feedback submission endpoint is defined below.
@app.post("/feedback")
def submit_feedback(request: FeedbackRequest):

    if request.rating not in ["positive", "negative"]:
        raise HTTPException(
            status_code=400,
            detail="Rating must be positive or negative"
        )

    feedback_id = add_feedback(
        session_id=request.session_id,
        query=request.query,
        answer=request.answer,
        rating=request.rating,
        comment=request.comment
    )

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": feedback_id,
        "rating": request.rating
    }

# Admine feadback listing endpoint.
@app.get("/admin/feedback")
def list_feedback(role: str = "user"):

    check_permission(
        role,
        "view_all_documents"
    )

    feedback = get_feedback()

    return {
        "total_feedback": len(feedback),
        "feedback": feedback
    }





#.\venv\Scripts\Activate.ps1
# uvicorn app.main:app --reload