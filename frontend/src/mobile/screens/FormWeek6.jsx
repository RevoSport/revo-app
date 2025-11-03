// =====================================================
// FILE: src/forms/FormWeek6.jsx
// Revo Sport — Week 6 toevoegen (zelfde stijl als Baseline/Blessure)
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

export default function FormWeek6() {
  const [formData, setFormData] = useState({
    blessure_id: "",
    datum_onderzoek: "",
    knie_flexie: "",
    knie_extensie: "",
    omtrek_5cm_boven_patella_l: "",
    omtrek_5cm_boven_patella_r: "",
    omtrek_10cm_boven_patella_l: "",
    omtrek_10cm_boven_patella_r: "",
    omtrek_20cm_boven_patella_l: "",
    omtrek_20cm_boven_patella_r: "",
    kracht_quadriceps_60_l: "",
    kracht_quadriceps_60_r: "",
    kracht_hamstrings_30_l: "",
    kracht_hamstrings_30_r: "",
    kracht_soleus_l: "",
    kracht_soleus_r: "",
    kracht_abductoren_kort_l: "",
    kracht_abductoren_kort_r: "",
    kracht_abductoren_lang_l: "",
    kracht_abductoren_lang_r: "",
    kracht_adductoren_kort_l: "",
    kracht_adductoren_kort_r: "",
    kracht_adductoren_lang_l: "",
    kracht_adductoren_lang_r: "",
    stepdown_valgus_score_l: "",
    stepdown_valgus_score_r: "",
    stepdown_pelvische_controle_l: "",
    stepdown_pelvische_controle_r: "",
    squat_forceplate_l: "",
    squat_forceplate_r: "",
    aantal_sessies: "",
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

  // 🔹 Bestaande Week6-data ophalen bij blessureselectie
useEffect(() => {
  const fetchWeek6 = async () => {
    if (!formData.blessure_id) return;
    try {
      const data = await apiGet(`/week6/${formData.blessure_id}`);
      if (data && data.blessure_id) {
        setFormData({
          ...formData,
          ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])),
        });
        setLoadedData(true);
      } else {
        setLoadedData(false);
      }
    } catch {
      setLoadedData(false);
    }
  };
  fetchWeek6();
  // eslint-disable-next-line
}, [formData.blessure_id]);


  // 🔹 Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Opslaan
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await apiPost("/week6", formData);
    setStatusMsg({
      type: "success",
      msg: loadedData
        ? "✅ Bestaande resultaten bijgewerkt"
        : "✅ Week 6 succesvol opgeslagen",
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
style={{
  background: "#111",
  color: "#fff",
  padding: "20px 30px 80px",
  maxWidth: 500,
  margin: "0 auto",
  textAlign: "left",
  fontFamily:
    "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
}}

    >

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

        <FormField
          label="Datum onderzoek"
          name="datum_onderzoek"
          type="date"
          value={formData.datum_onderzoek}
          onChange={handleChange}
          placeholder="DD/MM/JJJJ"
        />

        {/* 🔹 Sessie-informatie */}
        <FormField
          label="Aantal sessies"
          name="aantal_sessies"
          value={formData.aantal_sessies}
          onChange={handleChange}
          placeholder="Aantal"
        />

        {/* 🔹 Knie mobiliteit */}
        <SectionTitle text="Knie mobiliteit (°)" />
        <TwoColumnFields
          leftLabel="Flexie"
          rightLabel="Extensie"
          leftName="knie_flexie"
          rightName="knie_extensie"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in °"
          rightPlaceholder="in °"
        />

        {/* 🔹 Omtrek */}
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

        {/* 🔹 Krachtmetingen */}
        <SectionTitle text="Spierkracht (N)" />
        <TwoColumnFields
          leftLabel="Quadriceps 60° (L)"
          rightLabel="Quadriceps 60° (R)"
          leftName="kracht_quadriceps_60_l"
          rightName="kracht_quadriceps_60_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />
        <TwoColumnFields
          leftLabel="Hamstrings 30° (L)"
          rightLabel="Hamstrings 30° (R)"
          leftName="kracht_hamstrings_30_l"
          rightName="kracht_hamstrings_30_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />
        <TwoColumnFields
          leftLabel="Soleus (L)"
          rightLabel="Soleus (R)"
          leftName="kracht_soleus_l"
          rightName="kracht_soleus_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />
        <TwoColumnFields
          leftLabel="Adductoren kort (L)"
          rightLabel="Adductoren kort (R)"
          leftName="kracht_adductoren_kort_l"
          rightName="kracht_adductoren_kort_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />
        <TwoColumnFields
          leftLabel="Abductoren kort (L)"
          rightLabel="Abductoren kort (R)"
          leftName="kracht_abductoren_kort_l"
          rightName="kracht_abductoren_kort_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />
        <TwoColumnFields
          leftLabel="Adductoren lang (L)"
          rightLabel="Adductoren lang (R)"
          leftName="kracht_adductoren_lang_l"
          rightName="kracht_adductoren_lang_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />
        <TwoColumnFields
          leftLabel="Abductoren lang (L)"
          rightLabel="Abductoren lang (R)"
          leftName="kracht_abductoren_lang_l"
          rightName="kracht_abductoren_lang_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="in N"
          rightPlaceholder="in N"
        />

        {/* 🔹 Step Down Test */}
        <SectionTitle text="Functioneel" />
        <TwoColumnFields
          leftLabel="Valgus controle (L)"
          rightLabel="Valgus controle (R)"
          leftName="stepdown_valgus_score_l"
          rightName="stepdown_valgus_score_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="Score 0 - 3"
          rightPlaceholder="Score 0 - 3"
        />
        <TwoColumnFields
          leftLabel="Pelvische controle (L)"
          rightLabel="Pelvische controle (R)"
          leftName="stepdown_pelvische_controle_l"
          rightName="stepdown_pelvische_controle_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="Score 0 - 3"
          rightPlaceholder="Score 0 - 3"
        />

        {/* 🔹 Squat Forceplate */}
        <SectionTitle text="Squat Forceplate (%)" />
        <TwoColumnFields
          leftLabel="% Verdeling (L)"
          rightLabel="% Verdeling (R)"
          leftName="squat_forceplate_l"
          rightName="squat_forceplate_r"
          values={formData}
          onChange={handleChange}
          leftPlaceholder="Bv. 54"
          rightPlaceholder="Bv. 46"
        />

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

      {/* 🎨 Kalenderstijl identiek aan Blessure */}
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
// 🔹 Subcomponenten (ongewijzigd)
// =====================================================
function FormField({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ flex: 1, minWidth: "calc(50% - 8px)", marginBottom: "18px" }}>
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
