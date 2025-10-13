import React, { useState } from "react";
import { User, Ruler, Dumbbell, ClipboardList } from "lucide-react";

export default function VoorsteKruisband() {
  const [activeCard, setActiveCard] = useState(null);

  const cards = [
    { title: "POPULATIE", icon: <User size={24} color="var(--accent)" /> },
    { title: "METRICS", icon: <Ruler size={24} color="var(--accent)" /> },
    { title: "KRACHT", icon: <Dumbbell size={24} color="var(--accent)" /> },
    {
      title: "FUNCTIONELE TESTING",
      icon: <ClipboardList size={24} color="var(--accent)" />,
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
          fontSize: "28px",
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

      {/* === CONTAINER VOOR CARDS + LIJNEN === */}
      <div style={{ width: "100%", maxWidth: "950px" }}>
        {/* BOVENSTE LIJN */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#FF7900",
            marginBottom: "20px",
          }}
        ></div>

        {/* === 4 CARDS === */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          {cards.map((card, index) => {
            const isActive = activeCard === index;
            return (
              <div
                key={card.title}
                onClick={() => setActiveCard(index)}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: "10px",
                  border: isActive
                    ? "1.5px solid var(--accent)"
                    : "1.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100px",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseOut={(e) => {
                  if (!isActive)
                    e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div style={{ marginBottom: "6px" }}>{card.icon}</div>
                <h3
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: isActive ? "#727170" : "white", // 👈 actieve kleur
                    letterSpacing: "0.7px",
                    textTransform: "uppercase",
                    lineHeight: "1.2",
                  }}
                >
                  {card.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* ONDERSTE LIJN */}
        <div
          style={{
            width: "100%",
            height: "0.8px",
            backgroundColor: "#FF7900",
          }}
        ></div>
      </div>
    </div>
  );
}
