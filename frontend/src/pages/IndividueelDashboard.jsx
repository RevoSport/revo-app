// =====================================================
// FILE: src/pages/IndividueelDashboard.jsx
// Revo Sport — Volledig individueel overzicht (profiel + progressie)
// =====================================================

import React from "react";
import {
  CalendarDays,
  Activity,
  User,
  Layers,
  Award,
  HeartPulse,
  Dumbbell,
  ShieldHalf,
  Volleyball,
} from "lucide-react";
import { motion } from "framer-motion";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";

// ✅ Safe fallback
const safe = (val, fallback = "—") =>
  val !== null && val !== undefined && val !== "" ? val : fallback;

export default function IndividueelDashboard({ data }) {
  if (!data)
    return (
      <div style={{ color: COLOR_MUTED, textAlign: "center", paddingTop: "50px" }}>
        Geen gegevens beschikbaar voor deze patiënt.
      </div>
    );

  // 🔹 Data destructureren
  const {
    naam,
    geslacht,
    geboortedatum,
    leeftijd,
    zijde,
    operatie,
    sport,
    sportniveau,
    datum_operatie,
    aantal_blessures,
    aantal_fases,
    laatste_fase,
    laatste_testdatum,
  } = data;

  // 🔹 Leeftijd berekenen als enkel geboortedatum aanwezig is
  const calcLeeftijd = () => {
    if (leeftijd) return leeftijd;
    if (!geboortedatum) return null;
    const diff = Date.now() - new Date(geboortedatum).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        color: COLOR_TEXT,
        textAlign: "center",
        paddingBottom: "80px",
      }}
    >
      {/* ===================================================== */}
      {/* 🔸 PROFIEL + BLESSURE INFO */}
      {/* ===================================================== */}
      <div
        style={{
          background: COLOR_BG,
          borderRadius: 12,
          padding: "20px 40px 40px", // 🔹 meer verticale ruimte (boven/onder gelijk)
          marginBottom: 40,
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          border: `1px solid rgba(255,255,255,0.08)`,
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            color: COLOR_TEXT,
            letterSpacing: "1px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {safe(naam)}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)", // ✅ twee kolommen
            gridTemplateRows: "repeat(3, auto)",   // ✅ drie rijen
            gap: "10px 60px",                      // 🔹 verticale & horizontale marge
            alignItems: "center",
            justifyItems: "stretch",
          }}
        >

        <InfoRow
          icon={<HeartPulse size={18} color={COLOR_ACCENT} />}
          label="Geslacht"
          value={safe(geslacht)}
        />

        <InfoRow
          icon={<ShieldHalf size={18} color={COLOR_ACCENT} />}
          label="Zijde"
          value={safe(zijde)}
        />

        <InfoRow
          icon={<Award size={18} color={COLOR_ACCENT} />}
          label="Leeftijd"
          value={
            calcLeeftijd() !== null && calcLeeftijd() !== undefined
              ? `${calcLeeftijd()} jaar`
              : "—"
          }
        />
                <InfoRow
          icon={<CalendarDays size={18} color={COLOR_ACCENT} />}
          label="Datum operatie"
          value={
            datum_operatie
              ? new Date(datum_operatie).toLocaleDateString("nl-BE")
              : "—"
          }
        />

        <InfoRow
          icon={<Volleyball size={18} color={COLOR_ACCENT} />}
          label="Sport"
          value={`${safe(sport)} (${safe(sportniveau)})`}
        />


        <InfoRow
          icon={<Dumbbell size={18} color={COLOR_ACCENT} />}
          label="Operatie"
          value={safe(operatie)}
        />



        </div>
      </div>

      {/* ===================================================== */}
      {/* 🔸 DASHBOARD KPI-CARDS */}
      {/* ===================================================== */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          textTransform: "uppercase",
          color: COLOR_TEXT,
          letterSpacing: "1px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Revalidatie-overzicht
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          justifyContent: "center",
          width: "100%",
          marginBottom: "40px",
        }}
      >
        <Card
          icon={<Activity size={28} color={COLOR_ACCENT} />}
          label="BLESSURES"
          value={safe(aantal_blessures)}
        />

        <Card
          icon={<Layers size={28} color={COLOR_ACCENT} />}
          label="FASES GETEST"
          value={safe(aantal_fases)}
        />

        <Card
          icon={<Award size={28} color={COLOR_ACCENT} />}
          label="LAATSTE FASE"
          value={safe(laatste_fase)}
        />

        <Card
          icon={<CalendarDays size={28} color={COLOR_ACCENT} />}
          label="LAATSTE TEST"
          value={
            laatste_testdatum
              ? new Date(laatste_testdatum).toLocaleDateString("nl-BE")
              : "—"
          }
        />
      </div>
    </motion.div>
  );
}

// =====================================================
// 🔹 Herbruikbare Componenten
// =====================================================
function InfoRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr", // 🔹 vaste breedte voor labelkolom
        alignItems: "center",
        fontSize: 14,
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        paddingBottom: "3px",
        gap: "10px",
      }}
    >
      {/* 🔹 Labelgedeelte (icoon + tekst) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          textAlign: "left", // ✅ label links uitgelijnd
        }}
      >
        <span>{icon}</span>
        <span style={{ color: "#aaa" }}>{label}:</span>
      </div>

      {/* 🔹 Waardegedeelte */}
      <div
        style={{
          textAlign: "left",
          color: "#fff",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Card({ icon, label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "14px 10px", // iets meer ademruimte
        boxShadow: "0 0 8px rgba(0,0,0,0.25)",
        border: `1px solid rgba(255,255,255,0.08)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        minHeight: "90px",
      }}
    >
      {/* 🔹 Icoon */}
      <div style={{ marginBottom: 6 }}>{icon}</div>

      {/* 🔹 Label */}
      <p
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          color: "#c9c9c9",
          letterSpacing: "0.8px",
          margin: 0,             // geen extra marge boven/onder
          lineHeight: "1.2",
        }}
      >
        {label}
      </p>

      {/* 🔹 Waarde */}
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: COLOR_ACCENT,
          marginTop: 4,          // evenwichtige afstand boven
          marginBottom: 4,       // evenwichtige afstand onder
          lineHeight: "1.2",
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}
