// =====================================================
// FILE: src/pages/IndividueelDashboard.jsx
// Revo Sport — Individueel Dashboard per patiënt
// =====================================================

import React from "react";
import Populatie from "./Populatie";

export function IndividueelDashboard({ data }) {
  // hergebruik Populatie-component met dezelfde props
  return (
    <div style={{ width: "100%", animation: "fadeIn 0.6s ease-in-out" }}>
      <Populatie data={[]} summary={data} />
    </div>
  );
}
