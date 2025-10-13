import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband"; // 🔹 voeg dit toe

export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  // 🔹 eenvoudige router-switch
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;
      case "Voorste Kruisband":
        return <VoorsteKruisband />; // ✅ koppeling aan menu
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
