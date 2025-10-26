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
  Car,
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

import FormPatient from "../forms/FormPatient";
import FormBlessure from "../forms/FormBlessure";
import FormBaseline from "../forms/FormBaseline";
import FormWeek6 from "../forms/FormWeek6";
import FormMaand3 from "../forms/FormMaand3";
import FormMaand45 from "../forms/FormMaand45";
import FormMaand6 from "../forms/FormMaand6";
import FormAutorijden from "../forms/FormAutorijden";


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
// 🧩 Bij eerste load: blessurelijst ophalen + eerste automatisch selecteren
// =====================================================
useEffect(() => {
  const fetchAndSelectFirstBlessure = async () => {
    try {
      const data = await apiGet("/blessure/");
      if (Array.isArray(data) && data.length > 0) {
        setBlessureOptions(data);

        // Alleen automatisch selecteren als er nog niets gekozen is
        if (!selectedBlessureId) {
          setSelectedBlessureId(Number(data[0].blessure_id));
          setActiveMode("individual");
          setActiveSection("dashboard");
        }
      }
    } catch (err) {
      console.error("❌ Fout bij laden blessurelijst:", err);
    }
  };

  fetchAndSelectFirstBlessure();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setPopulatieSummary(await apiGet(`/individueel/${id}/summary`));
          } else if (activeSection === "metrics") {
            setMetricsData(await apiGet(`/individueel/${id}/metrics`));
          } else if (activeSection === "kracht") {
            setKrachtData(await apiGet(`/individueel/${id}/metrics`)); // kracht zit ook in metrics-resultaat
          } else if (activeSection === "functioneel") {
            setFunctioneelData(await apiGet(`/individueel/${id}/metrics`)); // functioneel idem
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
    { title: "PATIËNT\nTOEVOEGEN", key: "add_patient", icon: <UserRoundPlus size={24} color="var(--accent)" /> },
    { title: "BLESSURE\nTOEVOEGEN", key: "add_blessure", icon: <Activity size={24} color="var(--accent)" /> },
    { title: "BASELINE", key: "baseline", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "WEEK 6", key: "week6", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "MAAND 3", key: "maand3", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "MAAND 4.5", key: "maand45", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "MAAND 6", key: "maand6", icon: <NotepadText size={24} color="var(--accent)" /> },
    { title: "AUTORIJDEN  LOPEN", key: "autorijden", icon: <Car size={24} color="var(--accent)" /> },
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

{/* === DYNAMISCHE BUTTON RIJ (1 LIJN + ICONS UITGELIJND) === */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "nowrap",
    width: "100%",
  }}
>
  {currentCards.map((card) => {
    const isActive = activeSection === card.key;
    return (
      <div
        key={card.key}
        onClick={() => setActiveSection(card.key)}
        style={{
          flex: "1",
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
          minWidth: "90px",
        }}
      >
        {/* 🔹 Icon container met vaste hoogte en centrering */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "28px",      // vaste hoogte voor alle iconen
            marginBottom: "8px",
          }}
        >
          {card.icon}
        </div>

        {/* 🔹 Titel */}
        <h3
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: isActive ? "#727170" : "white",
            letterSpacing: "0.7px",
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "pre-line", // ondersteunt \n bij "BLESSURE\nTOEVOEGEN"
            lineHeight: "14px",
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
        marginBottom: "8px",
        fontSize: "12px",
        letterSpacing: "0.5px",
      }}
    >
      Selecteer patiënt:
    </p>

    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={selectedBlessureId || ""}
        onFocus={async () => {
          if (!blessureOptions || blessureOptions.length === 0) {
            try {
              const data = await apiGet("/blessure/");
              if (data && Array.isArray(data)) setBlessureOptions(data);
            } catch (err) {
              console.error("❌ Fout bij ophalen blessures:", err);
            }
          }
        }}
        onChange={(e) => {
          const value = Number(e.target.value);
          setSelectedBlessureId(isNaN(value) ? null : value);
        }}
        style={{
          width: "340px",
          padding: "10px 12px",
          borderRadius: "8px",
          backgroundColor: "#1a1a1a",
          color: "white",
          border: "1px solid #FF7900",
          fontSize: "14px",
          outline: "none",
          cursor: "pointer",
          textAlign: "left",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage:
            "linear-gradient(45deg, transparent 50%, #FF7900 50%), linear-gradient(135deg, #FF7900 50%, transparent 50%)",
          backgroundPosition:
            "calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)",
          backgroundSize: "5px 5px, 5px 5px",
          backgroundRepeat: "no-repeat",
          transition: "border-color 0.2s ease",
        }}
      >
        <option value="">Selecteer blessure</option>
        {Array.isArray(blessureOptions) && blessureOptions.length > 0 ? (
          [...blessureOptions]
            .sort((a, b) => (a.naam || "").localeCompare(b.naam || ""))
            .map((b) => {
              const naam = b.naam || `Patiënt #${b.patient_id}`;
              const zijde = b.zijde || "Onbepaald";
              const datum = b.datum_operatie
                ? new Date(b.datum_operatie).toLocaleDateString("nl-BE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Geen datum";
              return (
                <option key={b.blessure_id} value={Number(b.blessure_id)}>
                  {`${naam} - ACL ${zijde} (${datum})`}
                </option>
              );
            })
        ) : (
          <option value="">Geen blessures gevonden</option>
        )}
      </select>
    </div>

    <style>{`
      select {
        direction: ltr;
      }
      select option {
        background-color: #1a1a1a;
        color: white;
        text-align: left;
        border: 1px solid #FF7900;
        border-radius: 8px;
      }
      select:focus {
        border-color: #FF7900;
        box-shadow: none;
      }
      select option:hover,
      select option:focus {
        color: #FF7900 !important;
        background-color: #262626 !important;
      }
      select option:checked {
        background-color: #FF7900 !important;
        color: black !important;
      }
    `}</style>
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
            <>
              {activeSection === "add_patient" && <FormPatient />}
              {activeSection === "add_blessure" && <FormBlessure />}
              {activeSection === "baseline" && <FormBaseline />}
              {activeSection === "week6" && <FormWeek6 />}
              {activeSection === "maand3" && <FormMaand3 />}
              {activeSection === "maand45" && <FormMaand45 />}
              {activeSection === "maand6" && <FormMaand6 />}
              {activeSection === "autorijden" && <FormAutorijden />}

            </>

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
