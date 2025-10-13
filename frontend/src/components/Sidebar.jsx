import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png"; // pad aanpassen indien nodig
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
          background: "#111111",
          borderRight: "1px solid #FF7900",
          padding: "18px 16px",
          transform: collapsed ? "translateX(-110%)" : "translateX(0)",
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        {/* 🔹 Toggle-knop */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <button
            onClick={() => setCollapsed(true)} // altijd sluiten
            style={{
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              transition: "color 0.2s ease",
            }}
            title="Sidebar verbergen"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
        </div>

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
                      onClick={() => onNavigate(item)}
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
                          ? "inset 3px 0 0 var(--accent, #FF7900)"
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
            color: "#FFFFFF",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          <div style={{ opacity: 0.8, marginTop: 12 }}>
            Powered by{" "}
            <span style={{ color: "#FF7900", fontWeight: 700 }}>REVO SPORT</span>
          </div>
        </div>
      </aside>

      {/* 🟢 Zwevende open-knop (zichtbaar bij collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            background: "#FF7900",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 150,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
          title="Sidebar openen"
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>
      )}
    </>
  );
}
