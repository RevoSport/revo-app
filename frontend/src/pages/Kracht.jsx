// =====================================================
// FILE: src/pages/Kracht.jsx
// Revo Sport — Krachtanalyse per spiergroep + ratio's
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
  Cell,
  LabelList, 
} from "recharts";

// 🎨 Kleuren
const COLOR_OPER = "#FF7900";
const COLOR_GEZOND = "#555555";
const COLOR_OPER_HOVER = "#FFC266";
const COLOR_GEZOND_HOVER = "#888888";
const COLOR_RED = "#ff4d4d";

// 🔹 Safe array helper
const safeArray = (arr) => (Array.isArray(arr) ? [...arr] : []);

// 🔹 Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { fase } = payload[0].payload;
    const geo = payload.find((p) => p.dataKey === "geopereerd")?.value;
    const gez = payload.find((p) => p.dataKey === "gezond")?.value;
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
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

// 🔹 Legend boven grafiek
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

// 🔹 RatioCard (tabel)
function RatioCard({ data, label, zijde }) {
  if (!data?.length) return null;

  const backendLabel = label
    .replace(" Geopereerd", "")
    .replace(" Gezond", "")
    .trim();

  const sideKey = zijde === "gezond" ? "gezond_mean" : "geopereerd_mean";

  const isHQ = backendLabel.includes("H/Q");
  const isAddAbdKort = backendLabel.includes("ADD/ABD Kort");
  const isAddAbdLang = backendLabel.includes("ADD/ABD Lang");

  const ratioData = data.map((fase) => {
    const ratioVal = fase.ratios?.find((r) => r.ratio === backendLabel);
    return {
      fase: fase.fase,
      value: ratioVal ? ratioVal[sideKey] : null,
    };
  });

  return (
    <div
      className="chart-card"
      style={{
        background: "#1a1a1a",
        borderRadius: 12,
        padding: "18px 20px 26px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: 48,
          marginBottom: 8,
        }}
      >
        <h4
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            textAlign: "center",
            color: "#fff",
            letterSpacing: "0.5px",
            margin: 0,
          }}
        >
          {label} Ratio
        </h4>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "#FF7900", fontSize: 11 }}>
            <th style={{ textAlign: "left", paddingBottom: 6 }}>Fase</th>
            <th style={{ textAlign: "right", paddingBottom: 6 }}>Gemiddelde</th>
          </tr>
        </thead>
        <tbody>
          {ratioData.map((r, i) => {
            const color =
              isHQ && r.value != null && r.value < 0.6
                ? COLOR_RED
                : (isAddAbdKort || isAddAbdLang) &&
                  r.value != null &&
                  r.value > 1.1
                ? COLOR_RED
                : "#fff";
            return (
              <tr key={i} style={{ fontSize: 11, color: "#fff" }}>
                <td style={{ textAlign: "left", padding: "3px 0" }}>{r.fase}</td>
                <td style={{ textAlign: "right", color }}>{r.value ?? "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 🔹 ChartCard (bar chart met % verschil labels)
function ChartCard({ spiergroep, data }) {
  const values = data?.[spiergroep] || [];

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
        background: "#1a1a1a",
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
          {spiergroep}
        </div>
        <LegendAbove />
      </div>

      <div style={{ marginTop: "28px" }}>
        <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={dataWithDiff}
          margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="fase" tick={{ fill: "#ccc", fontSize: 11 }} interval={0} />
          <YAxis domain={[0, "dataMax"]} tick={{ fill: "#ccc", fontSize: 11 }} />
          <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />

          {/* 🟠 Geopereerd */}
{/* 🟠 Geopereerd met LabelList boven de grafiek */}
<Bar dataKey="geopereerd" radius={[4, 4, 4, 4]}>
  {dataWithDiff.map((_, i) => (
    <Cell key={`geo-${i}`} fill={COLOR_OPER} />
  ))}

  <LabelList
    dataKey="diff"
    position="top"
    content={({ x, width, value, index }) => {
      if (value == null) return null;
      const diffNum = parseFloat(value);
      const arrow = diffNum > 0 ? "↑" : diffNum < 0 ? "↓" : "";
      const color = Math.abs(diffNum) > 10 ? COLOR_RED : "#bbb";

      // 🔹 x centreren boven de balk
      const xPos = x + width / 2;
      // 🔹 altijd boven de grafiek, zodat het niet overlapt met de grijze balk
      const yPos = 20;

      return (
        <text
          key={`diff-label-${index}`}
          x={xPos}
          y={yPos}
          textAnchor="middle"
          fontSize="11px"
          fontWeight="600"
          fill={color}
        >
          {`${value}% ${arrow}`}
        </text>
      );
    }}
  />
</Bar>

          {/* ⚪ Gezond */}
          <Bar dataKey="gezond" radius={[4, 4, 4, 4]}>
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
// 📊 MAIN COMPONENT
// =====================================================
export default function Kracht({ data }) {
  const cleanData = useMemo(() => safeArray(data?.fases), [data]);
  const groupedData = useMemo(() => {
    const map = {};
    cleanData.forEach((faseObj) => {
      const faseNaam = faseObj.fase;
      faseObj.spiergroepen?.forEach((sg) => {
        if (!map[sg.spiergroep]) map[sg.spiergroep] = [];
        map[sg.spiergroep].push({
          fase: faseNaam,
          geopereerd: sg.geopereerd_mean,
          gezond: sg.gezond_mean,
        });
      });
    });
    return map;
  }, [cleanData]);

  const spiergroepen = Object.keys(groupedData);
  if (!spiergroepen.length)
    return (
      <p style={{ color: "#999", textAlign: "center", marginTop: "60px" }}>
        Geen krachtdata beschikbaar.
      </p>
    );

  const filterBy = (terms) =>
    spiergroepen.filter((s) =>
      terms.some((t) => s.toLowerCase().includes(t.toLowerCase()))
    );
  const exoSoleus = filterBy(["soleus", "exorot"]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0px 0 60px 0",
        color: "#fff",
      }}
    >
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
        KRACHTANALYSE
      </h2>

      {/* Sectie 1 */}
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
        Hamstrings & Quadriceps
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <ChartCard spiergroep="Quadriceps 60" data={groupedData}  />
        <ChartCard spiergroep="Hamstrings 30" data={groupedData} />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <RatioCard
            data={cleanData}
            label="H/Q Geopereerd"
            zijde="geopereerd"
          />
          <RatioCard data={cleanData} label="H/Q Gezond" zijde="gezond" />
        </div>
      </div>

      {/* Sectie 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <ChartCard spiergroep="Nordics" data={groupedData} />
        <ChartCard spiergroep="Hamstrings 90/90" data={groupedData} />
      </div>

      {/* Sectie 3 */}
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
        Adductoren & Abductoren
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <ChartCard spiergroep="Adductoren kort" data={groupedData} />
        <ChartCard spiergroep="Abductoren kort" data={groupedData} />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <RatioCard
            data={cleanData}
            label="ADD/ABD Kort Geopereerd"
            zijde="geopereerd"
          />
          <RatioCard
            data={cleanData}
            label="ADD/ABD Kort Gezond"
            zijde="gezond"
          />
        </div>
        <ChartCard spiergroep="Adductoren lang" data={groupedData} />
        <ChartCard spiergroep="Abductoren lang" data={groupedData} />
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <RatioCard
            data={cleanData}
            label="ADD/ABD Lang Geopereerd"
            zijde="geopereerd"
          />
          <RatioCard
            data={cleanData}
            label="ADD/ABD Lang Gezond"
            zijde="gezond"
          />
        </div>
      </div>

      {/* Sectie 4 */}
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
        Exorotatie Heup & Soleus
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
        }}
      >
        {exoSoleus.map((spiergroep) => (
          <ChartCard
            key={spiergroep}
            spiergroep={spiergroep}
            data={groupedData}
          />
        ))}
      </div>
    </div>
  );
}
