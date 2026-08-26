import { submitFeedback } from "../services/feedbackApi";
import {
  Sun,
  Moon,
  UploadCloud,
  BookOpen,
  FileText,
  Clock3,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Send,
  BarChart3,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import { useState, useRef } from "react";
import "./ChatAssistant.css";

function ChatAssistant() {

  const [showHelp, setShowHelp] = useState(false);

   // =========================
  // light and gark mode component
  // =========================
  const [darkMode, setDarkMode] = useState(false);

  // =========================
  // Chat States
  // =========================

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");

  const [sessionId] = useState(
    () => `session-${Date.now()}`
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [apiSources, setApiSources] = useState([]);

  const [evaluation, setEvaluation] =
    useState(null);

   

  // =========================
  // Feedback States
  // =========================

  const [feedbackLoading, setFeedbackLoading] =
    useState(false);

  const [feedbackStatus, setFeedbackStatus] =
    useState("");

   // =========================
  // Document Upload States
  // =========================

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);  
  

  // =========================
  // Feedback Function
  // =========================

  async function handleFeedback(rating) {

    if (!answer) {
      return;
    }

    try {

      setFeedbackLoading(true);
      setFeedbackStatus("");

      await submitFeedback({
        sessionId,
        query,
        answer,
        rating,
      });

      setFeedbackStatus(
        rating === "positive"
          ? "Thanks! Your feedback was helpful."
          : "Thanks! We'll use your feedback to improve."
      );

    } catch (error) {

      console.error(error);

      setFeedbackStatus(
        "Unable to submit feedback."
      );

    } finally {

      setFeedbackLoading(false);

    }
  }

  // =========================
  // Document Upload
  // =========================

  function openFilePicker() {
    document.getElementById("pdf-upload-input")?.click();
    fileInputRef.current?.click();
  }

  async function handleDocumentUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadStatus("Uploading and processing PDF...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/documents/upload?department=General&document_type=Document&uploaded_by=User&role=user",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Upload failed ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      setUploadStatus(
        `Uploaded successfully: ${data.filename || file.name}`
      );
    } catch (error) {
      console.error("Document Upload Error:", error);
      setUploadStatus(
        error.message || "Unable to upload document."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // =========================
  // Ask Question
  // =========================

  async function handleAsk(customQuestion = null) {

    const question = (
      customQuestion !== null
        ? customQuestion
        : query
    ).trim();

    if (!question) {
      return;
    }

    try {

      setLoading(true);
      setError("");
      setFeedbackStatus("");

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: question,
        },
      ]);

      const response = await fetch(
        "http://127.0.0.1:8000/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            query: question,
            top_k: 5,
            session_id: sessionId,
            filename: null,
            department: null,
            document_type: null,
            role: "user",
          }),
        }
      );

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          `Backend error ${response.status}: ${errorText}`
        );
      }

      const data =
        await response.json();

      const assistantAnswer =
      data.answer ||
      "No answer received.";  
      
      setAnswer(assistantAnswer);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantAnswer,
        },
      ]);

      setQuery("");

      // Sources
      setApiSources(
        Array.isArray(data.sources)
          ? data.sources
          : []
      );

      // Evaluation
      setEvaluation(
        data.evaluation || null
      );

    } catch (error) {

      console.error(
        "Ask API Error:",
        error
      );

      setError(
        error.message ||
        "Unable to connect to backend."
      );

      setAnswer("");
      setApiSources([]);
      setEvaluation(null);

    } finally {

      setLoading(false);

    }
  }

  // =========================
  // Documents
  // =========================

  const documents = [
    {
      name: "HR_Policy_2024.pdf",
      pages: "45 pages",
      uploaded: "Uploaded: 2 days ago",
      relevance: "0.92",
    },
    
    {
      name: "Leave_Guidelines.pdf",
      pages: "32 pages",
      uploaded: "Uploaded: 5 days ago",
      relevance: "0.85",
    },
    {
      name: "Company_Policies.pdf",
      pages: "60 pages",
      uploaded: "Uploaded: 1 week ago",
      relevance: "0.78",
    },
  ];

  // =========================
  // Default Sources
  // =========================

  const defaultSources = [
    {
      name: "HR_Policy_2024.pdf",
      page: "Page 12",
      relevance: "0.92",
    },
    
    {
      name: "Leave_Guidelines.pdf",
      page: "Page 5",
      relevance: "0.85",
    },
    {
      name: "Company_Policies.pdf",
      page: "Page 18",
      relevance: "0.78",
    },
  ];

  // =========================
  // History
  // =========================

  const history = [
    ["What is the leave policy?", "10:31 AM"],
    [
      "How to apply for reimbursement?",
      "Yesterday",
    ],
    [
      "What is the remote work policy?",
      "2 days ago",
    ],
    [
      "How to update personal details?",
      "3 days ago",
    ],
    [
      "What are the office timings?",
      "3 days ago",
    ],
  ];

  // =========================
  // Example Questions
  // =========================

  const questions = [
    "What are the working hours?",
    "How to apply for reimbursement?",
    "What is the remote work policy?",
    "How many sick leaves are allowed?",
    "What is the Summary?",
  ];

  // =========================
  // Render
  // =========================

  return (
    <div className={`dashboard ${darkMode ? "dark-mode" : "light-mode"}`}>

      <Sidebar />

      <main className="dashboard-main">

        {/* ================= HEADER ================= */}

        <header className="dashboard-header">

          <div>

            <h1>
              Enterprise Knowledge Assistant (RAG System)
            </h1>

            <p>
              Ask questions from your enterprise
              documents. Get accurate answers with
              sources.
            </p>

          </div>

          <div className="header-actions">

            <div className="theme-toggle">

              <button className="theme-light"
                onClick={() => setDarkMode(false)}
                title="Light Mode">

                <Sun size={17} />
              </button>

              <button className="theme-dark"
                onClick={() => setDarkMode(true)}
                title="Dark Mode">

                <Moon size={17} />
              </button>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf, application/pdf"
              onChange={handleDocumentUpload}
              style={{ display: "none" }}
            />

            <button 
              type="button"
              className="upload-button"
              onClick={openFilePicker}
              disabled={uploading}>

              <UploadCloud size={18} />

              {uploading ? "Uploading..." :  "Upload Documents"}

            </button>

          </div>

        </header>

        {uploadStatus &&(
          <div className= "upload-status">
            {uploadStatus}
          </div>
        )}

        {/* ================= MAIN GRID ================= */}
            <div className="dashboard-grid">
              <div className="main-column">

              {/* Chat Card */}

              <div className="chat-card">

                {/* ================= CHAT MESSAGES ================= */}

                <div className="chat-messages">

                  {messages.length === 0 ? (

                    <div className="chat-empty">

                      <div className="user-question">

                        <div className="question-bubble">

                          <p>
                            Start a new conversation by asking a
                            question about your uploaded documents.
                          </p>

                        </div>

                        <div className="question-avatar">
                          <span>👤</span>
                        </div>

                      </div>

                    </div>

                  ) : (

                    messages.map((message, index) => (

                      message.role === "user" ? (

                        <div
                          key={index}
                          className="user-question"
                        >

                          <div className="question-bubble">

                            <p>
                              {message.content}
                            </p>

                            <span>
                              10:31 AM
                            </span>

                          </div>

                          <div className="question-avatar">
                            <span>👤</span>
                          </div>

                        </div>

                      ) : (

                        <div
                          key={index}
                          className="ai-answer"
                        >

                          <div className="ai-avatar">
                            🤖
                          </div>

                          <div className="answer-content">

                            <p>
                              {message.content}
                            </p>

                            <span className="answer-time">
                              10:31 AM
                            </span>

                          </div>

                        </div>

                      )

                    ))

                  )}

                </div>
        


              {/* ================= FEEDBACK ================= */}

              <div className="feedback-section">

                <span className="feedback-label">
                  Was this answer helpful?
                </span>

                <div className="feedback-buttons">

                  <button
                    type="button"
                    onClick={() =>
                      handleFeedback("positive")
                    }
                    disabled={
                      feedbackLoading ||
                      !answer
                    }
                    className="feedback-btn"
                  >
                    👍
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleFeedback("negative")
                    }
                    disabled={
                      feedbackLoading ||
                      !answer
                    }
                    className="feedback-btn"
                  >
                    👎
                  </button>

                </div>

                {feedbackStatus && (

                  <p className="feedback-status">
                    {feedbackStatus}
                  </p>

                )}

              </div>


              {/* ================= CHAT INPUT ================= */}

              <div className="chat-input">

                <input
                  type="text"
                  placeholder="Ask anything about your documents..."
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      handleAsk();
                    }

                  }}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    handleAsk()
                  }
                  disabled={
                    loading ||
                    !query.trim()
                  }
                >
                  <Send size={20} />
                </button>

              </div>
             </div>

             {/* ================= DOCUMENTS ================= */}

              <div className="section-card">

                <div className="section-header">
                  <h2>Uploaded Documents</h2>

                  <button type="button">
                    View All
                  </button>
                </div>

                <div className="documents-grid">

                  {documents.map((doc) => (

                    <div
                      className="document-card"
                      key={doc.name}
                    >

                      <div className="document-title">

                        <div className="pdf-icon">
                          PDF
                        </div>

                        <span className="document-filename">
                          {doc.name}
                        </span>

                      </div>

                      <p>{doc.pages}</p>

                      <p>{doc.uploaded}</p>

                      <strong>
                        Relevance: {doc.relevance}
                      </strong>

                    </div>

                  ))}

                  <button
                    type="button"
                    className="upload-more"
                    onClick={openFilePicker}
                    disabled={uploading}
                  >

                    <UploadCloud size={25} />

                    <span>
                      {uploading
                        ? "Uploading..."
                        : "Upload More"}
                    </span>

                  </button>

                </div>

              </div>

              {/* ================= EXAMPLE QUESTIONS ================= */}
              <div className="section-card example-card">

                <div className="section-header">
                  <h2>Example Questions</h2>
                </div>

                <div className="question-tags">
                  {questions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleAsk(question)}
                      disabled={loading}
                    >
                      {question}
                    </button>
                  ))}
                </div>

              </div>
              

          </div>


            
            

          {/* ================= RIGHT SIDEBAR ================= */}

          <aside className="right-column">

            {/* Sources */}

            <div className="right-card">

              <div className="right-card-header">

                <h2>

                  <BookOpen size={19} />

                  Sources / Citations

                </h2>

              </div>

              <div className="sources-list">

                {apiSources.length > 0 ? (

                  apiSources.map(
                    (source, index) => {

                      const name =
                        source.name ||
                        source.filename ||
                        source.file_name ||
                        source.metadata?.filename ||
                        `Source ${index + 1}`;

                      const page =
                        source.page ||
                        source.page_number ||
                        source.metadata?.page ||
                        "";

                      const relevance =
                        source.relevance ??
                        source.score ??
                        "";

                      return (

                        <div
                          className="source-item"
                          key={`${name}-${index}`}
                        >

                          <div className="source-name">

                            <div className="pdf-icon">
                              PDF
                            </div>

                            <span>
                              {name}
                            </span>

                          </div>

                          <div className="source-meta">

                            <span>
                              {page
                                ? String(page)
                                    .toLowerCase()
                                    .includes("page")
                                  ? page
                                  : `Page ${page}`
                                : ""}
                            </span>

                            <strong>

                              Relevance:{" "}

                              {typeof relevance ===
                              "number"
                                ? relevance.toFixed(
                                    2
                                  )
                                : relevance}

                            </strong>

                          </div>

                        </div>

                      );
                    }
                  )

                ) : (

                  defaultSources.map(
                    (source) => (

                      <div
                        className="source-item"
                        key={source.name}
                      >

                        <div className="source-name">

                          <div className="pdf-icon">
                            PDF
                          </div>

                          <span>
                            {source.name}
                          </span>

                        </div>

                        <div className="source-meta">

                          <span>
                            {source.page}
                          </span>

                          <strong>
                            Relevance:{" "}
                            {source.relevance}
                          </strong>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

              <button className="view-sources">
                View All Sources →
              </button>

            </div>

            {/* ================= RAG EVALUATION ================= */}

            <div className="right-card">

              <div className="right-card-header">

                <h2>

                  <BarChart3 size={19} />

                  RAG Evaluation

                </h2>

              </div>

              {evaluation ? (

                <div className="feedback-grid">

                  {evaluation.faithfulness !==
                    undefined && (

                    <div className="feedback-box">

                      <strong>
                        {(
                          evaluation.faithfulness *
                          100
                        ).toFixed(0)}
                        %
                      </strong>

                      <span>
                        Faithfulness
                      </span>

                    </div>

                  )}

                  {evaluation.answer_relevance !==
                    undefined && (

                    <div className="feedback-box">

                      <strong>
                        {(
                          evaluation.answer_relevance *
                          100
                        ).toFixed(0)}
                        %
                      </strong>

                      <span>
                        Answer Relevance
                      </span>

                    </div>

                  )}

                  {evaluation.context_relevance !==
                    undefined && (

                    <div className="feedback-box">

                      <strong>
                        {(
                          evaluation.context_relevance *
                          100
                        ).toFixed(0)}
                        %
                      </strong>

                      <span>
                        Context Relevance
                      </span>

                    </div>

                  )}

                  {evaluation.overall_score !==
                    undefined && (

                    <div className="feedback-box satisfaction">

                      <strong>
                        {(
                          evaluation.overall_score *
                          100
                        ).toFixed(0)}
                        %
                      </strong>

                      <span>
                        Overall Score
                      </span>

                    </div>

                  )}

                </div>

              ) : (

                <p>
                  Evaluation will appear after
                  asking a question.
                </p>

              )}

            </div>

            {/* Conversation History */}

            <div className="right-card">

              <div className="right-card-header">

                <h2>
                  Conversation History
                </h2>

                <button>
                  View All
                </button>

              </div>

              <div className="history-list">

                {history.map(
                  ([text, time]) => (

                    <div
                      className="history-item"
                      key={text}
                    >

                      <Clock3 size={15} />

                      <span>
                        {text}
                      </span>

                      <small>
                        {time}
                      </small>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Feedback */}

            <div className="right-card feedback-card">

              <div className="right-card-header">

                <h2>
                  Feedback Summary
                </h2>

                <button className="month-select">

                  This Month

                  <ChevronDown size={14} />

                </button>

              </div>

              <div className="feedback-grid">

                <div className="feedback-box">

                  <ThumbsUp size={25} />

                  <strong>
                    125
                  </strong>

                  <span>
                    Helpful
                  </span>

                </div>

                <div className="feedback-box negative">

                  <ThumbsDown size={25} />

                  <strong>
                    18
                  </strong>

                  <span>
                    Not Helpful
                  </span>

                </div>

                <div className="feedback-box satisfaction">

                  <BarChart3 size={25} />

                  <strong>
                    87%
                  </strong>

                  <span>
                    Satisfaction
                  </span>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {showHelp && (
        <div
          className="help-overlay"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="help-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="help-modal-header">
              <div className="help-title">
                <HelpCircle size={22} />
                <h2>Help & Support</h2>
              </div>

              <button
                type="button"
                className="help-close"
                onClick={() => setShowHelp(false)}
              >
                ×
              </button>
            </div>

            <div className="help-content">
              <div className="help-card">
                <h3>📄 Upload Documents</h3>
                <p>
                  Click the Upload Documents button to upload a PDF.
                  The document will be processed and indexed for searching.
                </p>
              </div>

              <div className="help-card">
                <h3>💬 Ask Questions</h3>
                <p>
                  Ask questions about your uploaded documents using the
                  chat assistant. Answers are generated from the available
                  document information.
                </p>
              </div>

              <div className="help-card">
                <h3>🔍 Sources</h3>
                <p>
                  Relevant document sources and page numbers are shown
                  with the answer when available.
                </p>
              </div>

              <div className="help-card">
                <h3>👍 Feedback</h3>
                <p>
                  Use the positive or negative feedback buttons to tell us
                  whether an answer was useful.
                </p>
              </div>

              <div className="help-contact">
                <h3>Need more help?</h3>
                <p>
                  If something is not working, please contact your
                  administrator or project support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

    
  );
}

export default ChatAssistant;