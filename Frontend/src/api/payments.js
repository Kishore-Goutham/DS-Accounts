import { apiFetch } from "./client.js";

// Returns the full envelope { data, meta } — the table needs pagination meta.
export function listPayments(params) {
  return apiFetch("/payments", { params });
}

export function getPayment(id) {
  return apiFetch(`/payments/${id}`).then((r) => r.data);
}

export function createPayment(body) {
  return apiFetch("/payments", { method: "POST", body }).then((r) => r.data);
}

export function updatePayment(id, body) {
  return apiFetch(`/payments/${id}`, { method: "PUT", body }).then((r) => r.data);
}

export function deletePayment(id) {
  return apiFetch(`/payments/${id}`, { method: "DELETE" }).then((r) => r.data);
}

// Distinct sources used so far — powers the form's source autocomplete.
export function getPaymentSources() {
  return apiFetch("/payments/sources").then((r) => r.data);
}

export function getPaymentAnalytics(params) {
  return apiFetch("/payments/analytics", { params }).then((r) => r.data);
}
