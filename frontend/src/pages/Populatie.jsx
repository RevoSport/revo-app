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
import { FaMars, FaVenus } from "react-icons/fa";

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
    let operatieLopenDays = [];
    let operatieAutorijdenDays = [];

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

        const dOngeval = getField(b, ["Datum_ongeval", "datum_ongeval", "Datum ongeval"]);
        const dOperatie = getField(b, ["Datum_operatie", "datum_operatie", "Datum operatie"]);
        const dIntake = getField(b, ["Datum_intake", "datum_intake", "Datum intake"]);
        const dLopen = getField(b, ["Datum_start_lopen", "datum_start_lopen", "Datum start lopen"]);
        const dAutorijden = getField(b, ["Datum_start_autorijden", "datum_start_autorijden", "Datum start autorijden"]);

        const diff1 = daysBetween(dOngeval, dOperatie);
        const diff2 = daysBetween(dOperatie, dIntake);
        const diff3 = daysBetween(dOperatie, dLopen);
        const diff4 = daysBetween(dOperatie, dAutorijden);

        if (diff1 !== null) ongevalOperatieDays.push(diff1);
        if (diff2 !== null) operatieIntakeDays.push(diff2);
        if (diff3 !== null) operatieLopenDays.push(diff3);
        if (diff4 !== null) operatieAutorijdenDays.push(diff4);
      });
    });

    // 🔢 Percentages berekenen met afronding
    const toArray = (obj) => {
      const entries = Object.entries(obj).filter(([k, v]) => k && v);
      const total = entries.reduce((a, [, v]) => a + v, 0);
      if (total === 0) return [];

      let raw = entries.map(([k, v]) => ({
        name: k,
        value: v,
        percent: (v / total) * 100,
      }));

      let rounded = raw.map((r) => Math.round(r.percent * 10) / 10);
      const diff = 100 - rounded.reduce((a, b) => a + b, 0);
      if (Math.abs(diff) > 0.05) {
        const maxIdx = rounded.indexOf(Math.max(...rounded));
        rounded[maxIdx] = Math.round((rounded[maxIdx] + diff) * 10) / 10;
      }

      return raw.map((r, i) => ({
        name: r.name,
        value: r.value,
        percent: rounded[i].toFixed(1),
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
      avgOperatieLopen: avg(operatieLopenDays),
      avgOperatieAutorijden: avg(operatieAutorijdenDays),
    };
  }, [data]);

  const cardStyle = {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "25px 20px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.25)",
  };

  const kpiData = [
    { label: "Aantal patiënten", value: stats.totalPatients },
    {
      label: "Gem. tijd ongeval → operatie",
      value: stats.avgOngevalOperatie ? `${stats.avgOngevalOperatie} dagen` : "–",
    },
    {
      label: "Gem. tijd operatie → intake",
      value: stats.avgOperatieIntake ? `${stats.avgOperatieIntake} dagen` : "–",
    },
    {
      label: "Gem. tijd operatie → lopen",
      value: stats.avgOperatieLopen ? `${stats.avgOperatieLopen} dagen` : "–",
    },
    {
      label: "Gem. tijd operatie → autorijden",
      value: stats.avgOperatieAutorijden ? `${stats.avgOperatieAutorijden} dagen` : "–",
    },
  ];

  const man = stats.genderData.find((g) => g.name.toLowerCase().includes("man"))?.percent || 0;
  const vrouw = stats.genderData.find((g) => g.name.toLowerCase().includes("vrouw"))?.percent || 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
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

      {/* === KPI + GESLACHT === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
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

        {/* Geslachtkaart */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "22px",
            paddingTop: "30px",
            paddingBottom: "30px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <FaMars color="#555555" size={28} />
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#c9c9c9" }}>{man}%</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <FaVenus color="#FF7900" size={28} />
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#FF7900" }}>{vrouw}%</div>
          </div>
        </div>
      </div>

      {/* === Charts (rest identiek) === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <ChartCard title="Sport" data={stats.sportData} type="bar" />
        <ChartCard title="Sportniveau" data={stats.sportniveauData} type="bar" />
        <ChartCard title="Etiologie" data={stats.etiologieData} type="pie" />
        <ChartCard title="Arts" data={stats.artsData} type="bar" />
      </div>

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
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        <ChartCard title="Operatie Type" data={stats.operatieData} type="bar" />
        <ChartCard title="Bijkomende Letsels" data={stats.letselsData} type="bar" />
        <ChartCard title="Monoloop" data={stats.monoloopData} type="pie" />
      </div>
    </div>
  );
}

// === Subcomponent ChartCard (identiek aan vorige finale versie) ===
function ChartCard({ title, data, type }) {
  const baseCard = {
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "20px 20px 25px 20px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const titleStyle = {
    fontSize: "12px",
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontWeight: 700,
    margin: "0 0 10px 0",
    letterSpacing: "0.5px",
    minHeight: "18px",
  };

  if (type === "pie") {
    return (
      <div style={baseCard}>
        <h4 style={titleStyle}>{title}</h4>
        <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
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
                  const value = data[index]?.percent || 0;
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#ffffff"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight={400}
                    >
                      {`${value}%`}
                    </text>
                  );
                }}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="none"
                    style={{
                      transition: "all 0.25s ease-in-out",
                      cursor: "pointer",
                      transformOrigin: "center center",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.02)";
                      e.target.style.filter = "drop-shadow(0 0 4px rgba(255,255,255,0.15))";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.filter = "none";
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  color: "#FF7900",
                  fontSize: 11,
                  borderRadius: "6px",
                  boxShadow: "0 0 6px rgba(0,0,0,0.25)",
                }}
                formatter={(value) => [`Aantal: ${value}`, ""]}
                labelFormatter={() => ""}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div style={baseCard}>
      <h4 style={titleStyle}>{title}</h4>
      <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 70 }}>
            <XAxis
              dataKey="name"
              stroke="#c9c9c9"
              fontSize={data.length > 8 ? 8 : data.length > 5 ? 9 : 10}
              interval={0}
              angle={data.length > 5 ? -90 : 0}
              textAnchor={data.length > 5 ? "end" : "middle"}
              height={data.length > 5 ? 85 : 30}
              dy={10}
              style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #FF7900",
                color: "#FF7900",
                fontSize: 11,
                borderRadius: "6px",
                boxShadow: "0 0 6px rgba(0,0,0,0.25)",
              }}
              formatter={(value) => [`Aantal: ${value}`, ""]}
              labelFormatter={() => ""}
            />
            <Bar
              dataKey="value"
              fill="#FF7900"
              radius={4}
              style={{
                transition: "all 0.25s ease-in-out",
                cursor: "pointer",
                transformOrigin: "center bottom",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.02)";
                e.target.style.filter
                e.target.style.filter = "drop-shadow(0 0 4px rgba(255,255,255,0.15))";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.filter = "none";
              }}
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}
