// 📁 src/pages/Kracht.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { apiGet } from "../api";

export default function Kracht() {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiGet("/kracht/group").then((res) => setData(res.fases || []));
  }, []);

  if (!data.length) return <div style={{ color: "#fff" }}>Loading...</div>;

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "20px 0 60px", color: "#fff" }}>
      {data.map((fase, i) => (
        <div key={i} style={{ marginBottom: "60px" }}>
          <h2 style={{ color: "#FF7900", marginBottom: "10px" }}>{fase.fase}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fase.spiergroepen}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="spiergroep" tick={{ fill: "#ccc" }} />
              <YAxis tick={{ fill: "#ccc" }} domain={["dataMin", "dataMax"]} />
              <Tooltip />
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="geopereerd_mean" name="Geopereerd" fill="#FF7900" />
              <Bar dataKey="gezond_mean" name="Gezond" fill="#666666" />
            </BarChart>
          </ResponsiveContainer>

          {/* Ratio charts */}
          {fase.ratios && fase.ratios.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h3 style={{ color: "#FF7900" }}>Ratio’s</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={fase.ratios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="ratio" tick={{ fill: "#ccc" }} />
                  <YAxis domain={[0, "dataMax"]} tick={{ fill: "#ccc" }} />
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" />
                  <Bar
                    dataKey="geopereerd_mean"
                    name="Geopereerd"
                    fill="#FF7900"
                    // ADD/ABD < 1.1 rood
                    fillOpacity={({ payload }) =>
                      payload.ratio === "ADD/ABD" && payload.geopereerd_mean < 1.1 ? 0.5 : 1
                    }
                  />
                  <Bar
                    dataKey="gezond_mean"
                    name="Gezond"
                    fill="#666666"
                    fillOpacity={({ payload }) =>
                      payload.ratio === "ADD/ABD" && payload.gezond_mean < 1.1 ? 0.5 : 1
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
