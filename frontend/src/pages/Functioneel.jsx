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
const COLOR_BG = "#1a1a1a";
const COLOR_GREEN = "#7CFC00";

// 🔹 Safe array helper
const safeArray = (arr) => (Array.isArray(arr) ? [...arr] : []);

// =====================================================
// 🔹 Tooltip
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
// 🔹 DonutCard (met lift effect zoals Populatie.jsx)
// =====================================================
function DonutCard({ label, data }) {
  if (!data) return null;

  const COLORS = ["#FF7900", "#555555"];
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: parseFloat(value) || 0,
  }));

  const liftStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: 12,
        padding: "20px 20px 14px 20px",
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        animation: "fadeIn 0.6s ease-in-out",
        height: "100%",
      }}
    >
      <style>{liftStyle}</style>
      <h4
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "#fff",
          marginBottom: 10,
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </h4>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
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
              {chartData.map((_, i) => {
                const baseColor = COLORS[i % COLORS.length];
                const hoverColor =
                  baseColor === "#FF7900" ? "#FFC266" : "#888888";
                return (
                  <Cell
                    key={i}
                    fill={baseColor}
                    stroke="none"
                    onMouseEnter={(e) => {
                      e.target.style.fill = hoverColor;
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.transition =
                        "transform 0.25s ease, fill 0.25s ease";
                      e.target.style.transformOrigin = "center";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.fill = baseColor;
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #FF7900",
                fontSize: 11,
                borderRadius: 6,
              }}
              itemStyle={{ color: "#fff" }}
              formatter={(v, name, props) => [
                `${props?.payload?.name}: ${v}%`,
                null,
              ]}
              labelFormatter={() => ""}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Legenda onderaan */}
      <div style={{ fontSize: 11, color: "#ccc", marginTop: 6 }}>
        {chartData.map((entry, i) => (
          <div key={i}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: COLORS[i % COLORS.length],
                borderRadius: 2,
                marginRight: 6,
              }}
            ></span>
            {entry.name}: {entry.value.toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}


// =====================================================
// 🔹 ChartCard (bar chart)
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

  // helpers voor bar-hover (alleen de bar tilt/kleurt, niet de card)
  const liftUp = (e, fill) => {
    // lichte omhoog-shift van de balk
    e.target.setAttribute("transform", "translate(0,-3)");
    // kleur-accent bij hover
    e.target.setAttribute("fill", fill);
    // vloeiende overgang
    e.target.style.transition = "transform 0.2s ease, fill 0.2s ease";
    e.target.style.transformOrigin = "center";
  };
  const resetLift = (e, fill) => {
    e.target.setAttribute("transform", "translate(0,0)");
    e.target.setAttribute("fill", fill);
  };

  return (
    <div
      className="chart-card"
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "18px 20px 26px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        height: "100%",
        // alleen een subtiele fade-in bij laden, géén hover op de kaart
        animation: "fadeIn 0.6s ease-in-out",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#fff",
            letterSpacing: "0.5px",
            marginBottom: 4,
          }}
        >
          {test}
        </div>
        <LegendAbove />
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={dataWithDiff} margin={{ top: 40, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="fase" tick={{ fill: "#ccc", fontSize: 11 }} interval={0} />
          <YAxis domain={["auto", "auto"]} tick={{ fill: "#ccc", fontSize: 11 }} />
          <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />

          {/* Geopereerd (met bar-hover lift/kleur) */}
          <Bar dataKey="geopereerd" radius={[4, 4, 4, 4]}>
            {dataWithDiff.map((_, i) => (
              <Cell
                key={`geo-${i}`}
                fill={COLOR_OPER}
                onMouseEnter={(e) => liftUp(e, "#FFC266")}
                onMouseLeave={(e) => resetLift(e, COLOR_OPER)}
              />
            ))}
          </Bar>

          {/* Gezond (met bar-hover lift/kleur) */}
          <Bar dataKey="gezond" radius={[4, 4, 4, 4]}>
            {dataWithDiff.map((_, i) => (
              <Cell
                key={`gez-${i}`}
                fill={COLOR_GEZOND}
                onMouseEnter={(e) => liftUp(e, "#888888")}
                onMouseLeave={(e) => resetLift(e, COLOR_GEZOND)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// =====================================================
// 🔹 StepdownCard — uitgelijnd met H/Q Ratio stijl
// =====================================================
// =====================================================
// 🔹 StepdownCard — toont geopereerd en gezond per fase
// =====================================================
function StepdownCard({ label, data }) {
  if (!data) return null;

  const fases = data.map((d) => ({
    fase: d.fase,
    geopereerd: d.geopereerd ?? d.geopereerd_mean ?? null,
    gezond: d.gezond ?? d.gezond_mean ?? null,
  }));

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: 12,
        padding: "20px 24px 16px 24px",
        textAlign: "left",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        animation: "fadeIn 0.6s ease-in-out",
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

      <table
        style={{
          width: "100%",
          color: "#fff",
          fontSize: 12,
          borderCollapse: "collapse",
          marginTop: 4,
        }}
      >
        <thead>
          <tr style={{ color: "#FF7900", textAlign: "left" }}>
            <th style={{ paddingBottom: 4 }}>Fase</th>
            <th style={{ textAlign: "right", paddingBottom: 4 }}>Geopereerd</th>
            <th style={{ textAlign: "right", paddingBottom: 4 }}>Gezond</th>
          </tr>
        </thead>
        <tbody>
          {fases.map((f, i) => (
            <tr key={i}>
              <td style={{ padding: "3px 0", color: "#fff" }}>{f.fase}</td>
              <td
                style={{
                  textAlign: "right",
                  color: "#ccc",
                  fontWeight: 600,
                  padding: "3px 0",
                }}
              >
                {f.geopereerd != null ? f.geopereerd.toFixed(2) : "–"}
              </td>
              <td
                style={{
                  textAlign: "right",
                  color: "#ccc",
                  fontWeight: 600,
                  padding: "3px 0",
                }}
              >
                {f.gezond != null ? f.gezond.toFixed(2) : "–"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================
// 🔹 % Kaartje
// =====================================================
function MeanSplitCard({ label, data }) {
  if (!data) return null;

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: 12,
        padding: "20px 24px 16px 24px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        animation: "fadeIn 0.6s ease-in-out",
        height: "100%",
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

      <table
        style={{
          width: "100%",
          color: "#fff",
          fontSize: 12,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ color: "#FF7900" }}>
            <th style={{ textAlign: "left", paddingBottom: 4 }}>Fase</th>
            <th style={{ textAlign: "right", paddingBottom: 4 }}>Geopereerd</th>
            <th style={{ textAlign: "right", paddingBottom: 4 }}>Gezond</th>
          </tr>
        </thead>
        <tbody>
          {data.map((f, i) => (
            <tr key={i}>
              <td
                style={{
                  padding: "3px 0",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                {f.fase}
              </td>
              <td
                style={{
                  textAlign: "right",
                  color: "#fff", // wit ipv oranje
                  fontWeight: 600,
                  padding: "3px 0",
                }}
              >
                {f.geopereerd ? `${f.geopereerd.toFixed(1)}%` : "–"}
              </td>
              <td
                style={{
                  textAlign: "right",
                  color: "#fff", // wit ipv grijs
                  fontWeight: 600,
                  padding: "3px 0",
                }}
              >
                {f.gezond ? `${f.gezond.toFixed(1)}%` : "–"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================
// 🔹 MultiTestCard — toont meerdere testen in één kaart (zoals CMJ/Drop Jump)
// =====================================================
function MultiTestCard({ label, tests, groupedData }) {
  if (!tests || tests.length === 0) return null;

  const combined = tests
    .map((test) => ({
      test,
      data: groupedData?.[test] || [],
    }))
    .filter((t) => t.data.length > 0);

  // 🔹 Eenheid bepalen op basis van testnaam
  const getUnit = (testName) => {
    const lower = testName.toLowerCase();
    if (
      lower.includes("hoogte") ||
      lower.includes("hop") ||
      lower.includes("distance")
    )
      return "cm";
    if (lower.includes("rsi")) return "";
    if (lower.includes("steunname")) return "%";
    if (lower.includes("forceplate")) return "%";
    return "%"; // default
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: 12,
        padding: "20px 24px 16px 24px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
        animation: "fadeIn 0.6s ease-in-out",
        height: "100%",
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

      {combined.map((block, idx) => {
        const isBilateraal =
          block.test.toLowerCase().includes("2-benig") ||
          block.test.toLowerCase().includes("2benig");

        const unit = getUnit(block.test);

        return (
          <div key={idx} style={{ marginBottom: idx < combined.length - 1 ? 16 : 0 }}>
            <div
              style={{
                color: "#FF7900",
                fontWeight: 700,
                fontSize: 11,
                textTransform: "uppercase",
                marginBottom: 4,
                borderBottom: "1px solid #333",
                paddingBottom: 2,
              }}
            >
              {block.test}
            </div>

            <table
              style={{
                width: "100%",
                color: "#fff",
                fontSize: 12,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ color: "#FF7900" }}>
                  <th style={{ textAlign: "left", paddingBottom: 4 }}>Fase</th>
                  {isBilateraal ? (
                    <th style={{ textAlign: "right", paddingBottom: 4 }}>Gemiddelde</th>
                  ) : (
                    <>
                      <th style={{ textAlign: "right", paddingBottom: 4 }}>Geopereerd</th>
                      <th style={{ textAlign: "right", paddingBottom: 4 }}>Gezond</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {block.data.map((f, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        padding: "3px 0",
                        textAlign: "left",
                        color: "#fff",
                      }}
                    >
                      {f.fase}
                    </td>

                    {isBilateraal ? (
                      <td
                        style={{
                          textAlign: "right",
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      >
                        {f.geopereerd
                          ? `${f.geopereerd.toFixed(1)} ${unit}`
                          : f.mean
                          ? `${f.mean.toFixed(1)} ${unit}`
                          : "–"}
                      </td>
                    ) : (
                      <>
                        <td
                          style={{
                            textAlign: "right",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {f.geopereerd ? `${f.geopereerd.toFixed(1)} ${unit}` : "–"}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {f.gezond ? `${f.gezond.toFixed(1)} ${unit}` : "–"}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================
// 🔹 MiniHopChart (verticale versie met Revo-tooltipstijl)
// =====================================================
function MiniHopChart({ title, data }) {
  if (!data) return null;

  const chartData = data.map((d) => ({
    fase: d.fase,
    geopereerd: d.geopereerd ?? 0,
    gezond: d.gezond ?? 0,
  }));

  // 🔹 Hover-animatie zoals ChartCard
  const liftUp = (e, fill) => {
    e.target.setAttribute("transform", "translate(0,-3)");
    e.target.setAttribute("fill", fill);
    e.target.style.transition = "transform 0.2s ease, fill 0.2s ease";
    e.target.style.transformOrigin = "center";
  };

  const resetLift = (e, fill) => {
    e.target.setAttribute("transform", "translate(0,0)");
    e.target.setAttribute("fill", fill);
  };

  // 🔹 Custom Tooltip in Revo-stijl
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            textAlign: "left",
          }}
        >
          <div style={{ color: COLOR_OPER, marginBottom: 4, fontWeight: 700 }}>
            {label}
          </div>
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
        padding: "12px 18px 12px 18px",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      }}
    >
      <h4
        style={{
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </h4>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="fase"
            tick={{ fill: "#ccc", fontSize: 10 }}
            interval={0}
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fill: "#ccc", fontSize: 10 }}
          />
          <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />

          {/* Geopereerd */}
          <Bar dataKey="geopereerd" radius={[4, 4, 4, 4]}>
            {chartData.map((_, i) => (
              <Cell
                key={`geo-${i}`}
                fill={COLOR_OPER}
                onMouseEnter={(e) => liftUp(e, "#FFC266")}
                onMouseLeave={(e) => resetLift(e, COLOR_OPER)}
              />
            ))}
          </Bar>

          {/* Gezond */}
          <Bar dataKey="gezond" radius={[4, 4, 4, 4]}>
            {chartData.map((_, i) => (
              <Cell
                key={`gez-${i}`}
                fill={COLOR_GEZOND}
                onMouseEnter={(e) => liftUp(e, "#888888")}
                onMouseLeave={(e) => resetLift(e, COLOR_GEZOND)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


// =====================================================
// 🔹 HopClusterOverviewCard
// =====================================================
function HopClusterOverviewCard({ data }) {
  if (!data) return null;
  const subtests = Object.entries(data.subtests || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const getColor = (v) =>
    v >= 90 ? "#7CFC00" : v >= 80 ? "#FF7900" : "#FF4D4D";

  return (
    <div
      style={{
        background: COLOR_BG,
        borderRadius: 12,
        padding: "10px 30px 20px 30px",
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
          marginBottom: 30,
        }}
      >
        LSI-Overzicht
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {subtests.map((t, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div style={{ width: 80, color: "#fff", fontSize: 11 }}>
              {t.name.replaceAll("_", " ")}
            </div>
            <div
              style={{
                flexGrow: 1,
                height: 8,
                borderRadius: 4,
                background: "#333",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${t.value}%`,
                  background: getColor(t.value),
                  height: "100%",
                  borderRadius: 4,
                }}
              />
            </div>
            <div
              style={{
                width: 40,
                textAlign: "right",
                color: "#fff",
                fontSize: 11,
              }}
            >
              {t.value?.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          color: "#fff",
          fontSize: 12,
          marginTop: 12,
        }}
      >
        Gemiddelde LSI:{" "}
        <strong style={{ color: COLOR_OPER }}>
          {data.mean_lsi?.toFixed(1)}%
        </strong>{" "}
        (n={data.n ?? 0})
      </div>
    </div>
  );
}


// =====================================================
// 🔹 SingleValueCard + HopClusterCard (ongewijzigd)
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
      <div style={{ color: COLOR_OPER, fontSize: 24, fontWeight: 700 }}>{mean ?? "–"}</div>
    </div>
  );
}

function HopClusterCard({ data }) {
  if (!data) return null;
  const chartData = Object.entries(data.subtests || {}).map(([k, v]) => ({ test: k, value: v }));
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
              <Cell key={i} fill={entry.value >= 100 ? COLOR_GREEN : COLOR_OPER} />
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
  const groupedData = useMemo(() => {
    const map = {};
    cleanData.forEach((faseObj) => {
      const faseNaam = faseObj.fase;
const allTests = [
  ...(faseObj.functioneel || []),
  ...(faseObj.spring || []),
];

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
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        paddingBottom: "40px",
      }}
    >

      {/* === Neuromusculaire Activatie + Lateral Stepdown === */}
      <h3
        style={{
          color: "#fff",
          fontSize: 13,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Neuromusculaire Activatie & Lateral Stepdown
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr", // 2 donuts links, 1 kolom rechts
          gap: "24px",
          alignItems: "stretch",
          marginBottom: "40px",
        }}
      >
        {/* 🔸 Linkerkant — 2 donuts */}
        <DonutCard label="Lag Test" data={data?.baseline?.lag_test} />
        <DonutCard label="VMO Activatie" data={data?.baseline?.vmo_activatie} />

        {/* 🔸 Rechterkant — 2 kaarten onder elkaar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
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

      {/* === CMJ en Drop Jump Overzicht === */}
      <h3
        style={{
          color: "#fff",
          fontSize: 13,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        CMJ & Drop Jump Overzicht
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          alignItems: "stretch",
          marginBottom: "40px",
        }}
      >
        {/* 🔸 Linkerkant: Drop Jump */}
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

        {/* 🔸 Rechterkant: CMJ + Squat */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
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

      {/* === Hop Cluster === */}
      <h3
        style={{
          color: "#fff",
          fontSize: 13,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Hop Test Cluster
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          alignItems: "stretch",
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
