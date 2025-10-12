import React, { useEffect, useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import logo from "./assets/logo.png";
import "./index.css";
import Sidebar from "./components/Sidebar";

// 🧩 Pagina’s importeren
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband";
import Performance from "./pages/Performance";
import KFVHedes from "./pages/KFVHedes";
import KCFloriant from "./pages/KCFloriant";
import Screening from "./pages/Screening";
import Loopanalyse from "./pages/Loopanalyse";
import Oefenschemas from "./pages/Oefenschemas";

function App() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showMain, setShowMain] = useState(false);

  // 🔹 Sidebar navigatie
  const [page, setPage] = useState("Home");
  const [open, setOpen] = useState(false);

  // 🔸 API-check (jouw bestaande useEffect)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(JSON.stringify(data, null, 2));
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 300);
      })
      .catch((err) => {
        setStatus("❌ Fout: " + err.message);
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 300);
      });
  }, []);

  // 🔹 Bepaalt welke pagina wordt weergegeven
  const PageEl = useMemo(() => {
    switch (page) {
      case "Voorste Kruisband": return <VoorsteKruisband />;
      case "Performance": return <Performance />;
      case "KFV Hedes": return <KFVHedes />;
      case "KC Floriant": return <KCFloriant />;
      case "Screening": return <Screening />;
      case "Loopanalyse": return <Loopanalyse />;
      case "Oefenschema’s": return <Oefenschemas />;
      default: return <Home />;
    }
  }, [page]);

  return (
    <>
      {/* 🔸 Loading Screen */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#0E1117",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.3s ease-out",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: "translateY(-10%)", // optisch midden van pagina
            }}
          >
            <img
              src={logo}
              alt="Revo Sport Logo"
              style={{
                width: "40%",
                maxWidth: 400,
                height: "auto",
                marginBottom: 40,
                filter: "drop-shadow(0 0 10px rgba(255,121,0,0.3))",
              }}
            />
            <PuffLoader color="#FF7900" size={90} speedMultiplier={0.8} />
          </div>
        </div>
      )}

      {/* 🔹 Streamlit-style Main Layout */}
      {showMain && (
        <div className="layout fade-in">
          {/* 🔹 Topbar (mobiel) */}
          <div className="topbar">
            <button className="btn hamburger" onClick={() => setOpen(true)}>☰</button>
            <h1>Revo DataLab</h1>
          </div>

          {/* 🔸 Sidebar component */}
          <Sidebar
            currentPage={page}
            onNavigate={setPage}
            isOpen={open}
            onClose={() => setOpen(false)}
          />

          {/* 🔸 Main content */}
          <main className="main">
            {PageEl}
          </main>

          {/* 🔹 Sticky sidebar styling desktop */}
          <style>{`
            @media (min-width: 900px){
              .topbar{ display: none; }
              .layout{ grid-template-columns: 280px 1fr; }
              aside{ transform: translateX(0) !important; position: sticky !important; }
            }
          `}</style>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}

export default App;
