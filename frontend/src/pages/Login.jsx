import React, { useState } from "react";
import logo from "../assets/logo.png";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLocal = window.location.hostname === "localhost";
  const API_URL = isLocal
    ? "http://localhost:8000"
    : "https://revo-backend-5dji.onrender.com";

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
      localStorage.setItem(
        "user_name",
        data.user_name || email.split("@")[0]
      );

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
        padding: "40px 20px",
      }}
    >
      <div style={{ animation: "fadeIn 0.9s ease-out" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#1b1b1b",
            padding: "2.2rem 1.8rem",
            borderRadius: 18,
            width: "100%",
            maxWidth: 360,
            textAlign: "center",
            border: "1px solid rgba(255,121,0,0.4)",
            boxShadow: "0 0 25px rgba(0,0,0,0.4)",
            boxSizing: "border-box",
          }}
        >

          {/* Logo + Slogan */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 30,
              animation: "fadeLogo 1.2s ease-out",
            }}
          >
            <img
              src={logo}
              alt="Revo Sport Logo"
              style={{
                width: 200,
                marginBottom: 8,
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            />
            <span
              style={{
                fontSize: 14,
                color: "#c9c9c9",
                letterSpacing: "1px",
                fontWeight: 600,
                marginTop: 4,
                textAlign: "center",
                lineHeight: 1.6,
                textTransform: "uppercase",
                animation: "fadeText 1.5s ease-out",
              }}
            >
              Criteria-Based Rehab & {" "}
              <span style={{ color: "#FF7900", fontWeight: 700 }}>
              Performance&nbsp;Tracking
              </span>
            </span>
          </div>

          {/* Inputs */}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#222",
              color: "white",
              fontSize: 14,
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
              padding: 12,
              marginBottom: 22,
              borderRadius: 8,
              border: "1px solid #555",
              backgroundColor: "#222",
              color: "white",
              fontSize: 14,
            }}
          />

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #FF7900",
              backgroundColor: "transparent",
              color: "#FF7900",
              fontWeight: 500,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#FFFFFF";
              e.target.style.borderColor = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#FF7900";
              e.target.style.borderColor = "#FF7900";
            }}
          >
            {loading ? "AAN HET INLOGGEN" : "LOGIN"}
          </button>

          {error && (
            <p style={{ color: "tomato", marginTop: 15, fontSize: 14 }}>
              {error}
            </p>
          )}
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeLogo {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes fadeText {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
