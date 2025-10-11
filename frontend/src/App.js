import React, { useEffect, useState } from "react";
import logo from "./assets/Middel 4.svg"; // ⬅️ pad aanpassen indien map anders heet

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
        setTimeout(() => setFadeOut(true), 400);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 1000);
      })
      .catch((err) => {
        setStatus("❌ Fout: " + err.message);
        setTimeout(() => setFadeOut(true), 400);
        setTimeout(() => {
          setLoading(false);
          setShowMain(true);
        }, 1000);
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
            transition: "opacity 0.8s ease-out",
            zIndex: 1000,
          }}
        >
          {/* SVG-logo */}
          <img
            src={logo}
            alt="Revo Sport Logo"
            style={{
              width: 120,
              height: 120,
              marginBottom: 40,
              animation: "pulseLogo 2s infinite ease-in-out",
            }}
          />

          {/* Hartslaglijn */}
          <div className="heartbeat-container">
            <svg
              width="240"
              height="70"
              viewBox="0 0 240 70"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline
                fill="none"
                stroke="#FF7900"
                strokeWidth="3"
                points="0,35 50,35 60,10 70,60 80,35 140,35 150,15 160,55 170,35 240,35"
                className="heartbeat-line"
              />
            </svg>
          </div>

          <p
            style={{
              marginTop: 15,
              color: "#FF7900",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            Loading...
          </p>
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
            opacity: showMain ? 1 : 0,
            animation: "fadeIn 1s ease-in forwards",
          }}
        >
          <h2>🔗 Revo Sport API Test</h2>
          <pre>{status}</pre>
        </div>
      )}

      {/* 🔸 Animaties */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes pulseLogo {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
          }

          /* Hartslaglijn + glow */
          .heartbeat-line {
            stroke-dasharray: 450;
            stroke-dashoffset: 450;
            filter: drop-shadow(0 0 6px rgba(255,121,0,0.6));
            animation: heartbeat 2s ease-in-out infinite, glow 2s ease-in-out infinite;
          }

          @keyframes heartbeat {
            0% { stroke-dashoffset: 450; }
            50% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -450; }
          }

          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 6px rgba(255,121,0,0.4)); }
            50% { filter: drop-shadow(0 0 16px rgba(255,121,0,1)); }
          }

          .heartbeat-container {
            margin-top: 10px;
          }
        `}
      </style>
    </>
  );
}

export default App;
