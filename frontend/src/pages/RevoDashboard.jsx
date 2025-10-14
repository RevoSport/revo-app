import React, { useMemo } from "react";
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
  LabelList,
} from "recharts";

const COLORS = ["#FF7900", "#555555"];

export default function RevoDashboard({ title, subtitle, data, metrics, kpi }) {
  // 🔹 Helper: bereken percentages
  const formatData = (arr) => {
    const total = arr.reduce((sum, d) => sum + (d.value || 0), 0);
    return arr.map((d) => ({
      ...d,
      percent: total ? ((d.value / total) * 100).toFixed(1) : 0,
    }));
  };

  const prepared = useMemo(() => {
    const out = {};
    metrics.forEach((m) => {
      const grouped = {};
      data.forEach((d) => {
        const val = d[m.key];
        if (val) grouped[val] = (grouped[val] || 0) + 1;
      });
      out[m.key] = formatData(
        Object.entries(grouped).map(([k, v]) => ({ name: k, value: v }))
      );
    });
    return out;
  }, [data, metrics]);

  const cardStyle = {
    background: "#1a1a1a",
    borderRadius: "10px",
    padding: "25px 20px",
    textAlign: "center",
    boxShadow: "0 0 8px rgba(0,0,0,0.25)",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "20px 0 60px 0",
        color: "var(--text)",
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: "16px",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            color: "#c9c9c9",
            fontSize: "12px",
            textAlign: "center",
            marginBottom: "24px",
            letterSpacing: "0.5px",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* === KPI === */}
      {kpi && kpi.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${kpi.length}, 1fr)`,
            gap: "20px",
            marginBottom: "35px",
          }}
        >
          {kpi.map((item) => (
            <div key={item.label} style={cardStyle}>
              <div style={{ color: "#FF7900", fontSize: "22px", fontWeight: 700 }}>
                {item.value || "–"}
              </div>
              <div style={{ color: "#c9c9c9", fontSize: "12px" }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* === CHART GRID === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          justifyContent: "center",
        }}
      >
        {metrics.map((m) => (
          <ChartCard
            key={m.key}
            title={m.key}
            data={prepared[m.key]}
            type={m.type}
          />
        ))}
      </div>
    </div>
  );
}

// 📊 Subcomponent voor grafieken
function ChartCard({ title, data, type }) {
  return (
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
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={150}>
        {type === "pie" ? (
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #FF7900",
                color: "#fff",
                fontSize: 11,
              }}
              formatter={(v, name, e) => [`${v} (${e.payload.percent}%)`, name]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={4}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#c9c9c9" fontSize={10} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #FF7900",
                color: "#fff",
                fontSize: 11,
              }}
              formatter={(v, name, e) => [`${v} (${e.payload.percent}%)`, name]}
            />
            <Bar
              dataKey="value"
              fill="#FF7900"
              radius={4}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="percent"
                position="top"
                formatter={(v) => `${v}%`}
                fill="#c9c9c9"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
