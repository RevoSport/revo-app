function ChartCard({ title, data, type }) {
  const baseCard = {
    background: "#1a1a1a",
    borderRadius: 12,
    padding: "18px 20px 18px 20px",
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
    .bar-hover {
      transform-origin: bottom;
      animation: barGrow 0.7s ease-out forwards;
      transition: fill 0.25s ease-in-out;
    }
    .bar-hover:hover {
      fill: #ffa64d;
    }
    .slice-hover {
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .slice-hover:hover {
      transform: scale(1.03);
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
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    className="slice-hover"
                    fill={COLORS[i % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(v) => [`Aantal: ${v}`, ""]}
                labelFormatter={() => ""}
              />
            </PieChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 0, right: 10, left: 0, bottom: 50 }}
              barCategoryGap="25%"
              onMouseMove={() => {}} // ⛔️ blokkeert interne hover state
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
                cursor={{ fill: "transparent" }} // ✅ geen grijze hoverbalk
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #FF7900",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(v) => [`Aantal: ${v}`, ""]}
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
