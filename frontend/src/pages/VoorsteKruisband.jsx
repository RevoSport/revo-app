// =====================================================
// FILE: src/pages/VoorsteKruisband.jsx
// =====================================================

import React, { useState, useEffect } from "react";
import {
  BicepsFlexed,
  UsersRound,
  RulerDimensionLine,
  User,
  Users,
  UserPlus,
  Ruler,
  Dumbbell,
  ClipboardList,
  Activity,
  Gauge,
  NotepadText,
  UserRoundPlus,
} from "lucide-react";
import { apiGet } from "../api";
import Populatie from "./Populatie";
import Metrics from "./Metrics";
import Kracht from "./Kracht";
import Functioneel from "./Functioneel";
import { PuffLoader } from "react-spinners";

export default function VoorsteKruisband() {
  const [activeMode, setActiveMode] = useState("group");
  const [activeSection, setActiveSection] = useState("populatie");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [patients, setPatients] = useState([]);
  const [populatieSummary, setPopulatieSummary] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [krachtData, setKrachtData] = useState(null);
  const [functioneelData, setFunctioneelData] = useState(null);

  // 🧠 Data ophalen per sectie
  useEffect(() => {
    setError("");
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSection === "populatie") {
          const [p, s] = await Promise.all([apiGet("/patients/"), apiGet("/populatie/summary")]);
          setPatients(p);
          setPopulatieSummary(s);
        } else if (activeSection === "metrics") {
          const data = await apiGet("/metrics/summary");
          setMetricsData(data);
        } else if (activeSection === "kracht") {
          const data = await apiGet("/kracht/group");
          setKrachtData(JSON.parse(JSON.stringify(data)));
        } else if (activeSection === "functioneel") {
          const data = await apiGet("/functioneel/group");
          setFunctioneelData(JSON.parse(JSON.stringify(data)));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeSection]);

  // 🔁 Automatische secties bij moduswissel
  useEffect(() => {
    if (activeMode === "group") setActiveSection("populatie");
    if (activeMode === "individual") setActiveSection("dashboard"); // ✅ Nieuw
    if (activeMode === "add") setActiveSection("add_patient"); // ✅ Nieuw
  }, [activeMode]);

  // 🔹 Bovenste rij — 3 knoppen
  const topCards = [
    { key: "group", icon: <Users size={26} color="var(--accent)" /> },
    { key: "individual", icon: <User size={26} color="var(--accent)" /> },
    { key: "add", icon: <UserPlus size={26} color="var(--accent)" /> },
  ];

  // 🔹 Groepsweergave
  const groupCards = [
    { title: "POPULATIE", key: "populatie", icon: <UsersRound size={24} color="var(--accent)" /> },
    { title: "METRICS", key: "metrics", icon: <Ruler size={24} color="var(--accent)" /> },
    { title: "KRACHT", key: "kracht", icon: <Dumbbell size={24} color="var(--accent)" /> },
    { title: "FUNCTIONELE TESTING", key: "functioneel", icon: <Activity size={24} color="var(--accent)" /> },
  ];

  // 🔹 Individueel
  const individualCards = [
    { title: "DASHBOARD", key: "dashboard", icon: <Gauge size={24} color="var(--accent)" /> },
    { title: "METRICS", key: "metrics", icon: <RulerDimensionLine size={24} color="var(--accent)" /> },
    { title: "KRACHT", key: "kracht", icon: <BicepsFlexed size={24} color="var(--accent)" /> },
    { title: "FUNCTIONELE TESTING", key: "functioneel", icon: <ClipboardList size={24} color="var(--accent)" /> },
  ];

  // 🔹 Toevoegen-sectie
  const addCards = [
    { title: "PATIËNT TOEVOEGEN", key: "add_patient", icon: <UserRoundPlus size={24} color="var(--accent)" /> },
    { title: "BASELINE", key: "baseline", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "WEEK 6", key: "week6", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "MAAND 3", key: "maand3", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "MAAND 4.5", key: "maand45", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "MAAND 6", key: "maand6", icon: <NotepadText size={24} color="var(--accent)" /> },
  ];

  const currentCards =
    activeMode === "group"
      ? groupCards
      : activeMode === "individual"
      ? individualCards
      : addCards;

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
      <h1
        style={{
          fontSize: "22px",
          textTransform: "uppercase",
          color: "#fff",
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

      {/* === BOVENSTE KNOPPEN === */}
      <div style={{ width: "100%", maxWidth: "950px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "16px",
          }}
        >
          {topCards.map((card) => {
            const isActive = activeMode === card.key;
            return (
              <div
                key={card.key}
                onClick={() => setActiveMode(card.key)}
                style={{
                  width: "200px",
                  backgroundColor: "#1a1a1a",
                  borderRadius: "10px",
                  border: isActive ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "56px",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                }}
              >
                {card.icon}
              </div>
            );
          })}
        </div>

        {/* === Oranje lijn === */}
        <div style={{ height: "1px", backgroundColor: "#FF7900", marginBottom: "20px" }}></div>

        {/* === DYNAMISCHE BUTTON RIJ === */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: activeMode === "add" ? "repeat(6, 1fr)" : "repeat(4, 1fr)",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          {currentCards.map((card) => {
            const isActive = activeSection === card.key;
            return (
              <div
                key={card.key}
                onClick={() => setActiveSection(card.key)}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: "10px",
                  border: isActive ? "1.5px solid var(--accent)" : "1.5px solid transparent",
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

        <div style={{ height: "1px", backgroundColor: "#FF7900", marginBottom: "30px" }}></div>
      </div>

      {/* === CONTENT === */}
      <div style={{ width: "100%" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              color: "#FF7900",
            }}
          >
            <PuffLoader color="#FF7900" size={Math.min(window.innerWidth * 0.15, 100)} />
            <p style={{ marginTop: "20px", fontSize: "14px", letterSpacing: "0.5px" }}>
              Data wordt geladen...
            </p>
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : activeMode === "add" ? (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>
            Formulieren om patiënten of testen toe te voegen volgen hier.
          </p>
        ) : activeSection === "populatie" ? (
          <Populatie data={patients} summary={populatieSummary} />
        ) : activeSection === "metrics" ? (
          <Metrics data={metricsData} />
        ) : activeSection === "kracht" ? (
          <Kracht data={krachtData} />
        ) : activeSection === "functioneel" ? (
          <Functioneel data={functioneelData} />
        ) : (
          <p style={{ color: "var(--muted)" }}>Pagina {activeSection} in ontwikkeling…</p>
        )}
      </div>
    </div>
  );
}
