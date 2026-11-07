import { apiFetch } from "./client.js";

// Returns the full envelope { data, meta } — the table needs pagination meta.
export function listIncomes(params) {
  return apiFetch("/incomes", { params });
}

export function getIncome(id) {
  return apiFetch(`/incomes/${id}`).then((r) => r.data);
}

export function createIncome(body) {
  return apiFetch("/incomes", { method: "POST", body }).then((r) => r.data);
}

export function updateIncome(id, body) {
  return apiFetch(`/incomes/${id}`, { method: "PUT", body }).then((r) => r.data);
}

export function deleteIncome(id) {
  return apiFetch(`/incomes/${id}`, { method: "DELETE" }).then((r) => r.data);
}

export function getAnalytics(params) {
  return apiFetch("/incomes/analytics", { params }).then((r) => r.data);
}
