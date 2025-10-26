import React, { useEffect, useState } from "react";
import { apiGet } from "../api"; // ✅ gebruikt jouw helper

export default function Home() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await apiGet("/patients/");
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  // 🟠 Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FF7900",
          fontSize: 18,
        }}
      >
        Gegevens laden...
      </div>
    );
  }

  // 🔴 Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red",
          fontSize: 16,
        }}
      >
        {error}
      </div>
    );
  }

  // 🟢 Succes: toon patiëntenlijst
  return (
    <div
      className="fade-in"
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily:
          "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1
        style={{
          color: "var(--accent)",
          fontWeight: 700,
          fontSize: "clamp(22px, 2.8vw, 30px)",
          textTransform: "uppercase",
          marginBottom: 30,
        }}
      >
        FROM TIME-BASED REHABILITATION<br />
        TO CRITERIA-BASED REHABILITATION
      </h1>

      <p
        style={{
          color: "var(--text)",
          opacity: 0.9,
          fontSize: "clamp(16px, 1.8vw, 18px)",
          marginBottom: 40,
          fontStyle: "italic",
        }}
      >
        “INSIGHT FUELS INNOVATION”
      </p>

      {patients.length === 0 ? (
        <p style={{ color: "#aaa" }}>Nog geen patiënten geregistreerd.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.6 }}>
          {patients.map((p) => (
            <li key={p.id}>{p.naam}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
