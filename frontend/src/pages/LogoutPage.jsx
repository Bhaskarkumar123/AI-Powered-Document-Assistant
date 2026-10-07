import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import "./LogoutPage.css";

function LogoutPage() {
  const navigate = useNavigate();

  return (
    <div className="logout-page">

      {/* Close Button */}
      <button
        type="button"
        className="logout-close-btn"
        onClick={() => navigate("/")}
        title="Go to Main Page"
      >
        <X size={24} />
      </button>

      <div className="logout-card">
        <div className="logout-icon">🤖</div>

        <h1>Enterprise Knowledge Assistant</h1>

        <p className="logout-title">
          You have been logged out
        </p>

        <p className="logout-text">
          Choose an option below to continue.
        </p>

        <div className="logout-actions">
          <button
            type="button"
            className="logout-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            type="button"
            className="logout-register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutPage;