import React from "react";

export default function DesktopApp() {
  return (
    <div
      style={{
        background: "#1a1a1a",
        color: "#fff",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2 style={{ color: "#FF7900" }}>💻 Desktop versie actief</h2>
      <p>Hier komt je bestaande Revo-dashboard.</p>
    </div>
  );
}
