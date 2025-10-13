export default function Home() {
  return (
    <div
      className="fade-in"
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily:
          "'Open Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1
        style={{
          color: "var(--accent)",
          margin: 0,
          fontWeight: 700,
          fontSize: "clamp(22px, 2.8vw, 30px)",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        FROM TIME-BASED REHABILITATION
      </h1>

      <h1
        style={{
          color: "var(--accent)",
          margin: 0,
          fontWeight: 700,
          fontSize: "clamp(22px, 2.8vw, 30px)",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        TO CRITERIA-BASED REHABILITATION.
      </h1>

      <p
        style={{
          color: "var(--text)",
          opacity: 0.9,
          fontSize: "clamp(16px, 1.8vw, 18px)",
          marginTop: 16,
          fontWeight: 400,
          fontStyle: "italic",
        }}
      >
        “INSIGHT FUELS INNOVATION”
      </p>
    </div>
  );
}
