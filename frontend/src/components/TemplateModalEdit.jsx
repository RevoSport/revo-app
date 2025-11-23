// =====================================================
// FILE: src/components/TemplateModalEdit.jsx
// Revo Sport — Template aanpassen (OneDrive v2 + compressie + auto-close)
// =====================================================

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { apiGet, apiFetch } from "../api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#1a1a1a";
const COLOR_MUTED = "#c9c9c9";
const COLOR_PLACEHOLDER = "rgba(255,255,255,0.55)";

// =====================================================
// FOTO NORMALISATIE (OneDrive pad → proxied URL)
// =====================================================
function fotoToUrl(f) {
  if (!f) return null;

  if (f.type === "new" && f.file) return URL.createObjectURL(f.file);

  if (f.type === "existing" && f.path) {
    if (f.path.startsWith("http")) return f.path;

    return `${API_BASE_URL}/media/file?path=${encodeURIComponent(f.path)}`;
  }

  return null;
}

// =====================================================
// FOTO COMPRESSIE (canvas)
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
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          const out = new File([blob], file.name.replace(/\.(png|jpeg|jpg)$/i, "_c.jpg"), {
            type: "image/jpeg",
          });
          resolve(out);
        },
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

// =====================================================
// AUTOGROW TEXTAREA
// =====================================================
function smoothAutoGrow(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// =====================================================
// COMPONENT
// =====================================================
export default function TemplateModalEdit({
  isOpen,
  onClose,
  templateId,
  onSaved,
}) {
  const [naam, setNaam] = useState("");
  const [exercises, setExercises] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  // =====================================================
  // LOAD TEMPLATE
  // =====================================================
  const loadTemplate = useCallback(async () => {
    try {
      const data = await apiGet(`/oefenschema/templates/${templateId}`);

      setNaam(data.naam || "");

      const mapped = (data.oefeningen || []).map((o, idx) => ({
        sets: o.sets || "",
        reps: o.reps || "",
        tempo: o.tempo || "",
        gewicht: o.gewicht || "",
        opmerking: o.opmerking || "",
        volgorde: idx + 1,
        foto1: o.foto1 && o.foto1 !== "null"
          ? { type: "existing", path: o.foto1 }
          : null,
        foto2: o.foto2 && o.foto2 !== "null"
          ? { type: "existing", path: o.foto2 }
          : null,
      }));

      setExercises(mapped);
      setIsDirty(false);

      setTimeout(() => {
        document
          .querySelectorAll("textarea[data-autogrow]")
          .forEach((ta) => smoothAutoGrow(ta));
      }, 50);
    } catch (err) {
      console.error("❌ Template laden mislukt:", err);
    }
  }, [templateId]);

  useEffect(() => {
    if (isOpen && templateId) {
      setNaam("");
      setExercises([]);
      loadTemplate();
    }
  }, [isOpen, templateId, loadTemplate]);

  if (!isOpen || !templateId) return null;

  // =====================================================
  // CRUD
  // =====================================================
  function addExercise() {
    setExercises((prev) => [
      ...prev,
      { sets: "", reps: "", tempo: "", gewicht: "", opmerking: "", volgorde: prev.length + 1, foto1: null, foto2: null },
    ]);
    setIsDirty(true);
  }

  function removeExercise(idx) {
    setExercises((prev) =>
      prev.filter((_, i) => i !== idx).map((ex, i2) => ({ ...ex, volgorde: i2 + 1 }))
    );
    setIsDirty(true);
  }

  function updateField(i, key, value) {
    setExercises((prev) => {
      const out = [...prev];
      out[i][key] = value;
      return out;
    });
    setIsDirty(true);
  }

  function updateFoto(i, slot, file) {
    setExercises((prev) => {
      const out = [...prev];
      out[i][slot] = file ? { type: "new", file } : null;
      return out;
    });
    setIsDirty(true);
  }

 // =====================================================
// SAVE
// =====================================================
async function handleSave() {
  try {
    setIsSaving(true);

    const photosToUpload = exercises.flatMap((ex) => [
      ex.foto1?.type === "new" ? ex.foto1 : null,
      ex.foto2?.type === "new" ? ex.foto2 : null,
    ]).filter(Boolean);

    const totalSteps = photosToUpload.length + 3;
    setUploadProgress({ done: 0, total: totalSteps });

    const step = () =>
      setUploadProgress((p) => ({ ...p, done: Math.min(p.done + 1, totalSteps) }));

    // JSON
    const jsonOef = exercises.map((ex, i) => ({
      sets: ex.sets,
      reps: ex.reps,
      tempo: ex.tempo,
      gewicht: ex.gewicht,
      opmerking: ex.opmerking,
      volgorde: i + 1,
      foto1: ex.foto1?.type === "existing" ? ex.foto1.path : null,
      foto2: ex.foto2?.type === "existing" ? ex.foto2.path : null,
    }));

    step();

    const form = new FormData();
    form.append("naam", naam);
    form.append("oefeningen_json", JSON.stringify(jsonOef));

    // compress + append
    for (let i = 0; i < exercises.length; i++) {
      for (const key of ["foto1", "foto2"]) {
        const f = exercises[i][key];
        if (f?.type === "new") {
          const compressed = await compressImage(f.file);
          form.append("files", compressed, `${key}_${i}.jpg`);
          step();
        }
      }
    }

    // 🔥 Geen res.ok gebruiken — apiFetch gooit al bij fouten
    await apiFetch(`/oefenschema/templates/update/${templateId}`, {
      method: "PUT",
      body: form,
    });

    step();

    // 🔥 Success → auto-close
    setIsDirty(false);
    onSaved?.();
    onClose?.();

  } catch (err) {
    console.error("❌ Opslaan exception:", err);
  } finally {
    setIsSaving(false);
  }
}

  // =====================================================
  // STYLES
  // =====================================================
  const smallInput = {
    background: "#222",
    color: "#fff",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Open Sans', sans-serif",
  };

  const label = {
    color: COLOR_MUTED,
    fontSize: 13,
    marginBottom: 6,
    display: "block",
    fontFamily: "'Open Sans', sans-serif",
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <>
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
              transition={{ duration: 0.25 }}
              style={{
                background: COLOR_BG,
                borderRadius: 12,
                padding: "40px 60px",
                width: "100%",
                maxWidth: 900,
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                position: "relative",
              }}
            >
              {/* CLOSE BTN */}
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

              {/* TITLE */}
              <h2
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 25,
                  textTransform: "uppercase",
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                Template aanpassen
              </h2>

              {/* NAAM */}
              <div style={{ marginBottom: 20 }}>
                <label style={label}>Naam</label>
                <input
                  type="text"
                  value={naam}
                  onChange={(e) => {
                    setNaam(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Template naam"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#222",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: naam ? "#fff" : COLOR_PLACEHOLDER,
                    fontFamily: "'Open Sans', sans-serif",
                  }}
                />
              </div>

              {/* OEFENINGEN */}
              <div style={{ marginBottom: 18 }}>
                <label style={label}>Oefeningen</label>

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
                    {/* ROW */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: 12,
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) =>
                          updateField(index, "sets", e.target.value)
                        }
                        style={smallInput}
                      />

                      <input
                        type="text"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) =>
                          updateField(index, "reps", e.target.value)
                        }
                        style={smallInput}
                      />

                      <input
                        type="text"
                        placeholder="Tempo"
                        value={ex.tempo}
                        onChange={(e) =>
                          updateField(index, "tempo", e.target.value)
                        }
                        style={smallInput}
                      />

                      <input
                        type="text"
                        placeholder="Gewicht"
                        value={ex.gewicht}
                        onChange={(e) =>
                          updateField(index, "gewicht", e.target.value)
                        }
                        style={smallInput}
                      />
                    </div>

                    {/* OPMERKING */}
                    <textarea
                      placeholder="Opmerking (optioneel)"
                      data-autogrow
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
                        fontSize: 14, 
                        overflow: "hidden",
                        fontFamily: "'Open Sans', sans-serif",
                      }}
                    />

                    {/* FOTO'S */}
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      {[1, 2].map((slot) => {
                        const key = `foto${slot}`;
                        const foto = ex[key];

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
                              position: "relative",
                              overflow: "hidden",
                              fontFamily: "'Open Sans', sans-serif",
                            }}
                          >
                            {!foto && (
                            <span
                              style={{
                                opacity: 0.7,
                                fontSize: 14,            // 🔥 kleiner font
                                fontWeight: 400,
                                fontFamily: "'Open Sans', sans-serif",
                              }}
                            >
                              Foto {slot} toevoegen
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
                              }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) updateFoto(index, key, f);
                              }}
                            />

                            {foto && (
                              <img
                                src={fotoToUrl(foto)}
                                alt=""
                                style={{
                                  marginTop: 8,
                                  maxHeight: 100,
                                  borderRadius: 8,
                                  objectFit: "contain",
                                }}
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      style={{
                        background: "transparent",
                        border: "none",
                        marginTop: 15,
                        color: "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                        fontFamily: "'Open Sans', sans-serif",
                      }}
                    >
                      <Trash2 size={13} /> Verwijder oefening
                    </button>
                  </div>
                ))}

                {/* ADD BTN */}
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      background: "transparent",
                      border: "0px solid rgba(255,255,255,0.2)",
                      color: COLOR_MUTED,
                      fontFamily: "'Open Sans', sans-serif",
                    }}
                    onClick={addExercise}
                  >
                    + Oefening toevoegen
                  </motion.button>
                </div>
              </div>

              {/* SAVE */}
              <motion.button
                whileHover={isDirty && !isSaving ? { scale: 1.02 } : {}}
                whileTap={isDirty && !isSaving ? { scale: 0.98 } : {}}
                disabled={!isDirty || isSaving}
                onClick={handleSave}
                style={{
                  width: "25%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  marginTop: 30,
                  background: "transparent",
                  border: `1px solid ${
                    isDirty ? COLOR_ACCENT : "rgba(255,255,255,0.25)"
                  }`,
                  color: isDirty ? COLOR_ACCENT : "rgba(255,255,255,0.35)",
                  cursor: isDirty ? "pointer" : "not-allowed",
                  fontFamily: "'Open Sans', sans-serif",
                }}
              >
                {isSaving ? "Opslaan..." : "Opslaan"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADER OVERLAY */}
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
            fontFamily: "'Open Sans', sans-serif",
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
              marginBottom: 16,
            }}
          />
          Uploading {uploadProgress.done}/{uploadProgress.total}
        </div>
      )}
    </>
  );
}
