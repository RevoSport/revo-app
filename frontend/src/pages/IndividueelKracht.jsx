// =====================================================
// FILE: src/pages/IndividueelKracht.jsx
// Revo Sport — Individuele krachtanalyse per blessure
// =====================================================

import React from "react";
import Kracht from "./Kracht";

export function IndividueelKracht({ data }) {
  return (
    <div style={{ width: "100%", animation: "fadeIn 0.6s ease-in-out" }}>
      <Kracht data={data} />
    </div>
  );
}
