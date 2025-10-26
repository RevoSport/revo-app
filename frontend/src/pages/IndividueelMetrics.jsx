// =====================================================
// FILE: src/pages/IndividueelMetrics.jsx
// Revo Sport — Individuele Metrics (Omtrek + Mobiliteit)
// =====================================================

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 🎨 Kleuren
const COLOR_ACCENT = "#FF7900";
const COLOR_TEXT = "#ffffff";
const COLOR_MUTED = "#c9c9c9";
const COLOR_BG = "#1a1a1a";

export default function IndividueelMetrics({ data }) {
  // 🧩 Normaliseer backendstructuur → compatibel met frontend
  const parsed = useMemo(() => {
    if (!data || !Array.isArray(data.fases))
      return { antropometrie: [], mobiliteit: [] };

    const antropometrie = [];
    const mobiliteit = [];

    data.fases.forEach((fase) => {
      // 🔹 Antropometrie
      if (fase.antropometrie) {
        antropometrie.push({
          fase: fase.fase,
          cm5: fase.antropometrie.cm5_oper ?? null,
          cm10: fase.antropometrie.cm10_oper ?? null,
          cm20: fase.antropometrie.cm20_oper ?? null,
          diff5: fase.antropometrie.diff5 ?? null,
          diff10: fase.antropometrie.diff10 ?? null,
          diff20: fase.antropometrie.diff20 ?? null,
        });
      }

      // 🔹 Mobiliteit — enkel geopereerde zijde tonen
      if (fase.mobiliteit) {
        mobiliteit.push({
          fase: fase.fase,
          flexie_oper:
            fase.mobiliteit.flexie_oper ??
            fase.mobiliteit.flexie ?? // fallback indien oudere structuur
            null,
          extensie_oper:
            fase.mobiliteit.extensie_oper ??
            fase.mobiliteit.extensie ??
            null,
        });
      }
    });

    return { antropometrie, mobiliteit };
  }, [data]);

  // ✅ Veilig parsen
  const circumData = parsed.antropometrie;
  const mobiliteit = parsed.mobiliteit;

  // 🔹 Alleen geopereerde zijde tonen
  const flexieData = mobiliteit.map((f) => ({
    fase: f.fase,
    waarde: f.flexie_oper ?? null,
  }));

  const extensieData = mobiliteit.map((f) => ({
    fase: f.fase,
    waarde: f.extensie_oper ?? null,
  }));

  // 🔹 Δ t.o.v. vorige fase
  const deltaTable = useMemo(() => {
    if (!circumData?.length) return [];
    return circumData.map((r, i) => {
      if (i === 0) return { fase: r.fase, cm5: "-", cm10: "-", cm20: "-" };
      const prev = circumData[i - 1];
      return {
        fase: r.fase,
        cm5: r.cm5 && prev.cm5 ? (r.cm5 - prev.cm5).toFixed(1) : "-",
        cm10: r.cm10 && prev.cm10 ? (r.cm10 - prev.cm10).toFixed(1) : "-",
        cm20: r.cm20 && prev.cm20 ? (r.cm20 - prev.cm20).toFixed(1) : "-",
      };
    });
  }, [circumData]);

  if (!data)
    return (
      <div style={{ color: COLOR_MUTED, textAlign: "center", paddingTop: "50px" }}>
        Geen individuele metrics beschikbaar.
      </div>
    );

  // =====================================================
  // 🔹 Layout
  // =====================================================
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0px 0 60px 0",
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
          background: ${COLOR_BG};
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.25);
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          color: ${COLOR_MUTED};
          font-size: 12px;
          margin: 0 auto;
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
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        METRICS
      </h2>

      {/* === ANTROPOMETRIE === */}
      <h3
        style={{
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "14px",
        }}
      >
        Antropometrie
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {/* 🔹 Evolutie Omtrek Operatie */}
        <div className="metric-card">
          <h4
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            Evolutie Omtrek Operatie
          </h4>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={circumData}
              margin={{ top: 20, right: 80, left: 0, bottom: 10 }}
            >
              <CartesianGrid stroke="#2b2b2b" vertical={false} />
              <XAxis dataKey="fase" stroke="#c9c9c9" fontSize={10} />
              <YAxis
                stroke="#c9c9c9"
                fontSize={10}
                domain={[
                  (dataMin) => Math.floor(dataMin * 0.9),
                  (dataMax) => Math.ceil(dataMax * 1.1),
                ]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                formatter={(value, name) => [`${value?.toFixed?.(1) ?? value} cm`, name]}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  top: 0,
                  right: 0,
                  color: "#c9c9c9",
                  fontSize: 11,
                  lineHeight: "20px",
                  paddingRight: 10,
                }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="cm5"
                name="Omtrek 5 cm"
                stroke="#FF7900"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FF7900", stroke: "#FF7900" }}
              />
              <Line
                type="monotone"
                dataKey="cm10"
                name="Omtrek 10 cm"
                stroke="#c9c9c9"
                strokeWidth={2}
                dot={{ r: 3, fill: "#c9c9c9", stroke: "#c9c9c9" }}
              />
              <Line
                type="monotone"
                dataKey="cm20"
                name="Omtrek 20 cm"
                stroke="#777"
                strokeWidth={2}
                dot={{ r: 3, fill: "#777", stroke: "#777" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Δ Verschil t.o.v. vorige test */}
        <div className="metric-card">
          <h4
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            Δ Verschil t.o.v. vorige test (cm)
          </h4>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>5 cm</th>
                <th>10 cm</th>
                <th>20 cm</th>
              </tr>
            </thead>
            <tbody>
              {deltaTable.map((r, i) => (
                <tr key={i}>
                  <td>{r.fase}</td>
                  {[r.cm5, r.cm10, r.cm20].map((v, j) => (
                    <td
                      key={j}
                      style={{
                        color:
                          v === "-" ? "#c9c9c9" :
                          Math.abs(v) > 1.0 ? "#FF3B3B" : "#ffffff",
                        fontWeight: v === "-" ? 400 : Math.abs(v) > 1.0 ? 700 : 400,
                      }}
                    >
                      {v === "-" ? "–" : `${v > 0 ? "+" : ""}${v} cm`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === MOBILITEIT === */}
      <h3
        style={{
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "14px",
        }}
      >
        Mobiliteit
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* 🔸 Flexie */}
        <div className="metric-card">
          <h4
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            Flexie
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={flexieData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid stroke="#2b2b2b" vertical={false} />
              <XAxis dataKey="fase" stroke="#c9c9c9" fontSize={10} />
              <YAxis
                stroke="#c9c9c9"
                fontSize={10}
                domain={[
                  (dataMin) => Math.floor(dataMin * 0.9),
                  (dataMax) => Math.ceil(dataMax * 1.1),
                ]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  fontSize: 11,
                  borderRadius: 6,
                }}
              />
              <Line
                type="monotone"
                dataKey="waarde"
                name="Geopereerde zijde"
                stroke="#FF7900"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FF7900", stroke: "#FF7900" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔸 Extensie */}
        <div className="metric-card">
          <h4
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            Extensie
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={extensieData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid stroke="#2b2b2b" vertical={false} />
              <XAxis dataKey="fase" stroke="#c9c9c9" fontSize={10} />
              <YAxis
                stroke="#c9c9c9"
                fontSize={10}
                domain={[
                  (dataMin) => Math.floor(dataMin * 0.9),
                  (dataMax) => Math.ceil(dataMax * 1.1),
                ]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  fontSize: 11,
                  borderRadius: 6,
                }}
              />
              <Line
                type="monotone"
                dataKey="waarde"
                name="Geopereerde zijde"
                stroke="#FF7900"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FF7900", stroke: "#FF7900" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
