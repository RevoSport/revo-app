// =====================================================
// FILE: src/pages/IndividueelFunctioneel.jsx
// Revo Sport — Individuele Functionele & Springtesten + Hop Cluster
// =====================================================

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";

// 🎨 Kleuren
const COLOR_OPER = "#FF7900";
const COLOR_GEZOND = "#555555";
const COLOR_BG = "#1a1a1a";
const COLOR_GREEN = "#7CFC00";

// 🔹 Safe array helper
const safeArray = (arr) => (Array.isArray(arr) ? [...arr] : []);

// =====================================================
// 🔹 DonutCard
// =====================================================
const DonutCard = React.memo(function DonutCard({ label, data }) {
  if (!data) return null;
  const COLORS = [COLOR_OPER, COLOR_GEZOND];
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: parseFloat(value) || 0,
  }));

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
        {label}
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="82%"
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              const value = chartData[index]?.value || 0;
              return (
                <text
                  x={x}
                  y={y}
                  fill="#fff"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  fontSize={11}
                >
                  {`${value.toFixed(1)}%`}
                </text>
              );
            }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// =====================================================
// 🔹 StepdownCard
// =====================================================
const StepdownCard = React.memo(function StepdownCard({ label, data }) {
  if (!data) return null;
  const fases = data.map((d) => ({
    fase: d.fase,
    geopereerd: d.geopereerd ?? d.geopereerd_mean ?? null,
    gezond: d.gezond ?? d.gezond_mean ?? null,
  }));

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {label}
      </h4>
      <table style={{ width: "100%", color: "#fff", fontSize: 12 }}>
        <thead>
          <tr style={{ color: COLOR_OPER }}>
            <th style={{ textAlign: "left" }}>Fase</th>
            <th style={{ textAlign: "right" }}>Geopereerd</th>
            <th style={{ textAlign: "right" }}>Gezond</th>
          </tr>
        </thead>
        <tbody>
          {fases.map((f, i) => (
            <tr key={i}>
              <td>{f.fase}</td>
              <td style={{ textAlign: "right" }}>
                {f.geopereerd != null ? f.geopereerd.toFixed(1) : "–"}
              </td>
              <td style={{ textAlign: "right" }}>
                {f.gezond != null ? f.gezond.toFixed(1) : "–"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// =====================================================
// 🔹 MultiTestCard
// =====================================================
const MultiTestCard = ({ label, tests, groupedData }) => {
  const chartData = useMemo(() => {
    const fases = new Set();
    tests.forEach((test) => {
      safeArray(groupedData[test]).forEach((d) => fases.add(d.fase));
    });
    const faseList = Array.from(fases);
    return faseList.map((fase) => {
      const entry = { fase };
      tests.forEach((test) => {
        const t = safeArray(groupedData[test]).find((x) => x.fase === fase);
        entry[test] = t?.geopereerd ?? null;
      });
      return entry;
    });
  }, [tests, groupedData]);

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {label}
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="fase" tick={{ fill: "#ccc", fontSize: 11 }} />
          <YAxis tick={{ fill: "#ccc", fontSize: 11 }} domain={[0, "dataMax"]} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div
                  style={{
                    background: COLOR_BG,
                    border: `1px solid ${COLOR_OPER}`,
                    borderRadius: 6,
                    padding: 6,
                    color: "#fff",
                    fontSize: 11,
                  }}
                >
                  {payload.map((p, i) => (
                    <div key={i}>
                      {p.name}: {p.value != null ? p.value.toFixed(1) : "–"}
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
          {tests.map((t, i) => (
            <Bar key={i} dataKey={t} fill={i === 0 ? COLOR_OPER : COLOR_GEZOND} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 🔹 MeanSplitCard
// =====================================================
const MeanSplitCard = ({ label, data }) => {
  if (!data) return null;
  const fases = safeArray(data);

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {label}
      </h4>
      <table style={{ width: "100%", color: "#fff", fontSize: 12 }}>
        <thead>
          <tr style={{ color: COLOR_OPER }}>
            <th style={{ textAlign: "left" }}>Fase</th>
            <th style={{ textAlign: "right" }}>% Links</th>
            <th style={{ textAlign: "right" }}>% Rechts</th>
          </tr>
        </thead>
        <tbody>
          {fases.map((f, i) => (
            <tr key={i}>
              <td>{f.fase}</td>
              <td style={{ textAlign: "right" }}>{f.gezond ?? "–"}</td>
              <td style={{ textAlign: "right" }}>{f.geopereerd ?? "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// =====================================================
// 🔹 MiniHopChart
// =====================================================
const MiniHopChart = ({ title, data }) => {
  const chartData = safeArray(data);

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="fase" tick={{ fill: "#ccc", fontSize: 11 }} />
          <YAxis tick={{ fill: "#ccc", fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div
                  style={{
                    background: COLOR_BG,
                    border: `1px solid ${COLOR_OPER}`,
                    borderRadius: 6,
                    padding: 6,
                    color: "#fff",
                    fontSize: 11,
                  }}
                >
                  {payload.map((p, i) => (
                    <div key={i}>
                      {p.dataKey}: {p.value != null ? p.value.toFixed(1) : "–"}
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
          <Bar dataKey="geopereerd" fill={COLOR_OPER} />
          <Bar dataKey="gezond" fill={COLOR_GEZOND} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// =====================================================
// 🔹 HopClusterOverviewCard
// =====================================================
const HopClusterOverviewCard = ({ data }) => {
  if (!data) return null;
  const { mean_lsi, subtests } = data;

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        color: "#fff",
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Hop Cluster
      </h4>
      <p style={{ fontSize: 30, color: COLOR_OPER, margin: "10px 0" }}>
        {mean_lsi != null ? `${(mean_lsi * 100).toFixed(0)}%` : "–"}
      </p>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        {Object.entries(subtests || {}).map(([name, val]) => (
          <div key={name}>
            {name}: {val != null ? (val * 100).toFixed(0) + "%" : "–"}
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================================================
// 📊 MAIN COMPONENT
// =====================================================
export default function IndividueelFunctioneel({ data }) {
  const cleanData = useMemo(() => {
    if (Array.isArray(data?.fases)) return [...data.fases];
    return [];
  }, [data]);

  const groupedData = useMemo(() => {
    const map = {};
    cleanData.forEach((faseObj) => {
      const faseNaam = faseObj.fase;
      const allTests = [...(faseObj.functioneel || []), ...(faseObj.spring || [])];
      allTests.forEach((t) => {
        if (!map[t.test]) map[t.test] = [];
        map[t.test].push({
          fase: faseNaam,
          geopereerd: t.geopereerd ?? t.geopereerd_mean ?? null,
          gezond: t.gezond ?? t.gezond_mean ?? null,
        });
      });
    });
    return map;
  }, [cleanData]);

  const baselineData = data?.baseline || null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        paddingBottom: "40px",
      }}
    >
      {/* Sectie 1 */}
      <h3 style={{ color: "#fff", fontSize: 13, marginBottom: 14 }}>
        Neuromusculaire Activatie & Lateral Stepdown
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          gap: 24,
          marginBottom: 40,
        }}
      >
        <DonutCard label="Lag Test" data={baselineData?.lag_test} />
        <DonutCard label="VMO Activatie" data={baselineData?.vmo_activatie} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <StepdownCard
            label="Lateral Stepdown Valgus"
            data={groupedData["Step Down – Valgus Score"]}
          />
          <StepdownCard
            label="Lateral Stepdown Pelvic"
            data={groupedData["Step Down – Pelvis Controle"]}
          />
        </div>
      </div>

      {/* Sectie 2 */}
      <h3 style={{ color: "#fff", fontSize: 13, marginBottom: 14 }}>
        CMJ & Drop Jump Overzicht
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 24,
          marginBottom: 40,
        }}
      >
        <MultiTestCard
          label="Drop Jump"
          tests={[
            "Drop Jump 2-been Hoogte",
            "Drop Jump 1-been Hoogte",
            "Drop Jump 1-been RSI",
          ]}
          groupedData={groupedData}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <MultiTestCard
            label="CMJ"
            tests={["CMJ 2-been Hoogte", "CMJ 1-been Hoogte"]}
            groupedData={groupedData}
          />
          <MeanSplitCard
            label="Squat Forceplate – %"
            data={groupedData["Squat Forceplate"]}
          />
        </div>
      </div>

      {/* Sectie 3 */}
      <h3 style={{ color: "#fff", fontSize: 13, marginBottom: 14 }}>
        Hop Test Cluster
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 24,
        }}
      >
        <MiniHopChart title="CMJ Hoogte" data={groupedData["CMJ 1-been Hoogte"]} />
        <MiniHopChart
          title="Single Hop Distance"
          data={groupedData["Single Hop Distance"]}
        />
        <MiniHopChart title="Side Hop" data={groupedData["Side Hop"]} />
        <HopClusterOverviewCard
          data={cleanData.find((f) => f.fase === "Maand 6")?.hop_cluster}
        />
      </div>
    </div>
  );
}
