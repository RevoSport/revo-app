// =====================================================
// FILE: src/pages/Oefenschema/Oefenschema.jsx
// Revo Sport — Oefenschema-module (Overzicht + Templates + Nieuw)
// =====================================================

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Layers,
  FilePlus,
} from "lucide-react";

import FormOefenschema from "./FormOefenschema";
import TemplatesOverzicht from "./TemplatesOverzicht";
import SchemaOverzicht from "./SchemaOverzicht";

import SchemaModalPDF from "../../components/SchemaModalPDF";
import SchemaModalEdit from "../../components/SchemaModalEdit";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#111111";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";

// ⛔ LET OP
// Deze component MOET currentPage ontvangen vanuit App.jsx:
// <Oefenschema currentPage={currentPage} />

export default function Oefenschema({ currentPage, onNavigate }) {


  // ------------------------------------------------------
  // Extract tab uit currentPage (NIET uit window.location)
  // ------------------------------------------------------
  const getTab = (page) => {
    if (!page || typeof page !== "string") return "schema";
    const qs = page.split("?")[1];
    if (!qs) return "schema";
    const tab = new URLSearchParams(qs).get("tab");
    return tab || "schema";
  };

  // Init state uit currentPage
  const [activeSection, setActiveSection] = useState(getTab(currentPage));

  // Update wanneer currentPage verandert (via sidebar)
  useEffect(() => {
    setActiveSection(getTab(currentPage));
  }, [currentPage]);

  // UI → Router synchronisatie (blijft nodig)
  const switchTab = (tab) => {
    const newPage = `/oefenschema?tab=${tab}`;
    setActiveSection(tab);
    onNavigate(newPage);     // ← BELANGRIJK: update App state
    window.history.replaceState({}, "", newPage);
  };


  // --------------------------
  // Modals
  // --------------------------
  const [schemaEditData, setSchemaEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [pdfSchemaId, setPdfSchemaId] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // --------------------------
  // UI
  // --------------------------
  return (
    <div
      style={{
        background: COLOR_BG,
        minHeight: "100vh",
        padding: "30px 20px",
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
        <h1
          style={{
            fontSize: "22px",
            textTransform: "uppercase",
            color: "#fff",
            letterSpacing: "1.5px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          OEFENSCHEMA
        </h1>

        <p
          style={{
            color: "var(--muted)",
            fontSize: "14px",
            marginBottom: "35px",
            letterSpacing: "0.4px",
          }}
        >
          DATA-DRIVEN REHABILITATION INSIGHTS
        </p>

        {/* ORANJE LIJN BOVEN */}
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto 30px",
            height: "1px",
            backgroundColor: COLOR_ACCENT,
          }}
        />

        {/* TABS */}
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
            { key: "schema", title: "OVERZICHT", icon: <ClipboardList size={20} color={COLOR_ACCENT} /> },
            { key: "templates", title: "TEMPLATES", icon: <Layers size={20} color={COLOR_ACCENT} /> },
            { key: "nieuw", title: "NIEUW SCHEMA", icon: <FilePlus size={20} color={COLOR_ACCENT} /> },
          ].map((tab) => {
            const isActive = activeSection === tab.key;

            return (
              <div
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                style={{
                  width: "200px",
                  backgroundColor: "#1a1a1a",
                  borderRadius: "14px",
                  border: isActive ? `2px solid ${COLOR_ACCENT}` : "2px solid transparent",
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

                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: isActive ? COLOR_ACCENT : "white",
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

        {/* ORANJE LIJN */}
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto 30px",
            height: "1px",
            backgroundColor: COLOR_ACCENT,
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
