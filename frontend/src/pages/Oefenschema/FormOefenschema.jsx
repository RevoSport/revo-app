// =====================================================
// FILE: src/pages/Oefenschema/FormOefenschema.jsx
// Revo Sport — Nieuw Oefenschema (OneDrive v2 volledig geïntegreerd)
// =====================================================

import React, { useState, useEffect } from "react";
import { apiGet, apiFetch } from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

// =====================================================
// 📌 Datum helpers (UI ↔ backend)
// =====================================================
function toISO(dmy) {
  if (!dmy || !dmy.includes("/")) return dmy;
  const [d, m, y] = dmy.split("/");
  return `${y}-${m}-${d}`;
}

function toDMY(iso) {
  if (!iso || !iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function smoothAutoGrow(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// =====================================================
// 📌 OneDrive normalize
// =====================================================
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

function normalizeFotoUrl(url) {
  if (!url) return null;

  if (url.includes("/media/file?path=")) return url;

  if (url.startsWith("RevoSport/")) {
    return `${API_BASE_URL}/media/file?path=${encodeURIComponent(url)}&t=${Date.now()}`;
  }

  if (url.includes("revosportgent-my.sharepoint.com")) {
    const m = url.match(/root:(.*):\/content/);
    if (m && m[1]) {
      const rel = m[1].replace(/^\/+/, "");
      return `${API_BASE_URL}/media/file?path=${encodeURIComponent(rel)}&t=${Date.now()}`;
    }
    if (url.includes("/Documents/")) {
      const rel = url.split("/Documents/").pop();
      return `${API_BASE_URL}/media/file?path=${encodeURIComponent(rel)}&t=${Date.now()}`;
    }
    return url;
  }

  if (url.startsWith("http")) return url;

  return `${API_BASE_URL}/media/file?path=${encodeURIComponent(url)}&t=${Date.now()}`;
}

// =====================================================
// 📌 UI constants
// =====================================================
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

// =====================================================
// 📌 FRONTEND → OneDrive UPLOAD CALLS
// =====================================================
async function generateSchemaPDF(schemaId, updateProgress) {
  const res = await apiFetch(`/pdf/schema/${schemaId}`, {
    method: "POST",
  });

  if (!res || res.status !== "ok") {
    throw new Error("PDF-generatie mislukt");
  }

  updateProgress();
  return res.path;
}

// =====================================================
// 📌 Component
// =====================================================
export default function FormOefenschema() {
  const todayISO = new Date().toISOString().split("T")[0];
  const todayDMY = toDMY(todayISO);

  const [isDirty, setIsDirty] = useState(true);
  const [formData, setFormData] = useState({
    patient_id: "",
    datum: todayDMY,
    created_by: localStorage.getItem("user_name") || "Therapeut",
  });

  const [patients, setPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [exercises, setExercises] = useState([
    {
      sets: "",
      reps: "",
      tempo: "",
      gewicht: "",
      opmerking: "",
      foto1: null,
      foto2: null,
      volgorde: "1",
    },
  ]);

  const [statusMsg, setStatusMsg] = useState(null);
  const [savedSchemaId, setSavedSchemaId] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    done: 0,
    total: 1, // alleen PDF nu
  });

  // =====================================================
  // 📌 Data ophalen
  // =====================================================
  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await apiGet("/oefenschema/patient/");
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => a.naam.localeCompare(b.naam));
          setPatients(sorted);
        }
      } catch (err) {
        console.error("❌ Patienten laden:", err);
      }
    }
    loadPatients();
  }, []);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await apiGet("/oefenschema/templates/");
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => a.naam.localeCompare(b.naam));
          setTemplates(sorted);
        }
      } catch (err) {
        console.error("❌ Templates laden:", err);
      }
    }
    loadTemplates();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll("textarea[data-autogrow]").forEach((ta) => smoothAutoGrow(ta));
    }, 50);
  }, [exercises]);

  // =====================================================
  // 📌 Form handlers
  // =====================================================
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsDirty(true);
    setSavedSchemaId(null);
  }

  function handleExerciseFieldChange(idx, field, value) {
    setExercises((prev) => {
      const copy = [...prev];
      const ex = copy[idx];

      if (field === "foto1" || field === "foto2") {
        if (value instanceof File) ex[field] = value;
      } else {
        ex[field] = value;
      }

      setIsDirty(true);
      setSavedSchemaId(null);
      return copy;
    });
  }

  function removeExerciseBlock(index) {
    setExercises((prev) =>
      prev.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, volgorde: `${i + 1}` }))
    );
    setIsDirty(true);
    setSavedSchemaId(null);
  }

  // =====================================================
  // 📌 HANDLE SUBMIT (OneDrive-v2 Flow)
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setStatusMsg(null);

      const fotoUploads = [];
      exercises.forEach((ex, idx) => {
        if (ex.foto1 instanceof File) fotoUploads.push({ idx, slot: 1, file: ex.foto1 });
        if (ex.foto2 instanceof File) fotoUploads.push({ idx, slot: 2, file: ex.foto2 });
      });

      const form = new FormData();
      form.append("patient_id", formData.patient_id);
      form.append("datum", toISO(formData.datum));
      form.append("created_by", formData.created_by);

      form.append(
        "oefeningen_json",
        JSON.stringify(
          exercises.map((ex, i) => ({
            sets: ex.sets || null,
            reps: ex.reps || null,
            tempo: ex.tempo || "",
            gewicht: ex.gewicht || "",
            opmerking: ex.opmerking || "",
            volgorde: `${i + 1}`,
            foto1: typeof ex.foto1 === "string" ? ex.foto1 : null,
            foto2: typeof ex.foto2 === "string" ? ex.foto2 : null,
          }))
        )
      );

      fotoUploads.forEach(({ idx, slot, file }) => {
        form.append("files", file, `foto${slot}_${idx}.jpg`);
      });

      const saved = await apiFetch("/oefenschema/schemas/create", {
        method: "POST",
        body: form,
      });


      if (!saved || !saved.id) throw new Error("Schema kon niet opgeslagen worden.");

      const schemaId = saved.id;
      setSavedSchemaId(schemaId);

      await generateSchemaPDF(schemaId, () =>
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }))
      );

      setStatusMsg({ type: "success", msg: "Schema opgeslagen." });
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", msg: "Er ging iets mis." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // =====================================================
  // 📌 UI Rendering
  // =====================================================
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: COLOR_BG,
          borderRadius: 12,
          padding: "40px 60px",
          maxWidth: 1000,
          margin: "0 auto 80px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: COLOR_TEXT,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 25,
            letterSpacing: 1,
          }}
        >
          Nieuw oefenschema
        </h2>

        <form onSubmit={handleSubmit}>
          {/* PATIËNT + DATUM */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "calc(50% - 8px)", marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  color: COLOR_MUTED,
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Patiënt
              </label>

              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    patient_id: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#222",
                  color: formData.patient_id ? "#fff" : COLOR_PLACEHOLDER,
                  fontSize: 14,
                }}
              >
                <option value="">Selecteer patiënt</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.naam}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="Datum"
              name="datum"
              type="text"
              value={formData.datum}
              onChange={handleChange}
              placeholder="DD/MM/YYYY"
            />
          </div>

          {/* TEMPLATE KEUZE */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                color: COLOR_MUTED,
                fontSize: 13,
                marginBottom: 18,
                marginTop: 30,
              }}
            >
              Oefeningen
            </label>

            <select
              value={selectedTemplate}
              onChange={async (e) => {
                const id = e.target.value;

                if (!id) {
                  setSelectedTemplate("");
                  setExercises([
                    {
                      sets: "",
                      reps: "",
                      tempo: "",
                      gewicht: "",
                      opmerking: "",
                      foto1: null,
                      foto2: null,
                      volgorde: "1",
                    },
                  ]);
                  setStatusMsg({ type: "info", msg: "Template gewist." });
                  setTimeout(() => setStatusMsg(null), 2200);
                  return;
                }

                try {
                  const data = await apiGet(`/oefenschema/templates/${id}`);
                  setSelectedTemplate(id);

                  if (data && Array.isArray(data.oefeningen)) {
                    setExercises(
                      data.oefeningen.map((o, i) => ({
                        sets: o.sets || "",
                        reps: o.reps || "",
                        tempo: o.tempo || "",
                        gewicht: o.gewicht || "",
                        opmerking: o.opmerking || "",
                        volgorde: `${i + 1}`,
                        foto1: o.foto1 ? normalizeFotoUrl(o.foto1) : null,
                        foto2: o.foto2 ? normalizeFotoUrl(o.foto2) : null,
                      }))
                    );
                  }

                  setStatusMsg({
                    type: "success",
                    msg: "Template geladen.",
                  });
                  setTimeout(() => setStatusMsg(null), 2000);
                } catch (err) {
                  console.error(err);
                  setStatusMsg({
                    type: "error",
                    msg: "Fout bij laden template.",
                  });
                }
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#222",
                color: selectedTemplate ? "#fff" : COLOR_PLACEHOLDER,
                marginTop: 8,
              }}
            >
              <option value="">Selecteer template (optioneel)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.naam}
                </option>
              ))}
            </select>
          </div>

          {/* OEFENINGEN */}
          {exercises.map((ex, index) => (
            <ExerciseCard
              key={index}
              ex={ex}
              index={index}
              handleExerciseFieldChange={handleExerciseFieldChange}
              normalizeFotoUrl={normalizeFotoUrl}
              removeExerciseBlock={removeExerciseBlock}
            />
          ))}

          {/* OEFENING TOEVOEGEN */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setExercises([
                  ...exercises,
                  {
                    sets: "",
                    reps: "",
                    tempo: "",
                    gewicht: "",
                    opmerking: "",
                    foto1: null,
                    foto2: null,
                    volgorde: `${exercises.length + 1}`,
                  },
                ]);
                setIsDirty(true);
                setSavedSchemaId(null);
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "10px 16px",
                color: "#ccc",
                borderRadius: 10,
                fontSize: 13,
              }}
            >
              + Oefening toevoegen
            </motion.button>
          </div>

          {/* OPSLAAN + MAIL */}
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <motion.button
              whileHover={isDirty ? { scale: 1.02 } : {}}
              whileTap={isDirty ? { scale: 0.98 } : {}}
              type="submit"
              disabled={!isDirty}
              style={{
                flex: 1,
                border: `1px solid ${COLOR_ACCENT}`,
                background: "transparent",
                padding: "10px 16px",
                color: isDirty ? COLOR_ACCENT : "rgba(255,255,255,0.3)",
                borderRadius: 10,
                cursor: isDirty ? "pointer" : "not-allowed",
              }}
            >
              {isDirty ? "Opslaan" : "Opgeslagen"}
            </motion.button>

            <motion.button
              whileHover={savedSchemaId ? { scale: 1.02 } : {}}
              whileTap={savedSchemaId ? { scale: 0.98 } : {}}
              type="button"
              disabled={!savedSchemaId}
              onClick={async () => {
                try {
                  setIsSaving(true);
                  setStatusMsg({
                    type: "info",
                    msg: "E-mail verzenden...",
                  });

                  const res = await apiFetch(`/oefenschema/mail/${savedSchemaId}`, {
                    method: "POST",
                  });

                  if (!res || res.status !== "ok") throw new Error();

                  setStatusMsg({
                    type: "success",
                    msg: "E-mail verzonden",
                  });
                } catch {
                  setStatusMsg({
                    type: "error",
                    msg: "Mailen mislukt",
                  });
                } finally {
                  setIsSaving(false);
                  setTimeout(() => setStatusMsg(null), 2500);
                }
              }}
              style={{
                flex: 1,
                border: `1px solid ${COLOR_ACCENT}`,
                background: "transparent",
                padding: "10px 16px",
                color: savedSchemaId ? COLOR_ACCENT : "rgba(255,255,255,0.3)",
                borderRadius: 10,
                cursor: savedSchemaId ? "pointer" : "not-allowed",
              }}
            >
              Mail
            </motion.button>
          </div>
        </form>

        {/* STATUS MESSAGE */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: "center", marginTop: 22 }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color:
                    statusMsg.type === "success"
                      ? "#ffffff"
                      : statusMsg.type === "info"
                      ? COLOR_ACCENT
                      : "#ff4d4d",
                }}
              >
                {statusMsg.msg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADER OVERLAY */}
        {isSaving && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(3px)",
              zIndex: 3000,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: COLOR_ACCENT,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.25)",
                borderTopColor: COLOR_ACCENT,
                animation: "spin 1s linear infinite",
                marginBottom: 20,
              }}
            />
            Uploading... {uploadProgress.done}/{uploadProgress.total}
          </div>
        )}
      </motion.div>
    </>
  );
}

