import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband";
import { PuffLoader } from "react-spinners";
import logo from "./assets/logo.png";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "Gebruiker");
  const [currentPage, setCurrentPage] = useState("Home");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";
  const logoutTimer = useRef(null);
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minuten

  // ✅ Backend-check bij opstart
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        const data = await res.json();
        if (data.status) setStatus(data.status);
      } catch {
        setStatus("❌ Backend niet bereikbaar");
      } finally {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => setIsLoading(false), 600);
        }, 800);
      }
    };
    checkBackend();
  }, [API_URL]);

  // ✅ Login & Logout handlers
  const handleLogin = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUserName(localStorage.getItem("user_name") || "Gebruiker");
    startSessionTimer();
  };

  const handleLogout = () => {
    clearTimeout(logoutTimer.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    setToken(null);
    setUserName("Gebruiker");
  };

  // ⏱️ Sessie-timer starten of resetten
  const startSessionTimer = () => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      alert("Sessie verlopen — je wordt automatisch uitgelogd.");
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  };

  // 🖱️ Reset timer bij activiteit
  useEffect(() => {
    const resetTimer = () => startSessionTimer();
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    if (token) {
      events.forEach((ev) => window.addEventListener(ev, resetTimer));
      startSessionTimer();
    }

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      clearTimeout(logoutTimer.current);
    };
  }, [token]);

  // 🌀 Loader-scherm met fade-in animatie en responsieve verhoudingen
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111111",
          color: "#FF7900",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.6s ease-in-out",
          textAlign: "center",
          animation: "fadeIn 1.2s ease-in-out",
        }}
      >
        {/* Logo */}
        <img
          src={logo}
          alt="AI.THLETE Logo"
          style={{
            width: "50vw",
            maxWidth: "320px",
            minWidth: "160px",
            marginBottom: "4vh",
            animation: "fadeIn 1.4s ease-in-out",
          }}
        />

        {/* Spinner gecentreerd onder logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginBottom: "4vh",
            animation: "fadeIn 1.6s ease-in-out",
          }}
        >
          <PuffLoader
            color="#FF7900"
            size={Math.min(window.innerWidth * 0.15, 100)} // 15% van breedte, max 100px
          />
        </div>

        {/* Status-tekst */}
        <p
          style={{
            marginTop: "1vh",
            fontSize: "clamp(14px, 2vw, 18px)",
            letterSpacing: 0.5,
            opacity: 0.85,
            animation: "fadeIn 1.8s ease-in-out",
          }}
        >
          {status || "Verbinden..."}
        </p>

        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // 🔐 Login check
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // 🧩 Router
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;
      case "Voorste Kruisband":
        return <VoorsteKruisband defaultTab="Populatie" />;
      default:
        return (
          <div style={{ padding: "20px 30px" }}>
            <h1 style={{ color: "var(--accent)" }}>{currentPage}</h1>
            <p>Inhoud van {currentPage}</p>
          </div>
        );
    }
  };

  // 🎯 Layout
  return (
    <div>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        userName={userName}
      />

      <main
        style={{
          transition: "margin-left 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          marginLeft: "var(--sidebar-offset, 280px)",
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        {renderPage()}
      </main>

      <style>{`
        body.sidebar-collapsed {
          --sidebar-offset: 0px;
        }
        body:not(.sidebar-collapsed) {
          --sidebar-offset: 280px;
        }
      `}</style>
    </div>
  );
}
