import React from "react";
import { User, Ruler, Dumbbell, ClipboardList } from "lucide-react";

export default function VoorsteKruisband() {
  const cards = [
    {
      title: "POPULATIE BESCHRIJVING",
      icon: <User size={26} color="var(--accent)" />,
      onClick: () => console.log("Populatie Beschrijving"),
    },
    {
      title: "ANTROPOMETRIE & MOBILITEIT",
      icon: <Ruler size={26} color="var(--accent)" />,
      onClick: () => console.log("Antropometrie & Mobiliteit"),
    },
    {
      title: "KRACHT",
      icon: <Dumbbell size={26} color="var(--accent)" />,
      onClick: () => console.log("Kracht"),
    },
    {
      title: "FUNCTIONELE TESTING",
      icon: <ClipboardList size={26} color="var(--accent)" />,
      onClick: () => console.log("Functionele Testing"),
    },
  ];

  return (
    <div
      style={{
        padding: "40px 60px",
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
          marginBottom: "40px",
          letterSpacing: "0.4px",
        }}
      >
        DATA-DRIVEN REHABILITATION INSIGHTS
      </p>

      {/* === 4 CARDS ALTIJD 4x1 === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            style={{
              backgroundColor: "transparent",
              borderRadius: "10px",
              padding: "24px 10px",
              border: "1.8px solid var(--accent)",
              cursor: "pointer",
              transition: "all 0.25s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "0", // voorkomt overflow
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#ffffff";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.querySelector("svg").style.color = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "white";
              e.currentTarget.querySelector("svg").style.color = "var(--accent)";
            }}
          >
            <div style={{ marginBottom: "10px" }}>{card.icon}</div>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "white",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                lineHeight: "1.3",
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
