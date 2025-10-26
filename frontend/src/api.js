// =====================================================
// FILE: src/api.js
// Centrale helper voor alle API-calls (met JWT-token)
// =====================================================

const isLocal = window.location.hostname === "localhost";
const API_BASE = isLocal
  ? "http://localhost:8000"
  : "https://revo-backend-5dji.onrender.com";


// 🔸 Algemene fetch wrapper
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
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

export const apiPost = (path, data) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(data) });

export const apiPut = (path, data) =>
  apiFetch(path, { method: "PUT", body: JSON.stringify(data) });

export const apiDelete = (path) =>
  apiFetch(path, { method: "DELETE" });
