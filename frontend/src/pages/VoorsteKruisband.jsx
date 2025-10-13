import React from "react";
import { User, Ruler, Dumbbell, ClipboardList } from "lucide-react";

export default function VoorsteKruisband() {
  const cards = [
    {
      title: "POPULATIE BESCHRIJVING",
      icon: <User size={30} color="var(--accent)" />,
      onClick: () => console.log("Populatie Beschrijving"),
    },
    {
      title: "ANTROPOMETRIE & MOBILITEIT",
      icon: <Ruler size={30} color="var(--accent)" />,
      onClick: () => console.log("Antropometrie & Mobiliteit"),
    },
    {
      title: "KRACHT",
      icon: <Dumbbell size={30} color="var(--accent)" />,
      onClick: () => console.log("Kracht"),
    },
    {
      title: "FUNCTIONELE TESTING",
      icon: <ClipboardList size={30} color="var(--accent)" />,
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

      {/* === 4 CARDS === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "28px",
          width: "100%",
          maxWidth: "1100px",
          marginBottom: "35px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "12px",
              padding: "22px 10px",
              border: "1.8px solid transparent",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 0 10px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ marginBottom: "8px" }}>{card.icon}</div>
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

      {/* === ORANJE LIJN ONDER DE CARDS === */}
      <div
        style={{
          width: "100%",
          height: "1px", // even dik als menu-lijn
          backgroundColor: "var(--accent)",
          opacity: 0.7,
        }}
      ></div>
    </div>
  );
}
