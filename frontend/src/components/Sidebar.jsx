import React from "react";
import logo from "../assets/logo.png";

export default function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onToggleCollapse,
  collapsed,
}) {
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
      {/* Overlay voor mobiel */}
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

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: collapsed ? "-280px" : "0",
          height: "100vh",
          width: 280,
          background: "#0e1117",
          borderRight: "1px solid #FF7900",
          padding: "18px 12px",
          transition: "left 0.3s ease",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header met logo + knoppen */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src={logo} alt="Revo" style={{ width: 100, height: "auto", margin: "8px 0" }} />
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={onToggleCollapse}
              style={{
                color: "white",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
              title={collapsed ? "Sidebar openen" : "Sidebar verbergen"}
            >
              {collapsed ? ">>" : "<<"}
            </button>
            <button
              onClick={onClose}
              style={{
                color: "white",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
              title="Sluiten (mobiel)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu-items */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 10 }}>
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
                      textAlign: "left",
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

      {/* Hover-kleur wit → oranje */}
      <style>{`
        .sidebar-btn:hover {
          color: #FF7900 !important;
          background: rgba(255,121,0,0.08);
        }
        @media (min-width: 900px) {
          aside {
            position: sticky !important;
            top: 0;
          }
        }
      `}</style>
    </>
  );
}
