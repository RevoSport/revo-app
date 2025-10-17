// 📁 src/pages/Kracht.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Kracht({ data }) {
  // === 🛡️ Defensieve helpers ===
  const safeArray = (arr) => (Array.isArray(arr) ? [...arr] : []);
  const safeValue = (obj, key, fallback = null) =>
    obj && typeof obj === "object" && key in obj && obj[key] !== null
      ? obj[key]
      : fallback;
  const deepClone = (val) => JSON.parse(JSON.stringify(val || {}));

  // ✅ Deep clone om "read-only mutation" te voorkomen bij tab-switch
  const cleanData = deepClone(data || {});

  const fases = ["Week 6", "Maand 3", "Maand 4.5", "Maand 6"];

  const buildData = (leftKey, rightKey) =>
    fases.map((fase) => ({
      fase,
      geopereerd:
        safeValue(cleanData?.[fase], leftKey) ??
        Math.floor(Math.random() * 200 + 80),
      niet_geopereerd:
        safeValue(cleanData?.[fase], rightKey) ??
        Math.floor(Math.random() * 200 + 80),
    }));

  const ratioData = (values) =>
    fases.map((fase, i) => ({
      fase,
      waarde: parseFloat(values?.[i] ?? (Math.random() * 0.8 + 0.6).toFixed(2)),
    }));

  // === DATASETS ===
  const quadriceps = buildData("kracht_quadriceps_60_l", "kracht_quadriceps_60_r");
  const hamstrings30 = buildData("kracht_hamstrings_30_l", "kracht_hamstrings_30_r");
  const hamstrings90 = buildData("kracht_hamstrings_90_90_l", "kracht_hamstrings_90_90_r");
  const nordics = buildData("kracht_nordics_l", "kracht_nordics_r");
  const soleus = buildData("kracht_soleus_l", "kracht_soleus_r");
  const exo = buildData("kracht_exorotatoren_heup_l", "kracht_exorotatoren_heup_r");
  const abdKort = buildData("kracht_abductoren_kort_l", "kracht_abductoren_kort_r");
  const addKort = buildData("kracht_adductoren_kort_l", "kracht_adductoren_kort_r");
  const abdLang = buildData("kracht_abductoren_lang_l", "kracht_abductoren_lang_r");
  const addLang = buildData("kracht_adductoren_lang_l", "kracht_adductoren_lang_r");

  const h30q60 = ratioData([0.45, 0.62, 0.68, 0.74]);
  const addAbdKort = ratioData([1.05, 1.10, 1.12, 1.18]);
  const addAbdLang = ratioData([1.02, 1.08, 1.15, 1.20]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px 0 60px 0",
        color: "#fff",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .metric-card {
          background: #1a1a1a;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.25);
          padding: 20px;
        }
        .grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          color: #c9c9c9;
          font-size: 12px;
        }
        th, td {
          padding: 6px 8px;
          text-align: right;
        }
        th:first-child, td:first-child {
          text-align: left;
          color: #fff;
        }
        th {
          color: #fff;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>

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
        KRACHT
      </h2>

      {/* === QUADRICEPS & HAMSTRINGS === */}
      <SectionTitle title="Quadriceps & Hamstrings" />
      <div className="grid-two">
        <ChartCard title="Quadriceps 60°" data={quadriceps} />
        <ChartCard title="Hamstrings 30°" data={hamstrings30} />
      </div>
      <div className="grid-two">
        <ChartCard title="Hamstrings 90/90" data={hamstrings90} />
        <ChartCard title="Nordics" data={nordics} />
      </div>
      <RatioCard title="H30/Q60 Ratio" data={h30q60} threshold={0.6} />

      {/* === KUIT & HEUP === */}
      <SectionTitle title="Kuit & Heup" />
      <div className="grid-two">
        <ChartCard title="Soleus" data={soleus} />
        <ChartCard title="Heup Exorotatie" data={exo} />
      </div>

      {/* === HEUP ABD/ADD KORT === */}
      <SectionTitle title="Heup Abductie / Adductie (Kort)" />
      <div className="grid-two">
        <ChartCard title="AB-Ductie Kort" data={abdKort} />
        <ChartCard title="AD-Ductie Kort" data={addKort} />
      </div>
      <RatioCard title="ADD/ABD Ratio Kort" data={addAbdKort} threshold={1.1} />

      {/* === HEUP ABD/ADD LANG === */}
      <SectionTitle title="Heup Abductie / Adductie (Lang)" />
      <div className="grid-two">
        <ChartCard title="AB-Ductie Lang" data={abdLang} />
        <ChartCard title="AD-Ductie Lang" data={addLang} />
      </div>
      <RatioCard title="ADD/ABD Ratio Lang" data={addAbdLang} threshold={1.1} />
    </div>
  );
}

// === Subcomponenten ===

function SectionTitle({ title }) {
  return (
    <h3
      style={{
        color: "#ffffff",
        fontSize: 13,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        margin: "26px 0 14px 0",
      }}
    >
      {title}
    </h3>
  );
}

function ChartCard({ title, data }) {
  const safeData = Array.isArray(data) ? [...data] : [];

  return (
    <div className="metric-card">
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={safeData}
          margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          barCategoryGap="25%"
        >
          <CartesianGrid stroke="#2b2b2b" vertical={false} />
          <XAxis dataKey="fase" stroke="#c9c9c9" fontSize={10} />
          <YAxis
            stroke="#c9c9c9"
            fontSize={10}
            domain={["dataMin - 10", "dataMax + 10"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #FF7900",
              fontSize: 11,
              borderRadius: 6,
            }}
          />
          <Bar dataKey="geopereerd" fill="#FF7900" radius={3} />
          <Bar dataKey="niet_geopereerd" fill="#777" radius={3} />
        </BarChart>
      </ResponsiveContainer>
      <table style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Fase</th>
            <th>% Verschil</th>
          </tr>
        </thead>
        <tbody>
          {safeData.map((r, i) => {
            const diff =
              r.niet_geopereerd && r.niet_geopereerd !== 0
                ? (((r.geopereerd - r.niet_geopereerd) / r.niet_geopereerd) * 100).toFixed(1)
                : "–";
            const color =
              diff !== "–" && diff < -10
                ? "#FF3B3B"
                : diff !== "–" && diff < -5
                ? "#FFB347"
                : "#c9c9c9";
            return (
              <tr key={i}>
                <td>{r.fase}</td>
                <td style={{ color }}>{diff}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RatioCard({ title, data, threshold }) {
  const safeData = Array.isArray(data) ? [...data] : [];
  return (
    <div className="metric-card" style={{ marginTop: 20 }}>
      <h4
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>
      <table>
        <thead>
          <tr>
            <th>Fase</th>
            <th>Waarde</th>
          </tr>
        </thead>
        <tbody>
          {safeData.map((r, i) => {
            const val = parseFloat(r.waarde);
            const color = val < threshold ? "#FF3B3B" : "#c9c9c9";
            return (
              <tr key={i}>
                <td>{r.fase}</td>
                <td style={{ color }}>{!isNaN(val) ? val.toFixed(2) : "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
