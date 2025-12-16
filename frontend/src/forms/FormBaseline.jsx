// =====================================================
// FILE: src/forms/FormBaseline.jsx
// Revo Sport — Baseline toevoegen + tonen bestaande resultaten
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

// ============================
// Normalisatie helpers
// ============================

// ⛔ Graden: enkel integers, geen komma/punt
const normalizeDegreesInput = (value) =>
  value.replace(/[^0-9]/g, "");

// ✅ Omtrek: , of . toegestaan → float
const normalizeCm = (value) => {
  if (value === "" || value == null) return null;
  return parseFloat(value.replace(",", "."));
};

const DEGREE_FIELDS = [
  "knie_flexie_l",
  "knie_flexie_r",
  "knie_extensie_l",
  "knie_extensie_r",
];

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
  const [loadedData, setLoadedData] = useState(false);

  // 🔹 Blessures ophalen
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

  // 🔹 Haal bestaande baseline op bij blessureselectie
  useEffect(() => {
    const fetchBaseline = async () => {
      if (!formData.blessure_id) return;
      try {
        const data = await apiGet(`/baseline/${formData.blessure_id}`);
        if (data && data.blessure_id) {
          setFormData({
            blessure_id: data.blessure_id,
            datum_onderzoek: data.datum_onderzoek || "",
            knie_flexie_l: data.knie_flexie_l || "",
            knie_flexie_r: data.knie_flexie_r || "",
            knie_extensie_l: data.knie_extensie_l || "",
            knie_extensie_r: data.knie_extensie_r || "",
            omtrek_5cm_boven_patella_l: data.omtrek_5cm_boven_patella_l || "",
            omtrek_5cm_boven_patella_r: data.omtrek_5cm_boven_patella_r || "",
            omtrek_10cm_boven_patella_l: data.omtrek_10cm_boven_patella_l || "",
            omtrek_10cm_boven_patella_r: data.omtrek_10cm_boven_patella_r || "",
            omtrek_20cm_boven_patella_l: data.omtrek_20cm_boven_patella_l || "",
            omtrek_20cm_boven_patella_r: data.omtrek_20cm_boven_patella_r || "",
            lag_test: data.lag_test || "",
            vmo_activatie: data.vmo_activatie || "",
          });
          setLoadedData(true);
        }
      } catch (err) {
        console.warn("ℹ️ Geen bestaande baseline gevonden");
        setLoadedData(false);
      }
    };
    fetchBaseline();
  }, [formData.blessure_id]);

// 🔹 Handle input changes
const handleChange = (e) => {
  const { name, value } = e.target;

  // ⛔ Graden: enkel integers
  if (DEGREE_FIELDS.includes(name)) {
    setFormData((prev) => ({
      ...prev,
      [name]: normalizeDegreesInput(value),
    }));
    return;
  }

  // Default
  setFormData((prev) => ({ ...prev, [name]: value }));
};


  // 🔹 Submit — Upsert automatisch
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    ...formData,

    omtrek_5cm_boven_patella_l: normalizeCm(formData.omtrek_5cm_boven_patella_l),
    omtrek_5cm_boven_patella_r: normalizeCm(formData.omtrek_5cm_boven_patella_r),

    omtrek_10cm_boven_patella_l: normalizeCm(formData.omtrek_10cm_boven_patella_l),
    omtrek_10cm_boven_patella_r: normalizeCm(formData.omtrek_10cm_boven_patella_r),

    omtrek_20cm_boven_patella_l: normalizeCm(formData.omtrek_20cm_boven_patella_l),
    omtrek_20cm_boven_patella_r: normalizeCm(formData.omtrek_20cm_boven_patella_r),
  };

  try {
    await apiPost("/baseline", payload);
    setStatusMsg({
      type: "success",
      msg: loadedData
        ? "✅ Bestaande resultaten bijgewerkt"
        : "✅ Baseline succesvol opgeslagen",
    });
    setLoadedData(true);
    setTimeout(() => setStatusMsg(null), 3000);
  } catch (err) {
    console.error("❌ API-fout:", err);
    setStatusMsg({ type: "error", msg: "❌ Fout bij opslaan" });
    setTimeout(() => setStatusMsg(null), 4000);
  }
};


  return (
    <motion.div
    className="form-baseline-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "40px 60px",
        maxWidth: "650px",
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
        Baseline {loadedData ? "— Resultaten bewerken" : "toevoegen"}
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

        {/* 🔹 Functionele observaties */}
        <SectionTitle text="Functioneel" />
        <div style={{ display: "flex", gap: "16px", width: "100%" }}>
          <SelectField
            label="Lag test"
            name="lag_test"
            value={formData.lag_test}
            onChange={handleChange}
            options={[
              { value: "Ja", label: "Ja" },
              { value: "Nee", label: "Nee" },
              { value: "Nvt", label: "Nvt" },
            ]}
            placeholder="Kies"
          />
          <SelectField
            label="VMO activatie"
            name="vmo_activatie"
            value={formData.vmo_activatie}
            onChange={handleChange}
            options={[
              { value: "Ja", label: "Ja" },
              { value: "Nee", label: "Nee" },
              { value: "Nvt", label: "Nvt" },
            ]}
            placeholder="Kies"
          />
        </div>

        {/* 🔸 Opslaan */}
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
      <style>{`
        /* ===========================
          MOBILE OVERRIDES
          =========================== */
        @media (max-width: 768px) {

          .form-baseline-wrapper {
            padding: 20px 28px 80px !important;
            max-width: 100% !important;
            margin: 0 !important;

            /* 🔥 kader volledig weg */
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          /* 🔥 titel weg op mobiel */
          .form-baseline-wrapper h2 {
            display: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// =====================================================
// 🔹 Subcomponenten (identiek aan jouw stijl)
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
