// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message);

  if (err.code === "23505" || err.code === "23514" || err.code === "23503") {
    return res.status(400).json({
      error: "ValidationError",
      message: err.message || "Database constraint violation.",
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