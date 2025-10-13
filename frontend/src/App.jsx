import React, { useState } from "react";
import Sidebar from "./Sidebar";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  return (
    <div>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main
        style={{
          transition: "margin-left 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          marginLeft: "var(--sidebar-offset, 280px)",
          background: "#111",
          color: "white",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <h1>{currentPage}</h1>
        <p>Inhoud van {currentPage}</p>
      </main>

      <style>{`
        /* Sidebar open = 280px ruimte links */
        body:not(.sidebar-collapsed) {
          --sidebar-offset: 280px;
        }

        /* Sidebar dicht = geen marge links */
        body.sidebar-collapsed {
          --sidebar-offset: 0px;
        }
      `}</style>
    </div>
  );
}
