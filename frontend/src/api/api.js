// =====================================================
// FILE: src/api/oefenschema.js
// Centrale API-client voor alles rond oefenschema's & templates
// Eén uniforme laag → geen endpoints meer in de frontend.
// =====================================================

import { apiGet, apiPost, apiFetch } from "./index";

const oefenschemaAPI = {

  // =====================================================
  // PATIENTEN
  // =====================================================
  getPatients() {
    return apiGet("/oefenschema/patients");
  },

  // =====================================================
  // TEMPLATES
  // =====================================================
  listTemplates() {
    return apiGet("/oefenschema/templates");
  },

  getTemplate(id) {
    return apiGet(`/oefenschema/templates/${id}`);
  },

  deleteTemplate(id) {
    return apiFetch(`/oefenschema/templates/${id}`, { method: "DELETE" });
  },

  createTemplate(formData) {
    return apiFetch(`/oefenschema/templates`, {
      method: "POST",
      body: formData,
    });
  },

  updateTemplate(id, formData) {
    return apiFetch(`/oefenschema/templates/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  uploadTemplateImage(templateId, volgorde, slot, file) {
    const fd = new FormData();
    fd.append("foto", file);
    return apiFetch(
      `/oefenschema/uploads/template/${templateId}/${volgorde}/${slot}`,
      { method: "POST", body: fd }
    );
  },

  // =====================================================
  // SCHEMA'S
  // =====================================================
  listSchemas() {
    return apiGet("/oefenschema/schemas");
  },

  getSchema(id) {
    return apiGet(`/oefenschema/schemas/${id}`);
  },

  createSchema(body) {
    return apiPost("/oefenschema/schemas", body);
  },

  updateSchema(id, formData) {
    return apiFetch(`/oefenschema/schemas/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  deleteSchema(id) {
    return apiFetch(`/oefenschema/schemas/${id}`, {
      method: "DELETE",
    });
  },

  // FOTO-UPLOADS
  uploadSchemaImage(schemaId, volgorde, slot, file) {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch(
      `/oefenschema/uploads/schema/${schemaId}/${volgorde}/${slot}`,
      { method: "POST", body: fd }
    );
  },

  // =====================================================
  // PDF
  // =====================================================
  generateTemplatePDF(id) {
    return apiFetch(`/oefenschema/pdf/template/${id}`, { method: "POST" });
  },

  generateSchemaPDF(id) {
    return apiFetch(`/oefenschema/pdf/schema/${id}`, { method: "POST" });
  },

  getSchemaPDF(id) {
    // gebruikt iframe
    return `${process.env.REACT_APP_API_URL}/oefenschema/pdf/schema/${id}`;
  },

  // =====================================================
  // MAIL
  // =====================================================
  mailSchema(id, extra) {
    const fd = new FormData();
    if (extra) fd.append("extra", extra);

    return apiFetch(`/oefenschema/mail/schema/${id}`, {
      method: "POST",
      body: fd,
    });
  },

  mailTemplate(id) {
    return apiFetch(`/oefenschema/mail/template/${id}`, {
      method: "POST",
    });
  },
};

export default oefenschemaAPI;
