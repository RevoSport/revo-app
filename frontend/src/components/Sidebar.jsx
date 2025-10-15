import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Menu, X, ChevronLeft, LogOut } from "lucide-react";

export default function Sidebar({ currentPage, onNavigate, onLogout, userName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const WIDTH = 280;

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

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const handleClose = () => {
    if (isMobile) {
      setAnimateOut(true);
      setTimeout(() => {
        setCollapsed(true);
        setAnimateOut(false);
      }, 350);
    } else {
      setCollapsed(true);
    }
  };

  const sections = [
    { title: "Revalidatie", items: ["Voorste Kruisband"] },
    { title: "Performance", items: ["Performance"] },
    { title: "Monitoring", items: ["KFV Hedes", "KC Floriant"] },
    { title: "Blessurepreventie", items: ["Screening", "Loopanalyse"] },
    { title: "Oefenschema’s", items: ["Oefenschema’s"] },
  ];

  return (
    <>
      {!collapsed && isMobile && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 90,
            backdropFilter: "blur(2px)",
            animation: "fadeInOverlay 0.4s ease forwards",
          }}
        ></div>
      )}

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
          transform: collapsed
            ? "translateX(-110%)"
            : animateOut
            ? "translateX(-110%)"
            : "translateX(0)",
          transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          color: "var(--text)",
          animation:
            !collapsed && !animateOut && isMobile
              ? "slideIn 0.45s ease-out"
              : animateOut
              ? "slideOut 0.35s ease-in"
              : "none",
          boxShadow:
            !collapsed && !animateOut
              ? "4px 0 15px rgba(0, 0, 0, 0.15)"
              : "none",
        }}
      >
        {/* 🔹 SLUITKNOP — X bij mobiel / Chevron bij desktop */}
        {isMobile ? (
          <button
            onClick={handleClose}
            title="Sluiten"
            style={{
              position: "absolute",
              top: 18,
              right: 12,
              color: "var(--text)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              zIndex: 150,
              transition: "color 0.25s ease-in-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF7900")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(true)}
            title="Sidebar verbergen"
            style={{
              position: "absolute",
              top: 18,
              right: 8,
              color: "var(--text)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              zIndex: 150,
              transition: "color 0.25s ease-in-out, transform 0.25s ease-in-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF7900")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
        )}

        {/* === HEADER === */}
        <div
          onClick={() => onNavigate("Home")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "clamp(90px, 15vh, 130px)",
            marginBottom: 4,
            cursor: "pointer",
          }}
        >
          <img
            src={logo}
            alt="AI.THLETE Logo"
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

          {/* 🧑 Welkomsttekst (uppercase) */}
          <p
            style={{
              marginTop: 0,
              fontSize: 12,
              color: "#FF7900",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Welkom, {userName ? userName.toUpperCase() : "GEBRUIKER"}
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
                          ? "#727170"
                          : "var(--text)")
                      }
                      style={{
                        appearance: "none",
                        border: 0,
                        background: "transparent",
                        color: isActive ? "#727170" : "var(--text)",
                        textAlign: "left",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "color .25s ease",
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

      {/* 🍔 HAMBURGER-KNOP (openen) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Menu openen"
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
            transition: "color 0.25s ease-in-out, transform 0.25s ease-in-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF7900")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>
      )}

      {/* ✨ Animaties */}
      <style>{`
        @keyframes slideIn {
          0% { transform: translateX(-110%); opacity: 0.6; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-110%); opacity: 0; }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
