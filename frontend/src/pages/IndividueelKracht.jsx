// =====================================================
// FILE: src/pages/IndividueelKracht.jsx
// Revo Sport — Individuele krachtanalyse per blessure
// =====================================================

import React from "react";
import Kracht from "./Kracht";

export default function IndividueelKracht({ data }) {
  // ✅ Veilig: werkt zowel voor groep (array) als individueel (object)
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
      <Kracht data={safeData} />
    </div>
  );
}

export { IndividueelKracht };
