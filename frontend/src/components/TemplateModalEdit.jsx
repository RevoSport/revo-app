// =====================================================
// FILE: src/components/TemplateModalEdit.jsx
// Revo Sport — Template aanpassen (FINAL CLEAN VERSION)
// =====================================================

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { apiGet, apiFetch } from "../api";
import { PuffLoader } from "react-spinners";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_MUTED = "#c9c9c9";

function smoothAutoGrow(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// =====================================================
// FOTO → URL
// =====================================================
function fotoToUrl(f) {
  if (!f) return null;

  if (f instanceof File) return URL.createObjectURL(f);

  if (typeof f === "string") {
    if (f.startsWith("http")) return f;
    return `${API_BASE_URL}/media/file?path=${encodeURIComponent(f)}&t=${Date.now()}`;
  }

  return null;
}

// =====================================================
// IMAGE COMPRESSIE
// =====================================================
async function compressImage(file, maxWidth = 1600, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = img.width * scale;
      const h = img.height * scale;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas
        .getContext("2d")
        .drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) =>
          resolve(new File([blob], "compressed.jpg", { type: "image/jpeg" })),
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function TemplateModalEdit({
  isOpen,
  onClose,
  templateId,
  onSaved,
  newMode,
}) {
  const [naam, setNaam] = useState("");
  const [exercises, setExercises] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStage, setSaveStage] = useState("idle");

  // =====================================================
  // TEMPLATE LADEN
  // =====================================================
  const loadTemplate = useCallback(async () => {
    if (!templateId) return;

    try {
      const data = await apiGet(`/oefenschema/templates/${templateId}`);

      setNaam(data.naam || "");

      setExercises(
        (data.oefeningen || []).map((o, i) => ({
          sets: o.sets || "",
          reps: o.reps || "",
          tempo: o.tempo || "",
          gewicht: o.gewicht || "",
          opmerking: o.opmerking || "",
          volgorde: i + 1,
          foto1: o.foto1 || null,
          foto2: o.foto2 || null,
        }))
      );

      setIsDirty(false);
    } catch (err) {
      console.error("Template laden mislukt:", err);
    }
  }, [templateId]);

  // =====================================================
  // EFFECT: OPEN MODAL
  // =====================================================
  useEffect(() => {
    if (!isOpen) return;

    if (newMode) {
      setNaam("");
      setExercises([
        {
          sets: "",
          reps: "",
          tempo: "",
          gewicht: "",
          opmerking: "",
          volgorde: 1,
          foto1: null,
          foto2: null,
        },
      ]);
      setIsDirty(true);
      return;
    }

    loadTemplate();
  }, [isOpen, newMode, loadTemplate]);

  // =====================================================
  // CRUD
  // =====================================================
  function updateField(i, key, val) {
    setExercises((prev) =>
      prev.map((ex, idx) => (idx === i ? { ...ex, [key]: val } : ex))
    );
    setIsDirty(true);
  }

  function updateFoto(i, slot, file) {
    if (!(file instanceof File)) return;

    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx === i ? { ...ex, [slot]: file } : ex
      )
    );
    setIsDirty(true);
  }

  function addExercise() {
    setExercises((p) => [
      ...p,
      {
        sets: "",
        reps: "",
        tempo: "",
        gewicht: "",
        opmerking: "",
        volgorde: p.length + 1,
        foto1: null,
        foto2: null,
      },
    ]);
    setIsDirty(true);
  }

  function removeExercise(i) {
    setExercises((prev) =>
      prev
        .filter((_, idx) => idx !== i)
        .map((ex, j) => ({ ...ex, volgorde: j + 1 }))
    );
    setIsDirty(true);
  }

  // =====================================================
  // FOTO UPLOAD
  // =====================================================
  async function uploadOne(templateId, oefIndexOneBased, slot, file) {
    const fd = new FormData();
    const safeName = `foto${slot}_${oefIndexOneBased}.jpg`;

    fd.append("file", file, safeName);

    const res = await apiFetch(
      `/oefenschema/templates/upload/${templateId}/${oefIndexOneBased}/${slot}`,
      {
        method: "POST",
        body: fd,
      }
    );

    return res.path;
  }

  // =====================================================
  // SAVE
  // =====================================================
  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveStage("upload");

      let finalId = templateId;

      if (newMode) {
        const fdCreate = new FormData();
        fdCreate.append("naam", naam);
        fdCreate.append("created_by", "Onbekend");
        fdCreate.append("oefeningen_json", JSON.stringify([]));

        const res = await apiFetch(`/oefenschema/templates/create`, {
          method: "POST",
          body: fdCreate,
        });

        finalId = res.id;
      }

      const updated = JSON.parse(JSON.stringify(exercises));

      // Upload foto’s
      for (let i = 0; i < updated.length; i++) {
        for (const slot of ["foto1", "foto2"]) {
          const f = exercises[i][slot];

          if (f instanceof File) {
            const comp = await compressImage(f);
            const slotNum = slot === "foto1" ? 1 : 2;
            const oefIndexOneBased = i + 1;
            const path = await uploadOne(finalId, oefIndexOneBased, slotNum, comp);

            updated[i][slot] = path;
          }
        }
      }

      setSaveStage("save");

      // File → null safeguard
      for (let i = 0; i < updated.length; i++) {
        for (const slot of ["foto1", "foto2"]) {
          if (typeof updated[i][slot] === "object") {
            updated[i][slot] = null;
          }
        }
      }

      const payload = updated.map((ex, i) => ({
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo,
        gewicht: ex.gewicht,
        opmerking: ex.opmerking,
        volgorde: i + 1,
        foto1: ex.foto1,
        foto2: ex.foto2,
      }));

      const fd = new FormData();
      fd.append("naam", naam);
      fd.append("oefeningen_json", JSON.stringify(payload));
      fd.append("created_by", "Onbekend");

      await apiFetch(`/oefenschema/templates/update/${finalId}`, {
        method: "PUT",
        body: fd,
      });

      setSaveStage("done");
      setIsDirty(false);
      onSaved?.();
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  const smallInput = {
    background: "#222",
    color: "#fff",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 14,
    width: "100%",
  };
  return (
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
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            style={{
              background: COLOR_BG,
              borderRadius: 12,
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
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 26,
                color: "#999",
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
                marginBottom: 25,
                textTransform: "uppercase",
              }}
            >
              {newMode ? "Nieuwe Template" : "Template Aanpassen"}
            </h2>


            {/* NAAM */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  color: COLOR_MUTED,
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Naam
              </label>

              <input
                type="text"
                value={naam}
                onChange={(e) => {
                  setNaam(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Template naam"
                style={smallInput}
              />
            </div>

            {/* OEFENINGEN */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  color: COLOR_MUTED,
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Oefeningen
              </label>

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
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <input
                      value={ex.sets}
                      placeholder="Sets"
                      style={smallInput}
                      onChange={(e) =>
                        updateField(index, "sets", e.target.value)
                      }
                    />
                    <input
                      value={ex.reps}
                      placeholder="Reps"
                      style={smallInput}
                      onChange={(e) =>
                        updateField(index, "reps", e.target.value)
                      }
                    />
                    <input
                      value={ex.tempo}
                      placeholder="Tempo"
                      style={smallInput}
                      onChange={(e) =>
                        updateField(index, "tempo", e.target.value)
                      }
                    />
                    <input
                      value={ex.gewicht}
                      placeholder="Gewicht"
                      style={smallInput}
                      onChange={(e) =>
                        updateField(index, "gewicht", e.target.value)
                      }
                    />
                  </div>

                  <textarea
                    placeholder="Opmerking"
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
                      fontFamily: "'Open Sans', sans-serif",
                    }}
                  />

                  {/* FOTO’S */}
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    {[1, 2].map((slot) => {
                      const key = `foto${slot}`;
                      const foto = ex[key];
                      const url = fotoToUrl(foto);

                      return (
                        <label
                          key={slot}
                          style={{
                            flex: 1,
                            background: "#222",
                            border: "1px solid #2a2a2a",
                            borderRadius: 8,
                            padding: "8px 8px",
                            textAlign: "center",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            minHeight: url ? 110 : 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {!url && (
                            <span style={{ opacity: 0.7 }}>
                              Foto {slot}
                            </span>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            style={{
                              position: "absolute",
                              inset: 0,
                              opacity: 0,
                              cursor: "pointer",
                              zIndex: 20,
                            }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) updateFoto(index, key, f);
                            }}
                          />

                          {url && (
                            <img
                              src={url}
                              alt=""
                              style={{
                                marginTop: 8,
                                maxHeight: 150,
                                objectFit: "contain",
                                borderRadius: 8,
                                zIndex: 1,
                              }}
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      marginTop: 15,
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Trash2 size={13} /> Verwijder oefening
                  </button>
                </div>
              ))}

              <motion.button
                onClick={addExercise}
                style={{
                  background: "none",
                  border: "none",
                  color: COLOR_MUTED,
                  padding: "8px 4px",
                  cursor: "pointer",
                }}
              >
                + Oefening toevoegen
              </motion.button>
            </div>

            <motion.button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              style={{
                width: "25%",
                padding: "12px 16px",
                borderRadius: 10,
                background: "transparent",
                border: `1px solid ${
                  isDirty
                    ? COLOR_ACCENT
                    : "rgba(255,255,255,0.25)"
                }`,
                color: isDirty
                  ? COLOR_ACCENT
                  : "rgba(255,255,255,0.35)",
                cursor: isDirty ? "pointer" : "not-allowed",
              }}
            >
              {isSaving ? "Opslaan..." : "Opslaan"}
            </motion.button>
          </motion.div>
          {/* LOADER OVERLAY — FIXED POSITION, OUTSIDE MODAL */}
          {isSaving && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(3px)",
                zIndex: 4000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: COLOR_ACCENT,
              }}
            >
              <PuffLoader color={COLOR_ACCENT} size={90} />

              <p
                style={{
                  marginTop: 25,
                  fontSize: 15,
                  letterSpacing: 0.5,
                }}
              >
                {saveStage === "upload" && "Foto’s uploaden..."}
                {saveStage === "save" && "Template bewaren..."}
                {saveStage === "done" && "Klaar..."}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
