import React, { useState, useEffect } from "react";
import { User, Ruler, Dumbbell, ClipboardList } from "lucide-react";
import { apiGet } from "../api"; // ✅ JWT-beveiligde helper
import Populatie from "./Populatie";

export default function VoorsteKruisband({ defaultTab = "Populatie" }) {
  // 🔹 Tabs & data state
  const [activeSection, setActiveSection] = useState(defaultTab.toLowerCase());
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧠 Ophalen van data bij Populatie
  useEffect(() => {
    if (activeSection === "populatie") {
      setLoading(true);
      setError("");
      apiGet("/patients/")
        .then((data) => setPatients(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [activeSection]);

  // 🔸 Kaartdefinitie
  const cards = [
    { title: "POPULATIE", key: "populatie", icon: <User size={24} color="var(--accent)" /> },
    { title: "METRICS", key: "metrics", icon: <Ruler size={24} color="var(--accent)" /> },
    { title: "KRACHT", key: "kracht", icon: <Dumbbell size={24} color="var(--accent)" /> },
    { title: "FUNCTIONELE TESTING", key: "functioneel", icon: <ClipboardList size={24} color="var(--accent)" /> },
  ];

  // === UI ===
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
          fontSize: "22px",
          textTransform: "uppercase",
          color: "#ffffff",
          letterSpacing: "1.5px",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        VOORSTE KRUISBAND
      </h1>

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

      {/* === NAVIGATIECARDS === */}
      <div style={{ width: "100%", maxWidth: "950px" }}>
        <div style={{ height: "1px", backgroundColor: "#FF7900", marginBottom: "20px" }}></div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          {cards.map((card) => {
            const isActive = activeSection === card.key;
            return (
              <div
                key={card.key}
                onClick={() => setActiveSection(card.key)}
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
              >
                <div style={{ marginBottom: "6px" }}>{card.icon}</div>
                <h3
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: isActive ? "#727170" : "white",
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

        <div style={{ height: "0.8px", backgroundColor: "#FF7900", marginBottom: "30px" }}></div>
      </div>

      {/* === CONTENT === */}
      {activeSection === "populatie" && (
        <div style={{ width: "100%" }}>
          {loading ? (
            <p style={{ color: "#FF7900" }}>Gegevens laden...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : patients.length === 0 ? (
            <p style={{ color: "#888" }}>Nog geen patiënten gevonden.</p>
          ) : (
            <Populatie data={patients} />
          )}
        </div>
      )}

      {activeSection === "metrics" && (
        <p style={{ color: "var(--muted)" }}>Metrics-module in ontwikkeling…</p>
      )}

      {activeSection === "kracht" && (
        <p style={{ color: "var(--muted)" }}>Kracht-module in ontwikkeling…</p>
      )}

      {activeSection === "functioneel" && (
        <p style={{ color: "var(--muted)" }}>Functionele testing in ontwikkeling…</p>
      )}
    </div>
  );
}
