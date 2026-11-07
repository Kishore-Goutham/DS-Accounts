// Express-5-safe NoSQL-injection guard. The popular express-mongo-sanitize
// package reassigns req.query, which throws on Express 5 (read-only getter),
// so we roll a small in-place sanitizer instead.
//
// Removes any object key that starts with "$" or contains "." from req.body
// and req.params (Mongo operator / dotted-path injection vectors). req.query
// is already whitelisted + coerced by the zod validators, so it's left alone.
function stripKeys(value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(stripKeys);
    return;
  }
  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
    } else {
      stripKeys(value[key]);
    }
  }
}

export function sanitize(req, res, next) {
  stripKeys(req.body);
  stripKeys(req.params);
  next();
}

export default sanitize;
