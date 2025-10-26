// =====================================================
// FILE: src/pages/IndividueelKracht.jsx
// Revo Sport — Individuele krachtanalyse (zelfde layout als groep)
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

const COLOR_OPER = "#FF7900";
const COLOR_GEZOND = "#555555";
const COLOR_RED = "#ff4d4d";
const COLOR_BG = "#1a1a1a";

// =====================================================
// 🔹 Tooltip & Legend
// =====================================================
const CustomTooltip = React.memo(({ active, payload }) => {
  if (active && payload?.length) {
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
});

const LegendAbove = React.memo(() => (
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
));

// =====================================================
// 🔹 RatioCard (identiek aan groep)
// =====================================================
const RatioCard = React.memo(function RatioCard({ data, label, zijde }) {
  if (!data?.length) return null;

  const backendLabel = label
    .replace(" Geopereerd", "")
    .replace(" Gezond", "")
    .trim();

  const sideKey = zijde === "gezond" ? "gezond" : "geopereerd";
  const isHQ = backendLabel.includes("H/Q");
  const isAddAbdKort = backendLabel.includes("ADD/ABD Kort");
  const isAddAbdLang = backendLabel.includes("ADD/ABD Lang");

const ratioData = data
  .filter((fase) => fase.fase !== "Baseline") // Baseline overslaan
  .map((fase) => {
    const ratioVal = fase.ratios?.find((r) => r.ratio === backendLabel);
    return {
      fase: fase.fase,
      value: ratioVal ? ratioVal[sideKey] : null,
    };
  });


  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "18px 20px 26px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        height: "100%",
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
          marginBottom: 8,
        }}
      >
        {label} Ratio
      </h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: COLOR_OPER, fontSize: 11 }}>
            <th style={{ textAlign: "left", paddingBottom: 6 }}>Fase</th>
            <th style={{ textAlign: "right", paddingBottom: 6 }}>Waarde</th>
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
              <tr key={i} style={{ fontSize: 11, color }}>
                <td style={{ textAlign: "left", padding: "3px 0" }}>{r.fase}</td>
                <td style={{ textAlign: "right" }}>{r.value ?? "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

// =====================================================
// 🔹 ChartCard
// =====================================================
const ChartCard = React.memo(function ChartCard({ spiergroep, data }) {
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
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "18px 20px 26px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          {spiergroep}
        </div>
        <LegendAbove />
      </div>

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

          <Bar dataKey="geopereerd" radius={[4, 4, 4, 4]}>
            {dataWithDiff.map((_, i) => (
              <Cell key={i} fill={COLOR_OPER} />
            ))}
            <LabelList
              dataKey="diff"
              position="top"
              content={({ x, width, value }) => {
                if (value == null) return null;
                const diffNum = parseFloat(value);
                const arrow = diffNum > 0 ? "↑" : diffNum < 0 ? "↓" : "";
                const color = Math.abs(diffNum) > 10 ? COLOR_RED : "#bbb";
                const xPos = x + width / 2;
                const yPos = 20;
                return (
                  <text
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

          <Bar dataKey="gezond" radius={[4, 4, 4, 4]}>
            {dataWithDiff.map((_, i) => (
              <Cell key={i} fill={COLOR_GEZOND} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// =====================================================
// 📊 MAIN COMPONENT
// =====================================================
export default function IndividueelKracht({ data }) {
  const cleanData = useMemo(() => (Array.isArray(data?.fases) ? data.fases : []), [data]);

  // ✅ Convert kracht per fase naar groupedData per spiergroep
  const groupedData = useMemo(() => {
    const map = {};
    cleanData.forEach((fase) => {
      const faseNaam = fase.fase;
      fase.kracht?.forEach((k) => {
        const label = k.spiergroep;
        if (!map[label]) map[label] = [];
        map[label].push({
          fase: faseNaam,
          geopereerd: k.geopereerd,
          gezond: k.gezond,
        });
      });
    });
    return map;
  }, [cleanData]);

  const spiergroepen = Object.keys(groupedData);
  if (!spiergroepen.length)
    return (
      <p style={{ color: "#999", textAlign: "center", marginTop: 60 }}>
        Geen krachtdata beschikbaar.
      </p>
    );

  const filterBy = (terms) =>
    spiergroepen.filter((s) =>
      terms.some((t) => s.toLowerCase().includes(t.toLowerCase()))
    );
  const exoSoleus = filterBy(["soleus", "exorot"]);

  // =====================================================
  // 🔹 Layout (identiek aan groep)
  // =====================================================
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
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        KRACHT
      </h2>

      {/* Sectie 1 */}
      <h3
        style={{
          color: "#ffffff",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 14,
        }}
      >
        Hamstrings & Quadriceps
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <ChartCard spiergroep="Quadriceps 60" data={groupedData} />
        <ChartCard spiergroep="Hamstrings 30" data={groupedData} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <RatioCard data={cleanData} label="H/Q Geopereerd" zijde="geopereerd" />
          <RatioCard data={cleanData} label="H/Q Gezond" zijde="gezond" />
        </div>
      </div>

      {/* Sectie 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
          marginBottom: 40,
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
          marginBottom: 14,
        }}
      >
        Adductoren & Abductoren
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          gap: 24,
          marginBottom: 40,
        }}
      >
        <ChartCard spiergroep="Adductoren kort" data={groupedData} />
        <ChartCard spiergroep="Abductoren kort" data={groupedData} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <RatioCard data={cleanData} label="ADD/ABD Kort Geopereerd" zijde="geopereerd" />
          <RatioCard data={cleanData} label="ADD/ABD Kort Gezond" zijde="gezond" />
        </div>
        <ChartCard spiergroep="Adductoren lang" data={groupedData} />
        <ChartCard spiergroep="Abductoren lang" data={groupedData} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <RatioCard data={cleanData} label="ADD/ABD Lang Geopereerd" zijde="geopereerd" />
          <RatioCard data={cleanData} label="ADD/ABD Lang Gezond" zijde="gezond" />
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
          marginBottom: 14,
        }}
      >
        Exorotatie Heup & Soleus
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        {exoSoleus.map((spiergroep) => (
          <ChartCard key={spiergroep} spiergroep={spiergroep} data={groupedData} />
        ))}
      </div>
    </div>
  );
}
