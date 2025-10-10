import React, { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("⏳ Laden...");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/`)
      .then((res) => res.json())
      .then((data) => setStatus(JSON.stringify(data, null, 2)))
      .catch((err) => setStatus("❌ Fout: " + err.message));
  }, []);

  return (
    <div style={{ padding: "2rem", background: "#0d1117", color: "white" }}>
      <h2>🔗 Revo Sport API Test</h2>
      <pre>{status}</pre>
    </div>
  );
}

export default App;
