import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";

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
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#1b1b1b",
          padding: "2rem",
          borderRadius: 16,
          width: 320,
          textAlign: "center",
          border: "1px solid rgba(255,121,0,0.4)",
        }}
      >
        <h2 style={{ color: "#FF7900", marginBottom: 20 }}>Revo Sport Login</h2>

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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            backgroundColor: "#FF7900",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
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
  );
}
