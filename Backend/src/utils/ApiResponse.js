// Emits the standard success envelope: { success: true, data, meta? }.
// `meta` is included only when provided (e.g. pagination on list endpoints).
export function sendSuccess(res, data = null, { statusCode = 200, meta } = {}) {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

export default sendSuccess;
