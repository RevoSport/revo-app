// =====================================================
// FILE: src/pages/Oefenschema/SchemaOverzicht.jsx
// Revo Sport — Schema Overzicht (matching TemplatesOverzicht)
// =====================================================

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Eye, Mail } from "lucide-react";

import { apiGet, apiFetch } from "../../api";

import ConfirmModal from "../../components/ConfirmModal";
import SchemaModalEdit from "../../components/SchemaModalEdit";
import SchemaModalPDF from "../../components/SchemaModalPDF";

// 🎨 UI CONSTANTS
const COLOR_ACCENT = "#FF7900";
const COLOR_TEXT = "#FFFFFF";
const COLOR_CARD = "#1A1A1A";

function formatDate(d) {
  if (!d) return "—";

  const clean = d.replace("T", " ").trim();  
  const datePart = clean.split(" ")[0];      
  const [y, m, day] = datePart.split("-");

  if (!y || !m || !day) return d;

  return `${day}/${m}/${y}`;
}

export default function SchemaOverzicht() {
  const [schemas, setSchemas] = useState([]);

  const [editId, setEditId] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [statusMsg, setStatusMsg] = useState(null);

  // =====================================================
  // MAILEN
  // =====================================================
  async function handleMail(id) {
    try {
      await apiFetch(`/oefenschema/mail/${id}`, { method: "POST" });
      setStatusMsg({ type: "success", text: "Schema opnieuw gemaild" });
    } catch (err) {
      console.error("❌ Mail schema:", err);
      setStatusMsg({ type: "error", text: "Mailen mislukt" });
    } finally {
      setTimeout(() => setStatusMsg(null), 2500);
    }
  }

  // =====================================================
  // LOAD SCHEMAS
  // =====================================================
  async function loadSchemas() {
    try {
      const data = await apiGet("/oefenschema/schemas/");
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setSchemas(sorted);
      }
    } catch (err) {
      console.error("❌ Fout bij laden schema's:", err);
      setStatusMsg({ type: "error", text: "Fout bij ophalen schema’s" });
    }
  }

  useEffect(() => {
    loadSchemas();
  }, []);

  // =====================================================
  // DELETE
  // =====================================================
  async function deleteSchema(id) {
    try {
      await apiFetch(`/oefenschema/schemas/${id}`, { method: "DELETE" });
      setSchemas((prev) => prev.filter((x) => x.id !== id));

      setStatusMsg({ type: "success", text: "Schema verwijderd" });
    } catch (err) {
      console.error("❌ Delete schema:", err);
      setStatusMsg({ type: "error", text: "Verwijderen mislukt" });
    } finally {
      setShowDelete(false);
      setTimeout(() => setStatusMsg(null), 2500);
    }
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
          Oefenschema’s
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

        {/* =========================  
            GEGROEPEERD PER PATIËNT  
        ========================= */}

        {Object.entries(
          schemas.reduce((acc, item) => {
            const key = item.patient_naam || "Onbekend";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
          }, {})
        ).map(([patient, list]) => {
          const last = [...list].sort(
            (a, b) => new Date(b.laatst_gewijzigd) - new Date(a.laatst_gewijzigd)
          )[0];

          return (
            <GroupBlock
              key={patient}
              patient={patient}
              items={list}
              last={last}
              initiallyOpen={false}
              onEdit={(id) => {
                setEditId(id);
                setShowEdit(true);
              }}
              onPdf={(id) => {
                setPdfId(id);
                setShowPDF(true);
              }}
              onDelete={(id) => {
                setDeleteItem({ id });
                setShowDelete(true);
              }}
              onMail={(id) => handleMail(id)}
            />
          );
        })}

        {/* MODALS */}
        <ConfirmModal
          open={showDelete && Boolean(deleteItem)}
          title="Schema verwijderen"
          message={
            <>
              Weet je zeker dat je dit schema wilt verwijderen?
              <br />
              Dit kan niet ongedaan worden gemaakt.
            </>
          }
          confirmLabel="Verwijderen"
          cancelLabel="Annuleren"
          onCancel={() => setShowDelete(false)}
          onConfirm={() => deleteSchema(deleteItem.id)}
        />

        <SchemaModalEdit
          isOpen={showEdit}
          schemaId={editId}
          onClose={() => setShowEdit(false)}
          onSaved={() => loadSchemas()}
        />

        <SchemaModalPDF
          isOpen={showPDF}
          schemaId={pdfId}
          onClose={() => setShowPDF(false)}
        />
      </motion.div>
    </>
  );
}

// =====================================================
// SMALL UTILS
// =====================================================

function IconBtn({ icon, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.98 }}
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

// =====================================================
// COLLAPSIBLE GROUP COMPONENT
// =====================================================

function GroupBlock({
  patient,
  items,
  last,
  initiallyOpen,
  onEdit,
  onPdf,
  onDelete,
  onMail,
}) {
  const [open, setOpen] = React.useState(initiallyOpen);

  return (
    <div
      style={{
        marginBottom: 20,
        borderRadius: 12,
        border: "1px solid #22252D",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: "#222",
          padding: "14px 18px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
          {patient}
        </div>

        <div style={{ color: "#fff", fontSize: 13 }}>
          Laatste schema: {formatDate(last?.datum)} — {last?.aantal_oefeningen} oefeningen
        </div>

        <div
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "0.2s ease",
            color: "#FF7900",
            fontSize: 20,
          }}
        >
          ›
        </div>
      </div>

      {/* BODY */}
      {open && (
        <div style={{ background: "#1A1A1A" }}>
          {/* TABLE HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 120px",
              padding: "10px 18px",
              borderBottom: "1px solid #22252D",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 500,
              textTransform: "uppercase",
            }}
          >
            <div>Datum</div>
            <div>Oefeningen</div>
            <div style={{ textAlign: "center", paddingRight: 6 }}>Acties</div>
          </div>

          {/* DATA ROWS */}
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 120px",
                padding: "12px 18px",
                borderBottom: "1px solid #22252D",
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                alignItems: "center",
              }}
            >
              <div>{formatDate(item.datum)}</div>
              <div>{item.aantal_oefeningen}</div>

              {/* ICONS */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <IconBtn
                  icon={<Eye size={16} />}
                  color={COLOR_ACCENT}
                  onClick={() => onPdf(item.id)}
                />

                <IconBtn
                  icon={<Pencil size={16} />}
                  color={COLOR_ACCENT}
                  onClick={() => onEdit(item.id)}
                />

                <IconBtn
                  icon={<Mail size={16} />}
                  color={COLOR_ACCENT}
                  onClick={() => onMail(item.id)}
                />

                <IconBtn
                  icon={<Trash2 size={16} />}
                  color="#ff4e4e"
                  onClick={() => onDelete(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
