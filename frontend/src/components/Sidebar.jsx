import React from "react";
import logo from "../assets/logo.png";

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const sections = [
    { title: "Home", items: ["Home"] },
    { title: "Revalidatie", items: ["Voorste Kruisband"] },
    { title: "Performance", items: ["Performance"] },
    { title: "Monitoring", items: ["KFV Hedes", "KC Floriant"] },
    { title: "Blessurepreventie", items: ["Screening", "Loopanalyse"] },
    { title: "Oefenschema’s", items: ["Oefenschema’s"] },
  ];

  return (
    <>
      {/* 🔸 Overlay voor mobiel */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity .2s ease",
          zIndex: 40,
        }}
      />

      {/* 🔹 Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 280,
          background: "#0e1117",
          borderRight: "1px solid var(--border)",
          padding: "18px 12px",
          transform: `translateX(${isOpen ? "0" : "-100%"})`,
          transition: "transform .25s ease",
          zIndex: 50,
          overflow: "hidden", // nooit scrolbaar
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", margin: "10px 0 22px" }}>
          <img src={logo} alt="Revo" style={{ width: 130 }} />
        </div>

        {/* Navigatie */}
        <div style={{ flex: 1 }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 6 }}>
              <div className="subheader">{section.title}</div>
              {section.items.map((item) => {
                const isActive = currentPage === item;
                return (
                  <button
                    key={item}
                    className="btn sidebar-btn"
                    onClick={() => {
                      onNavigate(item);
                      onClose();
                    }}
                    style={{
                      padding: "8px 10px",
                      fontSize: "15px",
                      margin: "2px 0",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#727170" : "white",
                      background: isActive
                        ? "rgba(255,255,255,0.04)"
                        : "transparent",
                      borderLeft: isActive
                        ? "3px solid var(--accent)"
                        : "3px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          <div style={{ opacity: 0.8, marginTop: 12 }}>
            Powered by{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              REVO SPORT
            </span>
          </div>
        </div>
      </aside>

      {/* Hover effect: wit → oranje */}
      <style>{`
        .sidebar-btn:hover {
          color: #FF7900 !important;
          background: rgba(255,121,0,0.08);
        }

        @media (min-width: 900px) {
          aside {
            transform: translateX(0) !important;
            position: sticky !important;
          }
        }
      `}</style>
    </>
  );
}
