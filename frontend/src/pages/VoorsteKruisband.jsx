import React from "react";

export default function VoorsteKruisband() {
  return (
    <div style={{ padding: "30px" }}>
      {/* === TITEL === */}
      <h1
        style={{
          fontSize: "38px",
          textTransform: "uppercase",
          color: "var(--text)",
          letterSpacing: "2px",
          marginBottom: "6px",
        }}
      >
        VOORSTE KRUISBAND
      </h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Inhoud van Voorste Kruisband
      </p>

      {/* === BUTTONS === */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          marginBottom: "40px",
        }}
      >
        {[
          "POPULATIE BESCHRIJVING",
          "ANTROPOMETRIE & MOBILITEIT",
          "KRACHT",
          "FUNCTIONELE TESTING",
        ].map((label) => (
          <button
            key={label}
            style={{
              flex: 1,
              padding: "14px 0",
              backgroundColor: "var(--accent)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent)")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* === DASHBOARD INHOUD (komt hier later) === */}
      <div style={{ color: "var(--text)", opacity: 0.8 }}>
        {/* Hier zullen de KPI-tegels en grafieken komen */}
      </div>
    </div>
  );
}
