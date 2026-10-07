
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn, Sun, Moon } from "lucide-react";
import "./ChatAssistant.css";

function Login() {
  const navigate = useNavigate();

  // Get saved theme
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Change theme
  const handleThemeChange = (mode) => {
    setDarkMode(mode === "dark");
    localStorage.setItem("theme", mode);
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setError("");

    // Frontend-only login
    navigate("/");
  };

  return (
    <div
      className={`login-page ${
        darkMode ? "login-dark-mode" : "login-light-mode"
      }`}
    >
      {/* Close Button */}
      <button
        type="button"
        className="login-close-btn"
        onClick={() => navigate("/")}
        title="Go to Main Page"
      >
        <X size={23} />
      </button>

      {/* Theme Toggle */}
      <div className="login-theme-toggle">
        <button
          type="button"
          className={!darkMode ? "active" : ""}
          onClick={() => handleThemeChange("light")}
          title="Light Mode"
        >
          <Sun size={18} />
        </button>

        <button
          type="button"
          className={darkMode ? "active" : ""}
          onClick={() => handleThemeChange("dark")}
          title="Dark Mode"
        >
          <Moon size={18} />
        </button>
      </div>

      {/* Login Card */}
      <div className="login-card">

        <div className="login-icon">
          <LogIn size={30} />
        </div>

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to Enterprise Knowledge Assistant
        </p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="login-field">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit-btn"
          >
            <LogIn size={18} />
            Login
          </button>
        </form>

        {/* Register */}
        <p className="register-text">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;
