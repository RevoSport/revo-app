// 📁 src/pages/Kracht.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Kracht({ data }) {
  // ✅ Defensive copy
  const cleanData = Array.isArray(data) ? [...data] : [];

  // 🔹 fases in volgorde
  const fases = ["Week 6", "Maand 3", "Maand 4.5", "Maand 6"];

  // 🔹 Alle testnamen ophalen uit eerste fase
  const allTests = useMemo(() => {
    if (!cleanData.length) return [];
    const keys = Object.keys(cleanData[0]?.tests || {});
    return keys;
  }, [cleanData]);

  // 🔹 Alle ratio’s
  const allRatios = useMemo(() => {
    if (!cleanData.length) return [];
    return Object.keys(cleanData[0]?.ratios || {});
  }, [cleanData]);

  // 🔹 Functie om dataset per test op te bouwen
  const buildTestData = (testKey) =>
    fases.map((fase) => {
      const faseObj = cleanData.find((f) => f.fase === fase);
      const t = faseObj?.tests?.[testKey] || {};
      return {
        fase,
        geopereerd: t.operated_avg ?? null,
        niet_geopereerd: t.healthy_avg ?? null,
        diff_pct: t.diff_pct ?? null,
      };
    });

  // 🔹 Dataset voor ratio’s
  const buildRatioData = (ratioKey) =>
    fases.map((fase) => {
      const faseObj = cleanData.find((f) => f.fase === fase);
      const r = faseObj?.ratios?.[ratioKey] || {};
      return {
        fase,
        geopereerd: r.operated_avg ?? null,
        niet_geopereerd: r.healthy_avg ?? null,
        diff_pct: r.diff_pct ?? null,
      };
    });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px 0 60px 0",
        color: "#fff",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .metric-card {
          background: #1a1a1a;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.25);
          padding: 20px;
        }
        .grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          color: #c9c9c9;
          font-size: 12px;
        }
        th, td {
          padding: 6px 8px;
          text-align: right;
        }
        th:first-child, td:first-child {
          text-align: left;
          color: #fff;
        }
        th {
          color: #fff;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>

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
        KRACHT
      </h2>

      {/* === SPIERTESTEN === */}
      {allTests.map((tKey, i) => (
        <ChartCard key={i} title={tKey.replace("kracht_", "").toUpperCase()} data={buildTestData(tKey)} />
      ))}

      {/* === RATIO'S === */}
      <h3
        style={{
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          margin: "26px 0 14px 0",
        }}
      >
        Ratio’s
      </h3>

      {allRatios.map((rKey, i) => (
        <RatioCard
          key={i}
          title={rKey}
          data={buildRatioData(rKey)}
          threshold={rKey.startsWith("H30") ? 0.6 : 1.1}
        />
      ))}
    </div>
  );
}

// === Subcomponenten ===

function ChartCard({ title, data }) {
  const safeData = Array.isArray(data) ? [...data] : [];
  return (
    <div className="metric-card" style={{ marginBottom: 20 }}>
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={safeData}
          margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          barCategoryGap="25%"
        >
          <CartesianGrid stroke="#2b2b2b" vertical={false} />
          <XAxis dataKey="fase" stroke="#c9c9c9" fontSize={10} />
          <YAxis
            stroke="#c9c9c9"
            fontSize={10}
            domain={["dataMin - 10", "dataMax + 10"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #FF7900",
              fontSize: 11,
              borderRadius: 6,
            }}
            formatter={(v) => (v != null ? v.toFixed(1) : "–")}
          />
          <Bar dataKey="geopereerd" fill="#FF7900" radius={3} />
          <Bar dataKey="niet_geopereerd" fill="#777" radius={3} />
        </BarChart>
      </ResponsiveContainer>

      <table style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Fase</th>
            <th>% Verschil</th>
          </tr>
        </thead>
        <tbody>
          {safeData.map((r, i) => {
            const diff = r.diff_pct ?? "–";
            const color =
              diff !== "–" && Math.abs(diff) > 10
                ? "#FF3B3B"
                : "#c9c9c9";
            return (
              <tr key={i}>
                <td>{r.fase}</td>
                <td style={{ color }}>
                  {diff !== "–" ? `${diff.toFixed(1)}%` : "–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RatioCard({ title, data, threshold }) {
  const safeData = Array.isArray(data) ? [...data] : [];
  return (
    <div className="metric-card" style={{ marginBottom: 20 }}>
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>
      <table>
        <thead>
          <tr>
            <th>Fase</th>
            <th>Operatie</th>
            <th>Gezond</th>
            <th>% Verschil</th>
          </tr>
        </thead>
        <tbody>
          {safeData.map((r, i) => {
            const kleur =
              r.diff_pct && Math.abs(r.diff_pct) > 10 ? "#FF3B3B" : "#c9c9c9";
            return (
              <tr key={i}>
                <td>{r.fase}</td>
                <td>{r.geopereerd?.toFixed?.(2) ?? "–"}</td>
                <td>{r.niet_geopereerd?.toFixed?.(2) ?? "–"}</td>
                <td style={{ color: kleur }}>
                  {r.diff_pct != null ? `${r.diff_pct.toFixed(1)}%` : "–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}