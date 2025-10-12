import React from "react";
import logo from "../assets/logo2.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onToggleCollapse,
  collapsed,
}) {
  const WIDTH = 280;

  const sections = [
    { title: "Revalidatie", items: ["Voorste Kruisband"] },
    { title: "Performance", items: ["Performance"] },
    { title: "Monitoring", items: ["KFV Hedes", "KC Floriant"] },
    { title: "Blessurepreventie", items: ["Screening", "Loopanalyse"] },
    { title: "Oefenschema’s", items: ["Oefenschema’s"] },
  ];

  return (
    <>
      {/* 🟠 Overlay (alleen mobiel) */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          opacity: isOpen && !collapsed ? 1 : 0,
          pointerEvents: isOpen && !collapsed ? "auto" : "none",
          transition: "opacity 0.25s ease",
          zIndex: 40,
        }}
      />

      {/* 🧱 Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: WIDTH,
          background: "#0e1117",
          borderRight: "1px solid #FF7900",
          padding: "18px 16px",
          transform: collapsed ? "translateX(-102%)" : "translateX(0)",
          transition: "transform 0.35s cubic-bezier(0.55, 0.055, 0.675, 0.19)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        {/* 🔹 Toggle-knop */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={onToggleCollapse}
            style={{
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              transition: "color 0.2s ease",
            }}
            title={collapsed ? "Sidebar openen" : "Sidebar verbergen"}
          >
            {collapsed ? (
              <ChevronRight size={22} strokeWidth={2.2} />
            ) : (
              <ChevronLeft size={22} strokeWidth={2.2} />
            )}
          </button>
        </div>

        {/* 🧡 Logo */}
        <div
          onClick={() => {
            onNavigate("Home");
            onClose();
          }}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          <img
            src={logo}
            alt="TRACKR by Revo Sport"
            style={{
              width: "80%",
              height: "auto",
              filter: "drop-shadow(0 0 10px rgba(255,121,0,0.3))",
              transition: "transform 0.2s ease, filter 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter =
                "drop-shadow(0 0 15px rgba(255,121,0,0.5))")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter =
                "drop-shadow(0 0 10px rgba(255,121,0,0.3))")
            }
          />
        </div>

        {/* 🔸 Menu items */}
        <nav style={{ overflow: "hidden", flex: 1 }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".08em",
                  color: "#FF7900",
                  textTransform: "uppercase",
                  margin: "14px 2px 8px",
                }}
              >
                {section.title}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {section.items.map((item) => {
                  const isActive = currentPage === item;
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        onNavigate(item);
                        onClose();
                      }}
                      style={{
                        appearance: "none",
                        border: 0,
                        background: "transparent",
                        color: isActive ? "#727170" : "white",
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        transition: "color .2s ease, background .2s ease",
                        background: isActive
                          ? "rgba(255,255,255,0.06)"
                          : "transparent",
                        boxShadow: isActive
                          ? "inset 3px 0 0 #FF7900"
                          : "inset 3px 0 0 transparent",
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
        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          <div style={{ opacity: 0.8, marginTop: 12 }}>
            Powered by{" "}
            <span style={{ color: "#FF7900", fontWeight: 700 }}>
              REVO SPORT
            </span>
          </div>
        </div>
      </aside>

      {/* 🟣 Hoverkleur icoon */}
      <style>{`
        button:hover svg {
          color: #FF7900;
          stroke: #FF7900;
        }
        .sidebar-btn:hover {
          color: #FF7900 !important;
          background: rgba(255,121,0,0.08);
        }
      `}</style>
    </>
  );
}
