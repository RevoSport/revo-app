// =====================================================
// FILE: src/api/index.js
// Centrale API layer voor fetch, GET, POST, multipart
// =====================================================

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// -----------------------------------------------------
// Helper
// -----------------------------------------------------
async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API-fout");
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }

  return res;
}

// -----------------------------------------------------
// GET
// -----------------------------------------------------
export async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
  });
  return handleResponse(res);
}

// -----------------------------------------------------
// POST (JSON)
// -----------------------------------------------------
export async function apiPost(endpoint, body = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleResponse(res);
}

// -----------------------------------------------------
// FETCH – flexibele variant (multipart, PUT, DELETE)
// -----------------------------------------------------
export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
  });
  return handleResponse(res);
}

// -----------------------------------------------------
// Default export (compatibiliteit)
// -----------------------------------------------------
const api = { apiGet, apiPost, apiFetch };
export default api;
