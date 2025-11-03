// =====================================================
// FILE: src/pages/Oefenschema.jsx
// Revo Sport — Oefenschema-module (Voorste Kruisband layout)
// =====================================================

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Layers,
  FilePlus,
  FileText,
  Mail,
} from "lucide-react";
import { apiGet } from "../api";
import { PuffLoader } from "react-spinners";
import FormOefenschema from "../forms/FormOefenschema";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#111111";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_CARD = "#1a1a1a";

export default function Oefenschema() {
  const [activeSection, setActiveSection] = useState("schema");
  const [schemas, setSchemas] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // 🔹 Data ophalen
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSection === "schema") {
          const data = await apiGet("/oefenschema/");
          setSchemas(data);
        } else if (activeSection === "templates") {
          const data = await apiGet("/oefenschema/template");
          setTemplates(data);
        }
      } catch (err) {
        console.error("❌ Fout bij ophalen data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeSection]);

  // =====================================================
  // 🔹 Card-definities (bovenste rij)
  // =====================================================
  const cards = [
    { key: "schema", title: "SCHEMA'S", icon: <ClipboardList size={26} color={COLOR_ACCENT} /> },
    { key: "templates", title: "TEMPLATES", icon: <Layers size={26} color={COLOR_ACCENT} /> },
    { key: "new", title: "NIEUW SCHEMA", icon: <FilePlus size={26} color={COLOR_ACCENT} /> },
  ];

  // =====================================================
  // 🔹 Loader
  // =====================================================
  if (loading) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: COLOR_ACCENT,
        }}
      >
        <PuffLoader color={COLOR_ACCENT} size={90} />
        <p style={{ marginTop: 20, fontSize: 14 }}>Gegevens worden geladen...</p>
      </div>
    );
  }

  // =====================================================
  // 🔹 UI
  // =====================================================
  return (
    <div
      style={{
        backgroundColor: COLOR_BG,
        minHeight: "100vh",
        padding: "40px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* === HEADER === */}
      <h1
        style={{
          fontSize: "22px",
          textTransform: "uppercase",
          color: COLOR_TEXT,
          letterSpacing: "1.5px",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        OEFENTHERAPIE / OEFENSCHEMA
      </h1>
      <p
        style={{
          color: COLOR_MUTED,
          fontSize: "13px",
          marginBottom: "35px",
          letterSpacing: "0.5px",
        }}
      >
        PERSONALIZED TRAINING MODULE
      </p>

      {/* === ORANJE LIJN === */}
      <div style={{ height: "1px", backgroundColor: COLOR_ACCENT, width: "100%", marginBottom: "20px" }}></div>

      {/* === CARD-RIJ === */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "25px",
          flexWrap: "nowrap",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {cards.map((card) => {
          const isActive = activeSection === card.key;
          return (
            <div
              key={card.key}
              onClick={() => setActiveSection(card.key)}
              style={{
                flex: "1",
                backgroundColor: COLOR_CARD,
                borderRadius: "10px",
                border: isActive ? `1.5px solid ${COLOR_ACCENT}` : "1.5px solid transparent",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
                transform: isActive ? "translateY(-2px)" : "translateY(0)",
                minWidth: "120px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "28px", marginBottom: "8px" }}>
                {card.icon}
              </div>
              <h3
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: isActive ? "#727170" : "white",
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  whiteSpace: "pre-line",
                  lineHeight: "14px",
                }}
              >
                {card.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* === ORANJE LIJN === */}
      <div style={{ height: "1px", backgroundColor: COLOR_ACCENT, width: "100%", marginBottom: "30px" }}></div>

      {/* === INHOUD === */}
      <div style={{ width: "100%", maxWidth: "1100px", textAlign: "left" }}>
        {activeSection === "schema" && (
          <>
            {schemas.length === 0 ? (
              <p style={{ textAlign: "center", color: COLOR_MUTED }}>Geen oefenschema’s gevonden.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#1c1c1c",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr style={{ background: "#222", color: COLOR_ACCENT }}>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Patiënt</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Datum</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Titel</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Oefeningen</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas.map((s, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        transition: "0.2s",
                      }}
                    >
                      <td style={{ padding: "10px 12px" }}>{s.patient?.naam || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {new Date(s.datum).toLocaleDateString("nl-BE")}
                      </td>
                      <td style={{ padding: "10px 12px" }}>{s.titel || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>{s.oefeningen?.length || 0}</td>
                      <td style={{ textAlign: "center", padding: "10px" }}>
                        <button
                          style={{
                            background: "none",
                            border: "1px solid " + COLOR_ACCENT,
                            color: COLOR_ACCENT,
                            borderRadius: 8,
                            padding: "4px 10px",
                            marginRight: 8,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          <FileText size={14} /> PDF
                        </button>
                        <button
                          style={{
                            background: COLOR_ACCENT,
                            border: "none",
                            color: "#fff",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          <Mail size={14} /> Mail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeSection === "templates" && (
          <>
            {templates.length === 0 ? (
              <p style={{ textAlign: "center", color: COLOR_MUTED }}>Geen templates beschikbaar.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#1c1c1c",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr style={{ background: "#222", color: COLOR_ACCENT }}>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Titel</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Oefeningen</th>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Laatst gewijzigd</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={{ padding: "10px 12px" }}>{t.titel}</td>
                      <td style={{ padding: "10px 12px" }}>{t.oefeningen?.length || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {new Date(t.created_at).toLocaleDateString("nl-BE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeSection === "new" && (
          <div style={{ marginTop: 10 }}>
            <FormOefenschema />
          </div>
        )}
      </div>
    </div>
  );
}
