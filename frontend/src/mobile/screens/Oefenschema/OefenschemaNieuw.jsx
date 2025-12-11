// =====================================================
// FILE: src/mobile/screens/Oefenschema/OefenschemaNieuw.jsx
// Revo Sport — Mobile oefenschema maken (OneDrive A-flow)
// =====================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { PuffLoader } from "react-spinners";
import { apiGet, apiFetch } from "../../../api";

// =====================================================
// Helpers
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

function buildUploadName(idx, slot) {
  return `foto${slot}_${idx}.jpg`;
}

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

function normalizeFotoUrl(url) {
  if (!url) return null;
  if (url.includes("/media/file?path=")) return url;
  if (url.startsWith("RevoSport/"))
    return `${API_BASE_URL}/media/file?path=${encodeURIComponent(
      url
    )}&t=${Date.now()}`;
  return url;
}

function extractRawPath(url) {
  if (!url) return null;
  if (url instanceof File) return null;
  if (!url.includes("path=")) return url;
  try {
    const raw = decodeURIComponent(url.split("path=")[1].split("&")[0]);
    return raw;
  } catch {
    return null;
  }
}

async function generateSchemaPDF(schemaId) {
  const res = await apiFetch(`/oefenschema/pdf/schema/${schemaId}`, {
    method: "GET",
  });
  if (!res || res.status !== "ok") throw new Error("PDF mislukt");
  return res.path;
}

// =====================================================
// ADD: VALIDATIE FUNCTIE (zelfde principe als desktop)
// =====================================================
function isMobileFormValid(formData, exercises) {
  const validPatient =
    formData.patient_id && !isNaN(Number(formData.patient_id));
  const validDate = !!formData.datum;
  const validExercises =
    Array.isArray(exercises) && exercises.length > 0;

  return validPatient && validDate && validExercises;
}

// =====================================================
// Kleuren
// =====================================================
const COLOR_ACCENT = "#FF7900";
const COLOR_CARD = "#1D1D1D";
const COLOR_TEXT = "#FFFFFF";
const COLOR_MUTED = "#C9C9C9";

