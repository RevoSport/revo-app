// =====================================================
// FILE: src/components/SchemaModalPDF.jsx
// =====================================================

import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

const COLOR_ACCENT = "#FF7900";
const COLOR_TEXT = "#ffffff";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function SchemaModalPDF({ isOpen, onClose, schemaId }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // niet laden als modal niet open is
    if (!isOpen || !schemaId) return;

    async function loadPDF() {
      try {
        setIsLoading(true);
        setPdfUrl(null);

        // Backend route
        const res = await apiGet(`/oefenschema/pdf/schema/${schemaId}`);

        if (!res?.path) throw new Error("Backend gaf geen 'path' terug.");

        const proxiedUrl = `${API_BASE_URL}/media/file?path=${encodeURIComponent(
          res.path
        )}&t=${Date.now()}`;

        setPdfUrl(proxiedUrl);
      } catch (err) {
        console.error("❌ PDF laden mislukt:", err);
        setPdfUrl(null);
      }
    }

    loadPDF();
  }, [isOpen, schemaId]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(2px)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          padding: 20,
          borderRadius: 16,
          width: "90%",
          maxWidth: 1000,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          color: COLOR_TEXT,
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* sluitknop */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            color: "#ccc",
            fontSize: 26,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h2
          style={{
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 600,
            marginBottom: 25,
            textAlign: "center",
          }}
        >
          Oefenschema PDF
        </h2>

        {/* Loader */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: COLOR_ACCENT,
              borderRadius: 16,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.2)",
                borderTop: `3px solid ${COLOR_ACCENT}`,
                animation: "spin 1s linear infinite",
                marginBottom: 14,
              }}
            />
            PDF laden...
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* PDF viewer */}
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            onLoad={() => setIsLoading(false)}
            style={{
              flex: 1,
              width: "100%",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        ) : (
          !isLoading && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ff4e4e",
                fontSize: 16,
              }}
            >
              ❌ PDF niet beschikbaar
            </div>
          )
        )}
      </div>
    </div>
  );
}
