import React, { useState } from "react";
import logo from "./assets/logo.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ currentPage, onNavigate }) {
  // ✅ 1. State toegevoegd voor collapsen
  const [collapsed, setCollapsed] = useState(false);

  const WIDTH = 280;

  const sections = [
    { title: "Revalidatie", items: ["Voorste Kruisband"] },
    { title: "Performance", items: ["Performance"] },
    { title: "Monitoring", items: ["KFV Hedes", "KC Floriant"] },
    { title: "Blessurepreventie", items: ["Screening", "Loopanalyse"] },
    { title: "Oefenschema’s", items: ["Oefenschema’s"] },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: collapsed ? 70 : WIDTH, // ✅ 2. breedte verkleint bij collapse
        background: "#0E1117",
        borderRight: "1px solid #FF7900",
        padding: "18px 12px",
        transition: "width 0.35s ease",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 🔹 Toggle-knop */}
      <div
        style={{
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)} // ✅ 3. Toggle direct in component
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

      {/* 🔸 Logo */}
      {!collapsed && (
        <div
          onClick={() => onNavigate("Home")}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          <img
            src={logo}
            alt="Revo Sport Logo"
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
      )}

      {/* 🔸 Menu-items */}
      <nav style={{ overflowY: "auto", flex: 1 }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 10 }}>
            {!collapsed && (
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
            )}

            <div style={{ display: "grid", gap: 8 }}>
              {section.items.map((item) => {
                const isActive = currentPage === item;
                return (
                  <button
                    key={item}
                    onClick={() => onNavigate(item)}
                    style={{
                      appearance: "none",
                      border: 0,
                      background: "transparent",
                      color: isActive ? "#727170" : "white",
                      textAlign: "left",
                      padding: "12px 10px",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      transition: "color .2s ease, background .2s ease",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                      boxShadow: isActive
                        ? "inset 3px 0 0 var(--accent, #FF7900)"
                        : "inset 3px 0 0 transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                  >
                    {!collapsed && item}
                    {collapsed && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: isActive ? "#FF7900" : "white",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 🔹 Footer */}
      {!collapsed && (
        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "#888",
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
      )}

      <style>
        {`
          button:hover svg {
            color: #FF7900;
            stroke: #FF7900;
          }
        `}
      </style>
    </aside>
  );
}
