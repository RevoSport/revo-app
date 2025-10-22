// =====================================================
// FILE: src/pages/IndividueelDashboard.jsx
// Revo Sport — Individueel Dashboard per patiënt
// =====================================================

import React from "react";
import Populatie from "./Populatie";

export default function IndividueelDashboard({ data }) {
  // ✅ Veilig voor zowel array (groep) als object (individueel)
  const safeData =
    Array.isArray(data) || (data && typeof data === "object")
      ? data
      : {};

  return (
    <div
      style={{
        width: "100%",
        animation: "fadeIn 0.6s ease-in-out",
      }}
    >
      <Populatie
        data={safeData.data || []}       // eventuele lijst van patiënten
        summary={safeData.summary || safeData} // samenvatting of individueel detail
      />
    </div>
  );
}

export { IndividueelDashboard };
