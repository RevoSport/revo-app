// =====================================================
// FILE: src/api.js
// Centrale helper voor alle API-calls (met JWT-token)
// =====================================================

// 🔹 Automatische omgeving-detectie (werkt offline + online)
const host = window.location.hostname;
const isLocal =
  host === "localhost" ||
  host === "127.0.0.1" ||
  host.startsWith("192.168.");

const API_BASE = isLocal
  ? "http://localhost:8000"          // lokale backend
  : "https://revo-backend-5dji.onrender.com"; // Render backend

console.log("🌐 API actief:", API_BASE);

// =====================================================
// 🔸 Algemene fetch wrapper
// =====================================================
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  // ✅ Detecteer of de body FormData is (voor foto-upload)
  const isFormData = options.body instanceof FormData;

  // ✅ Enkel Content-Type zetten bij JSON, niet bij FormData
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // ⛔ Automatisch uitloggen bij verlopen token
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
    throw new Error("Sessie verlopen, log opnieuw in.");
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`API-fout ${res.status}: ${msg}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

// =====================================================
// 🔹 Convenience-helpers voor GET / POST / PUT / DELETE
// =====================================================
export const apiGet = (path) => apiFetch(path);

export const apiPost = (path, data) => {
  // ✅ Automatisch FormData detecteren
  const isFormData = data instanceof FormData;
  return apiFetch(path, {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
  });
};

export const apiPut = (path, data) => {
  const isFormData = data instanceof FormData;
  return apiFetch(path, {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
  });
};

export const apiDelete = (path) =>
  apiFetch(path, { method: "DELETE" });
