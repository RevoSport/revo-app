import React from "react";
import { User, Ruler, Dumbbell, ClipboardList } from "lucide-react";

export default function VoorsteKruisband() {
  const cards = [
    {
      title: "POPULATIE BESCHRIJVING",
      icon: <User size={36} color="var(--accent)" />,
      onClick: () => console.log("Populatie Beschrijving"),
    },
    {
      title: "ANTROPOMETRIE & MOBILITEIT",
      icon: <Ruler size={36} color="var(--accent)" />,
      onClick: () => console.log("Antropometrie & Mobiliteit"),
    },
    {
      title: "KRACHT",
      icon: <Dumbbell size={36} color="var(--accent)" />,
      onClick: () => console.log("Kracht"),
    },
    {
      title: "FUNCTIONELE TESTING",
      icon: <ClipboardList size={36} color="var(--accent)" />,
      onClick: () => console.log("Functionele Testing"),
    },
  ];

  return (
    <div
      style={{
        padding: "60px 80px",
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
          fontSize: "40px",
          textTransform: "uppercase",
          color: "#ffffff",
          letterSpacing: "2px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        VOORSTE KRUISBAND
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "18px",
          marginBottom: "50px",
          letterSpacing: "0.5px",
        }}
      >
        DATA-DRIVEN REHABILITATION INSIGHTS
      </p>

      {/* === KAARTEN === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "24px",
          width: "100%",
          maxWidth: "950px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "40px 20px",
              border: "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            <div style={{ marginBottom: "20px" }}>{card.icon}</div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {card.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
