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

  // compacte max-breedte voor mobiel overlay
  const WIDTH = 280;

  return (
    <>
      {/* Overlay (alleen mobiel) */}
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
          left: collapsed ? -WIDTH : 0,
          height: "100vh",
          width: WIDTH,
          background: "#0e1117",
          borderRight: "1px solid #FF7900", // 1px oranje lijn
          padding: "18px 16px",
          transition: "left .3s ease",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        {/* Header: logo + knoppen rechts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <img src={logo} alt="Revo" style={{ height: 28, objectFit: "contain" }} />
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {/* <<  /  >> */}
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "Sidebar openen" : "Sidebar verbergen"}
              style={iconBtn}
            >
              {collapsed ? ">>" : "<<"}
            </button>
            {/* ✕ alleen nuttig op mobiel overlay */}
            <button onClick={onClose} title="Sluiten (mobiel)" style={iconBtn}>
              ✕
            </button>
          </div>
        </div>

        {/* Navigatie */}
        <nav style={{ overflow: "hidden", paddingTop: 4 }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 18 }}>
              <div style={subHeader}>{section.title}</div>

              <div style={{ display: "grid", gap: 8 }}>
                {section.items.map((item) => {
                  const active = currentPage === item;
                  return (
                    <button
                      key={item}
                      className="sidebar-btn"
                      onClick={() => {
                        onNavigate(item);
                        onClose(); // sluit overlay op mobiel
                      }}
                      style={{
                        ...baseItem,
                        ...(active ? activeItem : {}),
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: "auto", fontSize: 12, color: "var(--muted)" }}>
          <div style={{ opacity: 0.8, marginTop: 10 }}>
            Powered by <span style={{ color: "var(--accent)", fontWeight: 700 }}>REVO SPORT</span>
          </div>
        </div>
      </aside>

      {/* Hover kleur en desktop sticky */}
      <style>{`
        .sidebar-btn:hover {
          color: #FF7900 !important;
          background: rgba(255,121,0,0.08);
        }
        @media (min-width: 900px) {
          aside { position: sticky !important; left: 0 !important; top: 0; }
        }
      `}</style>
    </>
  );
}

/* ====== Styles ====== */
const iconBtn = {
  color: "white",
  background: "none",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
  lineHeight: 1,
};

const subHeader = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".08em",
  color: "#FF7900",
  textTransform: "uppercase",
  margin: "14px 2px 8px",
};

const baseItem = {
  appearance: "none",
  border: 0,
  background: "transparent",
  color: "white",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  transition: "color .2s ease, background .2s ease",
};

const activeItem = {
  color: "#727170",
  fontWeight: 700,
  background: "rgba(255,255,255,0.06)",      // donkere pill
  boxShadow: "inset 3px 0 0 var(--accent)",   // oranje “linker-lijntje”
};
