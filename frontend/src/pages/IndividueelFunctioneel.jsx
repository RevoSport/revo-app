// =====================================================
// FILE: src/pages/IndividueelFunctioneel.jsx
// Revo Sport — Individuele functionele testen per blessure
// =====================================================

import React from "react";
import Functioneel from "./Functioneel";

export function IndividueelFunctioneel({ data }) {
  return (
    <div style={{ width: "100%", animation: "fadeIn 0.6s ease-in-out" }}>
      <Functioneel data={data} />
    </div>
  );
}