export default function OefenschemaNieuw() {
  const todayDMY = toDMY(new Date().toISOString().split("T")[0]);

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
      volgorde: 1,
    },
  ]);

  const [statusMsg, setStatusMsg] = useState(null);
  const [savedSchemaId, setSavedSchemaId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle");

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ naam: "", email: "" });

  // Load patienten + templates
  useEffect(() => {
    (async () => {
      try {
        const p = await apiGet("/oefenschema/patient/");
        setPatients([...p].sort((a, b) => a.naam.localeCompare(b.naam)));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const t = await apiGet("/oefenschema/templates/");
        setTemplates([...t].sort((a, b) => a.naam.localeCompare(b.naam)));
      } catch {}
    })();
  }, []);

  // AUTO-GROW textarea's opnieuw meten bij elke wijziging in oefeningen
  useEffect(() => {
    setTimeout(() => {
      document
        .querySelectorAll("textarea[data-autogrow]")
        .forEach((ta) => smoothAutoGrow(ta));
    }, 30);
  }, [exercises]);


  // Template laden
  async function loadTemplate(id) {
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
          volgorde: 1,
        },
      ]);
      return;
    }

    try {
      const data = await apiGet(`/oefenschema/templates/${id}`);
      setSelectedTemplate(id);

      setExercises(
        data.oefeningen.map((o, i) => ({
          sets: o.sets || "",
          reps: o.reps || "",
          tempo: o.tempo || "",
          gewicht: o.gewicht || "",
          opmerking: o.opmerking || "",
          volgorde: i + 1,
          template_id: o.id,
          foto1: extractRawPath(o.foto1),
          foto2: extractRawPath(o.foto2),
        }))
      );
    } catch (e) {
      setStatusMsg({ type: "error", msg: "Template laden mislukt" });
    }
  }

  function updateField(e) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSavedSchemaId(null);
  }

  function updateExercise(i, field, value) {
    setExercises((prev) => {
      const copy = [...prev];
      if (field === "foto1" || field === "foto2") {
        if (value instanceof File) {
          const slot = field === "foto1" ? 1 : 2;
          const renamed = new File([value], buildUploadName(i, slot), {
            type: value.type,
          });
          copy[i][field] = renamed;
        } else {
          copy[i][field] = value;
        }
      } else {
        copy[i][field] = value;
      }
      return copy;
    });
    setSavedSchemaId(null);
  }

  function removeExercise(i) {
    setExercises((prev) =>
      prev
        .filter((_, idx) => idx !== i)
        .map((o, idx) => ({ ...o, volgorde: idx + 1 }))
    );
    setSavedSchemaId(null);
  }

  // -----------------------------------------------------
  // SAVE
  // -----------------------------------------------------
  async function handleSave() {
    if (!isMobileFormValid(formData, exercises)) return;

    try {
      setIsSaving(true);
      setUploadStage("upload");

      const fd = new FormData();
      fd.append("patient_id", formData.patient_id);
      fd.append("datum", toISO(formData.datum));
      fd.append("created_by", formData.created_by);

      fd.append(
        "oefeningen_json",
        JSON.stringify(
          exercises.map((ex, i) => ({
            sets: ex.sets || null,
            reps: ex.reps || null,
            tempo: ex.tempo || "",
            gewicht: ex.gewicht || "",
            opmerking: ex.opmerking || "",
            volgorde: i + 1,
            template_id: ex.template_id || null,
            foto1: ex.foto1 instanceof File ? null : extractRawPath(ex.foto1),
            foto2: ex.foto2 instanceof File ? null : extractRawPath(ex.foto2),
          }))
        )
      );

      exercises.forEach((ex, i) => {
        if (ex.foto1 instanceof File)
          fd.append("files", ex.foto1, buildUploadName(i, 1));
        if (ex.foto2 instanceof File)
          fd.append("files", ex.foto2, buildUploadName(i, 2));
      });

      const saved = await apiFetch("/oefenschema/schemas/create", {
        method: "POST",
        body: fd,
      });

      if (!saved?.id) throw new Error();

      setUploadStage("pdf");
      await generateSchemaPDF(saved.id);

      setUploadStage("done");
      setSavedSchemaId(saved.id);
      setStatusMsg({ type: "success", msg: "Schema opgeslagen" });
    } catch {
      setStatusMsg({ type: "error", msg: "Opslaan mislukt" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 2000);
    }
  }

  // -----------------------------------------------------
  // MAIL
  // -----------------------------------------------------
  async function sendMail() {
    if (!savedSchemaId) return;
    setIsSaving(true);
    try {
      const r = await apiFetch(`/oefenschema/mail/${savedSchemaId}`, {
        method: "POST",
      });
      if (r?.status !== "ok") throw new Error();
      setStatusMsg({ type: "success", msg: "E-mail verzonden" });
    } catch {
      setStatusMsg({ type: "error", msg: "Mailen mislukt" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 2000);
    }
  }

  // -----------------------------------------------------
  // UI RENDER
  // -----------------------------------------------------
  return (
    <div style={{ padding: 20, color: COLOR_TEXT }}>
      {/* PATIËNT */}
      <div style={{ marginBottom: 18 }}>
        <label
            style={{
              fontSize: 13,
              color: COLOR_MUTED,
              marginBottom: 6,     // <— toegevoegd
              display: "block"     // <— garandeert correcte spacing
            }}
          >
            Patiënt
          </label>


        <div style={{ display: "flex", gap: 10 }}>
          <select
            name="patient_id"
            value={formData.patient_id}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                patient_id: Number(e.target.value),
              }))
            }
            style={{
              ...selectStyle,
              flex: 1,
            }}
          >
            <option value="">Selecteer patiënt</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naam}
              </option>
            ))}
          </select>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setShowAddPatient(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              background: "transparent",
              border: `1px solid ${COLOR_ACCENT}`,
              color: COLOR_ACCENT,
              fontSize: 22,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </motion.button>
        </div>
      </div>

      {/* DATUM */}
      <div style={{ marginBottom: 18 }}>
        <label
          style={{
            fontSize: 13,
            color: COLOR_MUTED,
            marginBottom: 6,     // <— toegevoegd
            display: "block"     // <— garandeert correcte spacing
          }}
        >
          Datum
        </label>

        <input
          type="text"
          name="datum"
          value={formData.datum}
          onChange={updateField}
          placeholder="DD/MM/YYYY"
          style={inputStyle}
        />
      </div>

      {/* TEMPLATE SELECT */}
      <div style={{ marginBottom: 18 }}>
        <label
          style={{
            fontSize: 13,
            color: COLOR_MUTED,
            marginBottom: 6,     // <— toegevoegd
            display: "block"     // <— garandeert correcte spacing
          }}
        >
          Template (optioneel)
        </label>

        <select
          value={selectedTemplate}
          onChange={(e) => loadTemplate(e.target.value)}
          style={selectStyle}
        >
          <option value="">Geen</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.naam}
            </option>
          ))}
        </select>
      </div>

      {/* OEFENINGEN */}
      {exercises.map((ex, i) => (
        <ExerciseCardMobile
          key={i}
          index={i}
          ex={ex}
          onUpdate={updateExercise}
          onRemove={removeExercise}
        />
      ))}

      {/* TOEVOEGEN */}
{/* OEFENING TOEVOEGEN – zelfde stijl als desktop */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: 22,
  }}
