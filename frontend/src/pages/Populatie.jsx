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
  const genderData = [
    { name: "Vrouw", value: 65 },
    { name: "Man", value: 35 },
  ];

  const sportData = [
    { name: "Voetbal", value: 6 },
    { name: "Korfbal", value: 3 },
    { name: "Ander", value: 1 },
  ];

  const etiologieData = [
    { name: "Non-Contact", value: 72 },
    { name: "Contact", value: 28 },
  ];

  const kpiData = [
    { label: "Aantal patiënten", value: "16" },
    { label: "Gem. tijd ongeval → operatie", value: "31.2 dagen" },
    { label: "Gem. tijd operatie → intake", value: "4.3 dagen" },
  ];

  return (
    <div
      style={{
        width: "85%",
        margin: "0 auto",
        padding: "20px 0 60px 0",
        color: "var(--text)",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* === TITEL === */}
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        {kpiData.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              backgroundColor: "#1a1a1a",
              padding: "18px 10px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 0 8px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ color: "#FF7900", fontSize: "22px", fontWeight: 700 }}>
              {kpi.value}
            </div>
            <div
              style={{
                color: "#c9c9c9",
                fontSize: "12px",
              }}
            >
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* === GRAFIEKEN === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          justifyContent: "center",
        }}
      >
        {/* Geslacht */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "10px",
            padding: "25px 20px",
            textAlign: "center",
            boxShadow: "0 0 8px rgba(0,0,0,0.25)",
          }}
        >
          <h4
            style={{
              fontSize: "12px",
              color: "#FFFFFF",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Geslacht
          </h4>
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
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "10px",
            padding: "25px 20px",
            textAlign: "center",
            boxShadow: "0 0 8px rgba(0,0,0,0.25)",
          }}
        >
          <h4
            style={{
              fontSize: "12px",
              color: "#FFFFFF",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Sport
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sportData}>
              <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#FF7900" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Etiologie */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "10px",
            padding: "25px 20px",
            textAlign: "center",
            boxShadow: "0 0 8px rgba(0,0,0,0.25)",
          }}
        >
          <h4
            style={{
              fontSize: "12px",
              color: "#FFFFFF",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Etiologie
          </h4>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={etiologieData}
                dataKey="value"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={4}
              >
                {etiologieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
