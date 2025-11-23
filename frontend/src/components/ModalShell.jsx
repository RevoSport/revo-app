// =====================================================
// FILE: src/components/ModalShell.jsx
// Revo Sport — Unified Modal Shell (Oefenschema card style)
// =====================================================

import React from "react";

const COLOR_BG = "#111111";
const COLOR_BORDER = "#222";
const COLOR_TEXT = "#ffffff";

export default function ModalShell({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 1000,
          maxHeight: "90vh",
          overflowY: "auto",
          background: COLOR_BG,
          borderRadius: 24,
          padding: "40px 50px",
          position: "relative",
          boxShadow: "0 0 40px rgba(0,0,0,0.45)",
          color: COLOR_TEXT,
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "transparent",
            border: "none",
            color: "#777",
            fontSize: 32,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {/* CONTENT */}
        {children}
      </div>
    </div>
  );
}
