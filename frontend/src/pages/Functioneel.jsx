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
        animation: "fadeIn 0.6s ease-in-out",
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
// 🔹 MeanSplitCard
// =====================================================
const MeanSplitCard = React.memo(function MeanSplitCard({ label, data }) {
  if (!data) return null;
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
          {data.map((f, i) => (
            <tr key={i}>
              <td>{f.fase}</td>
              <td style={{ textAlign: "right" }}>
                {f.geopereerd ? `${f.geopereerd.toFixed(1)}%` : "–"}
              </td>
              <td style={{ textAlign: "right" }}>
                {f.gezond ? `${f.gezond.toFixed(1)}%` : "–"}
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
const MultiTestCard = React.memo(function MultiTestCard({ label, tests, groupedData }) {
  if (!tests?.length) return null;
  const combined = tests
    .map((test) => ({ test, data: groupedData?.[test] || [] }))
    .filter((t) => t.data.length > 0);

  const getUnit = (t) => (t.toLowerCase().includes("hoogte") ? "cm" : "%");

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
        {label}
      </h4>
      {combined.map((block, idx) => (
        <div key={idx} style={{ marginTop: 10 }}>
          <div style={{ color: COLOR_OPER, fontWeight: 700, fontSize: 11 }}>
            {block.test}
          </div>
          <table style={{ width: "100%", color: "#fff", fontSize: 12 }}>
            <thead>
              <tr style={{ color: COLOR_OPER }}>
                <th style={{ textAlign: "left" }}>Fase</th>
                <th style={{ textAlign: "right" }}>Geopereerd</th>
                <th style={{ textAlign: "right" }}>Gezond</th>
              </tr>
            </thead>
            <tbody>
              {block.data.map((f, i) => (
                <tr key={i}>
                  <td>{f.fase}</td>
                  <td style={{ textAlign: "right" }}>
                    {f.geopereerd
                      ? `${f.geopereerd.toFixed(1)} ${getUnit(block.test)}`
                      : "–"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {f.gezond
                      ? `${f.gezond.toFixed(1)} ${getUnit(block.test)}`
                      : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
});

// =====================================================
// 🔹 MiniHopChart
// =====================================================
const MiniHopChart = React.memo(function MiniHopChart({ title, data }) {
  if (!data) return null;
  const chartData = data.map((d) => ({
    fase: d.fase,
    geopereerd: d.geopereerd ?? 0,
    gezond: d.gezond ?? 0,
  }));

  const CustomTooltipMini = ({ active, payload, label }) => {
    if (active && payload?.length) {
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
          }}
        >
          <div style={{ color: COLOR_OPER, marginBottom: 4 }}>{label}</div>
          <div>Geopereerd: {geo ?? "–"}</div>
          <div>Gezond: {gez ?? "–"}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "12px 18px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4 style={{ color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center" }}>
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="fase" tick={{ fill: "#ccc", fontSize: 10 }} />
          <YAxis domain={[0, "auto"]} tick={{ fill: "#ccc", fontSize: 10 }} />
          <Tooltip content={<CustomTooltipMini />} />
          <Bar dataKey="geopereerd" radius={[4, 4, 4, 4]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLOR_OPER} />
            ))}
          </Bar>
          <Bar dataKey="gezond" radius={[4, 4, 4, 4]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLOR_GEZOND} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// =====================================================
// 🔹 HopClusterOverviewCard
// =====================================================
const HopClusterOverviewCard = React.memo(function HopClusterOverviewCard({ data }) {
  if (!data) return null;
  const subtests = Object.entries(data.subtests || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const getColor = (v) => (v >= 90 ? COLOR_GREEN : v >= 80 ? COLOR_OPER : "#FF4D4D");

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4 style={{ color: "#fff", textAlign: "center", marginBottom: 10 }}>
        LSI-Overzicht
      </h4>
      {subtests.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 90, color: "#fff", fontSize: 11 }}>
            {t.name.replaceAll("_", " ")}
          </div>
          <div style={{ flex: 1, background: "#333", borderRadius: 4, height: 8 }}>
            <div
              style={{
                width: `${t.value}%`,
                background: getColor(t.value),
                height: "100%",
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ width: 40, textAlign: "right", color: "#fff", fontSize: 11 }}>
            {t.value?.toFixed(1)}%
          </div>
        </div>
      ))}
      <div style={{ color: "#fff", fontSize: 12, textAlign: "center", marginTop: 8 }}>
        Gemiddelde LSI:{" "}
        <strong style={{ color: COLOR_OPER }}>{data.mean_lsi?.toFixed(1)}%</strong>{" "}
        (n={data.n ?? 0})
      </div>
    </div>
  );
});

// =====================================================
// 📊 MAIN COMPONENT
// =====================================================
export default function Functioneel({ data }) {
  // ✅ Veilig voor zowel groep als individueel
  const cleanData = useMemo(() => {
    if (Array.isArray(data)) return [...data]; // groepsdata
    if (Array.isArray(data?.fases)) return [...data.fases]; // individuele data
    return [];
  }, [data]);

  // ✅ Gegroepeerde mapping
  const groupedData = useMemo(() => {
    const map = {};
    cleanData.forEach((faseObj) => {
      const faseNaam = faseObj.fase;
      const allTests = [...(faseObj.functioneel || []), ...(faseObj.spring || [])];
      allTests.forEach((t) => {
        if (!map[t.test]) map[t.test] = [];
        map[t.test].push({
          fase: faseNaam,
          geopereerd: t.geopereerd_mean ?? t.mean ?? null,
          gezond: t.gezond_mean ?? null,
        });
      });
    });
    return map;
  }, [cleanData]);

  // ✅ Donutcards enkel tonen bij individuele data
  const baselineData = !Array.isArray(data) ? data?.baseline : null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        paddingBottom: "40px",
      }}
    >
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
            "Drop Jump 2-benig Steunname Landing",
            "Drop Jump 2-benig Hoogte",
            "Drop Jump 1-been Hoogte",
            "Drop Jump 1-been RSI",
          ]}
          groupedData={groupedData}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <MultiTestCard
            label="CMJ"
            tests={[
              "CMJ 2-benig Steunname Landing",
              "CMJ 2-benig Hoogte",
              "CMJ 1-been Hoogte",
            ]}
            groupedData={groupedData}
          />
          <MeanSplitCard
            label="Squat Forceplate – %"
            data={groupedData["Squat Forceplate"]}
          />
        </div>
      </div>

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