// Operational error carrying an HTTP status code and optional field details.
// Thrown anywhere in services/controllers; the central error handler turns it
// into the standard error envelope. `isOperational` distinguishes these
// expected errors from unexpected bugs.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}

export default ApiError;
