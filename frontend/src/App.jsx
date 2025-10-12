import React, { useEffect, useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { Menu, X } from "lucide-react"; // ✅ icoontjes
import logo from "./assets/logo.png";
import "./index.css";
import Sidebar from "./components/Sidebar";

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

  const [page, setPage] = useState("Home");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  // Dynamisch aanpassen bij venstergrootte
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // API-check (loading)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/`)
      .then((res) => res.json())
      .then(() => {
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 300);
      })
      .catch(() => {
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 300);
      });
  }, []);

  // Pagina’s
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
          <img
            src={logo}
            alt="Revo Sport Logo"
            style={{
              width: "40%",
              maxWidth: 400,
              marginBottom: 40,
              filter: "drop-shadow(0 0 10px rgba(255,121,0,0.3))",
            }}
          />
          <PuffLoader color="#FF7900" size={90} speedMultiplier={0.8} />
        </div>
      )}

      {/* 🔹 Main Layout */}
      {showMain && (
        <div className="layout fade-in">
          {/* 🔹 Overlay bij openstaand menu (mobiel) */}
          {isMobile && !collapsed && (
            <div
              onClick={() => setCollapsed(true)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 80,
                transition: "opacity 0.3s ease",
              }}
            />
          )}

          {/* 🔹 Minimalistische menu-knop (alleen mobiel) */}
          {isMobile && (
            <div
              style={{
                position: "fixed",
                top: 14,
                left: 16,
                zIndex: 999,
              }}
            >
              <button
                onClick={() => setCollapsed(!collapsed)} // open/sluit
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={collapsed ? "Open menu" : "Sluit menu"}
              >
                {collapsed ? (
                  <Menu
                    size={26}
                    color="white"
                    strokeWidth={2}
                    style={{
                      transition: "color 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FF7900";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                ) : (
                  <X
                    size={26}
                    color="white"
                    strokeWidth={2}
                    style={{
                      transition: "color 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FF7900";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                )}
              </button>
            </div>
          )}

          {/* 🔸 Sidebar component */}
          <Sidebar
            currentPage={page}
            onNavigate={setPage}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            collapsed={collapsed}
          />

          {/* 🔸 Main content */}
          <main className="main">{PageEl}</main>

          {/* 🔹 Desktop layout fix */}
          <style>{`
            @media (min-width: 900px){
              .layout{ grid-template-columns: 280px 1fr; }
              aside{ transform: translateX(0) !important; position: sticky !important; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

export default App;
