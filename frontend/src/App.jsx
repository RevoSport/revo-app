import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband";

export default function App() {
  // 🧠 1️⃣ Token ophalen uit localStorage bij opstart
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentPage, setCurrentPage] = useState("Home");

  // ✅ Login & Logout handlers
  const handleLogin = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // 🧱 2️⃣ Login-check: toon loginpagina als geen token
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // 🧩 3️⃣ Toon app als ingelogd
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;
      case "Voorste Kruisband":
        return <VoorsteKruisband />;
      default:
        return (
          <div style={{ padding: "20px 30px" }}>
            <h1 style={{ color: "var(--accent)" }}>{currentPage}</h1>
            <p>Inhoud van {currentPage}</p>
          </div>
        );
    }
  };

  return (
    <div>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* 🔸 Logout-knop */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: 15,
          right: 20,
          background: "#FF7900",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 999,
        }}
      >
        Logout
      </button>

      <main
        style={{
          transition: "margin-left 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          marginLeft: "var(--sidebar-offset, 280px)",
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        {renderPage()}
      </main>

      {/* 🔹 CSS variabele om sidebar in/out te schuiven */}
      <style>{`
        body.sidebar-collapsed {
          --sidebar-offset: 0px;
        }
        body:not(.sidebar-collapsed) {
          --sidebar-offset: 280px;
        }
      `}</style>
    </div>
  );
}
