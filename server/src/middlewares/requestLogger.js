import { randomUUID } from "node:crypto";
import morgan from "morgan";

const accessLog = morgan((tokens, req, res) => JSON.stringify({
  timestamp: new Date().toISOString(),
  level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
  event: "http_request",
  requestId: req.requestId,
  method: req.method,
  // Exclude query strings, headers and bodies, which may contain secrets.
  path: req.path,
  status: Number(tokens.status(req, res)) || null,
  durationMs: Number(tokens["response-time"](req, res)) || 0,
}), { stream: { write: (line) => console.info(line.trim()) } });

export function requestLogger(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  accessLog(req, res, next);
}
