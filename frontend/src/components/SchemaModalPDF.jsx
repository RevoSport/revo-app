// =====================================================
// FILE: src/components/SchemaModalPDF.jsx
// Revo Sport — PDF Viewer Modal (OneDrive v2 + Proxy)
// =====================================================

import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

const COLOR_ACCENT = "#FF7900";
const COLOR_TEXT = "#ffffff";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function SchemaModalPDF({ isOpen, onClose, schemaId }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // PDF laden via backend → interne path → proxy url
  useEffect(() => {
    async function loadPDF() {
      try {
        setIsLoading(true);
        const res = await apiGet(`/oefenschema/pdf/${schemaId}`);
        if (!res?.url) throw new Error("Geen PDF-pad ontvangen.");

        const proxied = `${API_BASE_URL}/media/file?path=${encodeURIComponent(
          res.url
        )}&t=${Date.now()}`;

        setPdfUrl(proxied);
      } catch (err) {
        console.error("❌ PDF laden mislukt:", err);
        setPdfUrl(null);
      }
    }

    loadPDF();
  }, [schemaId]);

    if (!isOpen || !schemaId) return null;
    
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
        {/* Sluit-knop */}
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
            zIndex: 20,
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
            fontSize: 18,
          }}
        >
          Oefenschema PDF
        </h2>

        {/* Loader overlay */}
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
              zIndex: 15,
              borderRadius: 16,
              color: COLOR_ACCENT,
              fontSize: 15,
              fontWeight: 600,
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

        {/* PDF zelf */}
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
        )}
      </div>
    </div>
  );
}
