// =====================================================
// FILE: src/pages/Oefenschema/SchemaOverzicht.jsx
// Revo Sport — Overzicht + Edit + PDF + Delete Modal (OneDrive v2 ready)
// =====================================================

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Mail,
  RefreshCw,
  AlertTriangle,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

// 🔧 CORRECTE API IMPORT
import { apiGet, apiFetch } from "../../api";

// 🔧 CORRECTE COMPONENT IMPORTS
import SchemaModalPDF from "../../components/SchemaModalPDF";
import SchemaModalEdit from "../../components/SchemaModalEdit";
import ConfirmModal from "../../components/ConfirmModal";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#0E0E0E";
const COLOR_CARD = "#16181D";
const COLOR_BORDER = "#22252D";
const COLOR_TEXT = "#FFFFFF";
const COLOR_MUTED = "#9CA3AF";

function formatDate(iso) {
  if (!iso) return "–";
  try {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

export default function SchemaOverzicht() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedSchema, setSelectedSchema] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [query, setQuery] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================
  async function loadData() {
    try {
      setLoading(true);
      const data = await apiGet("/oefenschema/");
      if (Array.isArray(data)) {
        const sorted = [...data].sort(
          (a, b) => new Date(b.datum) - new Date(a.datum)
        );
        setSchemas(sorted);
      }
    } catch (err) {
      console.error("❌ Laden mislukt:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================
  const filtered = useMemo(() => {
    if (!query.trim()) return schemas;
    return schemas.filter((s) =>
      s.patient_naam?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, schemas]);

  // =====================================================
  // DELETE
  // =====================================================
  async function deleteSchema(id) {
    try {
      await apiFetch(`/oefenschema/${id}`, { method: "DELETE" });
      setSchemas((prev) => prev.filter((s) => s.id !== id));
      setShowDelete(false);
    } catch (err) {
      console.error("❌ Verwijderen mislukt:", err);
    }
  }

  // =====================================================
  // MAIL (v2) — geen alerts, maar correcte flow
  // =====================================================
  async function sendMail(id) {
    try {
      const res = await apiFetch(`/oefenschema/mail/${id}`, {
        method: "POST",
      });

      if (!res || res.status !== "ok") {
        throw new Error("Mail endpoint error");
      }

      // ⬇️ uniforme Revo feedback
      setStatus({
        type: "success",
        msg: "E-mail verzonden naar patiënt",
      });
      setTimeout(() => setStatus(null), 2200);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        msg: "Mailen mislukt",
      });
      setTimeout(() => setStatus(null), 2800);
    }
  }

  const [status, setStatus] = useState(null);

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      style={{
        background: COLOR_BG,
        minHeight: "100vh",
        padding: 40,
        color: COLOR_TEXT,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: COLOR_CARD,
          border: `1px solid ${COLOR_BORDER}`,
          borderRadius: 20,
          padding: 35,
          width: "100%",
          maxWidth: 1100,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 25,
            textTransform: "uppercase",
          }}
        >
          Overzicht Oefenschema's
        </h2>

        {/* SEARCH */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              background: "#111",
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: 12,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Search size={16} color={COLOR_MUTED} />
            <input
              type="text"
              placeholder="Zoek op naam..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                color: COLOR_TEXT,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* STATUS MESSAGE */}
        <AnimatePresence>
          {status && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                textAlign: "center",
                marginBottom: 15,
                color:
                  status.type === "success"
                    ? "#FFFFFF"
                    : status.type === "error"
                    ? "#ff4d4d"
                    : COLOR_ACCENT,
              }}
            >
              {status.msg}
            </motion.p>
          )}
        </AnimatePresence>

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
              <col style={{ width: "35%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>

            <thead>
              <tr
                style={{
                  background: "#1F1F1F",
                  borderBottom: `1px solid ${COLOR_BORDER}`,
                }}
              >
                <th style={thStyle}>Patiënt</th>
                <th style={thStyle}>Datum</th>
                <th style={thStyle}>Therapeut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Acties</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={loadingStyle}>
                    Laden...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={loadingStyle}>
                    Geen schema’s gevonden
                  </td>
                </tr>
              )}

              {filtered.map((s) => (
                <tr
                  key={s.id}
                  style={{
                    background: "#1A1A1A",
                    borderBottom: `1px solid ${COLOR_BORDER}`,
                  }}
                >
                  <td style={tdStyle}>{s.patient_naam}</td>
                  <td style={tdStyle}>{formatDate(s.datum)}</td>
                  <td style={tdStyle}>{s.created_by}</td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    {/* PDF */}
                    <IconBtn
                      icon={<Eye size={16} />}
                      onClick={() => {
                        setSelectedSchema(s);
                        setShowPDF(true);
                      }}
                      color={COLOR_ACCENT}
                    />

                    {/* MAIL */}
                    <IconBtn
                      icon={<Mail size={16} />}
                      onClick={() => sendMail(s.id)}
                      color={COLOR_ACCENT}
                    />

                    {/* EDIT */}
                    <IconBtn
                      icon={<Pencil size={16} />}
                      onClick={() => {
                        setSelectedSchema(s);
                        setShowEdit(true);
                      }}
                      color={COLOR_ACCENT}
                    />

                    {/* DELETE */}
                    <IconBtn
                      icon={<Trash2 size={16} />}
                      onClick={() => {
                        setSelectedSchema(s);
                        setShowDelete(true);
                      }}
                      color="#ff4e4e"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DELETE MODAL */}
        <ConfirmModal
          open={showDelete}
          title="Oefenschema verwijderen"
          message="Dit kan niet ongedaan worden gemaakt."
          confirmLabel="Verwijderen"
          cancelLabel="Annuleren"
          onCancel={() => setShowDelete(false)}
          onConfirm={() => deleteSchema(selectedSchema.id)}
        />

        {/* EDIT MODAL */}
        <SchemaModalEdit
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          schemaId={selectedSchema?.id}
          onSaved={() => {
            setShowEdit(false);
            loadData();
          }}
        />

        {/* PDF MODAL */}
        <SchemaModalPDF
          isOpen={showPDF}
          onClose={() => setShowPDF(false)}
          schemaId={selectedSchema?.id}
        />
      </div>
    </div>
  );
}

// =====================================================
// SMALL UTILS
// =====================================================

const thStyle = {
  padding: "12px 16px",
  fontSize: 13,
  color: "rgba(255,255,255,0.85)",
  fontWeight: 600,
};

const tdStyle = {
  padding: "10px 16px",
  fontSize: 13,
  color: "rgba(255,255,255,0.85)",
};

const loadingStyle = {
  padding: 20,
  textAlign: "center",
  color: COLOR_MUTED,
};

function IconBtn({ icon, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        color,
        cursor: "pointer",
      }}
    >
      {icon}
    </motion.button>
  );
}
