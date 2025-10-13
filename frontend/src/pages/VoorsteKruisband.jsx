import React from "react";

export default function VoorsteKruisband() {
  return (
    <div
      style={{
        padding: "50px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* === TITEL === */}
      <h1
        style={{
          fontSize: "36px",
          textTransform: "uppercase",
          color: "#ffffff",
          letterSpacing: "2px",
          marginBottom: "30px",
          fontWeight: 700,
        }}
      >
        VOORSTE KRUISBAND
      </h1>

      {/* === BUTTONS === */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
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
              padding: "10px 22px",
              border: "2px solid var(--accent)",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onClick={() => console.log(`Navigeren naar ${label}`)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
