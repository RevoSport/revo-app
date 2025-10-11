import React, { useEffect, useState } from "react";
import { RingLoader } from "react-spinners";
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
          {/* Groot logo */}
          <img
            src={logo}
            alt="Revo Sport Logo"
            style={{
              width: 400,
              height: "auto",
              marginBottom: 60,
            }}
          />

          {/* Spinner */}
          <RingLoader color="#FF7900" size={60} speedMultiplier={1.1} />
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

      {/* 🔸 Fade-in animatie */}
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
