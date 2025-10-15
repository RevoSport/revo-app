import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband";
import { RingLoader } from "react-spinners";
import logo from "./assets/logo.png";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "Gebruiker");
  const [currentPage, setCurrentPage] = useState("Home");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";
  const logoutTimer = useRef(null); // ⏱️ sessietimer-referentie
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
  }, []);

  // 🌀 Loader-scherm
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
        }}
      >
        <img src={logo} alt="Revo Sport Logo" style={{ width: 120, marginBottom: 25 }} />
        <RingLoader color="#FF7900" size={65} />
        <p style={{ marginTop: 20, fontSize: 13, opacity: 0.8 }}>
          {status || "Verbinden..."}
        </p>
      </div>
    );
  }

  // ✅ Login & Logout handlers
  const handleLogin = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUserName(localStorage.getItem("user_name") || "Gebruiker");
    startSessionTimer(); // start timer bij login
  };

  const handleLogout = () => {
    clearTimeout(logoutTimer.current);
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    setToken(null);
    setUserName("Gebruiker");
  };

  // ⏱️ Functie om sessietimer te (her)starten
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

      // ✅ De hook wordt altijd uitgevoerd, maar alleen actief als er een token is
      if (token) {
        events.forEach((ev) => window.addEventListener(ev, resetTimer));
        startSessionTimer();
      }

      return () => {
        events.forEach((ev) => window.removeEventListener(ev, resetTimer));
        clearTimeout(logoutTimer.current);
      };
    }, [token]);

      }

  // 🧩 Router
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;

      case "Voorste Kruisband":
        // ✅ Automatisch tonen van de Populatie-subpagina
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
