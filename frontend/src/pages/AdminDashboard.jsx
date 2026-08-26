import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/adminApi";
import { getAdminFeedback } from "../services/feedbackAdminApi";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Load dashboard statistics
        const data = await getAdminDashboard();

        setDashboardData(data.statistics);

        // Load user feedback
        const feedbackData = await getAdminFeedback();

        setFeedback(feedbackData.feedback || []);

      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
        setFeedbackLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="logo-icon">
            EK
          </div>

          <div>
            <h2>Enterprise</h2>
            <span>Knowledge Assistant</span>
          </div>

        </div>

        <nav className="admin-nav">

          <div className="nav-section">
            <span>MAIN</span>
          </div>

          <a className="nav-item active"
            href="#dashboard-section"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("dashboard-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <span>▦</span>
            Dashboard
          </a>

          <a
            href="#documents-section"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("documents-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <span>▤</span>
            Documents
          </a>

          <a className="nav-item">
            <span>◉</span>
            Users
          </a>

          <a
            href="#feedback-section"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("feedback-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <span>◌</span>
            Feedback
          </a>

          <div className="nav-section">
            <span>MANAGEMENT</span>
          </div>

          <a className="nav-item">
            <span>⚙</span>
            Settings
          </a>

        </nav>

        {/* Admin Profile */}

        <div className="admin-profile">

          <div className="profile-avatar">
            A
          </div>

          <div>
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="admin-main" id="dashboard-section">

        {/* Header */}

        <header className="admin-header">

          <div>

            <p className="breadcrumb">
              Enterprise / Admin
            </p>

            <h1>
              Admin Dashboard
            </h1>

            <p className="header-description">
              Monitor documents, departments and
              knowledge-base activity.
            </p>

          </div>

          <div className="header-actions">

            <button className="notification-btn">
              🔔
            </button>

            <button className="admin-user-btn">

              <span className="small-avatar">
                A
              </span>

              Admin

              <span>
                ⌄
              </span>

            </button>

          </div>

        </header>


        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {/* Total Documents */}

          <div className="stat-card">

            <div className="stat-icon documents-icon">
              ▤
            </div>

            <div>

              <span>
                Total Documents
              </span>

              <h2>
                {dashboardData.total_documents}
              </h2>

              <small>
                Knowledge base documents
              </small>

            </div>

          </div>


          {/* Departments */}

          <div className="stat-card">

            <div className="stat-icon department-icon">
              ◫
            </div>

            <div>

              <span>
                Departments
              </span>

              <h2>
                {dashboardData.total_departments}
              </h2>

              <small>
                Active departments
              </small>

            </div>

          </div>


          {/* System Status */}

          <div className="stat-card">

            <div className="stat-icon search-icon">
              ⌕
            </div>

            <div>

              <span>
                Knowledge Status
              </span>

              <h2>
                Active
              </h2>

              <small className="status-text">
                ● System operational
              </small>

            </div>

          </div>

        </section>


        {/* ================= DEPARTMENTS + DOCUMENTS ================= */}

        <section className="content-grid" id="documents-section">


          {/* Departments */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Departments
                </h2>

                <p>
                  Documents by department
                </p>

              </div>

              <button className="view-btn">
                View all
              </button>

            </div>


            <div className="department-list">

              {Object.entries(
                dashboardData.departments || {}
              ).map(([department, count]) => (

                <div
                  className="department-item"
                  key={department}
                >

                  <div className="department-info">

                    <div className="department-icon">

                      {department
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <strong>
                        {department}
                      </strong>

                      <span>
                        Knowledge documents
                      </span>

                    </div>

                  </div>

                  <div className="department-count">
                    {count}
                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* Recent Documents */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Recent Documents
                </h2>

                <p>
                  Latest uploaded knowledge
                </p>

              </div>

              <button className="view-btn">
                View all
              </button>

            </div>


            <div className="document-list">

              {(dashboardData.recent_documents || [])
                .map((document, index) => (

                  <div
                    className="document-item"
                    key={
                      document.id || index
                    }
                  >

                    <div className="pdf-icon">
                      PDF
                    </div>

                    <div className="document-info">

                      <strong>
                        {document.filename}
                      </strong>

                      <span>
                        {document.department ||
                          "General"}
                      </span>

                    </div>

                    <button className="more-btn">
                      ⋮
                    </button>

                  </div>

                ))}

            </div>

          </div>

        </section>


        {/* ================= USER FEEDBACK ================= */}

        <section className="dashboard-card feedback-card" id="feedback-section">

          <div className="card-header">

            <div>

              <h2>
                User Feedback
              </h2>

              <p>
                Recent feedback from users
              </p>

            </div>

            <span className="feedback-total">
              {feedback.length} total
            </span>

          </div>


          {/* Loading */}

          {feedbackLoading ? (

            <p className="empty-feedback">
              Loading feedback...
            </p>

          ) : feedback.length === 0 ? (

            /* No feedback */

            <p className="empty-feedback">
              No feedback received yet.
            </p>

          ) : (

            /* Feedback List */

            <div className="feedback-list">

              {feedback
                .slice(0, 5)
                .map((item) => (

                  <div
                    className="feedback-item"
                    key={item.id}
                  >

                    {/* Rating Icon */}

                    <div className="feedback-rating">

                      {item.rating === "positive"
                        ? "👍"
                        : "👎"}

                    </div>


                    {/* Feedback Content */}

                    <div className="feedback-content">

                      <strong>

                        {item.rating === "positive"
                          ? "Helpful"
                          : "Not Helpful"}

                      </strong>

                      <p>
                        {item.query}
                      </p>

                      {item.comment && (
                        <small>
                          "{item.comment}"
                        </small>
                      )}

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;