// =====================================================
// FILE: src/pages/Oefenschema/Oefenschema.jsx
// Revo Sport — Oefenschema-module (Overzicht + Templates + Nieuw)
// =====================================================

import React, { useState } from "react";
import {
  ClipboardList,
  Layers,
  FilePlus,
} from "lucide-react";

// 🔧 Correcte imports na verhuis
import FormOefenschema from "./FormOefenschema";
import TemplatesOverzicht from "./TemplatesOverzicht";
import SchemaOverzicht from "./SchemaOverzicht";

// PDF / Edit modals
import SchemaModalPDF from "../../components/SchemaModalPDF";
import SchemaModalEdit from "../../components/SchemaModalEdit";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#111111";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_CARD = "#1a1a1a";

export default function Oefenschema() {
  const [activeSection, setActiveSection] = useState("schema");

  // Edit modal
  const [schemaEditData, setSchemaEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // PDF modal
  const [pdfSchemaId, setPdfSchemaId] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

const tabStyle = (active) => ({
  flex: 1,
  padding: "12px 0",
  textAlign: "center",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
  borderBottom: active ? `3px solid ${COLOR_ACCENT}` : "3px solid transparent",
  color: active ? COLOR_ACCENT : COLOR_MUTED,
  transition: "all .2s ease",
});


  return (
    <div
      style={{
        background: COLOR_BG,
        minHeight: "100vh",
        padding: "30px 20px",
        alignItems: "center",
        textAlign: "center",
        color: COLOR_TEXT,
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          background: COLOR_BG,
          borderRadius: 14,
          padding: "25px 30px",
        }}
      >
      <h1 style={{ fontSize: "22px", textTransform: "uppercase", color: "#fff", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "6px" }}>
        OEFENSCHEMA
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "35px", letterSpacing: "0.4px" }}>
        DATA-DRIVEN REHABILITATION INSIGHTS
      </p>
      
{/* ORANJE LIJN BOVEN (exactzelfde breedte als tabs) */}
<div
  style={{
    width: "100%",
    maxWidth: "1000px", // exact breedte van 3 × 200px kaarten + gaps
    margin: "0 auto 30px auto",
    height: "1px",
    backgroundColor: "#FF7900",
  }}
/>

{/* TABBAR */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginBottom: "20px",
    width: "100%",
  }}
>
  {[
    { key: "schema", title: "OVERZICHT", icon: <ClipboardList size={20} color="#FF7900" /> },
    { key: "templates", title: "TEMPLATES", icon: <Layers size={20} color="#FF7900" /> },
    { key: "nieuw", title: "NIEUW SCHEMA", icon: <FilePlus size={20} color="#FF7900" /> },
  ].map((tab) => {
    const isActive = activeSection === tab.key;

    return (
      <div
        key={tab.key}
        onClick={() => setActiveSection(tab.key)}
        style={{
          width: "200px",
          backgroundColor: "#1a1a1a",
          borderRadius: "14px",
          border: isActive ? "2px solid #FF7900" : "2px solid transparent",
          cursor: "pointer",
          transition: "all 0.25s ease",
          boxShadow: "0 0 10px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 0",
          transform: isActive ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "28px",
            marginBottom: "8px",
          }}
        >
          {tab.icon}
        </div>

        {/* Titel */}
        <h3
          style={{
            fontSize: "12px",
            fontWeight: 500,          // << EXACTE AANPASSING
            color: isActive ? "#FF7900" : "white",
            letterSpacing: "0.7px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {tab.title}
        </h3>
      </div>
    );
  })}
</div>

{/* ORANJE LIJN ONDER (zelfde breedte als tabs) */}
<div
  style={{
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto 30px auto",
    height: "1px",
    backgroundColor: "#FF7900",
  }}
/>


        {/* CONTENT */}
        <div>
          {activeSection === "schema" && (
            <SchemaOverzicht
              onOpenEdit={(schema) => {
                setSchemaEditData(schema);
                setShowEditModal(true);
              }}
              onOpenPDF={(id) => {
                setPdfSchemaId(id);
                setShowPdfModal(true);
              }}
            />
          )}

          {activeSection === "templates" && <TemplatesOverzicht />}

          {activeSection === "nieuw" && <FormOefenschema />}
        </div>
      </div>

      {/* EDIT MODAL */}
      <SchemaModalEdit
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        schemaId={schemaEditData?.id}
      />

      {/* PDF MODAL */}
      <SchemaModalPDF
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        schemaId={pdfSchemaId}
      />
    </div>
  );
}
