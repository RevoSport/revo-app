import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function VkbForm() {
  const [patientNaam, setPatientNaam] = useState("");
  const [datum, setDatum] = useState("");
  const [opmerkingen, setOpmerkingen] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Data opgeslagen:\nPatiënt: ${patientNaam}\nDatum: ${datum}`);
    // Later vervangen door apiPost("/vkb/add", formData)
  };

  return (
    <div
      style={{
        padding: 16,
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h3 style={{ color: "#FF7900", marginBottom: 12 }}>
        Voorste Kruisband — Data-ingave
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Patiëntnaam:
          <input
            type="text"
            value={patientNaam}
            onChange={(e) => setPatientNaam(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          Datum onderzoek:
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          Opmerkingen:
          <textarea
            value={opmerkingen}
            onChange={(e) => setOpmerkingen(e.target.value)}
            style={{ ...inputStyle, height: 100 }}
          />
        </label>

        <button type="submit" style={saveButton}>
          💾 Opslaan
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <Link to="/" style={backLink}>
          ← Terug naar start
        </Link>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 4,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#1b1b1b",
  color: "#fff",
  fontSize: 16,
};

const saveButton = {
  background: "#FF7900",
  border: "1px solid #FF7900",
  color: "#000",
  padding: "12px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 16,
};

const backLink = {
  color: "#FF7900",
  textDecoration: "none",
  fontWeight: 600,
};
