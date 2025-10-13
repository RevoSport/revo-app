import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home"; // 🔹 jouw echte Home-pagina importeren

export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  // 🔹 eenvoudige router-switch (later uitbreidbaar)
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;
      default:
        return (
          <div>
            <h1>{currentPage}</h1>
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
          color: "white",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        {renderPage()}
      </main>

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
