import {
  Bot,
  MessageSquare,
  FileText,
  Upload,
  History,
  MessageCircle,
  Settings,
  HelpCircle,
  LogOut,
  Database,
  Users,
  Layers3,
} from "lucide-react";

import React, { useState, useEffect } from "react";

function Sidebar() {
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  
  const [settingsPage, setSettingsPage] = useState("main");
  const [language, setLanguage] = useState("English");
  const [notifications, setNotifications] = useState(true);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [showConversations, setShowConversations] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState("");

  {/* DOCUMENT LIBRARY CONNECT TO BACKEND */}
  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setDocumentError("");

      const response = await fetch(
        "http://127.0.0.1:8000/documents"
      );

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();

      setDocuments(data.documents || []);

    } catch (error) {
      console.error("Document loading error:", error);

      setDocumentError(
        "Unable to load documents."
      );

    } finally {
      setLoadingDocuments(false);
    }
  };

  {/* CONVERSATIONS CONNECT TO BACKEND */}
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      setConversationError("");

      const response = await fetch(
          "http://127.0.0.1:8000/conversations?role=user"
        );

      if (!response.ok) {
          throw new Error("Failed to load conversations");
        }

      const data = await response.json();

      setConversations(data.conversations || []);
      } catch (error) {
        console.error("Conversation loading error:", error);
        setConversationError(
          "Unable to load conversations."
        );
      } finally {
        setLoadingConversations(false);
      }
    };
    
    {/* CONVERSATIONS deleted */}
    const deleteConversation = async (sessionId) => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/conversation/${sessionId}?role=user`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        console.log("DELETE STATUS:", response.status);
        console.log("DELETE RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to delete conversation"
          );
        }

        await loadConversations();
        setSelectedConversation(null);

      } catch (error) {
        console.error("Delete conversation error:", error);
      }
    };

    {/* DOCUMENTS DELETE */}    
    const deleteDocument = async (documentId) => {
      try {
        const confirmed = window.confirm(
          "Delete this document?"
        );

        if (!confirmed) {
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8000/documents/${documentId}?role=user`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        console.log(
          "DELETE DOCUMENT STATUS:",
          response.status
        );

        console.log(
          "DELETE DOCUMENT RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.detail ||
            "Failed to delete document"
          );
        }

        // Reload document library
        await loadDocuments();

      } catch (error) {
        console.error(
          "Document delete error:",
          error
        );
      }
    };


  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Bot size={27} />
        </div>

        <div className="brand-text">
          <h2>Enterprise</h2>
          <h2>Knowledge Assistant</h2>
          <span>RAG System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        <button className="sidebar-item active">
          <MessageSquare size={20} />
          <span>Chat Assistant</span>
        </button>

        <button 
          type="button"
          className="sidebar-item"
          onClick={() => {
            setShowDocuments(true);
            loadDocuments();
          }}>

          <FileText size={20} />
          <span>Document Library</span>
        </button>

        <button
            type="button"
            className="sidebar-item"
            onClick={() => {
              window.location.reload();
            }}
          >
            <MessageSquare size={20} />
            <span>New Chat</span>
        </button>

        <button 
         type="button"
          className="sidebar-item"
          onClick={() => {
            setShowConversations(true);
            loadConversations();
          }}>
            
          <History size={20} />
          <span>Conversations</span>
        </button>

        <button 
          type="button"
          className="sidebar-item"
          onClick={() => setShowFeedback(true)}>

          <MessageCircle size={20} />
          <span>Feedback</span>
        </button>

        <button 
        type="button"
        className="sidebar-item"
        onClick={() => setShowSettings(true)}>

          <Settings size={20} />
          <span>Settings</span>
        </button>

        <button 
          type="button"
          className="sidebar-item"
           onClick={() => setShowHelp(true)}>

            <HelpCircle size={20} />
            <span>Help & Support</span>
        </button>

        <button className="sidebar-item">
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </nav>

      {/* System Status */}
      <div className="system-status">
        <h3>System Status</h3>

        <div className="status-online">
          <span></span>
          All systems operational
        </div>

        <div className="status-line"></div>

        <div className="status-row">
          <span>Vector Database</span>
          <strong className="db-badge">ChromaDB</strong>
        </div>

        <div className="status-row">
          <span>LLM Model</span>
          <strong>GPT-4</strong>
        </div>

        <div className="status-row">
          <span>Total Documents</span>
          <strong>128</strong>
        </div>

        <div className="status-row">
          <span>Total Chunks</span>
          <strong>3,245</strong>
        </div>

        <div className="status-row">
          <span>Total Users</span>
          <strong>56</strong>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">BJ</div>

        <div className="user-details">
          <strong>Bhaskar Kumar</strong>
          <span>Employee</span>
        </div>

        <span className="user-arrow">⌄</span>
      </div>
      
      {/* HELP & SUPPORT MODEL */}

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
              <h2>Help & Support</h2>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="help-close"
              >
                ×
              </button>
            </div>

            <div className="help-content">
              <h3>📄 Upload Documents</h3>
              <p>
                Upload PDF documents using the Upload Documents button.
              </p>

              <h3>💬 Ask Questions</h3>
              <p>
                Ask questions about your uploaded enterprise documents.
              </p>

              <h3>🔍 Document Sources</h3>
              <p>
                Answers can include the document name and page number
                used as a source.
              </p>

              <h3>👍 Feedback</h3>
              <p>
                Use the feedback buttons to rate an answer.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* SETTING MODELS */}

      {showSettings && (
        <div
          className="settings-overlay"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}

            <div className="settings-modal-header">

              <div className="settings-title">
                <Settings size={22} />
                <h2>Settings</h2>
              </div>

              <button
                type="button"
                className="settings-close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>

            </div>


            {/* MAIN SETTINGS */}

            {settingsPage === "main" && (
              <div className="settings-content">

                {/* Profile */}

                <button
                  type="button"
                  className="settings-item"
                  onClick={() => setSettingsPage("profile")}
                >
                  <div>
                    <h3>👤 Profile</h3>
                    <p>Manage your profile information.</p>
                  </div>

                  <span>›</span>
                </button>


                {/* Language */}

                <button
                  type="button"
                  className="settings-item"
                  onClick={() => setSettingsPage("language")}
                >
                  <div>
                    <h3>🌐 Language</h3>
                    <p>{language}</p>
                  </div>

                  <span>›</span>
                </button>


                {/* Appearance */}

                <button
                  type="button"
                  className="settings-item"
                  onClick={() => setSettingsPage("appearance")}
                >
                  <div>
                    <h3>🎨 Appearance</h3>
                    <p>Customize the appearance of the assistant.</p>
                  </div>

                  <span>›</span>
                </button>


                {/* Notifications */}

                <button
                  type="button"
                  className="settings-item"
                  onClick={() => setSettingsPage("notifications")}
                >
                  <div>
                    <h3>🔔 Notifications</h3>
                    <p>
                      {notifications ? "Enabled" : "Disabled"}
                    </p>
                  </div>

                  <span>›</span>
                </button>


                {/* Security */}

                <button
                  type="button"
                  className="settings-item"
                  onClick={() => setSettingsPage("security")}
                >
                  <div>
                    <h3>🔒 Security</h3>
                    <p>Manage account security.</p>
                  </div>

                  <span>›</span>
                </button>


                {/* About */}

                <button
                  type="button"
                  className="settings-item"
                  onClick={() => setSettingsPage("about")}
                >
                  <div>
                    <h3>ℹ️ About</h3>
                    <p>Enterprise Knowledge Assistant</p>
                  </div>

                  <span>›</span>
                </button>

              </div>
            )}


            {/* PROFILE */}

            {settingsPage === "profile" && (
              <div className="settings-content">

                <button
                  className="settings-back"
                  onClick={() => setSettingsPage("main")}
                >
                  ← Back
                </button>

                <h3>👤 Profile</h3>

                <div className="profile-box">

                  <div className="profile-avatar">
                    U
                  </div>

                  <h3>User</h3>

                  <p>Enterprise Knowledge Assistant</p>

                  <button
                    type="button"
                    className="settings-action-btn"
                  >
                    Change Profile
                  </button>

                </div>

              </div>
            )}


            {/* LANGUAGE */}

            {settingsPage === "language" && (
              <div className="settings-content">

                <button
                  className="settings-back"
                  onClick={() => setSettingsPage("main")}
                >
                  ← Back
                </button>

                <h3>🌐 Choose Language</h3>

                <label className="language-option">
                  <input
                    type="radio"
                    name="language"
                    checked={language === "English"}
                    onChange={() => setLanguage("English")}
                  />
                  English
                </label>

                <label className="language-option">
                  <input
                    type="radio"
                    name="language"
                    checked={language === "Hindi"}
                    onChange={() => setLanguage("Hindi")}
                  />
                  Hindi
                </label>

              </div>
            )}


            {/* APPEARANCE */}

            {settingsPage === "appearance" && (
              <div className="settings-content">

                <button
                  className="settings-back"
                  onClick={() => setSettingsPage("main")}
                >
                  ← Back
                </button>

                <h3>🎨 Appearance</h3>

                <p>
                  Use the Light / Dark theme controls in the
                  dashboard to change the application appearance.
                </p>

              </div>
            )}


            {/* NOTIFICATIONS */}

            {settingsPage === "notifications" && (
              <div className="settings-content">

                <button
                  className="settings-back"
                  onClick={() => setSettingsPage("main")}
                >
                  ← Back
                </button>

                <h3>🔔 Notifications</h3>

                <div className="notification-setting">

                  <div>
                    <strong>Notifications</strong>

                    <p>
                      Receive notifications from the assistant.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`notification-toggle ${
                      notifications ? "active" : ""
                    }`}
                    onClick={() =>
                      setNotifications(!notifications)
                    }
                  >
                    {notifications ? "ON" : "OFF"}
                  </button>

                </div>

              </div>
            )}


            {/* SECURITY */}

            {settingsPage === "security" && (
              <div className="settings-content">

                <button
                  className="settings-back"
                  onClick={() => setSettingsPage("main")}
                >
                  ← Back
                </button>

                <h3>🔒 Security</h3>

                <p>
                  Your account and document access are protected
                  by the application's permission system.
                </p>

                <button
                  type="button"
                  className="settings-action-btn"
                >
                  Manage Security
                </button>

              </div>
            )}


                  {/* ABOUT */}

                  {settingsPage === "about" && (
                    <div className="settings-content">

                      <button
                        className="settings-back"
                        onClick={() => setSettingsPage("main")}
                      >
                        ← Back
                      </button>

                      <h3>ℹ️ About</h3>

                      <p>
                        Enterprise Knowledge Assistant
                      </p>

                      <p>
                        An AI-powered document assistant that allows
                        users to upload documents and ask questions
                        using knowledge retrieved from those documents.
                      </p>

                      <p>
                        Version 1.0.0
                      </p>

                    </div>
                  )}

                </div>
              </div>
            )} 

      {/* FEEDBACK MODAL */}

      {showFeedback && (
        <div
          className="feedback-overlay"
          onClick={() => setShowFeedback(false)}
        >
          <div
            className="feedback-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}

            <div className="feedback-modal-header">

              <div>
                <MessageCircle size={22} />
                <h2>Feedback</h2>
              </div>

              <button
                type="button"
                className="feedback-close"
                onClick={() => setShowFeedback(false)}
              >
                ×
              </button>

            </div>


            <div className="feedback-content">

              <h3>How is your experience?</h3>

              <p>
                Your feedback helps us improve the
                Enterprise Knowledge Assistant.
              </p>


              {/* Feedback Rating */}

              <div className="feedback-choice">

                <button
                  type="button"
                  className={`feedback-choice-btn ${
                    feedbackRating === "positive"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setFeedbackRating("positive");
                    setFeedbackMessage("");
                  }}
                >
                  👍 Helpful
                </button>


                <button
                  type="button"
                  className={`feedback-choice-btn ${
                    feedbackRating === "negative"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setFeedbackRating("negative");
                    setFeedbackMessage("");
                  }}
                >
                  👎 Needs improvement
                </button>

              </div>


              {/* Selected message */}

              {feedbackRating && (
                <div className="feedback-selected-message">

                  {feedbackRating === "positive"
                    ? "👍 Thanks! You found this helpful."
                    : "👎 Thanks! We'll use your feedback to improve."}

                </div>
              )}


              {/* Comment */}

              <textarea
                className="feedback-textarea"
                value={feedbackComment}
                onChange={(e) =>
                  setFeedbackComment(e.target.value)
                }
                placeholder="Tell us what you think..."
              />


              {/* Submit */}

              <button
                type="button"
                className="feedback-submit"
                disabled={
                  !feedbackRating ||
                  feedbackSubmitting
                }
                onClick={async () => {

                  if (!feedbackRating) {
                    setFeedbackMessage(
                      "Please select Helpful or Needs improvement."
                    );
                    return;
                  }

                  try {

                    setFeedbackSubmitting(true);
                    setFeedbackMessage("");

                    const response = await fetch(
                      "http://127.0.0.1:8000/feedback",
                      {
                        method: "POST",

                        headers: {
                          "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                          session_id: "sidebar-feedback",
                          query: "General application feedback",
                          answer: "User submitted feedback",
                          rating: feedbackRating,
                          comment:
                            feedbackComment.trim() || null,
                        }),
                      }
                    );


                    if (!response.ok) {

                      const errorText =
                        await response.text();

                      throw new Error(errorText);
                    }


                    const data =
                      await response.json();

                    console.log(
                      "Feedback saved:",
                      data
                    );


                    setFeedbackMessage(
                      "✅ Feedback submitted successfully!"
                    );

                    setFeedbackComment("");


                  } catch (error) {

                    console.error(
                      "Feedback submission error:",
                      error
                    );

                    setFeedbackMessage(
                      "❌ Unable to submit feedback. Please try again."
                    );

                  } finally {

                    setFeedbackSubmitting(false);

                  }

                }}
              >

                {feedbackSubmitting
                  ? "Submitting..."
                  : "Submit Feedback"}

              </button>


              {/* Status Message */}

              {feedbackMessage && (
                <div className="feedback-status">
                  {feedbackMessage}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* CONVERSATIONS MODAL */}
       
      {showConversations && (
        <div
          className="conversations-overlay"
          onClick={() => {
            setShowConversations(false);
            setSelectedConversation(null);
          }}
        >
          <div
            className="conversations-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="conversations-header">

              <div className="conversations-title">
                <History size={22} />
                <h2>Conversations</h2>
              </div>

              <button
                type="button"
                className="conversations-close"
                onClick={() => {
                  setShowConversations(false);
                  setSelectedConversation(null);
                }}
              >
                ×
              </button>

            </div>


            <div className="conversations-content">

              {/* LOADING */}
              {loadingConversations && (
                <div className="conversation-empty">
                  <p>Loading conversations...</p>
                </div>
              )}


              {/* ERROR */}
              {!loadingConversations && conversationError && (
                <div className="conversation-empty">

                  <p>{conversationError}</p>

                  <button
                    type="button"
                    onClick={loadConversations}
                  >
                    Try Again
                  </button>

                </div>
              )}


              {/* NO CONVERSATIONS */}
              {!loadingConversations &&
                !conversationError &&
                conversations.length === 0 && (
                  <div className="conversation-empty">

                    <History size={40} />

                    <h3>No conversations yet</h3>

                    <p>
                      Start asking questions and your
                      conversations will appear here.
                    </p>

                  </div>
                )}


              {/* CONVERSATION LIST */}
              {!selectedConversation &&
                !loadingConversations &&
                !conversationError &&
                conversations.map((conversation) => (

                  <div
                    key={conversation.session_id}
                    className="conversation-item"
                  >

                    {/* Conversation information */}
                    <div
                      className="conversation-info"
                      onClick={() =>
                        setSelectedConversation(conversation)
                      }
                    >

                      <h3>
                        {conversation.title ||
                          "New Conversation"}
                      </h3>

                      <p>
                        {conversation.message_count} messages
                      </p>

                    </div>


                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      className="conversation-delete"
                      title="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();

                        const confirmed = window.confirm(
                          "Delete this conversation?"
                        );

                        if (confirmed) {
                          deleteConversation(
                            conversation.session_id
                          );
                        }
                      }}
                    >
                      🗑
                    </button>

                  </div>

                ))}


              {/* SELECTED CONVERSATION */}
              {selectedConversation && (
                <div className="conversation-details">

                  {/* BACK BUTTON */}
                  <button
                    type="button"
                    className="conversation-back"
                    onClick={() =>
                      setSelectedConversation(null)
                    }
                  >
                    ← Back
                  </button>


                  {/* TITLE */}
                  <h3>
                    {selectedConversation.title ||
                      "Conversation"}
                  </h3>


                  {/* MESSAGE COUNT */}
                  <p>
                    Total messages:{" "}
                    {selectedConversation.messages?.length || 0}
                  </p>


                  {/* ALL MESSAGES */}
                  <div className="conversation-messages">

                    {selectedConversation.messages?.map(
                      (message, index) => (

                        <div
                          key={index}
                          className={`conversation-message ${
                            message.role === "user"
                              ? "user-message"
                              : "assistant-message"
                          }`}
                        >

                          <strong>
                            {message.role === "user"
                              ? "You"
                              : "Assistant"}
                          </strong>

                          <p>
                            {message.content}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT LIBRARY MODAL */}

      {showDocuments && (
        <div
          className="documents-overlay"
          onClick={() => setShowDocuments(false)}
        >
          <div
            className="documents-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="documents-header">

              <div className="documents-title">
                <FileText size={22} />
                <h2>Document Library</h2>
              </div>

              <button
                type="button"
                className="documents-close"
                onClick={() => setShowDocuments(false)}
              >
                ×
              </button>

            </div>

            <div className="documents-content">

              {loadingDocuments && (
                <div className="documents-empty">
                  <p>Loading documents...</p>
                </div>
              )}

              {!loadingDocuments && documentError && (
                <div className="documents-empty">
                  <p>{documentError}</p>

                  <button
                    type="button"
                    onClick={loadDocuments}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loadingDocuments &&
                !documentError &&
                documents.length === 0 && (
                  <div className="documents-empty">
                    <FileText size={42} />

                    <h3>No documents found</h3>

                    <p>
                      Uploaded PDF documents will appear here.
                    </p>
                  </div>
                )}

              {!loadingDocuments &&
                !documentError &&
                documents.length > 0 && (

                  <div className="documents-list">

                    {documents.map((document) => (

                      <div
                        className="document-card"
                        key={document.id}
                      >

                        <div className="document-icon">
                          <FileText size={20} />
                        </div>

                        <div className="document-info">

                          <h3>
                            {document.filename}
                          </h3>

                          <p>
                            Department:{" "}
                            {document.department || "General"}
                          </p>

                          <p>
                            Type:{" "}
                            {document.document_type || "Document"}
                          </p>

                          <p>
                            Uploaded by:{" "}
                            {document.uploaded_by || "User"}
                          </p>

                          <p>
                            Date:{" "}
                            {document.upload_date || "N/A"}
                          </p>

                        </div>

                        {/* DELETE DOCUMENT */} 
                        <button 
                          type="button" 
                          className="document-delete" 
                          title="Delete document" 
                          onClick={() => deleteDocument(document.id) } > 🗑️ 
                        </button>

                      </div>

                    ))}

                  </div>
                )}

            </div>

          </div>
        </div>
      )}

    </aside>
  );
}

export default Sidebar;