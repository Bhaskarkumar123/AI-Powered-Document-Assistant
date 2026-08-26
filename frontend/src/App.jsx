import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatAssistant from "./pages/ChatAssistant";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* User Dashboard / Chat Assistant */}
        <Route
          path="/"
          element={<ChatAssistant />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;