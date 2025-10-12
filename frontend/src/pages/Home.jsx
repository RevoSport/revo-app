export default function Home(){
  return (
    <div
      className="fade-in"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flexDirection: "column",
        padding: 16
      }}
    >
      <h3 style={{ color: "var(--accent)", margin: 0 }}>
        FROM TIME-BASED REHABILITATION TO CRITERIA-BASED REHABILITATION.
      </h3>
      <p style={{ color: "var(--text)", opacity: .9, fontSize: 18, marginTop: 10 }}>
        <i>"INSIGHT FUELS INNOVATION"</i>
      </p>
    </div>
  );
}
