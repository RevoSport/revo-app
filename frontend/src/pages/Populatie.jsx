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

// 🔍 Helper om veldnamen flexibel op te vragen
function getField(obj, possibleKeys = []) {
  if (!obj) return null;
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "")
      return obj[key];
  }
  return null;
}

// 🔢 Dagenverschil tussen twee datums (veilig)
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1) || isNaN(d2)) return null;
  const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff < 400 ? diff : null;
}

export default function Populatie({ data }) {
  const stats = useMemo(() => {
    const counts = {
      geslacht: {},
      sport: {},
      sportniveau: {},
      etiologie: {},
      operatie: {},
      arts: {},
      letsel: {},
      monoloop: {},
    };

    let ongevalOperatieDays = [];
    let operatieIntakeDays = [];

    data.forEach((p) => {
      const geslacht = getField(p, ["Geslacht", "geslacht"]);
      if (geslacht)
        counts.geslacht[geslacht] = (counts.geslacht[geslacht] || 0) + 1;

      (p.blessures || []).forEach((b) => {
        const sport = getField(b, ["Sport", "sport"]);
        const sportniveau = getField(b, ["Sportniveau", "sportniveau"]);
        const etiologie = getField(b, ["Etiologie", "etiologie"]);
        const operatie = getField(b, ["Operatie", "operatie", "Type_operatie", "type_operatie"]);
        const arts = getField(b, ["Arts", "arts"]);
        const letsel = getField(b, ["Bijkomende_letsels", "Bijkomende letsels", "letsels"]);
        const monoloop = getField(b, ["Monoloop", "monoloop"]);

        if (sport) counts.sport[sport] = (counts.sport[sport] || 0) + 1;
        if (sportniveau) counts.sportniveau[sportniveau] = (counts.sportniveau[sportniveau] || 0) + 1;
        if (etiologie) counts.etiologie[etiologie] = (counts.etiologie[etiologie] || 0) + 1;
        if (operatie) counts.operatie[operatie] = (counts.operatie[operatie] || 0) + 1;
        if (arts) counts.arts[arts] = (counts.arts[arts] || 0) + 1;
        if (letsel) counts.letsel[letsel] = (counts.letsel[letsel] || 0) + 1;
        if (monoloop) counts.monoloop[monoloop] = (counts.monoloop[monoloop] || 0) + 1;

        // 🗓️ Gemiddelde tijden berekenen
        const dOngeval = getField(b, ["Datum_ongeval", "datum_ongeval", "Datum ongeval", "datum ongeval"]);
        const dOperatie = getField(b, ["Datum_operatie", "datum_operatie", "Datum operatie", "datum operatie"]);
        const dIntake = getField(b, ["Datum_intake", "datum_intake", "Datum intake", "datum intake"]);

        const diff1 = daysBetween(dOngeval, dOperatie);
        const diff2 = daysBetween(dOperatie, dIntake);

        if (diff1 !== null) ongevalOperatieDays.push(diff1);
        if (diff2 !== null) operatieIntakeDays.push(diff2);
      });
    });

    const toArray = (obj) => {
      const total = Object.values(obj).reduce((a, b) => a + b, 0);
      return Object.entries(obj)
        .filter(([k, v]) => k && v)
        .map(([k, v]) => ({
          name: k,
          value: v,
          percent: total ? ((v / total) * 100).toFixed(1) : 0,
        }));
    };

    const avg = (arr) =>
      arr.length > 0
        ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
        : null;

    return {
      genderData: toArray(counts.geslacht),
      sportData: toArray(counts.sport),
      sportniveauData: toArray(counts.sportniveau),
      etiologieData: toArray(counts.etiologie),
      operatieData: toArray(counts.operatie),
      artsData: toArray(counts.arts),
      letselsData: toArray(counts.letsel),
      monoloopData: toArray(counts.monoloop),
      totalPatients: data.length,
      avgOngevalOperatie: avg(ongevalOperatieDays),
      avgOperatieIntake: avg(operatieIntakeDays),
    };
  }, [data]);

  const cardStyle = {
    background: "#1a1a1a",
    borderRadius: "10px",
    padding: "25px 20px",
    textAlign: "center",
    boxShadow: "0 0 8px rgba(0,0,0,0.25)",
  };

  const kpiData = [
    { label: "Aantal patiënten", value: stats.totalPatients },
    {
      label: "Gem. tijd ongeval → operatie",
      value: stats.avgOngevalOperatie
        ? `${stats.avgOngevalOperatie} dagen`
        : "–",
    },
    {
      label: "Gem. tijd operatie → intake",
      value: stats.avgOperatieIntake
        ? `${stats.avgOperatieIntake} dagen`
        : "–",
    },
  ];

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
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        POPULATIE BESCHRIJVING
      </h2>

      {/* === KPI === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        {kpiData.map((kpi) => (
          <div key={kpi.label} style={cardStyle}>
            <div style={{ color: "#FF7900", fontSize: "22px", fontWeight: 700 }}>
              {kpi.value}
            </div>
            <div style={{ color: "#c9c9c9", fontSize: "12px" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* === POPULATIE GRAFIEKEN === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <ChartCard title="Geslacht" data={stats.genderData} type="pie" />
        <ChartCard title="Sport" data={stats.sportData} type="bar" />
        <ChartCard title="Sportniveau" data={stats.sportniveauData} type="bar" />
        <ChartCard title="Etiologie" data={stats.etiologieData} type="pie" />
      </div>

      <div
        style={{
          height: "1px",
          backgroundColor: "#FF7900",
          width: "100%",
          margin: "25px 0 40px 0",
        }}
      ></div>

      {/* === MEDISCH === */}
      <h2
        style={{
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        MEDISCH
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
        }}
      >
        <ChartCard title="Arts" data={stats.artsData} type="bar" />
        <ChartCard title="Operatie Type" data={stats.operatieData} type="bar" />
        <ChartCard title="Bijkomende Letsels" data={stats.letselsData} type="bar" />
        <ChartCard title="Monoloop" data={stats.monoloopData} type="pie" />
      </div>
    </div>
  );
}

// 📊 Subcomponent voor herbruikbare grafiek met animatie + percentages
function ChartCard({ title, data, type }) {
  const cardStyle = {
    background: "#1a1a1a",
    borderRadius: "10px",
    padding: "25px 20px",
    textAlign: "center",
    boxShadow: "0 0 8px rgba(0,0,0,0.25)",
  };
  const titleStyle = {
    fontSize: "12px",
    color: "#FFFFFF",
    marginBottom: 10,
    textTransform: "uppercase",
  };

  return (
    <div style={cardStyle}>
      <h4 style={titleStyle}>{title}</h4>
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
              formatter={(value, name, entry) => [
                `${value} (${entry.payload.percent}%)`,
                name,
              ]}
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
              formatter={(value, name, entry) => [
                `${value} (${entry.payload.percent}%)`,
                name,
              ]}
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
