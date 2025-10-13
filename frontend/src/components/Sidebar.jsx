import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ currentPage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const WIDTH = 280;

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const sections = [
    { title: "Revalidatie", items: ["Voorste Kruisband"] },
    { title: "Performance", items: ["Performance"] },
    { title: "Monitoring", items: ["KFV Hedes", "KC Floriant"] },
    { title: "Blessurepreventie", items: ["Screening", "Loopanalyse"] },
    { title: "Oefenschema’s", items: ["Oefenschema’s"] },
  ];

  return (
    <>
      {/* 🟠 Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: WIDTH,
          background: "var(--panel)",
          borderRight: "1px solid var(--accent)",
          padding: "18px 16px",
          transform: collapsed ? "translateX(-110%)" : "translateX(0)",
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          color: "var(--text)",
        }}
      >
        {/* 🔹 Toggle-knop (sluiten) */}
        <button
          onClick={() => setCollapsed(true)}
          title="Sidebar verbergen"
          style={{
            position: "absolute",
            top: 18,
            right: 16,
            color: "var(--text)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            transition: "color 0.2s ease",
            zIndex: 150,
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>

        {/* 🔸 Logo */}
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
          />
        </div>

        {/* 🔸 Menu-items */}
        <nav style={{ overflowY: "auto", flex: 1 }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  color: "var(--accent)",
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
                      onClick={() => onNavigate(item)}
                      style={{
                        appearance: "none",
                        border: 0,
                        background: "transparent",
                        color: isActive ? "var(--muted)" : "var(--text)",
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        transition: "color .2s ease, background .2s ease",
                        background: isActive
                          ? "rgba(255,255,255,0.06)"
                          : "transparent",
                        boxShadow: isActive
                          ? "inset 3px 0 0 var(--accent)"
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

        {/* 🔹 Footer */}
        <div
          style={{
            marginTop: "auto",
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "center",
            paddingTop: 10,
            fontWeight: 400,
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

      {/* 🟢 Chevron-knop (openen) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Sidebar openen"
          style={{
            position: "fixed",
            top: 18,
            right: 16,
            color: "var(--text)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            zIndex: 200,
            transition: "color 0.2s ease",
          }}
        >
          <ChevronRight size={22} strokeWidth={2.2} />
        </button>
      )}
    </>
  );
}
