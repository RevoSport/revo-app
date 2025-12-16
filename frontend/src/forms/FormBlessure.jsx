// =====================================================
// FILE: src/forms/FormBlessure.jsx
// Revo Sport — Blessure toevoegen (met patiënt-dropdown en Revo-stijl)
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

export default function FormBlessure() {
  const [formData, setFormData] = useState({
    patient_id: "",
    zijde: "",
    etiologie: "",
    operatie: "",
    arts: "Dr. ",
    therapeut: "",
    datum_ongeval: "",
    datum_operatie: "",
    monoloop: "",
    bijkomende_letsels: "",
    sport: "",
    sportniveau: "",
  });

  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [artsen, setArtsen] = useState([]);
  const [therapeuten, setTherapeuten] = useState([]);
  const [sporten, setSporten] = useState([]);

// 🔹 Formatter arts: Dr. Achternaam V. (ondersteunt meerdere achternamen)
const formatArts = (input) => {
  if (!input) return "Dr. ";

  // strip alle Dr-varianten aan het begin
  let raw = input.replace(/^(dr\.?\s*)+/i, "");

  // behoud typing-spatie
  const endsWithSpace = raw.endsWith(" ");

  const val = raw.trim();
  if (!val) return "Dr. ";

  const parts = val.split(/\s+/);

  // Alle woorden = naam (achternaam + voornaam)
  const naam = parts
    .map(
      (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    )
    .join(" ");

  // laat trailing spatie toe tijdens typen
  return `Dr. ${naam}${endsWithSpace ? " " : ""}`;
};

// 🔹 Formatter naam (sport / therapeut): behoud spaties + Capitalize Words
const formatNaam = (input) => {
  if (!input) return "";

  const endsWithSpace = input.endsWith(" ");
  const val = input.trim();
  if (!val) return "";

  const naam = val
    .split(/\s+/)
    .map(
      (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    )
    .join(" ");

  return naam + (endsWithSpace ? " " : "");
};


  // 🔹 Ophalen van patiënten en blessure-opties
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, blessureOpts, artsenData, therapeutenData, sportenData] =
          await Promise.all([
            apiGet("/patients/names"),
            apiGet("/blessure/options"),
            apiGet("/blessure/artsen"),
            apiGet("/blessure/therapeuten"),
            apiGet("/blessure/sporten"),
          ]);

        // Sorteer patiënten alfabetisch
        const sortedPatients = Array.isArray(patientsData)
          ? [...patientsData].sort((a, b) => a.naam.localeCompare(b.naam))
          : [];
        setPatients(sortedPatients);
        setOptions(blessureOpts || {});
        setArtsen(Array.isArray(artsenData) ? artsenData : []);
        setTherapeuten(Array.isArray(therapeutenData) ? therapeutenData : []);
        setSporten(Array.isArray(sportenData) ? sportenData : []);
      } catch (err) {
        console.error("❌ Fout bij laden formulierdata:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Inputveranderingen
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "arts") {
    setFormData((prev) => ({
      ...prev,
      arts: formatArts(value),
    }));
    return;
  }

  if (name === "sport" || name === "therapeut") {
    setFormData((prev) => ({
      ...prev,
      [name]: formatNaam(value),
    }));
    return;
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
};



  // 🔹 Opslaan
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPost("/blessure", formData);
      setFormData({
        patient_id: "",
        zijde: "",
        etiologie: "",
        operatie: "",
        arts: "Dr. ",
        therapeut: "",
        datum_operatie: "",
        sport: "",
        sportniveau: "",
      });
      setStatusMsg({ type: "success", msg: "✅ Blessure succesvol opgeslagen" });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error("❌ API-fout:", err);
      setStatusMsg({ type: "error", msg: "❌ Fout bij opslaan" });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <motion.div
      className="form-blessure-wrapper"
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
        Blessure toevoegen
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 🔹 Patiënt selecteren */}
        <SelectField
          label="Patiënt"
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          options={patients.map((p) => ({
            value: p.patient_id,
            label: p.naam,
          }))}
          placeholder="Selecteer patiënt"
          required
        />

        {/* 🔹 Sport & Sportniveau naast elkaar */}
          <div
            className="form-row"
            style={{ display: "flex", gap: "16px", width: "100%" }}
          >

          <div style={{ flex: 1 }}>
            <FormComboBox
              label="Sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              options={sporten}
              listId="sporten-list"
              placeholder="Kies of voeg sport toe"
            />
          </div>
          <div style={{ flex: 1 }}>
            <SelectField
              label="Sportniveau"
              name="sportniveau"
              value={formData.sportniveau}
              onChange={handleChange}
              options={(options.sportniveau || []).map((opt) => ({
                value: opt,
                label: opt,
              }))}
              placeholder="Kies niveau"
            />
          </div>
        </div>

        {/* 🔹 Zijde & Etiologie naast elkaar */}
          <div
            className="form-row"
            style={{ display: "flex", gap: "16px", width: "100%" }}
          >

          <div style={{ flex: 1 }}>
            <SelectField
              label="Zijde"
              name="zijde"
              value={formData.zijde}
              onChange={handleChange}
              options={(options.zijde || []).map((opt) => ({
                value: opt,
                label: opt,
              }))}
              placeholder="Kies zijde"
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <SelectField
              label="Etiologie"
              name="etiologie"
              value={formData.etiologie}
              onChange={handleChange}
              options={(options.etiologie || []).map((opt) => ({
                value: opt,
                label: opt,
              }))}
              placeholder="Kies type"
            />
          </div>
        </div>
        
          {/* 🔹 Bijkomende letsels */}
            <SelectField
              label="Bijkomende letsels"
              name="bijkomende_letsels"
              value={formData.bijkomende_letsels}
              onChange={handleChange}
              options={(options.bijkomende_letsels || []).map((opt) => ({
                value: opt,
                label: opt,
              }))}
              placeholder="Kies"
            />


          {/* 🔹 Type operatie & Monoloop */}
          <div
            className="form-row"
            style={{ display: "flex", gap: "16px", width: "100%" }}
          >
            <div style={{ flex: 1 }}>
              <SelectField
                label="Type operatie"
                name="operatie"
                value={formData.operatie}
                onChange={handleChange}
                options={(options.operatie || []).map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                placeholder="Selecteer type"
              />
            </div>

            <div style={{ flex: 1 }}>
              <SelectField
                label="Monoloop"
                name="monoloop"
                value={formData.monoloop}
                onChange={handleChange}
                options={[
                  { value: "Ja", label: "Ja" },
                  { value: "Nee", label: "Nee" },
                ]}
                placeholder="Kies"
              />
            </div>
          </div>


        {/* 🔹 Arts & Therapeut naast elkaar */}
          <div
            className="form-row"
            style={{ display: "flex", gap: "16px", width: "100%" }}
          >

          <div style={{ flex: 1 }}>
            <FormComboBox
              label="Arts"
              name="arts"
              value={formData.arts}
              onChange={handleChange}
              options={artsen}
              listId="artsen-list"
              placeholder="Kies of voeg arts toe"
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormComboBox
              label="Therapeut"
              name="therapeut"
              value={formData.therapeut}
              onChange={handleChange}
              options={therapeuten}
              listId="therapeuten-list"
              placeholder="Kies of voeg therapeut toe"
            />
          </div>
        </div>

        {/* 🔹 Datum ongeval & Datum operatie */}
        <div
          className="form-row"
          style={{ display: "flex", gap: "16px", width: "100%" }}
        >
          <div style={{ flex: 1 }}>
            <FormField
              label="Datum ongeval"
              name="datum_ongeval"
              type="date"
              value={formData.datum_ongeval}
              onChange={handleChange}
            />
          </div>

          <div style={{ flex: 1 }}>
            <FormField
              label="Datum operatie"
              name="datum_operatie"
              type="date"
              value={formData.datum_operatie}
              onChange={handleChange}
            />
          </div>
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
              letterSpacing: "0.4px",
            }}
          >
            {statusMsg.msg}
          </motion.p>
        )}
      </AnimatePresence>

      <style>{`
        input::placeholder,
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

        /* Container zoals mobile versie */
  @media (max-width: 768px) {

  .form-blessure-wrapper {
    padding: 20px 30px 80px !important;
    max-width: 100% !important;
    margin: 0 !important;

    /* 🔥 KADER VOLLEDIG UIT */
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .form-blessure-wrapper h2 {
    display: none !important;

  .form-row {
    flex-direction: column !important;
    gap: 0 !important;
  }
}

    `}</style>

    </motion.div>
  );
}

// =====================================================
// 🔹 Subcomponenten
// =====================================================
function FormField({ label, name, value, onChange, type = "text", placeholder, required }) {
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
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder, required }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>
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

function FormComboBox({ label, name, value, onChange, options, listId, placeholder }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", color: COLOR_MUTED, fontSize: 13, marginBottom: 6 }}>
        {label}
      </label>

      <input
        list={listId}
        name={name}
        value={value || ""}
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

      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}
