// Indian Rupee currency, e.g. ₹1,23,456.50
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(amount) {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n)) return "—";
  return inr.format(n);
}

// Compact INR for axis ticks, e.g. ₹1.2L, ₹3Cr
const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatINRCompact(amount) {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n)) return "—";
  return inrCompact.format(n);
}

// Human-readable date, e.g. 07 Nov 2026
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}
