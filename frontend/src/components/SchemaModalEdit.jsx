// =====================================================
// FILE: src/components/SchemaModalEdit.jsx
// Revo Sport — Oefenschema aanpassen (OneDrive v2 + progress)
// =====================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Mail } from "lucide-react";
import { apiGet, apiFetch } from "../api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

// =====================================================
// FOTO NORMALISATIE — OneDrive interne path → proxied preview
// =====================================================
function normalizeFotoUrl(url) {
  if (!url) return null;

  // V2 geeft interne path terug zoals:
  //   RevoSport/Oefenschema/Schemas/<id>/foto1_0.jpg
  return `${API_BASE_URL}/media/file?path=${encodeURIComponent(
    url
  )}&t=${Date.now()}`;
}

// =====================================================
// AUTOGROW
// =====================================================
function smoothAutoGrow(el) {
  if (!el) return;
  const start = el.offsetHeight;

  el.style.height = "auto";
  const end = el.scrollHeight;

  el.style.transition = "height 120ms ease";
  el.style.height = start + "px";

  requestAnimationFrame(() => {
    el.style.height = end + "px";
  });
}

// =====================================================
// COMPONENT
// =====================================================

export default function SchemaModalEdit({ isOpen, onClose, schemaId, onSaved }) {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [datum, setDatum] = useState("");
  const [exercises, setExercises] = useState([]);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMailing, setIsMailing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  // =====================================================
  // LOAD PATIENTEN BIJ OPENEN
  // =====================================================
  useEffect(() => {
    if (!isOpen) return;
    loadPatients();
  }, [isOpen]);

  async function loadPatients() {
    try {
      const data = await apiGet("/oefenschema/patient");
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Patienten laden mislukt:", err);
    }
  }

  // =====================================================
  // LOAD SCHEMA
  // =====================================================
  useEffect(() => {
    if (!isOpen || !schemaId) return;
    loadSchema();
  }, [isOpen, schemaId]);

  async function loadSchema() {
    try {
      const data = await apiGet(`/oefenschema/${schemaId}`);

      const iso = data?.datum?.slice(0, 10) ?? "";
      setDatum(iso);

      const pid = data.patient_id || (data.patient && data.patient.id) || "";
      setPatientId(pid);

      const oef = (data.oefeningen || []).map((o) => ({
        sets: o.sets || "",
        reps: o.reps || "",
        tempo: o.tempo || "",
        gewicht: o.gewicht || "",
        opmerking: o.opmerking || "",
        volgorde: o.volgorde,
        foto1: o.foto1 ? o.foto1 : null, // interne OneDrive path
        foto2: o.foto2 ? o.foto2 : null,
      }));

      setExercises(oef);
      setIsDirty(false);

      setTimeout(() => {
        document
          .querySelectorAll("textarea[data-autogrow='schema-oef']")
          .forEach((ta) => smoothAutoGrow(ta));
      }, 80);
    } catch (err) {
      console.error("❌ Schema laden mislukt:", err);
    }
  }

  if (!isOpen) return null;

  // =====================================================
  // CRUD OEFENINGEN
  // =====================================================

  function addExercise() {
    setExercises((prev) => [
      ...prev,
      {
        sets: "",
        reps: "",
        tempo: "",
        gewicht: "",
        opmerking: "",
        foto1: null,
        foto2: null,
        volgorde: String(prev.length + 1),
      },
    ]);
    setIsDirty(true);
  }

  function removeExercise(idx) {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((ex, i) => ({ ...ex, volgorde: String(i + 1) }))
    );
    setIsDirty(true);
  }

  function updateField(i, field, value) {
    setExercises((prev) => {
      const out = [...prev];
      out[i][field] = value;
      return out;
    });
    setIsDirty(true);
  }

  function updateFoto(i, slot, fileOrValue) {
    setExercises((prev) => {
      const out = [...prev];
      out[i][slot] = fileOrValue;
      return out;
    });
    setIsDirty(true);
  }

  // =====================================================
  // OPSLAAN — OneDrive v2
  // =====================================================

  async function handleSave() {
    if (!schemaId) return;

    try {
      setIsSaving(true);

      const fotoCount = exercises.reduce(
        (acc, ex) =>
          acc +
          (ex.foto1 instanceof File ? 1 : 0) +
          (ex.foto2 instanceof File ? 1 : 0),
        0
      );

      const total = fotoCount + 2; // JSON + final response
      setUploadProgress({ done: 0, total });

      const step = () =>
        setUploadProgress((p) => ({
          ...p,
          done: Math.min(p.done + 1, p.total),
        }));

      // --- JSON ---
      const jsonExercises = exercises.map((ex, i) => ({
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo,
        gewicht: ex.gewicht,
        opmerking: ex.opmerking,
        volgorde: String(i + 1),
        foto1: typeof ex.foto1 === "string" ? ex.foto1 : null,
        foto2: typeof ex.foto2 === "string" ? ex.foto2 : null,
      }));

      step();

      const form = new FormData();
      form.append("datum", datum);
      form.append("patient_id", String(patientId));
      form.append("data_json", JSON.stringify(jsonExercises));

      exercises.forEach((ex, i) => {
        if (ex.foto1 instanceof File) {
          form.append("files", ex.foto1, `foto1_${i}.jpg`);
          step();
        }
        if (ex.foto2 instanceof File) {
          form.append("files", ex.foto2, `foto2_${i}.jpg`);
          step();
        }
      });

      const res = await apiFetch(`/oefenschema/schema/${schemaId}/formdata`, {
        method: "PUT",
        body: form,
      });
      step();

      if (res?.ok) {
        setIsDirty(false);
        if (onSaved) onSaved();
      } else {
        console.error("❌ Opslaan mislukt:", res);
      }
    } catch (err) {
      console.error("❌ Opslaan exception:", err);
    } finally {
      setIsSaving(false);
    }
  }

  // =====================================================
  // MAIL
  // =====================================================

  async function handleMail() {
    if (!schemaId) return;

    try {
      setIsMailing(true);
      const res = await apiFetch(`/oefenschema/mail/${schemaId}`, {
        method: "POST",
      });

      if (!res.ok) console.error("❌ Mail mislukt:", res);
    } catch (err) {
      console.error("❌ Mail exception:", err);
    } finally {
      setIsMailing(false);
    }
  }

  // =====================================================
  // STYLES
  // =====================================================

  const smallInputStyle = {
    background: "#222",
    color: "#fff",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 14,
  };

  const labelStyle = {
    color: COLOR_MUTED,
    fontSize: 13,
    marginBottom: 6,
    display: "block",
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 2500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: COLOR_BG,
                borderRadius: 14,
                padding: "40px 60px",
                width: "100%",
                maxWidth: 900,
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative",
                color: "#fff",
              }}
            >
              {/* SLUITKNOP */}
              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 18,
                  background: "transparent",
                  border: "none",
                  fontSize: 26,
                  color: "#aaa",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

              <h2
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 25,
                }}
              >
                Oefenschema aanpassen
              </h2>

              {/* PATIËNT */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Patiënt</label>
                <select
                  value={patientId || ""}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    setIsDirty(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#222",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
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

              {/* DATUM */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Datum</label>
                <input
                  type="date"
                  value={datum}
                  onChange={(e) => {
                    setDatum(e.target.value);
                    setIsDirty(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#222",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>

              {/* OEFENINGEN */}
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Oefeningen</label>

                {exercises.map((ex, index) => (
                  <div
                    key={index}
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
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) =>
                          updateField(index, "sets", e.target.value)
                        }
                        style={smallInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) =>
                          updateField(index, "reps", e.target.value)
                        }
                        style={smallInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Tempo"
                        value={ex.tempo}
                        onChange={(e) =>
                          updateField(index, "tempo", e.target.value)
                        }
                        style={smallInputStyle}
                      />
                      <input
                        type="text"
                        placeholder="Gewicht"
                        value={ex.gewicht}
                        onChange={(e) =>
                          updateField(index, "gewicht", e.target.value)
                        }
                        style={smallInputStyle}
                      />
                    </div>

                    <textarea
                      placeholder="Opmerking (optioneel)"
                      data-autogrow="schema-oef"
                      value={ex.opmerking}
                      onInput={(e) => smoothAutoGrow(e.target)}
                      onChange={(e) =>
                        updateField(index, "opmerking", e.target.value)
                      }
                      style={{
                        width: "100%",
                        marginTop: 10,
                        minHeight: 40,
                        background: "#222",
                        border: "1px solid #2a2a2a",
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "#fff",
                        resize: "none",
                        overflow: "hidden",
                      }}
                    />

                    {/* FOTO'S */}
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      {[1, 2].map((slot) => {
                        const key = `foto${slot}`;
                        const val = ex[key];

                        return (
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
                            }}
                          >
                            {!val && (
                              <span style={{ opacity: 0.7 }}>
                                Foto {slot} toevoegen
                              </span>
                            )}

                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) updateFoto(index, key, file);
                              }}
                            />

                            {val && (
                              <img
                                src={
                                  val instanceof File
                                    ? URL.createObjectURL(val)
                                    : normalizeFotoUrl(val)
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
                        );
                      })}
                    </div>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      style={{
                        background: "transparent",
                        border: "none",
                        marginTop: 8,
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} style={{ marginRight: 4 }} />
                      Verwijderen
                    </button>
                  </div>
                ))}

                {/* TOEVOEGEN */}
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addExercise}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#ccc",
                      borderRadius: 10,
                      padding: "10px 16px",
                    }}
                  >
                    + Oefening toevoegen
                  </motion.button>
                </div>
              </div>

              {/* KNOPPEN */}
              <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
                <motion.button
                  whileHover={isDirty && !isSaving ? { scale: 1.02 } : {}}
                  whileTap={isDirty && !isSaving ? { scale: 0.98 } : {}}
                  type="button"
                  disabled={!isDirty || isSaving}
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    border: `1px solid ${COLOR_ACCENT}`,
                    background: "transparent",
                    color: isDirty ? COLOR_ACCENT : "rgba(255,255,255,0.3)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    cursor: isDirty ? "pointer" : "not-allowed",
                  }}
                >
                  {isSaving ? "Opslaan..." : isDirty ? "Opslaan" : "Opgeslagen"}
                </motion.button>

                <motion.button
                  whileHover={!isDirty ? { scale: 1.02 } : {}}
                  whileTap={!isDirty ? { scale: 0.98 } : {}}
                  type="button"
                  disabled={isDirty || isSaving || isMailing}
                  onClick={handleMail}
                  style={{
                    flex: 1,
                    background: COLOR_ACCENT,
                    color: "#000",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 16px",
                    fontWeight: 600,
                    cursor:
                      !isDirty && !isSaving && !isMailing
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  <Mail size={16} />
                  {isMailing ? "Versturen..." : "Mail"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN LOADER */}
      {isSaving && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 3000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
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
    </>
  );
}
