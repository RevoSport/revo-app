// =====================================================
// FILE: src/pages/Functioneel.jsx
// Revo Sport — Functionele & Springtesten + Hop Cluster
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
const COLOR_OPER_HOVER = "#FFC266";
const COLOR_GEZOND_HOVER = "#888888";
const COLOR_RED = "#ff4d4d";
const COLOR_GREEN = "#7CFC00";
const COLOR_BG = "#1a1a1a";

// 🔹 Safe array helper
const safeArray = (arr) => (Array.isArray(arr) ? [...arr] : []);

// =====================================================
// 🔹 TOOLTIP
// =====================================================
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { fase } = payload[0].payload;
    const geo = payload.find((p) => p.dataKey === "geopereerd")?.value;
    const gez = payload.find((p) => p.dataKey === "gezond")?.value;
    return (
      <div
        style={{
          backgroundColor: COLOR_BG,
          border: `1px solid ${COLOR_OPER}`,
          borderRadius: 6,
          padding: "6px 10px",
          color: "#fff",
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        <div style={{ color: COLOR_OPER, marginBottom: 4 }}>{fase}</div>
        <div>Geopereerd: {geo ?? "–"}</div>
        <div>Gezond: {gez ?? "–"}</div>
      </div>
    );
  }
  return null;
};

// =====================================================
// 🔹 Legend boven grafiek
// =====================================================
function LegendAbove() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "22px",
        marginBottom: "6px",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      <span style={{ color: "#fff" }}>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            backgroundColor: COLOR_OPER,
            borderRadius: 2,
            marginRight: 6,
          }}
        ></span>
        Geopereerd
      </span>
      <span style={{ color: "#fff" }}>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            backgroundColor: COLOR_GEZOND,
            borderRadius: 2,
            marginRight: 6,
          }}
        ></span>
        Gezond
      </span>
    </div>
  );
}

