import React, { useState } from "react";
import logo from "../assets/logo.png";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) {
        throw new Error("Ongeldige login of wachtwoord");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onLogin && onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 🔸 Fade-in container */}
      <div
        style={{
          animation: "fadeIn 0.9s ease-out",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#1b1b1b",
            padding: "2rem",
            borderRadius: 16,
            width: 320,
            textAlign: "center",
            border: "1px solid rgba(255,121,0,0.4)",
            boxShadow: "0 0 25px rgba(0,0,0,0.3)",
          }}
        >
          {/* 🔹 Logo gecentreerd */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              marginBottom: 25,
            }}
          >
            <img
              src={logo}
              alt="Revo Sport Logo"
              style={{
                width: 160,
                marginBottom: 10,
                filter: "drop-shadow(0 0 8px rgba(255,121,0,0.4))",
                opacity: 0.95,
              }}
            />
          </div>

          {/* 🔹 Inputvelden */}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#222",
              color: "white",
            }}
          />

          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 20,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#222",
              color: "white",
            }}
          />

          {/* 🔹 Login-knop */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(255,121,0,0.4)",
              backgroundColor: "transparent",
              color: rgba(255,121,0,0.4),
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#FFFFFF";
              e.target.style.borderColor = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = rgba(255,121,0,0.4);
              e.target.style.borderColor = rgba(255,121,0,0.4);
            }}
          >
            {loading ? "Aan het inloggen..." : "Login"}
          </button>


          {error && (
            <p style={{ color: "tomato", marginTop: 15, fontSize: 14 }}>
              {error}
            </p>
          )}
        </form>
      </div>

      {/* 🔸 Fade-in animatie CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}