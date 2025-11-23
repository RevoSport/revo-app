// =====================================================
// FILE: src/components/ConfirmModal.jsx
// Revo Sport — Generieke Confirm Modal (Delete / Alerts)
// =====================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_ACCENT = "#FF7900";

export default function ConfirmModal({
  open,
  title = "Bevestigen",
  message = "",
  confirmLabel = "OK",
  cancelLabel = "Annuleren",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5000,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            backgroundColor: "#1e1e1e",
            borderRadius: 12,
            padding: 30,
            width: "90%",
            maxWidth: 400,
            color: COLOR_TEXT,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 25px rgba(0,0,0,0.45)",
          }}
        >
          {/* HEADER */}
          <h3
            style={{
              marginBottom: 16,
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            {title}
          </h3>

          {/* MESSAGE */}
          <p style={{ color: COLOR_MUTED, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
            {message}
          </p>

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: 12 }}>
            {/* CANCEL */}
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: COLOR_MUTED,
                borderRadius: 8,
                padding: "10px 0",
                cursor: "pointer",
              }}
            >
              {cancelLabel}
            </button>

            {/* CONFIRM */}
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                border: `1px solid ${COLOR_ACCENT}`,
                background: "transparent",
                color: COLOR_ACCENT,
                borderRadius: 8,
                padding: "10px 0",
                cursor: "pointer",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
