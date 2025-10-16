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

// 🔹 Flexibele key-opvrager
function getField(obj, possibleKeys = []) {
  if (!obj) return null;
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "")
      return obj[key];
  }
  return null;
}

// 🔹 Dagenverschil berekening (veilig)
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1) || isNaN(d2)) return null;
  const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff < 400 ? diff : null;
}

function Populatie({ data, summary }) {
  // 🔸 Lokale fallback-berekeningen
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

        const dOngeval = getField(b, ["Datum_ongeval", "Datum ongeval"]);
        const dOperatie = getField(b, ["Datum_operatie", "Datum operatie"]);
        const dIntake = getField(b, ["Datum_intake", "Datum intake"]);
        const dLopen = getField(b, ["Datum_start_lopen", "Lopen - Opstartdatum"]);
        const dAutorijden = getField(b, ["Datum_start_autorijden", "Autorijden - datum"]);

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

    const toArray = (obj) => {
      const entries = Object.entries(obj).filter(([k, v]) => k && v);
      const total = entries.reduce((a, [, v]) => a + v, 0);
      if (total === 0) return [];
      return entries
        .map(([k, v]) => ({
          name: k,
          value: v,
          percent: ((v / total) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value);
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

  // 🔸 Combineer lokale + backenddata
  const avgOngevalOperatie = summary?.avg?.accident_to_surgery ?? stats.avgOngevalOperatie;
  const avgOperatieIntake = summary?.avg?.surgery_to_intake ?? stats.avgOperatieIntake;
  const avgOperatieLopen = summary?.avg?.surgery_to_walk ?? stats.avgOperatieLopen;
  const avgOperatieAutorijden = summary?.avg?.surgery_to_drive ?? stats.avgOperatieAutorijden;

  const genderData = summary?.counts?.geslacht ?? stats.genderData;
  const sportData = (summary?.counts?.sport ?? stats.sportData)?.sort((a, b) => b.value - a.value);
  const sportniveauData = (summary?.counts?.sportniveau ?? stats.sportniveauData)?.sort((a, b) => b.value - a.value);
  const etiologieData = summary?.counts?.etiologie ?? stats.etiologieData;
  const artsData = (summary?.counts?.arts ?? stats.artsData)?.sort((a, b) => b.value - a.value);
  const operatieData = (summary?.counts?.operatie ?? stats.operatieData)?.sort((a, b) => b.value - a.value);
  const letselsData = (summary?.counts?.letsel ?? stats.letselsData)?.sort((a, b) => b.value - a.value);
  const monoloopData = summary?.counts?.monoloop ?? stats.monoloopData;

  const totalPatients = summary?.totalPatients ?? stats.totalPatients;

  // ✅ Verbeterde genderherkenning
  const man =
    genderData.find((g) => ["man", "m", "male"].includes(g.name?.toLowerCase().trim()))?.percent || 0;
  const vrouw =
    genderData.find((g) => ["vrouw", "v", "female"].includes(g.name?.toLowerCase().trim()))?.percent || 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px 0 60px 0",
        color: "var(--text)",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h2 style={{ color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px", fontWeight: 700, marginBottom: "24px", textAlign: "center" }}>
        POPULATIE BESCHRIJVING
      </h2>

      {/* === RIJ 1 === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
        <KpiCard label="Aantal patiënten" value={totalPatients} />
        <KpiCard label="Gem. tijd ongeval → operatie" value={avgOngevalOperatie} eenheid="dagen" />
        <KpiCard label="Gem. tijd operatie → autorijden" value={avgOperatieAutorijden} eenheid="dagen" />
      </div>

      {/* === RIJ 2 === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "35px" }}>
        <GeslachtCard man={man} vrouw={vrouw} />
        <KpiCard label="Gem. tijd operatie → intake" value={avgOperatieIntake} eenheid="dagen" />
        <KpiCard label="Gem. tijd operatie → lopen" value={avgOperatieLopen} eenheid="dagen" />
      </div>

      {/* === CHARTS === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
        <ChartCard title="Sport" data={sportData} type="bar" />
        <ChartCard title="Sportniveau" data={sportniveauData} type="bar" />
        <ChartCard title="Etiologie" data={etiologieData} type="pie" />
        <ChartCard title="Arts" data={artsData} type="bar" />
      </div>

      <h2 style={{ color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px", fontWeight: 700, marginBottom: "30px", textAlign: "center" }}>
        MEDISCH
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        <ChartCard title="Operatie Type" data={operatieData} type="bar" />
        <ChartCard title="Bijkomende Letsels" data={letselsData} type="bar" />
        <ChartCard title="Monoloop" data={monoloopData} type="pie" />
      </div>
    </div>
  );
}

// === Subcomponenten ===
function KpiCard({ label, value, eenheid }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "25px 20px", textAlign: "center", boxShadow: "0 0 10px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ color: "#FF7900", fontSize: 22, fontWeight: 700 }}>
        {value ? `${value} ${eenheid || ""}` : "–"}
      </div>
      <div style={{ color: "#c9c9c9", fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function GeslachtCard({ man, vrouw }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "20px 0", textAlign: "center", boxShadow: "0 0 10px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FaMars color="#bbb" size={22} />
        <span style={{ fontSize: 18, fontWeight: 700, color: "#bbb" }}>{man}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FaVenus color="#FF7900" size={22} />
        <span style={{ fontSize: 18, fontWeight: 700, color: "#FF7900" }}>{vrouw}%</span>
      </div>
    </div>
  );
}

function ChartCard({ title, data, type }) {
  const baseCard = {
    background: "#1a1a1a",
    borderRadius: 12,
    padding: "18px 20px 0px 20px", // ⬇️ minder padding onderaan
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    animation: "fadeIn 0.6s ease-in-out",
  };

  const titleStyle = {
    fontSize: 12,
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 14,
    letterSpacing: "0.5px",
  };

  const liftStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes barGrow {
      from { transform: scaleY(0); opacity: 0; }
      to { transform: scaleY(1); opacity: 1; }
    }

    /* === BAR ANIMATIES === */
    .bar-hover {
      transform-origin: bottom;
      animation: barGrow 0.7s ease-out forwards;
      transition: transform 0.25s ease-in-out, fill 0.25s ease-in-out;
    }
    .bar-hover:hover {
      fill: #ffa64d;
      transform: translateY(-2px) scaleY(1.03);
    }

    /* === PIE ANIMATIES === */
    .slice-hover {
      transition: fill 0.25s ease-in-out;
    }
    .slice-hover:nth-child(odd):hover {
      fill: #FFA64D; /* lichtere oranje */
    }
    .slice-hover:nth-child(even):hover {
      fill: #777777; /* lichtere grijs */
    }
  `;

  return (
    <div style={baseCard}>
      <style>{liftStyle}</style>
      <h4 style={titleStyle}>{title}</h4>

      <div
        style={{
          flexGrow: 1,
          width: "100%",
          minHeight: 200,
          display: "flex",
          alignItems: type === "pie" ? "center" : "flex-end",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {type === "pie" ? (
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
                      fill="#fff"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {`${value}%`}
                    </text>
                  );
                }}
              >
              {data.map((_, i) => {
                const baseColor = COLORS[i % COLORS.length];
                const hoverColor = baseColor === "#FF7900" ? "#FFA64D" : "#888888";
                return (
                  <Cell
                    key={i}
                    fill={baseColor}
                    stroke="none"
                    className="slice-hover"
                    onMouseEnter={(e) => (e.target.style.fill = hoverColor)}
                    onMouseLeave={(e) => (e.target.style.fill = baseColor)}
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
                formatter={(v) => `Aantal: ${v}`} // ✅ geen dubbele punt
                labelFormatter={() => ""}
              />
            </PieChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 0, right: 10, left: 0, bottom: 50 }}
              barCategoryGap="25%"
              onMouseMove={() => {}} // blokkeert interne hover state
            >
              <XAxis
                dataKey="name"
                stroke="#c9c9c9"
                fontSize={data.length > 8 ? 8 : 10}
                interval={0}
                angle={data.length > 5 ? -90 : 0}
                textAnchor={data.length > 5 ? "end" : "middle"}
                height={data.length > 5 ? 85 : 30}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "transparent" }} // geen grijze hoverbalk
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(v) => `Aantal: ${v}`} // ✅ geen dubbele punt
                labelFormatter={() => ""}
              />
              <Bar
                dataKey="value"
                radius={4}
                isAnimationActive={false}
                activeBar={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} className="bar-hover" fill="#FF7900" />
                ))}
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
    </div>
  );
}

export default Populatie;


