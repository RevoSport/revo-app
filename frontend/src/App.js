import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import logo from "./assets/Middel 4.png";

function App() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(JSON.stringify(data, null, 2));
        // start snelle fade-out
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 300); // 0.3s fade-out
      })
      .catch((err) => {
        setStatus("❌ Fout: " + err.message);
        setFadeOut(true);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 300);
      });
  }, []);

  return (
    <>
      {/* 🔸 Loading Screen */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#0E1117",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.3s ease-out",
            zIndex: 1000,
          }}
        >
          <img
            src={logo}
            alt="Revo Sport Logo"
            style={{
              width: 400,
              height: "auto",
              marginBottom: 60,
              filter: "drop-shadow(0 0 10px rgba(255,121,0,0.3))",
            }}
          />

          <PuffLoader color="#FF7900" size={90} speedMultiplier={0.8} />
        </div>
      )}

      {/* 🔹 Main App */}
      {showMain && (
        <div
          style={{
            padding: "2rem",
            background: "#0E1117",
            color: "white",
            minHeight: "100vh",
            animation: "fadeIn 0.8s ease-in forwards",
          }}
        >
          <h2>🔗 Revo Sport API Test</h2>
          <pre>{status}</pre>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}

export default App;
