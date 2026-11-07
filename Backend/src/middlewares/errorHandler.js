import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

const isProd = (process.env.NODE_ENV || "development") === "production";

// Central error handler (must keep all 4 args so Express treats it as one).
// Maps known error types to the standard error envelope:
//   { success: false, error: { message, details? } }
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = 500;
  let message = "Internal server error";
  let details;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.issues.map((i) => ({
      field: i.path.join(".") || "(root)",
      message: i.message,
    }));
  } else if (err?.name === "ValidationError" && err?.errors) {
    // Mongoose schema validation
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err?.name === "CastError") {
    // Mongoose bad cast (e.g. malformed ObjectId)
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (err?.code === 11000) {
    // Mongoose duplicate key
    statusCode = 409;
    message = "Duplicate value";
    details = err.keyValue;
  }

  // Log anything unexpected (5xx) with its stack.
  if (statusCode >= 500) {
    console.error("[error]", err);
  }

  const body = { success: false, error: { message } };
  if (details !== undefined) body.error.details = details;
  if (!isProd && statusCode >= 500) body.error.stack = err?.stack;

  res.status(statusCode).json(body);
}

export default errorHandler;
