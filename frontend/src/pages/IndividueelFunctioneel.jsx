// =====================================================
// FILE: src/pages/IndividueelFunctioneel.jsx
// Revo Sport — Individuele functionele testen per blessure
// =====================================================

import React from "react";
import Functioneel from "./Functioneel";

export default function IndividueelFunctioneel({ data }) {
  // ✅ Veilig: zowel array (groep) als object (individueel)
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
      <Functioneel data={safeData} />
    </div>
  );
}

export { IndividueelFunctioneel };
