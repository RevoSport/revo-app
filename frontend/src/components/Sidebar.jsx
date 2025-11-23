// =====================================================
// FILE: src/components/Sidebar.jsx
// Revo Sport — Sidebar (Revo v2 UI + mobile optimised)
// =====================================================

import React, { useState, useEffect } from "react";
import { Menu, X, ChevronLeft, LogOut } from "lucide-react";
import logo from "../assets/logo.png";

export default function Sidebar({ currentPage, onNavigate, onLogout, userName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const WIDTH = 280;

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Collapsed state class op body
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  // Menu-structuur — identiek aan je project
  const sections = [
    { title: "Revalidatie", items: ["Voorste Kruisband"] },
    { title: "Performance", items: ["Performance"] },
    { title: "Monitoring", items: ["KFV Hedes", "KC Floriant"] },
    { title: "Blessurepreventie", items: ["Screening", "Loopanalyse"] },
    {
      title: "Oefenschema",
      items: ["Overzicht","Templates" ,"Schema maken"],
      map: {
        "Schema maken": "Oefenschema",
        Templates: "TemplatesOverzicht",
        Overzicht: "SchemaOverzicht",
      },
    },
  ];

  // Navigate helper
  const handleNavigate = (item, map) => {
    const internal = map?.[item] || item;
    onNavigate(internal);
    if (isMobile) setCollapsed(true);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {!collapsed && isMobile && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 90,
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: WIDTH,
          background: "#111",
          borderRight: "2px solid #FF7900",
          transform: collapsed ? "translateX(-110%)" : "translateX(0)",
          transition: "transform .35s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          padding: "18px 16px",
          color: "#fff",
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setCollapsed(true)}
          style={{
            position: "absolute",
            top: 18,
            right: 12,
            background: "none",
            border: "none",
            color: "#ccc",
            cursor: "pointer",
          }}
        >
          {isMobile ? <X size={22} /> : <ChevronLeft size={22} />}
        </button>

        {/* HEADER */}
        <div
          onClick={() => handleNavigate("Home")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 25,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <img
            src={logo}
            alt="AI.THLETE"
            style={{
              width: "75%",
              filter: "drop-shadow(0 0 12px rgba(255,121,0,0.35))",
              transition: "all 0.25s ease",
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

          <p
            style={{
              margin: 0,
              marginTop: 6,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              color: "#FF7900",
              textTransform: "uppercase",
            }}
          >
            WELKOM, {userName?.toUpperCase() || "GEBRUIKER"}
          </p>
        </div>

        {/* MENU */}
        <nav style={{ flex: 1, overflowY: "auto" }}>
          {sections.map((sec) => (
            <div key={sec.title} style={{ marginBottom: 16 }}>
              <div
                style={{
                  color: "#FF7900",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  marginBottom: 6,
                  marginLeft: 2,
                  textTransform: "uppercase",
                }}
              >
                {sec.title}
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                {sec.items.map((item) => {
                  const mapped = sec.map?.[item] || item;
                  const isActive = currentPage === mapped;

                  return (
                    <button
                      key={item}
                      onClick={() => handleNavigate(item, sec.map)}
                      style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "transparent",       // ← geen highlight
                      border: "1px solid transparent",
                      color: isActive ? "#FF7900" : "#ddd",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
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

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid #FF7900",
            color: "#FF7900",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "all .25s ease",
            alignSelf: "center",
          }}
        >
          <LogOut size={16} />
          Uitloggen
        </button>
      </aside>

      {/* MOBILE HAMBURGER */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: "fixed",
            top: 18,
            left: 16,
            background: "transparent",
            border: "none",
            color: "#ddd",
            zIndex: 200,
            cursor: "pointer",
          }}
        >
          <Menu size={26} />
        </button>
      )}
    </>
  );
}
