// =====================================================
// FILE: src/forms/FormOefenschema.jsx
// Revo Sport — Nieuw Oefenschema (upload + animatie + stijl)
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload } from "lucide-react";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";
const COLOR_CARD = "#222";

export default function FormOefenschema() {
  const [formData, setFormData] = useState({
    patient_id: "",
    datum: "",
    titel: "",
    opmerkingen: "",
    created_by: localStorage.getItem("user_name") || "Therapeut",
  });

  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);

  // 🔹 Patiënten ophalen
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await apiGet("/oefenschema/patient");
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => a.naam.localeCompare(b.naam));
          setPatients(sorted);
        }
      } catch (err) {
        console.error("❌ Fout bij ophalen patiënten:", err);
      }
    };
    fetchPatients();
  }, []);

  // 🔹 Veldwijzigingen
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Oefening toevoegen
  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        naam: "",
        sets: "",
        reps: "",
        tempo: "",
        gewicht: "",
        opmerking: "",
        foto1: null,
        foto2: null,
        volgorde: `${prev.length + 1}`,
      },
    ]);
  };

  // 🔹 Oefening verwijderen
  const removeExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 Oefening wijzigen
  const handleExerciseChange = (index, e) => {
    const { name, value, files } = e.target;
    setExercises((prev) => {
      const updated = [...prev];
      if (files && files[0]) {
        updated[index][name] = files[0];
      } else {
        updated[index][name] = value;
      }
      return updated;
    });
  };

  // 🔹 Preview helper
  const getPreview = (file) => (file ? URL.createObjectURL(file) : null);

