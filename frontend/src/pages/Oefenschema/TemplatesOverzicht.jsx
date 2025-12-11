// =====================================================
// FILE: src/pages/Oefenschema/TemplatesOverzicht.jsx
// Revo Sport — Templates Overzicht (OneDrive v2 ready)
// =====================================================

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

// 🔧 API
import { apiGet, apiFetch } from "../../api";

// 🔧 Components
import ConfirmModal from "../../components/ConfirmModal";
import TemplateModalEdit from "../../components/TemplateModalEdit";

// 🎨 UI CONSTANTS
const COLOR_ACCENT = "#FF7900";
const COLOR_BORDER = "#22252D";
const COLOR_TEXT = "#FFFFFF";
const COLOR_MUTED = "#9CA3AF";
const COLOR_CARD = "#1A1A1A";
function formatDate(d) {
  if (!d) return "—";

  // ISO-normalisatie
  const clean = d.replace("T", " ").trim();  // "2025-12-06 13:00:00"

  // Datumdeel nemen
  const datePart = clean.split(" ")[0];      // "2025-12-06"
  const [y, m, day] = datePart.split("-");

  if (!y || !m || !day) return d;

  return `${day}/${m}/${y}`;
}


export default function TemplatesOverzicht() {
  const [templates, setTemplates] = useState([]);

  // SCHEIDING:
  const [selectedId, setSelectedId] = useState(null);          // ← voor edit
  const [selectedTemplate, setSelectedTemplate] = useState(null); // ← voor delete

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [statusMsg, setStatusMsg] = useState(null);
  const [createNew, setCreateNew] = useState(false);

  // =====================================================
  // LOAD TEMPLATES
  // =====================================================

  async function loadTemplates() {
    try {
      const data = await apiGet("/oefenschema/templates");
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setTemplates(sorted);
      }
    } catch (err) {
      console.error("❌ Fout bij laden templates:", err);
      setStatusMsg({ type: "error", text: "Fout bij ophalen templates" });
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  // =====================================================
  // DELETE TEMPLATE
  // =====================================================

  async function deleteTemplate(id) {
    try {
      await apiFetch(`/oefenschema/templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));

      setStatusMsg({ type: "success", text: "Template verwijderd" });
    } catch (err) {
      console.error("❌ Delete template:", err);
      setStatusMsg({ type: "error", text: "Verwijderen mislukt" });
    } finally {
      setShowDelete(false);
      setTimeout(() => setStatusMsg(null), 2500);
    }
  }

  // =====================================================
  // OPEN EDIT
  // =====================================================

  function openEdit(t) {
    setSelectedId(t.id);      
    setShowEdit(true);
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: COLOR_CARD,
          borderRadius: 12,
          padding: "40px 60px",
          maxWidth: 1000,
          margin: "0 auto 80px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: COLOR_TEXT,
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 25,
          }}
        >
          Templates
        </h2>

        {/* STATUS */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                marginBottom: 20,
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 14,
                background:
                  statusMsg.type === "success" ? "#063E26" : "#4C1D1D",
                border:
                  statusMsg.type === "success"
                    ? "1px solid #1A7F4D"
                    : "1px solid #7F1D1D",
                color:
                  statusMsg.type === "success" ? "#BBF7D0" : "#FCA5A5",
                textAlign: "center",
              }}
            >
              {statusMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      setSelectedId(null);
      setCreateNew(true);
      setShowEdit(true);
    }}
    style={{
      background: "transparent",
      border: `1px solid ${COLOR_ACCENT}`,
      color: COLOR_ACCENT,
      padding: "8px 14px",
      borderRadius: 8,
      fontSize: 14,
      cursor: "pointer",
    }}
  >
    + Nieuw template
  </motion.button>
</div>

        {/* TABLE */}
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${COLOR_BORDER}`,
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  background: "#222",
                  borderBottom: `1px solid ${COLOR_BORDER}`,
                }}
              >
                <th style={thStyle}>Naam</th>
                <th style={thStyle}>Aantal oefeningen</th>
                <th style={thStyle}>Laatst gewijzigd</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Acties</th>
              </tr>
            </thead>

            <tbody>
              {templates.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: COLOR_MUTED,
                    }}
                  >
                    Geen templates gevonden
                  </td>
                </tr>
              )}

              {templates.map((t) => (
                <tr
                  key={t.id}
                  style={{
                    background: COLOR_CARD,
                    borderBottom: `1px solid ${COLOR_BORDER}`,
                  }}
                >
                  <td style={tdStyle}>{t.naam}</td>
                  <td style={tdStyle}>{t.aantal_oefeningen ?? 0}</td>
                  <td style={tdStyle}>{formatDate(t.laatst_gewijzigd)}</td>

                  <td
                    style={{
                      ...tdStyle,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    <IconBtn
                      icon={<Pencil size={16} />}
                      color={COLOR_ACCENT}
                      onClick={() => openEdit(t)}
                    />

                    <IconBtn
                      icon={<Trash2 size={16} />}
                      color="#ff4e4e"
                      onClick={() => {
                        setSelectedTemplate(t);
                        setShowDelete(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL: DELETE */}
        <ConfirmModal
          open={showDelete && Boolean(selectedTemplate)}
          title="Template verwijderen"
          message={
            <>
              Weet je zeker dat je <b>{selectedTemplate?.naam}</b> wilt verwijderen?
              <br />
              Dit kan niet ongedaan worden gemaakt.
            </>
          }
          confirmLabel="Verwijderen"
          cancelLabel="Annuleren"
          onCancel={() => setShowDelete(false)}
          onConfirm={() => deleteTemplate(selectedTemplate.id)}
        />

        {/* MODAL: EDIT */}
        <TemplateModalEdit
          isOpen={showEdit}
          onClose={() => {
            setShowEdit(false);
            setCreateNew(false);
          }}
          templateId={createNew ? null : selectedId}
          newMode={createNew}    // ← belangrijk
          onSaved={() => {
            loadTemplates();
            setCreateNew(false);
          }}
        />

      </motion.div>
    </>
  );
}

// =====================================================
// SMALL UTILS
// =====================================================

const thStyle = {
  padding: "12px 16px",
  color: "rgba(255,255,255,0.85)",
  fontSize: 13,
  fontWeight: 500,
  textAlign: "left",
};

const tdStyle = {
  padding: "10px 16px",
  color: "rgba(255,255,255,0.85)",
  fontSize: 13,
  textAlign: "left",
};

function IconBtn({ icon, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color,
      }}
    >
      {icon}
    </motion.button>
  );
}
