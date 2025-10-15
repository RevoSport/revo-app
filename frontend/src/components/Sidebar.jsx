import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

export default function Sidebar({ currentPage, onNavigate, onLogout, userName }) {
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
      {/* 🟠 SIDEBAR */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: WIDTH,
          background: "var(--panel)",
          borderRight: "2px solid #FF7900",
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
        {/* 🔹 SLUITKNOP */}
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

        {/* === HEADERZONE === */}
        <div
          onClick={() => onNavigate("Home")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "clamp(90px, 15vh, 130px)",
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          <img
            src={logo}
            alt="Revo Sport Logo"
            style={{
              width: "80%",
              height: "auto",
              filter: "drop-shadow(0 0 10px rgba(255,121,0,0.35))",
              transition: "transform 0.3s ease, filter 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.filter =
                "drop-shadow(0 0 14px rgba(255,121,0,0.6))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.filter =
                "drop-shadow(0 0 10px rgba(255,121,0,0.35))";
            }}
          />

          {/* 🧑 Welkomsttekst */}
          <p
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "#FF7900",
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            Welkom, {userName || "Gebruiker"}
          </p>
        </div>

        {/* === MENUZONE === */}
        <nav style={{ flex: 1, overflowY: "auto", marginTop: 10 }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginBottom: 12 }}>
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
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = isActive
                          ? "#FF7900"
                          : "var(--text)")
                      }
                      style={{
                        appearance: "none",
                        border: 0,
                        background: isActive
                          ? "rgba(255,121,0,0.08)"
                          : "transparent",
                        color: isActive ? "#FF7900" : "var(--text)",
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all .25s ease",
                        borderLeft: isActive
                          ? "3px solid #FF7900"
                          : "3px solid transparent",
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

        {/* === LOGOUT & FOOTER === */}
        <div
          style={{
            marginTop: "auto",
            textAlign: "center",
            paddingTop: 10,
          }}
        >
          {/* 🔸 Logout-knop */}
          <button
            onClick={onLogout}
            title="Uitloggen"
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid #FF7900",
              color: "#FF7900",
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 0",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.25s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FF7900";
              e.currentTarget.style.color = "#111111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#FF7900";
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            Uitloggen
          </button>

          {/* Footer */}
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              textAlign: "center",
              fontWeight: 400,
              opacity: 0.8,
            }}
          >
            Powered by{" "}
            <span style={{ color: "#FF7900", fontWeight: 700 }}>REVO SPORT</span>
          </div>
        </div>
      </aside>

      {/* 🟢 OPENKNOP */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Sidebar openen"
          style={{
            position: "fixed",
            top: 18,
            left: 16,
            color: "var(--text)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            zIndex: 200,
            transition: "color 0.2s ease, transform 0.2s ease",
          }}
        >
          <ChevronRight
            size={22}
            strokeWidth={2.2}
            style={{ transition: "transform 0.2s ease" }}
          />
        </button>
      )}
    </>
  );
}
