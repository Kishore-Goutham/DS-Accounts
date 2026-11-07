// Serialize/parse the SHARED filters (period + serviceType) to/from the URL
// query string. Each page uses its own `prefix` (e.g. "d" for Dashboard,
// "r" for Records) so their filters are independent, yet both persist across
// navigation/refresh and stay shareable. Records' search/sort/pagination stay
// local — they're table-view concerns.

const KEYS = ["serviceType", "mode", "year", "month", "date", "from", "to"];

const keyFor = (prefix, k) => (prefix ? `${prefix}_${k}` : k);

export function searchParamsToFilters(sp, prefix = "") {
  const num = (k) => {
    const v = sp.get(keyFor(prefix, k));
    return v != null && v !== "" ? Number(v) : undefined;
  };
  const str = (k) => sp.get(keyFor(prefix, k)) || undefined;

  return {
    serviceType: sp.get(keyFor(prefix, "serviceType")) || null,
    period: {
      mode: sp.get(keyFor(prefix, "mode")) || "all",
      year: num("year"),
      month: num("month"),
      date: str("date"),
      from: str("from"),
      to: str("to"),
    },
  };
}

// Returns a NEW URLSearchParams: the current params with this prefix's filter
// keys replaced (other pages' params are preserved).
export function applyFiltersToSearchParams(sp, filters, prefix = "") {
  const next = new URLSearchParams(sp);
  for (const k of KEYS) next.delete(keyFor(prefix, k));

  if (filters?.serviceType) next.set(keyFor(prefix, "serviceType"), filters.serviceType);

  const period = filters?.period || { mode: "all" };
  if (period.mode && period.mode !== "all") {
    next.set(keyFor(prefix, "mode"), period.mode);
    if (period.year) next.set(keyFor(prefix, "year"), String(period.year));
    if (period.month) next.set(keyFor(prefix, "month"), String(period.month));
    if (period.date) next.set(keyFor(prefix, "date"), period.date);
    if (period.from) next.set(keyFor(prefix, "from"), period.from);
    if (period.to) next.set(keyFor(prefix, "to"), period.to);
  }
  return next;
}
