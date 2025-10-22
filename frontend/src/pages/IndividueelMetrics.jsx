// =====================================================
// FILE: src/pages/IndividueelMetrics.jsx
// Revo Sport — Individuele metrics per blessure
// =====================================================

import React from "react";
import Metrics from "./Metrics";

export default function IndividueelMetrics({ data }) {
  // ✅ Veilig: ondersteunt zowel array (groepsdata) als object (individuele data)
  const safeData =
    Array.isArray(data) || (data && typeof data === "object")
      ? data
      : [];

  return (
    <div
      style={{
        width: "100%",
        animation: "fadeIn 0.6s ease-in-out",
      }}
    >
      <Metrics data={safeData} />
    </div>
  );
}

export { IndividueelMetrics };
