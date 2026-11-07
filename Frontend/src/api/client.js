const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Thin fetch wrapper.
// - Serializes `params` into the query string (skips undefined/null/"").
// - Sends/parses JSON.
// - Unwraps the backend envelope { success, data, meta }.
// - Throws ApiError on a non-2xx or { success:false } response.
export async function apiFetch(path, { method = "GET", body, params } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* response had no JSON body */
  }

  if (!res.ok || !json?.success) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    throw new ApiError(message, {
      status: res.status,
      details: json?.error?.details,
    });
  }

  return json; // { success, data, meta? }
}

export default apiFetch;