// =====================================================
// 🔹 DonutCard (Lag & VMO)
// =====================================================
function DonutCard({ label, data }) {
  if (!data) return null;
  const entries = Object.entries(data);
  const COLORS = [COLOR_OPER, COLOR_GEZOND];
  const chartData = entries.map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "18px 20px",
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        height: "100%",
      }}
    >
      <h4
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "#fff",
          marginBottom: 12,
        }}
      >
        {label}
      </h4>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            innerRadius={50}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <Label
              value={`${chartData[0].value ?? 0 + chartData[1].value ?? 0}%`}
              position="center"
              fill="#fff"
              style={{ fontSize: "12px", fontWeight: "600" }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 11, color: "#ccc", marginTop: 6 }}>
        {entries.map(([key, val], i) => (
          <div key={i}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: COLORS[i],
                borderRadius: 2,
                marginRight: 6,
              }}
            ></span>
            {key}: {val}%
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// 🔹 ChartCard (unilaterale testen)
// =====================================================
function ChartCard({ test, data }) {
  const values = data?.[test] || [];

  const dataWithDiff = values.map((d) => {
    if (d.geopereerd != null && d.gezond != null && d.gezond !== 0) {
      const diff = ((d.geopereerd - d.gezond) / d.gezond) * 100;
      return { ...d, diff: diff.toFixed(1) };
    }
    return { ...d, diff: null };
  });

  return (
    <div
      className="chart-card"
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "18px 20px 26px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: 48,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            textAlign: "center",
            color: "#fff",
            letterSpacing: "0.5px",
            marginBottom: 4,
          }}
        >
          {test}
        </div>
        <LegendAbove />
      </div>

      <div style={{ marginTop: "28px" }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={dataWithDiff}
            margin={{ top: 40, right: 20, left: 0, bottom: 20 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="fase" tick={{ fill: "#ccc", fontSize: 11 }} interval={0} />
            <YAxis domain={["dataMin", "dataMax"]} tick={{ fill: "#ccc", fontSize: 11 }} />
            <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />

            {/* 🟠 Geopereerd */}
            <Bar dataKey="geopereerd" radius={[4, 4, 0, 0]}>
              {dataWithDiff.map((_, i) => (
                <Cell key={`geo-${i}`} fill={COLOR_OPER} />
              ))}
            </Bar>

            {/* ⚪ Gezond */}
            <Bar dataKey="gezond" radius={[4, 4, 0, 0]}>
              {dataWithDiff.map((_, i) => (
                <Cell key={`gez-${i}`} fill={COLOR_GEZOND} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =====================================================
// 🔹 SingleValueCard (2-benige testen)
// =====================================================
function SingleValueCard({ label, mean }) {
  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </h4>
      <div style={{ color: COLOR_OPER, fontSize: 24, fontWeight: 700 }}>
        {mean ?? "–"}
      </div>
    </div>
  );
}

// =====================================================
// 🔹 HopClusterCard
// =====================================================
function HopClusterCard({ data }) {
  if (!data) return null;

  const chartData = Object.entries(data.subtests || {}).map(([k, v]) => ({
    test: k,
    value: v,
  }));

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "24px 24px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Hop Test Cluster
      </h4>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" domain={[0, 120]} tick={{ fill: "#ccc", fontSize: 10 }} />
          <YAxis dataKey="test" type="category" tick={{ fill: "#ccc", fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value >= 100 ? COLOR_GREEN : COLOR_OPER}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ color: "#fff", fontSize: 11, textAlign: "center", marginTop: 8 }}>
        Gemiddelde LSI: <strong>{data.mean_lsi ?? "–"}%</strong> (n={data.n ?? 0})
      </div>
    </div>
  );
}

// =====================================================
// 📊 MAIN COMPONENT
// =====================================================
export default function Functioneel({ data }) {
  const cleanData = useMemo(() => safeArray(data?.fases), [data]);

  // 🧠 Map unilaterale testen naar testnaam → array met {fase, geopereerd, gezond}
  const groupedData = useMemo(() => {
    const map = {};
    cleanData.forEach((faseObj) => {
      const faseNaam = faseObj.fase;
      faseObj.functioneel?.forEach((t) => {
        if (!map[t.test]) map[t.test] = [];
        map[t.test].push({ fase: faseNaam, geopereerd: t.geopereerd_mean, gezond: t.gezond_mean });
      });
      faseObj.spring?.forEach((t) => {
        if (!map[t.test]) map[t.test] = [];
        map[t.test].push({ fase: faseNaam, geopereerd: t.geopereerd_mean, gezond: t.gezond_mean });
      });
    });
    return map;
  }, [cleanData]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 0 60px 0",
        color: "#fff",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "40px",
        }}
      >
        FUNCTIONELE & SPRINGTESTEN
      </h2>

      {/* 🧠 Baseline */}
      <h3 style={{ color: "#fff", fontSize: 13, textTransform: "uppercase", marginBottom: 14 }}>
        Neuromusculaire Activatie
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <DonutCard label="Lag Test" data={data?.baseline?.lag_test} />
        <DonutCard label="VMO Activatie" data={data?.baseline?.vmo_activatie} />
      </div>

      {/* 🦵 Functionele Testen */}
      <h3 style={{ color: "#fff", fontSize: 13, textTransform: "uppercase", marginBottom: 14 }}>
        Functionele Testen
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <ChartCard test="Step Down – Valgus Score" data={groupedData} />
        <ChartCard test="Step Down – Pelvis Controle" data={groupedData} />
        <ChartCard test="Squat Forceplate" data={groupedData} />
        <ChartCard test="Single Hop Distance" data={groupedData} />
        <ChartCard test="Side Hop" data={groupedData} />
      </div>

      {/* 🧍‍♂️ Springtesten */}
      <h3 style={{ color: "#fff", fontSize: 13, textTransform: "uppercase", marginBottom: 14 }}>
        CMJ & Drop Jump
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <ChartCard test="CMJ 1-been Asymmetrie" data={groupedData} />
        <ChartCard test="CMJ 1-been Hoogte" data={groupedData} />
        <SingleValueCard label="CMJ 2-benig Hoogte" mean={data?.cmj_hoogte_2benig} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <ChartCard test="Drop Jump 1-been Hoogte" data={groupedData} />
        <ChartCard test="Drop Jump 1-been RSI" data={groupedData} />
        <ChartCard test="Drop Jump 2-benig Steunname Landing" data={groupedData} />
        <SingleValueCard label="Drop Jump 2-benig Hoogte" mean={data?.dropjump_hoogte_2benig} />
      </div>

      {/* 🧮 Hop Cluster */}
      <h3 style={{ color: "#fff", fontSize: 13, textTransform: "uppercase", marginBottom: 14 }}>
        Hop Test Cluster
      </h3>
      <HopClusterCard data={cleanData.find((f) => f.fase === "Maand 6")?.hop_cluster} />
    </div>
  );
}
