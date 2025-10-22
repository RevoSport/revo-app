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

import IndividueelDashboard from "./IndividueelDashboard";
import IndividueelMetrics from "./IndividueelMetrics";
import IndividueelKracht from "./IndividueelKracht";
import IndividueelFunctioneel from "./IndividueelFunctioneel";

export default function VoorsteKruisband() {
  // =====================================================
  // 🧠 States
  // =====================================================
  const [activeMode, setActiveMode] = useState("group");
  const [activeSection, setActiveSection] = useState("populatie");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // aparte states voor blessurelijst en groepsdata
  const [blessureOptions, setBlessureOptions] = useState([]);
  const [patientsGroup, setPatientsGroup] = useState([]);

  const [populatieSummary, setPopulatieSummary] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [krachtData, setKrachtData] = useState(null);
  const [functioneelData, setFunctioneelData] = useState(null);

  const [selectedBlessureId, setSelectedBlessureId] = useState(null);

  // =====================================================
  // 🧩 Blessures ophalen bij start + eerste automatisch selecteren
  // =====================================================
  useEffect(() => {
    const loadBlessures = async () => {
      try {
        const data = await apiGet("/blessure/");
        setBlessureOptions(data);
        if (data.length > 0 && data[0].blessure_id) {
          setSelectedBlessureId(Number(data[0].blessure_id));
        }
      } catch (err) {
        console.error("Error loading blessures:", err);
      }
    };
    loadBlessures();
  }, []);
  

// =====================================================
// 🧠 Data ophalen afhankelijk van mode + sectie + blessure_id
// =====================================================
useEffect(() => {
  const fetchData = async () => {
    setError("");
    setLoading(true);
    try {
      // ======== GROUP MODE ========
      if (activeMode === "group") {
        if (activeSection === "populatie") {
          const [p, s] = await Promise.all([
            apiGet("/patients/"),
            apiGet("/populatie/summary"),
          ]);
          setPatientsGroup(p);
          setPopulatieSummary(s);
        } else if (activeSection === "metrics") {
          setMetricsData(await apiGet("/metrics/summary"));
        } else if (activeSection === "kracht") {
          setKrachtData(await apiGet("/kracht/group"));
        } else if (activeSection === "functioneel") {
          setFunctioneelData(await apiGet("/functioneel/group"));
        }
      }

      // ======== INDIVIDUAL MODE ========
      if (activeMode === "individual" && selectedBlessureId) {
        const id = Number(selectedBlessureId);
        if (!isNaN(id)) {
          if (activeSection === "dashboard") {
            setPopulatieSummary(await apiGet(`/populatie/${id}`));
          } else if (activeSection === "metrics") {
            setMetricsData(await apiGet(`/metrics/${id}`));
          } else if (activeSection === "kracht") {
            setKrachtData(await apiGet(`/kracht/${id}`));
          } else if (activeSection === "functioneel") {
            setFunctioneelData(await apiGet(`/functioneel/${id}`));
          }
        }
      }
    } catch (err) {
      setError(err.message || "Fout bij laden van data");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [activeMode, activeSection, selectedBlessureId]);

// =====================================================
// 🧩 DEBUG USEEFFECT — toont live React state
// =====================================================
useEffect(() => {
  console.log("▶️ STATE UPDATE — metricsData:", metricsData);
  console.log("▶️ STATE UPDATE — krachtData:", krachtData);
  console.log("▶️ STATE UPDATE — functioneelData:", functioneelData);
  console.log("▶️ STATE UPDATE — populatieSummary:", populatieSummary);
}, [metricsData, krachtData, functioneelData, populatieSummary]);

  // =====================================================
  // 🧭 Sectie reset bij mode-switch
  // =====================================================
  useEffect(() => {
    if (activeMode === "group") setActiveSection("populatie");
    if (activeMode === "individual") setActiveSection("dashboard");
    if (activeMode === "add") setActiveSection("add_patient");
  }, [activeMode]);

  useEffect(() => {
  console.log("🩺 BlessureOptions voorbeeld:", blessureOptions?.slice(0, 3));
}, [blessureOptions]);
  // =====================================================
  // 🔹 Kaarten
  // =====================================================
  const topCards = [
    { key: "group", icon: <Users size={26} color="var(--accent)" /> },
    { key: "individual", icon: <User size={26} color="var(--accent)" /> },
    { key: "add", icon: <UserPlus size={26} color="var(--accent)" /> },
  ];

  const groupCards = [
    { title: "POPULATIE", key: "populatie", icon: <UsersRound size={24} color="var(--accent)" /> },
    { title: "METRICS", key: "metrics", icon: <Ruler size={24} color="var(--accent)" /> },
    { title: "KRACHT", key: "kracht", icon: <Dumbbell size={24} color="var(--accent)" /> },
    { title: "FUNCTIONELE TESTING", key: "functioneel", icon: <Activity size={24} color="var(--accent)" /> },
  ];

  const individualCards = [
    { title: "DASHBOARD", key: "dashboard", icon: <Gauge size={24} color="var(--accent)" /> },
    { title: "METRICS", key: "metrics", icon: <RulerDimensionLine size={24} color="var(--accent)" /> },
    { title: "KRACHT", key: "kracht", icon: <BicepsFlexed size={24} color="var(--accent)" /> },
    { title: "FUNCTIONELE TESTING", key: "functioneel", icon: <ClipboardList size={24} color="var(--accent)" /> },
  ];

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

  // =====================================================
  // 🔹 Render
  // =====================================================
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
      <h1 style={{ fontSize: "22px", textTransform: "uppercase", color: "#fff", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "6px" }}>
        VOORSTE KRUISBAND
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "35px", letterSpacing: "0.4px" }}>
        DATA-DRIVEN REHABILITATION INSIGHTS
      </p>

      {/* === BOVENSTE KNOPPEN === */}
      <div style={{ width: "100%", maxWidth: "950px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "16px" }}>
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

        {/* === ORANJE LIJN === */}
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
                  }}
                >
                  {card.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* === ORANJE LIJN === */}
        <div style={{ height: "1px", backgroundColor: "#FF7900", marginBottom: "30px" }}></div>


{/* === DROPDOWN (alleen in individuele modus) === */}
{activeMode === "individual" && (
  <div style={{ marginBottom: "25px", textAlign: "center" }}>
    <p
      style={{
        color: "var(--muted)",
        marginBottom: "6px",
        fontSize: "12px",
      }}
    >
      Selecteer patiënt:
    </p>

    <select
      value={selectedBlessureId || ""}
      onChange={(e) => {
        const value = Number(e.target.value);
        setSelectedBlessureId(isNaN(value) ? null : value);
      }}
      style={{
        width: "280px",
        padding: "8px 10px",
        borderRadius: "8px",
        backgroundColor: "#1a1a1a",
        color: "white",
        border: "1px solid var(--accent)",
        fontSize: "14px",
        outline: "none",
        cursor: "pointer",
        transition: "border 0.2s ease",
      }}
    >
      <option value="">Selecteer blessure</option>

      {[...blessureOptions]
        .sort((a, b) => (a.naam || "").localeCompare(b.naam || ""))
        .map((b) => {
          const naam = b.naam || `Patiënt #${b.patient_id}`;
          const zijde = b.zijde || "Onbepaald";
          const operatie = b.operatie || "ACL";
          const datum = b.datum_operatie
            ? new Date(b.datum_operatie).toLocaleDateString("nl-BE")
            : "Geen datum";

          return (
            <option key={b.blessure_id} value={Number(b.blessure_id)}>
              {`${naam} – ${operatie} (${zijde}) • ${datum}`}
            </option>
          );
        })}
    </select>
  </div>
)}


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
          ) : activeMode === "group" ? (
            <>
              {activeSection === "populatie" && <Populatie data={patientsGroup} summary={populatieSummary} />}
              {activeSection === "metrics" && <Metrics data={metricsData} />}
              {activeSection === "kracht" && <Kracht data={krachtData} />}
              {activeSection === "functioneel" && <Functioneel data={functioneelData} />}
            </>
          ) : activeMode === "individual" ? (
            <>
              {activeSection === "dashboard" && <IndividueelDashboard data={populatieSummary} />}
              {activeSection === "metrics" && <IndividueelMetrics data={metricsData} />}
              {activeSection === "kracht" && <IndividueelKracht data={krachtData} />}
              {activeSection === "functioneel" && <IndividueelFunctioneel data={functioneelData} />}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>
              Pagina {activeSection} in ontwikkeling…
            </p>
          )}
        </div> 
      </div> 
    </div>  
  );
}
