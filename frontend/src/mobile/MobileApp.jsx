// =====================================================
// FILE: src/mobile/MobileApp.jsx
// Revo Sport — Mobile App (100% uniforme header & layout)
// =====================================================

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import {
  Activity,
  UsersRound,
  ClipboardList,
  Dumbbell,
  Gauge,
  UserPlus,
  CalendarDays,
  CarFront,
} from "lucide-react"; // ✅ Staat nu juist bovenaan

// 🔹 Formulieren importeren
import FormPatient from "./screens/FormPatient";
import FormBlessure from "./screens/FormBlessure";
import FormBaseline from "./screens/FormBaseline";
import FormWeek6 from "./screens/FormWeek6";
import FormMaand3 from "./screens/FormMaand3";
import FormMaand45 from "./screens/FormMaand45";
import FormMaand6 from "./screens/FormMaand6";
import FormAutorijden from "./screens/FormAutorijden";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_BG = "#111";
const COLOR_TEXT = "#ffffff";

// 🎯 Universele headerstijl
const HEADER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 28px 0 28px",
  marginBottom: 20,
  height: 80,
};

export default function MobileApp({ userName = "Frederic", onLogout }) {
  return (
    <BrowserRouter>
      <div
        style={{
          background: COLOR_BG,
          color: COLOR_TEXT,
          minHeight: "100vh",
          fontFamily:
            "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={<StartScreen userName={userName} onLogout={onLogout} />}
          />
          <Route
            path="/vkb"
            element={<VkbMenu userName={userName} onLogout={onLogout} />}
          />
          <Route
            path="/vkb/patient"
            element={
              <FormLayout title="Patiënt">
                <FormPatient />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/blessure"
            element={
              <FormLayout title="Blessure">
                <FormBlessure />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/baseline"
            element={
              <FormLayout title="Baseline">
                <FormBaseline />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/week6"
            element={
              <FormLayout title="Week 6">
                <FormWeek6 />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/maand3"
            element={
              <FormLayout title="Maand 3">
                <FormMaand3 />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/maand45"
            element={
              <FormLayout title="Maand 4.5">
                <FormMaand45 />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/maand6"
            element={
              <FormLayout title="Maand 6">
                <FormMaand6 />
              </FormLayout>
            }
          />
          <Route
            path="/vkb/autorijden"
            element={
              <FormLayout title="Autorijden / Lopen">
                <FormAutorijden />
              </FormLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// =====================================================
// 🏁 STARTPAGINA — Grid Tiles + Icons
// =====================================================
function StartScreen({ userName, onLogout }) {
  const navigate = useNavigate();

  const startTiles = [
    { label: "Voorste Kruisband", icon: Activity, path: "/vkb" },
    { label: "Performance", icon: Gauge, path: "#" },
    { label: "Team Monitoring", icon: UsersRound, path: "#" },
    { label: "Oefenschema’s", icon: ClipboardList, path: "#" },
  ];

  return (
    <div
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        paddingBottom: 40,
        fontFamily:
          "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      {/* Header (centrale logo) */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 28px 0 28px",
          height: 80,
        }}
      >
        <img
          src={logo}
          alt="AI.THLETE Logo"
          onClick={() => navigate("/")}
          style={{
            width: 150,
            height: "auto",
            cursor: "pointer",
            filter: "drop-shadow(0 0 10px rgba(255,121,0,0.4))",
          }}
        />
      </div>

      {/* Welkomtekst */}
      <h2
        style={{
          textAlign: "center",
          color: "#FF7900",
          fontSize: 18,
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 24,
          letterSpacing: 1,
        }}
      >
        Welkom, {userName}
      </h2>

      {/* Grid tegels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          padding: "20px 28px",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        {startTiles.map(({ label, icon: Icon, path }) => (
<motion.div
  key={label}
  whileTap={{ scale: 0.97 }}
  onClick={() => path !== "#" && navigate(path)}
  style={{
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    height: 110,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#C9C9C9",
    cursor: "pointer",
    transition: "all 0.25s ease",
  }}
  onMouseEnter={(e) => {
    if (path !== "#") {
      e.currentTarget.style.color = "#FF7900"; 
      const svg = e.currentTarget.querySelector("svg");
      if (svg) svg.style.stroke = "#FF7900"; // icoon wit (Lucide gebruikt stroke)
    }
  }}
  onMouseLeave={(e) => {
    if (path !== "#") {
      e.currentTarget.style.color = "#C9C9C9"; // tekst terug wit
      const svg = e.currentTarget.querySelector("svg");
      if (svg) svg.style.stroke = "#FF7900"; // icoon terug oranje
    }
  }}
>
  <Icon
    size={26}
    stroke={path === "#" ? "#C9C9C9" : "#FF7900"}
    style={{
      marginBottom: 8,
      transition: "stroke 0.25s ease",
    }}
  />
  {label}
</motion.div>


        ))}
      </div>

      {/* Logout onderaan */}
      <div style={{ textAlign: "center", marginTop: 50 }}>
{/* Logout onderaan (vast aan schermonderzijde) */}
<button
  onClick={onLogout}
  style={{
    position: "fixed",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    background: "transparent",
    border: `1px solid #FF7900`,
    borderRadius: 8,
    padding: "10px 20px",
    color: "#FF7900",
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s ease",
    zIndex: 50, // blijft boven de content
  }}
>
  ↩ Uitloggen
</button>

      </div>
    </div>
  );
}

// =====================================================
// 🔹 VKB MENU — Grid + Icons + Overlay “← Start”
// =====================================================
function VkbMenu({ userName, onLogout }) {
  const navigate = useNavigate();

  const tiles = [
    { label: "Patiënt", icon: UserPlus, path: "/vkb/patient" },
    { label: "Blessure", icon: Activity, path: "/vkb/blessure" },
    { label: "Baseline", icon: ClipboardList, path: "/vkb/baseline" },
    { label: "Week 6", icon: CalendarDays, path: "/vkb/week6" },
    { label: "Maand 3", icon: CalendarDays, path: "/vkb/maand3" },
    { label: "Maand 4.5", icon: CalendarDays, path: "/vkb/maand45" },
    { label: "Maand 6", icon: CalendarDays, path: "/vkb/maand6" },
    { label: "Autorijden / Lopen", icon: CarFront, path: "/vkb/autorijden" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        paddingBottom: 60,
      }}
    >
      {/* Header met overlay terugknop */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 28px 0 28px",
          height: 80,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: 18,
            left: 22,
            background: "rgba(17,17,17,0.8)",
            border: "0px solid transparent",
            borderRadius: "10px",
            color: "#FF7900",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            padding: "6px 10px",
            backdropFilter: "blur(4px)",
          }}
        >
          ← Start
        </button>

        <img
          src={logo}
          alt="AI.THLETE Logo"
          onClick={() => navigate("/")}
          style={{
            width: 150,
            height: "auto",
            cursor: "pointer",
            filter: "drop-shadow(0 0 10px rgba(255,121,0,0.4))",
          }}
        />
      </div>

      {/* Titel */}
      <h2
        style={{
          textAlign: "center",
          color: "#FF7900",
          fontSize: 18,
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 24,
          letterSpacing: 1,
        }}
      >
        Voorste Kruisband
      </h2>

      {/* Grid met tegels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          padding: "20px 28px",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        {tiles.map(({ label, icon: Icon, path }) => (
          <motion.div
            key={path}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(path)}
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              height: 110,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: "#C9C9C9",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FF7900"; // tekst wit
              const svg = e.currentTarget.querySelector("svg");
              if (svg) svg.style.stroke = "#FF7900"; // icoon wit
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#C9C9C9"; // tekst oranje
              const svg = e.currentTarget.querySelector("svg");
              if (svg) svg.style.stroke = "#FF7900"; // icoon terug oranje
            }}
          >
            <Icon
              size={26}
              stroke="#FF7900"
              style={{
                marginBottom: 8,
                transition: "stroke 0.25s ease",
              }}
            />
            {label}
          </motion.div>
        ))}
      </div>

 
    </motion.div>
  );
}


// =====================================================
// 🔹 Form layout (met overlay header zoals VKB)
// =====================================================
function FormLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: COLOR_BG,
        minHeight: "100vh",
        color: "#fff",
        fontFamily:
          "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        position: "relative",
      }}
    >
      {/* Overlay Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 28px 0 28px",
          height: 80,
        }}
      >
        {/* Terugknop (overlay linksboven) */}
        <button
          onClick={() => navigate("/vkb")}
          style={{
            position: "absolute",
            top: 18,
            left: 22,
            background: "rgba(17,17,17,0.8)",
            border: "0px solid transparent",
            borderRadius: "10px",
            color: COLOR_ACCENT,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            padding: "6px 10px",
            backdropFilter: "blur(4px)",
          }}
        >
          ← Terug
        </button>

        {/* Logo in het midden */}
        <img
          src={logo}
          alt="AI.THLETE Logo"
          onClick={() => navigate("/")}
          style={{
            width: 150,
            height: "auto",
            cursor: "pointer",
            filter: "drop-shadow(0 0 10px rgba(255,121,0,0.4))",
          }}
        />
      </div>

      {/* Titel */}
      <h2
        style={{
          textAlign: "center",
          color: COLOR_ACCENT,
          fontSize: 18,
          fontWeight: 600,
          textTransform: "uppercase",
          marginTop: 10,
          marginBottom: 24,
          letterSpacing: 1,
          lineHeight: 1.4,
        }}
      >
        Voorste Kruisband
        <br />
        <span style={{ fontSize: 18, color: "#c9c9c9" }}>{title}</span>
      </h2>


      {/* Formulierinhoud */}
      <div
        style={{
          padding: "0 28px 60px 28px",
        }}
      >
        {children}
      </div>
    </div>
  );
}


// =====================================================
// 🔹 Styling helpers
// =====================================================
const logoutButton = {
  display: "inline-block",
  padding: "10px 20px",
  border: `1px solid ${COLOR_ACCENT}`,
  borderRadius: 8,
  color: COLOR_ACCENT,
  background: "transparent",
  fontWeight: 500,
  cursor: "pointer",
  fontSize: 13,
  transition: "all 0.3s ease",
};

const mainButton = {
  background: "transparent",
  border: `1px solid ${COLOR_ACCENT}`,
  color: COLOR_ACCENT,
  padding: "14px 24px",
  borderRadius: 10,
  fontWeight: 500,
  textDecoration: "none",
  letterSpacing: 0.5,
  transition: "all 0.25s ease",
};