>
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={() => {
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
          volgorde: prev.length + 1,
        },
      ]);
      // Mobile versie heeft geen isDirty, dus niets extra:
      setSavedSchemaId(null);
    }}
    style={{
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.2)",
      padding: "10px 16px",
      color: "#ccc",
      borderRadius: 10,
      fontSize: 13,
      width: "100%", // mobile-friendly breedte
      maxWidth: 300, // mooi gecentreerd
    }}
  >
    + Oefening toevoegen
  </motion.button>
</div>


      {/* SAVE BUTTON — NOW WITH DESKTOP LOGIC */}
 <div
  style={{
    display: "flex",
    gap: 10,
    marginTop: 18,
  }}
>
  <motion.button
    whileHover={isMobileFormValid(formData, exercises) ? { scale: 1.02 } : {}}
    whileTap={isMobileFormValid(formData, exercises) ? { scale: 0.98 } : {}}
    onClick={handleSave}
    disabled={!isMobileFormValid(formData, exercises)}
    style={{
      ...saveBtn,
      flex: 1,                         // <— naast elkaar
      opacity: isMobileFormValid(formData, exercises) ? 1 : 0.4,
      cursor: isMobileFormValid(formData, exercises)
        ? "pointer"
        : "not-allowed",
    }}
  >
    Opslaan
  </motion.button>

  <motion.button
    whileHover={savedSchemaId ? { scale: 1.02 } : {}}
    whileTap={savedSchemaId ? { scale: 0.98 } : {}}
    onClick={sendMail}
    disabled={!savedSchemaId}
    style={{
      ...saveBtn,
      flex: 1,                         // <— naast elkaar
      opacity: savedSchemaId ? 1 : 0.4,
      cursor: savedSchemaId ? "pointer" : "not-allowed",
    }}
  >
    Mail
  </motion.button>
</div>


      {/* STATUS */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ textAlign: "center", marginTop: 20 }}
          >
            <p
              style={{
                fontSize: 13,
                color:
                  statusMsg.type === "success"
                    ? "#fff"
                    : statusMsg.type === "error"
                    ? "#ff4d4d"
                    : COLOR_ACCENT,
              }}
            >
              {statusMsg.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADER */}
      {isSaving && (
        <div style={loaderOverlay}>
          <PuffLoader color={COLOR_ACCENT} size={80} />
          <p style={{ marginTop: 20 }}>
            {uploadStage === "upload" && "Foto's uploaden..."}
            {uploadStage === "pdf" && "PDF genereren..."}
            {uploadStage === "done" && "Klaar..."}
          </p>
        </div>
      )}
    {/* ================================
    MOBILE ADD-PATIENT MODAL
================================ */}
<AnimatePresence>
  {showAddPatient && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 5000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#1e1e1e",
          padding: 24,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          boxShadow: "0 0 25px rgba(0,0,0,0.4)",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            textTransform: "uppercase",
            fontSize: 15,
            letterSpacing: 0.5,
            marginBottom: 14,
          }}
        >
          Nieuwe patiënt
        </h3>

        <input
          type="text"
          placeholder="Naam"
          value={newPatient.naam}
          onChange={(e) =>
            setNewPatient({ ...newPatient, naam: e.target.value })
          }
          style={{
            width: "100%",
            marginBottom: 12,
            padding: "10px 12px",
            background: "#222",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
          }}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={newPatient.email}
          onChange={(e) =>
            setNewPatient({ ...newPatient, email: e.target.value })
          }
          style={{
            width: "100%",
            marginBottom: 18,
            padding: "10px 12px",
            background: "#222",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
           whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowAddPatient(false);
              setNewPatient({ naam: "", email: "" });
            }}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#bbb",
              cursor: "pointer",
            }}
          >
            Annuleer
          </motion.button>


          <motion.button
            whileHover={newPatient.naam && newPatient.email ? { scale: 1.02 } : {}}
            whileTap={newPatient.naam && newPatient.email ? { scale: 0.98 } : {}}
            disabled={!newPatient.naam || !newPatient.email}
            onClick={async () => {
              try {
                const fd = new FormData();
                fd.append("naam", newPatient.naam);
                fd.append("email", newPatient.email);

                const res = await apiFetch("/oefenschema/patient/create", {
                  method: "POST",
                  body: fd,
                });

                if (res?.id) {
                  setPatients((prev) =>
                    [...prev, res].sort((a, b) => a.naam.localeCompare(b.naam))
                  );
                  setFormData((p) => ({ ...p, patient_id: res.id }));
                }

                setShowAddPatient(false);
                setNewPatient({ naam: "", email: "" });
              } catch (e) {
                console.error(e);
              }
            }}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "transparent",
              border: `1px solid ${COLOR_ACCENT}`,
              borderRadius: 8,
              color: COLOR_ACCENT,
              cursor:
                !newPatient.naam || !newPatient.email ? "not-allowed" : "pointer",
              opacity:
                !newPatient.naam || !newPatient.email ? 0.5 : 1,
            }}
          >
            Opslaan
          </motion.button>

        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}

