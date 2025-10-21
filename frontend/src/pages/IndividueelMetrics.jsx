// =====================================================
// FILE: src/pages/IndividueelMetrics.jsx
// Revo Sport — Individuele metrics per blessure
// =====================================================

import React from "react";
import Metrics from "./Metrics";

export function IndividueelMetrics({ data }) {
  return (
    <div style={{ width: "100%", animation: "fadeIn 0.6s ease-in-out" }}>
      <Metrics data={data} />
    </div>
  );
}
