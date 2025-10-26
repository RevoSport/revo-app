// =====================================================
// FILE: src/forms/FormBaseline.jsx
// Revo Sport — Baseline toevoegen (met correcte placeholders)
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

export default function FormBaseline() {
  const [formData, setFormData] = useState({
    blessure_id: "",
    datum_onderzoek: "",
    knie_flexie_l: "",
    knie_flexie_r: "",
    knie_extensie_l: "",
    knie_extensie_r: "",
    omtrek_5cm_boven_patella_l: "",
    omtrek_5cm_boven_patella_r: "",
    omtrek_10cm_boven_patella_l: "",
    omtrek_10cm_boven_patella_r: "",
    omtrek_20cm_boven_patella_l: "",
    omtrek_20cm_boven_patella_r: "",
    lag_test: "",
    vmo_activatie: "",
  });

  const [blessures, setBlessures] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const fetchBlessures = async () => {
      try {
        const data = await apiGet("/blessure/");
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) =>
            a.naam.localeCompare(b.naam)
          );
          setBlessures(sorted);
        }
      } catch (err) {
        console.error("❌ Fout bij ophalen blessures:", err);
      }
    };
    fetchBlessures();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPost("/baseline", formData);
      setFormData({
        blessure_id: "",
        datum_onderzoek: "",
        knie_flexie_l: "",
        knie_flexie_r: "",
        knie_extensie_l: "",
        knie_extensie_r: "",
        omtrek_5cm_boven_patella_l: "",
        omtrek_5cm_boven_patella_r: "",
        omtrek_10cm_boven_patella_l: "",
        omtrek_10cm_boven_patella_r: "",
        omtrek_20cm_boven_patella_l: "",
        omtrek_20cm_boven_patella_r: "",
        lag_test: "",
        vmo_activatie: "",
      });
      setStatusMsg({ type: "success", msg: "✅ Baseline succesvol opgeslagen" });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error("❌ API-fout:", err);
      setStatusMsg({ type: "error", msg: "❌ Fout bij opslaan" });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "40px 60px",
        maxWidth: "600px",
        margin: "0 auto 80px",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        border: `1px solid rgba(255,255,255,0.08)`,
        color: COLOR_TEXT,
        textAlign: "left",
        fontFamily:
          "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: COLOR_TEXT,
          fontSize: 18,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "25px",
          letterSpacing: "1px",
        }}
      >
        Baseline toevoegen
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 🔹 Blessure selecteren */}
        <SelectField
          label="Blessure (Patiënt)"
          name="blessure_id"
          value={formData.blessure_id}
          onChange={handleChange}
          options={blessures.map((b) => ({
            value: b.blessure_id,
            label: `${b.naam} - ${b.zijde || ""} (${b.datum_operatie || "?"})`,
          }))}
          placeholder="Selecteer blessure"
          required
        />

        {/* 🔹 Datum onderzoek */}
        <FormField
          label="Datum onderzoek"
          name="datum_onderzoek"
          type="date"
          value={formData.datum_onderzoek}
          onChange={handleChange}
          placeholder="DD/MM/JJJJ"
        />

        {/* 🔹 Knie mobiliteit */}
        <SectionTitle text="Knie mobiliteit (°)" />
        <TwoColumnFields
          leftLabel="Flexie links"
          rightLabel="Flexie rechts"
          leftName="knie_flexie_l"
          rightName="knie_flexie_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in °"
          rightPlaceholder="in °"
        />
        <TwoColumnFields
          leftLabel="Extensie links"
          rightLabel="Extensie rechts"
          leftName="knie_extensie_l"
          rightName="knie_extensie_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in °"
          rightPlaceholder="in °"
        />

        {/* 🔹 Omtrekmetingen */}
        <SectionTitle text="Omtrek boven patella (cm)" />
        <TwoColumnFields
          leftLabel="5 cm boven patella (L)"
          rightLabel="5 cm boven patella (R)"
          leftName="omtrek_5cm_boven_patella_l"
          rightName="omtrek_5cm_boven_patella_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in cm"
          rightPlaceholder="in cm"
        />
        <TwoColumnFields
          leftLabel="10 cm boven patella (L)"
          rightLabel="10 cm boven patella (R)"
          leftName="omtrek_10cm_boven_patella_l"
          rightName="omtrek_10cm_boven_patella_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in cm"
          rightPlaceholder="in cm"
        />
        <TwoColumnFields
          leftLabel="20 cm boven patella (L)"
          rightLabel="20 cm boven patella (R)"
          leftName="omtrek_20cm_boven_patella_l"
          rightName="omtrek_20cm_boven_patella_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in cm"
          rightPlaceholder="in cm"
        />

        {/* 🔹 Functionele testen */}
        <SectionTitle text="Functionele observaties" />
        <div style={{ display: "flex", gap: "16px", width: "100%" }}>
          <SelectField
            label="Lag test"
            name="lag_test"
            value={formData.lag_test}
            onChange={handleChange}
            options={[
              { value: "Ja", label: "Ja" },
              { value: "Nee", label: "Nee" },
            ]}
            placeholder="Kies resultaat"
          />
          <SelectField
            label="VMO activatie"
            name="vmo_activatie"
            value={formData.vmo_activatie}
            onChange={handleChange}
            options={[
              { value: "Ja", label: "Ja" },
              { value: "Nee", label: "Nee" },
            ]}
            placeholder="Kies resultaat"
          />
        </div>

        {/* 🔸 Opslaan-knop */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: `1px solid ${COLOR_ACCENT}`,
            color: COLOR_ACCENT,
            borderRadius: "10px",
            padding: "8px 16px",
            width: "100%",
            marginTop: "25px",
            fontSize: "13px",
            fontWeight: 500,
            transition: "all 0.25s ease",
            cursor: "pointer",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#fff";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(255,121,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLOR_ACCENT;
            e.currentTarget.style.color = COLOR_ACCENT;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Opslaan
        </motion.button>
      </form>

      {/* ✅ Feedbackmelding */}
      <AnimatePresence>
        {statusMsg && (
          <motion.p
            key={statusMsg.msg}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{
              textAlign: "center",
              color: statusMsg.type === "success" ? "#7CFC00" : "#ff4d4d",
              marginTop: "25px",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {statusMsg.msg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 🎨 Kalenderstijl gelijk aan Blessure */}
      <style>{`
        input::placeholder,
        select:invalid {
          color: ${COLOR_PLACEHOLDER};
          opacity: 1;
        }
        input[type="date"] {
          color-scheme: dark;
          text-transform: uppercase;
          font-family: 'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
          font-size: 14px;
          letter-spacing: 0.4px;
        }
        input[type="date"]::-webkit-datetime-edit {
          color: ${COLOR_PLACEHOLDER};
          text-transform: uppercase;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6);
          opacity: 0.55;
          cursor: pointer;
        }
        input[type="date"]:focus::-webkit-datetime-edit {
          color: #fff;
        }
      `}</style>
    </motion.div>
  );
}

// =====================================================
// 🔹 Subcomponenten
// =====================================================
function FormField({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ""}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#222",
          color: "#fff",
          outline: "none",
          fontSize: 14,
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder }) {
  return (
    <div style={{ flex: 1, marginBottom: "18px" }}>
      <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#222",
          color: value ? "#fff" : COLOR_PLACEHOLDER,
          fontSize: 14,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="">{placeholder || "Kies..."}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TwoColumnFields({
  leftLabel,
  rightLabel,
  leftName,
  rightName,
  values,
  onChange,
  leftPlaceholder,
  rightPlaceholder,
}) {
  return (
    <div style={{ display: "flex", gap: "16px", width: "100%" }}>
      <FormField
        label={leftLabel}
        name={leftName}
        value={values[leftName]}
        onChange={onChange}
        placeholder={leftPlaceholder}
      />
      <FormField
        label={rightLabel}
        name={rightName}
        value={values[rightName]}
        onChange={onChange}
        placeholder={rightPlaceholder}
      />
    </div>
  );
}

function SectionTitle({ text }) {
  return (
    <h3
      style={{
        marginTop: "25px",
        marginBottom: "10px",
        color: COLOR_ACCENT,
        fontSize: 13,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {text}
    </h3>
  );
}
