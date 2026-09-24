// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    event: "request_error",
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    // Do not log raw database errors: they can contain submitted values.
    code: ["23505", "23514", "23503", "PGRST116"].includes(err.code)
      ? err.code : "UNEXPECTED_ERROR",
  }));

  if (err.code === "23505" || err.code === "23514" || err.code === "23503") {
    return res.status(400).json({
      error: "ValidationError",
      message: err.message || "Database constraint violation.",
    });
  }

  if (err.name === "AiServiceError") {
    return res.status(err.status || 500).json({
      error: err.code || "AI_ERROR",
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.code === "PGRST116") {
    return res.status(404).json({ error: "NotFound", message: "Resource not found." });
  }

  res.status(500).json({
    error: "InternalServerError",
    message: err.message || "Something went wrong.",
  });
}
