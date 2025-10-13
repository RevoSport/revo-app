import React from "react";

export default function VoorsteKruisband() {
  const buttons = [
    "Populatie beschrijving",
    "Antropometrie & Mobiliteit",
    "Kracht",
    "Functionele Testing",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "30px",
      }}
    >
      <h1
        style={{
          color: "var(--accent)",
          fontSize: "26px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "10px",
        }}
      >
        Voorste Kruisband
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px",
        }}
      >
        {buttons.map((label) => (
          <button
            key={label}
            style={{
              background: "transparent",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              padding: "8px 22px",
              borderRadius: "8px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
