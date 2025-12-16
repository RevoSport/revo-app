// =====================================================
// FILE: src/forms/FormPatient.jsx
// Revo Sport — Patiënt toevoegen (volledig uniforme stijl)
// =====================================================

import React, { useState } from "react";
import { apiPost } from "../api";
import { motion } from "framer-motion";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

// =====================================================
// 🔹 Helpers
// =====================================================
function normalizeNaam(naam) {
  if (!naam) return "";
  return naam
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function FormPatient() {
  const [formData, setFormData] = useState({
    naam: "",
    geslacht: "",
    geboortedatum: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      naam: normalizeNaam(formData.naam),
    };

    try {
      await apiPost("/patients", payload);
      setStatus({ type: "success", msg: "✅ Patiënt succesvol toegevoegd!" });
      setFormData({ naam: "", geslacht: "", geboortedatum: "" });
    } catch (err) {
      console.error("❌ API-fout:", err);
      setStatus({ type: "error", msg: "❌ Fout bij opslaan, controleer de velden." });
    }
  };

  return (
  <motion.div
    className="form-patient-wrapper"
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
        Patiënt toevoegen
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 🔹 Naam */}
        <FormField
          label="Naam"
          name="naam"
          value={formData.naam}
          onChange={handleChange}
          onBlur={(e) =>
            setFormData((prev) => ({
              ...prev,
              naam: normalizeNaam(e.target.value),
            }))
          }
          placeholder="Voornaam Achternaam"
          required
        />

        {/* 🔹 Geslacht */}
        <SelectField
          label="Geslacht"
          name="geslacht"
          value={formData.geslacht}
          onChange={handleChange}
          options={[
            { value: "Man", label: "Man" },
            { value: "Vrouw", label: "Vrouw" },
            { value: "X", label: "X" },
          ]}
          placeholder="Kies"
          required
        />

        {/* 🔹 Geboortedatum */}
        <FormField
          label="Geboortedatum"
          name="geboortedatum"
          type="date"
          value={formData.geboortedatum}
          onChange={handleChange}
          required
          placeholder="DD/MM/JJJJ"
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
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLOR_ACCENT;
            e.currentTarget.style.color = COLOR_ACCENT;
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Opslaan
        </motion.button>
      </form>

      {status && (
        <p
          style={{
            textAlign: "center",
            color: status.type === "success" ? "#7CFC00" : "#ff4d4d",
            marginTop: "20px",
            fontSize: 14,
            letterSpacing: "0.3px",
          }}
        >
          {status.msg}
        </p>
      )}

      <style>{`
        input::placeholder {
        color: ${COLOR_PLACEHOLDER};
        }


        input[type="date"] {
          color-scheme: dark;
          text-transform: uppercase;
          font-family: 'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
          font-size: 14px;
          letter-spacing: 0.4px;
        }

        input[type="date"]::-webkit-datetime-edit {
          font-family: 'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif !important;
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

        select option[disabled] {
          color: ${COLOR_PLACEHOLDER};
        }
      `}</style>
      <style>{`
        /* ===========================
          MOBILE OVERRIDES
          =========================== */
        @media (max-width: 768px) {

          .form-patient-wrapper {
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
          .form-patient-wrapper h2 {
            display: none !important;
          }
        }
      `}</style>

    </motion.div>
  );
}

// =====================================================
// 🔹 Subcomponenten (Input & Select)
// =====================================================
function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  required,
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label
        style={{
          display: "block",
          color: COLOR_MUTED,
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder || ""}
        required={required}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#222",
          color: "#fff",
          outline: "none",
          fontSize: 14,
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder, required }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label
        style={{
          display: "block",
          color: COLOR_MUTED,
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
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
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <option value="" disabled>
          {placeholder || "Kies..."}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