// =====================================================
// Exercise Card
// =====================================================
function ExerciseCardMobile({ ex, index, onUpdate, onRemove }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <input
          value={ex.sets}
          onChange={(e) => onUpdate(index, "sets", e.target.value)}
          placeholder="Sets"
          style={inputSmall}
        />

        <input
          value={ex.reps}
          onChange={(e) => onUpdate(index, "reps", e.target.value)}
          placeholder="Reps"
          style={inputSmall}
        />

        <input
          value={ex.tempo}
          onChange={(e) => onUpdate(index, "tempo", e.target.value)}
          placeholder="Tempo"
          style={inputSmall}
        />

        <input
          value={ex.gewicht}
          onChange={(e) => onUpdate(index, "gewicht", e.target.value)}
          placeholder="Gewicht"
          style={inputSmall}
        />
      </div>

      <textarea
        value={ex.opmerking}
        onChange={(e) => onUpdate(index, "opmerking", e.target.value)}
        onInput={(e) => smoothAutoGrow(e.target)}
        placeholder="Opmerking (optioneel)"
        data-autogrow
        style={textareaStyle}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {[1, 2].map((slot) => {
          const field = `foto${slot}`;
          const foto = ex[field];

          return (
            <label key={slot} style={fotoBox}>
              <input
                type="file"
                accept="image/*"
                capture="environment"          // <— CAMERA (achterkant)
                style={{ display: "none" }}
                onChange={(e) => onUpdate(index, field, e.target.files[0])}
              />


              {!foto && (
                <div style={{ opacity: 0.6, fontSize: 12 }}>
                  Foto {slot}
                </div>
              )}

              {foto && (
                <img
                  src={
                    foto instanceof File
                      ? URL.createObjectURL(foto)
                      : normalizeFotoUrl(foto)
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: 100,
                    objectFit: "contain",
                    borderRadius: 6,
                  }}
                />
              )}
            </label>
          );
        })}
      </div>

      <button onClick={() => onRemove(index)} style={deleteBtn}>
        <Trash2 size={12} /> Verwijder
      </button>
    </div>
  );
}

// =====================================================
// Styles
// =====================================================
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#1f1f1f",
  color: "#fff",
  borderRadius: 8,
  border: "1px solid #333",
  fontSize: 13,
};

const selectStyle = {
  ...inputStyle,
  color: "#fff",
};

const inputSmall = {
  flex: 1,
  padding: "10px 10px",
  background: "#1f1f1f",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
};

const textareaStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#1f1f1f",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  fontFamily: "'Open Sans', sans-serif",
  minHeight: 50,
  resize: "none",
  overflow: "hidden",
  marginTop: 10,
};

const cardStyle = {
  background: COLOR_CARD,
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  padding: 16,
  marginBottom: 18,
};

const fotoBox = {
  flex: 1,
  background: "#1f1f1f",
  border: "1px solid #333",
  borderRadius: 8,
  padding: 14,
  textAlign: "center",
  cursor: "pointer",
};

const deleteBtn = {
  marginTop: 12,
  border: "none",
  background: "transparent",
  color: "#bbb",
  fontSize: 13,
  cursor: "pointer",
};

const saveBtn = {
  width: "100%",
  padding: 14,
  background: "transparent",
  border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: 10,
  color: COLOR_ACCENT,
  marginTop: 18,
  fontSize: 13,
  fontWeight: 400,
};

const loaderOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  zIndex: 2000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: COLOR_ACCENT,
};
