import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF7900", "#555555"];

export default function Populatie() {
  // --- Dummydata (later via MySQL) ---
  const genderData = [
    { name: "Vrouw", value: 65 },
    { name: "Man", value: 35 },
  ];
  const sportData = [
    { name: "Voetbal", value: 6 },
    { name: "Korfbal", value: 3 },
    { name: "Ander", value: 1 },
  ];
  const sportniveauData = [
    { name: "Recreatief", value: 5 },
    { name: "Competitief", value: 5 },
    { name: "Sedentair", value: 2 },
  ];
  const etiologieData = [
    { name: "Non-Contact", value: 72 },
    { name: "Contact", value: 28 },
  ];
  const artsData = [
    { name: "Dr. Dobbelaere", value: 8 },
    { name: "Dr. Vanstiphout", value: 2 },
    { name: "Dr. De Neve", value: 2 },
    { name: "Dr. Scherpens", value: 1 },
    { name: "Dr. Moens", value: 1 },
  ];
  const operatieData = [
    { name: "Hamstringpees", value: 13 },
    { name: "Niet gekend", value: 2 },
    { name: "Quadricepspees", value: 1 },
  ];
  const letselsData = [
    { name: "NVM", value: 10 },
    { name: "Meniscusscheur", value: 2 },
    { name: "Meniscus dissectie", value: 1 },
  ];
  const monoloopData = [
    { name: "Ja", value: 57 },
    { name: "Nee", value: 43 },
  ];
  const kpiData = [
    { label: "Aantal patiënten", value: "16" },
    { label: "Gem. tijd ongeval → operatie", value: "31.2 dagen" },
    { label: "Gem. tijd operatie → intake", value: "4.3 dagen" },
  ];

  const cardStyle = {
    background: "#1a1a1a",
    borderRadius: "10px",
    padding: "25px 20px",
    textAlign: "center",
    boxShadow: "0 0 8px rgba(0,0,0,0.25)",
  };
  const titleStyle = {
    fontSize: "12px",
    color: "#FFFFFF",
    marginBottom: 10,
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "20px 0 60px 0",
        color: "var(--text)",
        animation: "fadeIn 0.6s ease",
      }}
    >
      <style>
        {`
          @media (max-width: 1199px) {
            .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 799px) {
            .grid-4, .grid-3 { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      {/* === TITEL POPULATIE === */}
      <h2
        style={{
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        POPULATIE BESCHRIJVING
      </h2>

      {/* === KPI-TILES === */}
      <div
        className="grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        {kpiData.map((kpi) => (
          <div key={kpi.label} style={cardStyle}>
            <div style={{ color: "#FF7900", fontSize: "22px", fontWeight: 700 }}>
              {kpi.value}
            </div>
            <div style={{ color: "#c9c9c9", fontSize: "12px" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* === POPULATIE GRAFIEKEN === */}
      <div
        className="grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          justifyContent: "center",
          marginBottom: "40px",
        }}
      >
        {/* Gemiddelde Tijd */}
        <div style={{ ...cardStyle, textAlign: "left" }}>
          <h4 style={{ ...titleStyle, textAlign: "center" }}>
            Gemiddelde Tijd
          </h4>
          <p style={{ fontSize: "12px", color: "#c9c9c9", marginTop: 4 }}>
            Gemiddelde tijd tussen ongeval & operatie:{" "}
            <b style={{ color: "#FF7900" }}>31.2 dagen</b> <br />
            Gemiddelde tijd tussen operatie & intake:{" "}
            <b style={{ color: "#FF7900" }}>4.3 dagen</b>
          </p>
        </div>

        {/* Geslacht */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Geslacht</h4>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={4}
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sport */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Sport</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sportData}>
              <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#FF7900" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sportniveau */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Sportniveau</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sportniveauData}>
              <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#FF7900" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- SCHEIDINGSLIJN --- */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#FF7900",
          width: "100%",
          margin: "25px 0 40px 0",
        }}
      ></div>

      {/* === MEDISCH SECTIE === */}
      <h2
        style={{
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        MEDISCH
      </h2>

      <div
        className="grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          justifyContent: "center",
        }}
      >
        {/* Arts */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Arts</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={artsData}>
              <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#FF7900" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Etiologie + Monoloop */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={cardStyle}>
            <h4 style={titleStyle}>Etiologie</h4>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={etiologieData}
                  dataKey="value"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                >
                  {etiologieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={cardStyle}>
            <h4 style={titleStyle}>Monoloop</h4>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={monoloopData}
                  dataKey="value"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                >
                  {monoloopData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operatie Type */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Operatie Type</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={operatieData}>
              <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#FF7900" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bijkomende Letsels */}
        <div style={cardStyle}>
          <h4 style={titleStyle}>Bijkomende Letsels</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={letselsData}>
              <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#FF7900" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
