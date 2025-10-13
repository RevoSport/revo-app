import React from "react";
import { User, Ruler, Dumbbell, ClipboardList } from "lucide-react";

export default function VoorsteKruisband() {
  const cards = [
    {
      title: "POPULATIE",
      icon: <User size={24} color="var(--accent)" />,
      onClick: () => console.log("Populatie Beschrijving"),
    },
    {
      title: "METRICS",
      icon: <Ruler size={24} color="var(--accent)" />,
      onClick: () => console.log("Antropometrie & Mobiliteit"),
    },
    {
      title: "KRACHT",
      icon: <Dumbbell size={24} color="var(--accent)" />,
      onClick: () => console.log("Kracht"),
    },
    {
      title: "FUNCTIONELE TESTING",
      icon: <ClipboardList size={24} color="var(--accent)" />,
      onClick: () => console.log("Functionele Testing"),
    },
  ];

  return (
    <div
      style={{
        padding: "40px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100vh",
      }}
    >
      {/* === TITEL === */}
      <h1
        style={{
          fontSize: "16px",
          textTransform: "uppercase",
          color: "#ffffff",
          letterSpacing: "1.5px",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        VOORSTE KRUISBAND
      </h1>

      {/* === SUBTITEL === */}
      <p
        style={{
          color: "var(--muted)",
          fontSize: "14px",
          marginBottom: "35px",
          letterSpacing: "0.4px",
        }}
      >
        DATA-DRIVEN REHABILITATION INSIGHTS
      </p>

      {/* === 4 COMPACTE CARDS === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          width: "100%",
          maxWidth: "950px",
          marginBottom: "30px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "10px",
              padding: "16px 8px", // 🔹 kleiner
              border: "1.5px solid transparent",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ marginBottom: "6px" }}>{card.icon}</div>
            <h3
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "white",
                letterSpacing: "0.7px",
                textTransform: "uppercase",
                lineHeight: "1.2",
              }}
            >
              {card.title}
            </h3>
          </div>
        ))}
      </div>

      {/* === ORANJE LIJN === */}
      <div
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: "#FF7900",
          opacity: 1,
        }}
      ></div>
    </div>
  );
}
