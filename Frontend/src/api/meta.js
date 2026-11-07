import { apiFetch } from "./client.js";

export function getServiceTypes() {
  return apiFetch("/service-types").then((r) => r.data);
}

export function getHealth() {
  return apiFetch("/health").then((r) => r.data);
}