// =====================================================
// 🔹 OPSLAAN MET FOTO-UPLOAD (2 FASEN)
// =====================================================
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1️⃣ JSON Payload (zonder foto's)
    const payload = {
      patient_id: formData.patient_id,
      datum: formData.datum,
      titel: formData.titel,
      opmerkingen: formData.opmerkingen,
      created_by: formData.created_by,
      oefeningen: exercises.map((ex, i) => ({
        naam: ex.naam || "",
        sets: ex.sets ? Number(ex.sets) : null,
        reps: ex.reps ? Number(ex.reps) : null,
        tempo: ex.tempo || "",
        gewicht: ex.gewicht || "",
        opmerking: ex.opmerking || "",
        volgorde: `${i + 1}`,
      })),

    };

    // 🔸 POST schema + oefeningen (JSON)
    const response = await fetch(`${process.env.REACT_APP_API_URL}/oefenschema/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Schema opslaan mislukt");
    const savedSchema = await response.json();

    // 2️⃣ Upload foto's per oefening (indien aanwezig)
    for (let i = 0; i < exercises.length; i++) {
      const oef = exercises[i];
      const oef_id = savedSchema.oefeningen?.[i]?.id; // backend geeft deze mee
      if (!oef_id) continue;

      // Foto 1 uploaden
      if (oef.foto1) {
        const formData1 = new FormData();
        formData1.append("foto", oef.foto1);
        await fetch(`${process.env.REACT_APP_API_URL}/oefenschema/upload-foto/${oef_id}`, {
          method: "POST",
          body: formData1,
        });
      }

      // Foto 2 uploaden
      if (oef.foto2) {
        const formData2 = new FormData();
        formData2.append("foto", oef.foto2);
        await fetch(`${process.env.REACT_APP_API_URL}/oefenschema/upload-foto/${oef_id}?slot=2`, {
          method: "POST",
          body: formData2,
        });
      }
    }

    // ✅ Klaar
    setStatusMsg({ type: "success", msg: "✅ Oefenschema succesvol opgeslagen" });
    setTimeout(() => setStatusMsg(null), 3000);
    setExercises([]);
    setFormData({
      patient_id: "",
      datum: "",
      titel: "",
      opmerkingen: "",
      created_by: localStorage.getItem("user_name") || "Therapeut",
    });
  } catch (err) {
    console.error("❌ Fout bij opslaan:", err);
    setStatusMsg({ type: "error", msg: "❌ Fout bij opslaan of upload" });
    setTimeout(() => setStatusMsg(null), 4000);
  }
};


  // =====================================================
  // 🔹 UI
  // =====================================================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "40px 60px",
        maxWidth: "850px",
        margin: "0 auto 80px",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        border: `1px solid rgba(255,255,255,0.08)`,
        color: COLOR_TEXT,
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
        Nieuw oefenschema
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <SelectField
            label="Patiënt"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            options={patients.map((p) => ({
              value: p.id,
              label: p.naam,
            }))}
            placeholder="Selecteer patiënt"
            required
          />

          <FormField label="Datum" name="datum" type="date" value={formData.datum} onChange={handleChange} />

          <FormField
            label="Titel schema"
            name="titel"
            value={formData.titel}
            onChange={handleChange}
            placeholder="Bijv. ‘Knie stabiliteit week 1’"
          />
        </div>

        <FormField
          label="Opmerkingen"
          name="opmerkingen"
          value={formData.opmerkingen}
          onChange={handleChange}
          placeholder="Eventuele notities of instructies..."
        />

        <SectionTitle text="Oefeningen" />
        {exercises.map((ex, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: COLOR_CARD,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 16,
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => removeExercise(index)}
              title="Verwijder oefening"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "none",
                border: "none",
                color: "#ff4d4d",
                cursor: "pointer",
              }}
            >
              <Trash2 size={16} />
            </button>

            <FormField
              label={`Oefening ${index + 1} — Naam`}
              name="naam"
              value={ex.naam}
              onChange={(e) => handleExerciseChange(index, e)}
              placeholder="Naam van oefening"
            />

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {["sets", "reps", "tempo", "gewicht"].map((field) => (
                <FormField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={ex[field]}
                  onChange={(e) => handleExerciseChange(index, e)}
                  placeholder={field === "tempo" ? "2-0-1" : ""}
                />
              ))}
            </div>

            <FormField
              label="Opmerkingen"
              name="opmerking"
              value={ex.opmerking}
              onChange={(e) => handleExerciseChange(index, e)}
              placeholder="Extra uitleg..."
            />

            {/* 📸 Foto upload */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[1, 2].map((n) => (
                <div key={n} style={{ flex: 1, minWidth: "calc(50% - 8px)" }}>
                  <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>
                    Foto {n}
                  </label>
                  <div
                    style={{
                      background: "#333",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {getPreview(ex[`foto${n}`]) ? (
                      <img
                        src={getPreview(ex[`foto${n}`])}
                        alt={`Foto ${n}`}
                        style={{
                          width: "100%",
                          maxHeight: "140px",
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          color: COLOR_PLACEHOLDER,
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 100,
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <Upload size={20} color={COLOR_ACCENT} />
                        <span>Klik om te uploaden</span>
                      </div>
                    )}
                    <input
                      type="file"
                      name={`foto${n}`}
                      accept="image/*"
                      onChange={(e) => handleExerciseChange(index, e)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* ➕ Oefening toevoegen */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addExercise}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            background: "transparent",
            border: `1px dashed ${COLOR_ACCENT}`,
            color: COLOR_ACCENT,
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 12,
            cursor: "pointer",
            fontWeight: 500,
            textTransform: "uppercase",
            fontSize: 13,
          }}
        >
          <Plus size={16} />
          Oefening toevoegen
        </motion.button>

        {/* 💾 Opslaan */}
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
            padding: "10px 16px",
            width: "100%",
            marginTop: "30px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Opslaan
        </motion.button>
      </form>

      {/* ✅ Status */}
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
    </motion.div>
  );
}

// =====================================================
// 🔹 Subcomponenten (zelfde stijl als Maand6)
// =====================================================
function FormField({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ flex: 1, minWidth: "calc(50% - 8px)", marginBottom: "18px" }}>
      <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>{label}</label>
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
      <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>{label}</label>
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
