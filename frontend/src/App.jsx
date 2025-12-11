import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VoorsteKruisband from "./pages/VoorsteKruisband";
import { PuffLoader } from "react-spinners";
import logo2 from "./assets/logo2.png";
import { useDeviceMode } from "./hooks/useDeviceMode";
import Oefenschema from "./pages/Oefenschema/Oefenschema";

const MobileApp = lazy(() => import("./mobile/MobileApp")); // ← nieuw

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "Gebruiker");
  const [currentPage, setCurrentPage] = useState("/oefenschema?tab=schema");
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeMain, setFadeMain] = useState(false);

  const { mode, setMode } = useDeviceMode();

  const API_URL = process.env.REACT_APP_API_URL || "https://revo-backend-5dji.onrender.com";
  const logoutTimer = useRef(null);
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

  // Naam bewaren
  useEffect(() => {
    if (userName && userName !== "Gebruiker") {
      localStorage.setItem("user_name", userName);
    }
  }, [userName]);

  // Backend ping
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

  // Login
  const handleLogin = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    setUserName(localStorage.getItem("user_name") || "Gebruiker");
    startSessionTimer();
  };

  // Logout
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

  // Sessietimer
  const startSessionTimer = useCallback(() => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      alert("Sessie verlopen — je wordt automatisch uitgelogd.");
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  }, [handleLogout]);

  // Reset bij activiteit
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

  // Loader-screen
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
        }}
      >
        <img
          src={logo2}
          alt="AI.THLETE Logo"
          style={{
            width: "50vw",
            maxWidth: 320,
            minWidth: 160,
            marginBottom: "4vh",
          }}
        />
        <PuffLoader color="#FF7900" size={Math.min(window.innerWidth * 0.15, 100)} />
      </div>
    );
  }

  // Geen token → login
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // DESKTOP ROUTER — volledig gefixt
  const renderPage = () => {
    // Herken ALLE varianten van /oefenschema?...
    if (typeof currentPage === "string" && currentPage.startsWith("/oefenschema")) {
      return <Oefenschema currentPage={currentPage} onNavigate={setCurrentPage} />;
    }


    switch (currentPage) {
      case "Home":
        return <Home />;

      case "Voorste Kruisband":
        return <VoorsteKruisband defaultTab="Populatie" />;

      case "Oefenschema":
        return <Oefenschema currentPage={currentPage} onNavigate={setCurrentPage} />;


      default:
        return (
          <div style={{ padding: "20px 30px" }}>
            <h1 style={{ color: "var(--accent)" }}>{currentPage}</h1>
            <p>Inhoud van {currentPage}</p>
          </div>
        );
    }
  };

  // MOBILE
  if (mode === "mobile") {
    return (
      <Suspense fallback={<div style={{ color: "#fff", padding: 16 }}>Laden…</div>}>
        <MobileApp userName={userName} onLogout={handleLogout} />
      </Suspense>
    );
  }

  // DESKTOP
  return (
    <div style={{ opacity: fadeMain ? 0 : 1, transition: "opacity 0.5s ease-in-out" }}>
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
        body.sidebar-collapsed { --sidebar-offset: 0px; }
        body:not(.sidebar-collapsed) { --sidebar-offset: 280px; }
      `}</style>
    </div>
  );
}

// Handmatige test (niet in gebruik)
function ModeSwitcher() {
  return null;
}
