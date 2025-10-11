import React from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";

export default function TestAPI() {
  const handleClick = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/week6`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blessure_id: 1,
          Datumonderzoek: "2025-10-09",
          Knie_flexie_L: 125,
          Knie_flexie_R: 130,
          Knie_extensie_L: 10,
          Knie_extensie_R: 12,
        }),
      });

      if (!response.ok) throw new Error("Fout bij verzenden");
      const data = await response.json();
      console.log("✅ Opgeslagen:", data);
      alert("✅ Week6 data succesvol opgeslagen!");
    } catch (error) {
      console.error("❌ API-fout:", error);
      alert("❌ Er ging iets mis bij het opslaan.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "#FF7900" }}>Revo API Test</h1>
      <button
        onClick={handleClick}
        style={{
          backgroundColor: "#FF7900",
          color: "white",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Verstuur testdata naar backend
      </button>
    </div>
  );
}
