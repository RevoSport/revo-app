// 📁 src/pages/Metrics.jsx
import React from "react";
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

export default function Metrics({ data }) {
  // ✅ Defensieve kopieën om bevroren props te vermijden bij tab-switch
  const circumData = Array.isArray(data?.antropometrie)
    ? [...data.antropometrie]
    : [];

  const mobiliteit = Array.isArray(data?.mobiliteit)
    ? [...data.mobiliteit]
    : [];

  const flexieData = mobiliteit.map((f) => ({
    fase: f.fase,
    waarde: f.flexie,
  }));

  const extensieData = mobiliteit.map((f) => ({
    fase: f.fase,
    waarde: f.extensie,
  }));

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
        {/* 🔸 Evolutie Omtrek Operatie */}
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
              {/* volgorde = weergave in legende */}
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

        {/* 🔸 % Verschil-tabel */}
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
            % Verschil <br />
            Geopereerde vs niet-geopereerde zijde
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
              {circumData.map((r, i) => (
                <tr key={i}>
                  <td>{r.fase}</td>
                  <td>{r.diff5 ?? "–"}</td>
                  <td>{r.diff10 ?? "–"}</td>
                  <td>{r.diff20 ?? "–"}</td>
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