// =====================================================
// 📌 SUBCOMPONENTEN
// =====================================================
function FormField({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ flex: 1, minWidth: "calc(50% - 8px)", marginBottom: 18 }}>
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
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          background: "#222",
          border: "1px solid rgba(255,255,255,0.1)",
          color: value ? "#fff" : COLOR_PLACEHOLDER,
          fontSize: 14,
        }}
      />
    </div>
  );
}

function ExerciseCard({
  ex,
  index,
  handleExerciseFieldChange,
  normalizeFotoUrl,
  removeExerciseBlock,
}) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Sets"
          value={ex.sets}
          onChange={(e) => handleExerciseFieldChange(index, "sets", e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Reps"
          value={ex.reps}
          onChange={(e) => handleExerciseFieldChange(index, "reps", e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Tempo"
          value={ex.tempo}
          onChange={(e) => handleExerciseFieldChange(index, "tempo", e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Gewicht"
          value={ex.gewicht}
          onChange={(e) => handleExerciseFieldChange(index, "gewicht", e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Opmerking */}
      <textarea
        placeholder="Opmerking (optioneel)"
        data-autogrow
        value={ex.opmerking}
        onInput={(e) => smoothAutoGrow(e.target)}
        onChange={(e) => handleExerciseFieldChange(index, "opmerking", e.target.value)}
        style={{
          width: "100%",
          minHeight: 40,
          marginTop: 10,
          padding: "8px 10px",
          background: "#222",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          color: "#fff",
          fontFamily: "'Open Sans', sans-serif",
          resize: "none",
          overflow: "hidden",
        }}
      />

      {/* Foto's */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {[1, 2].map((slot) => (
          <label
            key={slot}
            style={{
              flex: 1,
              background: "#222",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              padding: "16px 10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {!ex[`foto${slot}`] && <span style={{ opacity: 0.7 }}>Foto {slot} toevoegen</span>}

            <input
              type="file"
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={(e) =>
                handleExerciseFieldChange(index, `foto${slot}`, e.target.files[0])
              }
            />

            {ex[`foto${slot}`] && (
              <img
                src={
                  typeof ex[`foto${slot}`] === "object"
                    ? URL.createObjectURL(ex[`foto${slot}`])
                    : normalizeFotoUrl(ex[`foto${slot}`])
                }
                alt="preview"
                style={{
                  marginTop: 8,
                  maxHeight: 100,
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            )}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => removeExerciseBlock(index)}
        style={{
          background: "transparent",
          border: "none",
          marginTop: 15,
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
          fontFamily: "'Open Sans', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Trash2 size={13} /> Verwijder oefening
      </button>
    </div>
  );
}

const inputStyle = {
  background: "#222",
  color: "#fff",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  padding: "8px 10px",
};
