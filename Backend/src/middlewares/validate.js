import { ApiError } from "../utils/ApiError.js";

// Factory: validate(schemas) where schemas = { body?, query?, params? } (zod).
// Validates each provided part of the request. On success, the parsed/coerced
// values are placed on req.valid.{body,query,params} — controllers read from
// there (Express 5's req.query is read-only, so we don't overwrite it).
// On failure, forwards a 400 ApiError with per-field details.
export function validate(schemas = {}) {
  return (req, res, next) => {
    const valid = {};
    const details = [];

    for (const source of ["body", "query", "params"]) {
      const schema = schemas[source];
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (result.success) {
        valid[source] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({
            source,
            field: issue.path.join(".") || source,
            message: issue.message,
          });
        }
      }
    }

    if (details.length > 0) {
      return next(ApiError.badRequest("Validation failed", details));
    }

    req.valid = valid;
    next();
  };
}

export default validate;
