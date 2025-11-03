import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";  // ← Suspense, lazy
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband";
import { PuffLoader } from "react-spinners";
import logo2 from "./assets/logo2.png";
import { useDeviceMode } from "./hooks/useDeviceMode";
import Oefenschema from "./pages/Oefenschema";

const MobileApp = lazy(() => import("./mobile/MobileApp")); // ← nieuw

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "Gebruiker");
  const [currentPage, setCurrentPage] = useState("Home");
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeMain, setFadeMain] = useState(false);

  const { mode, setMode } = useDeviceMode(); // ← nieuw

  const API_URL = process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";
  const logoutTimer = useRef(null);
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minuten

  // ✅ Backend-check bij opstart
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await fetch(`${API_URL}/`);
      } catch {
        console.warn("❌ AI.THLETE NIET BEREIKBAAR");
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

  // ✅ Logout met fade en stabiele referentie
  const handleLogout = useCallback(() => {
    setFadeMain(true);
    setTimeout(() => {
      clearTimeout(logoutTimer.current);
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      setToken(null);
      setUserName("Gebruiker");
      setFadeMain(false);
    }, 500);
  }, []);

  // ⏱️ Sessie-timer starten of resetten
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const startSessionTimer = useCallback(() => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      alert("Sessie verlopen — je wordt automatisch uitgelogd.");
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  }, [handleLogout, SESSION_TIMEOUT_MS]);

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
  }, [token, startSessionTimer]);

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
          textAlign: "center",
          animation: "fadeIn 1.2s ease-in-out",
        }}
      >
        <img
          src={logo2}
          alt="AI.THLETE Logo"
          style={{
            width: "50vw",
            maxWidth: "320px",
            minWidth: "160px",
            marginBottom: "4vh",
            animation: "fadeIn 1.4s ease-in-out",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            animation: "fadeIn 1.6s ease-in-out",
          }}
        >
          <PuffLoader color="#FF7900" size={Math.min(window.innerWidth * 0.15, 100)} />
        </div>

        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // 🔐 Login check (geldt voor zowel desktop als mobile)
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // 🧩 Desktop router
  const renderPage = () => {
    switch (currentPage) {
      case "Home":
        return <Home />;
      case "Voorste Kruisband":
        return <VoorsteKruisband defaultTab="Populatie" />;
      case "Oefenschema":
        return <Oefenschema />;           
      default:
        return (
          <div style={{ padding: "20px 30px" }}>
            <h1 style={{ color: "var(--accent)" }}>{currentPage}</h1>
            <p>Inhoud van {currentPage}</p>
          </div>
        );
    }
  };

  // 📱 Mobile: toon aparte app (zonder Sidebar/desktop-layout)
  if (mode === "mobile") {
    return (
      <Suspense fallback={<div style={{ color: "#fff", padding: 16 }}>Laden…</div>}>
        <ModeSwitcher setMode={setMode} />
        <MobileApp userName={userName} onLogout={handleLogout} />
      </Suspense>
    );
  }

  // 💻 Desktop: jouw bestaande layout
  return (
    <div
      style={{
        opacity: fadeMain ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <ModeSwitcher setMode={setMode} />

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
          animation: "fadeInMain 0.8s ease-in-out",
        }}
      >
        {renderPage()}
      </main>

      <style>{`
        @keyframes fadeInMain {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        body.sidebar-collapsed { --sidebar-offset: 0px; }
        body:not(.sidebar-collapsed) { --sidebar-offset: 280px; }
      `}</style>
    </div>
  );
}

// 🔸 Bovenaan rechts: handmatig testen (force mobile/desktop)
function ModeSwitcher({ setMode }) {
  return null;(
    <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
      <button onClick={() => setMode("mobile")}>📱 Mobile</button>
      <button onClick={() => setMode("desktop")} style={{ marginLeft: 6 }}>
        💻 Desktop
      </button>
      <button
        onClick={() => {
        localStorage.removeItem("forceMode");
        window.location.reload();
        }}
        style={{ marginLeft: 6 }}
      >
        🔄 Auto
      </button>
    </div>
  );
}
