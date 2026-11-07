// Wraps an async route handler so any thrown error or rejected promise
// is passed to Express's error-handling middleware via next().
// Usage: router.post("/", asyncHandler(controller.create))
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
