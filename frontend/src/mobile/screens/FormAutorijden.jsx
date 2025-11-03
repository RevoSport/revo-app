// =====================================================
// FILE: src/forms/FormAutorijden.jsx
// Revo Sport — Autorijden + Lopen (Week6 + Maand45)
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

export default function FormAutorijden() {
  const [formData, setFormData] = useState({
    blessure_id: "",
    datum_onderzoek: "",
    autorijden: "",
    autorijden_schakelen: "",
    autorijden_datum: "",
    lopen_opstartdatum: "",
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

  // 🔹 Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Data ophalen bij blessureselectie (Week6 + Maand45)
useEffect(() => {
  if (!formData.blessure_id) return;

  const fetchExisting = async () => {
    try {
      // Autorijden (Week6)
      const week6 = await apiGet(`/week6/${formData.blessure_id}`);
      // Lopen (Maand45)
      const maand45 = await apiGet(`/maand45/${formData.blessure_id}`);

      setFormData((prev) => ({
        ...prev,
        autorijden: week6?.autorijden || "",
        autorijden_schakelen: week6?.autorijden_schakelen || "",
        autorijden_datum: week6?.autorijden_datum || "",
        lopen_opstartdatum: maand45?.lopen_opstartdatum || "",
        blessure_id: prev.blessure_id,
      }));

      setLoadedData(true);
    } catch {
      setLoadedData(false);
    }
  };

  fetchExisting();
  // eslint-disable-next-line
}, [formData.blessure_id]);

  // 🔹 Submit → twee API calls
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const week6Payload = {
        blessure_id: formData.blessure_id,
        datum_onderzoek: formData.datum_onderzoek,
        autorijden: formData.autorijden,
        autorijden_schakelen: formData.autorijden_schakelen,
        autorijden_datum: formData.autorijden_datum,
      };

      const maand45Payload = {
        blessure_id: formData.blessure_id,
        datum_onderzoek: formData.datum_onderzoek,
        lopen_opstartdatum: formData.lopen_opstartdatum,
      };

      await apiPost("/week6", week6Payload);
      await apiPost("/maand45", maand45Payload);

      setStatusMsg({ type: "success", msg: "✅ Gegevens succesvol opgeslagen" });
      setTimeout(() => setStatusMsg(null), 3000);

      setFormData({
        blessure_id: "",
        datum_onderzoek: "",
        autorijden: "",
        autorijden_schakelen: "",
        autorijden_datum: "",
        lopen_opstartdatum: "",
      });
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
        />

        {/* ===== AUTORIJDEN ===== */}
        <SectionTitle text="Autorijden" />

        <SelectField
          label="Autorijden"
          name="autorijden"
          value={formData.autorijden}
          onChange={handleChange}
          options={[
            { value: "Ja", label: "Ja" },
            { value: "Nee", label: "Nee" },
            { value: "Nvt", label: "Nvt" },
          ]}
        />

        <SelectField
          label="Schakelen"
          name="autorijden_schakelen"
          value={formData.autorijden_schakelen}
          onChange={handleChange}
          options={[
            { value: "Manueel", label: "Manueel" },
            { value: "Automaat", label: "Automaat" },
            { value: "Nvt", label: "Nvt" },
          ]}
        />

        <FormField
          label="Datum hervatten autorijden"
          name="autorijden_datum"
          type="date"
          value={formData.autorijden_datum}
          onChange={handleChange}
        />

        {/* ===== LOPEN ===== */}
        <SectionTitle text="Lopen" />
        <FormField
          label="Datum opstart lopen"
          name="lopen_opstartdatum"
          type="date"
          value={formData.lopen_opstartdatum}
          onChange={handleChange}
        />

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

      {/* 🎨 Kalenderstijl identiek aan andere formulieren */}
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
// 🔹 Subcomponenten (zelfde stijl als Maand6)
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
    <div style={{ flex: 1, minWidth: "calc(50% - 8px)", marginBottom: "18px" }}>
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
        <option value="">{placeholder || "Kies"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
