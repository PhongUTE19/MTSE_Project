import { apiClient } from "./apiClient.js";

export const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

// Keep this in sync with the multer limit in the multimodal backend route.
export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

export class MultimodalClientError extends Error {
  constructor(message, { code = "MULTIMODAL_REQUEST_FAILED", status, details } = {}) {
    super(message);
    this.name = "MultimodalClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function validateImageFile(file) {
  if (!file) {
    throw new MultimodalClientError("Please select an image first.", { code: "INVALID_INPUT", status: 400 });
  }

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new MultimodalClientError("Only PNG, JPEG, and WebP images are supported.", {
      code: "UNSUPPORTED_FILE_TYPE",
      status: 400,
    });
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new MultimodalClientError("The image must be 20 MB or smaller.", {
      code: "FILE_TOO_LARGE",
      status: 413,
    });
  }
}

function asText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => asText(item)).filter(Boolean).slice(0, 20)
    : [];
}

function asIsoDate(value) {
  if (typeof value !== "string" || !value.trim() || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

/**
 * Client-side defense in depth for data returned by the model service.
 * This deliberately accepts only MANA task fields and drops unexpected values.
 */
export function normalizeMultimodalResult(payload, availableLabels = []) {
  if (!payload || payload.success !== true || !payload.data || typeof payload.data !== "object") {
    throw new MultimodalClientError("The AI service returned an invalid response.", {
      code: "INVALID_OUTPUT",
      status: 422,
    });
  }

  const raw = payload.data;
  const isTask = raw.isTask === true;
  const title = asText(raw.title);

  if (isTask && !title) {
    throw new MultimodalClientError("The AI response did not include a task title.", {
      code: "INVALID_OUTPUT",
      status: 422,
    });
  }

  const allowedLabels = new Set(
    (Array.isArray(availableLabels) ? availableLabels : [])
      .map((label) => (typeof label === "string" ? label : label?.name))
      .filter(Boolean)
  );
  const rawLabels = asStringArray(raw.labels);

  return {
    isTask,
    title,
    description: asText(raw.description),
    priority: ["low", "medium", "high"].includes(raw.priority) ? raw.priority : null,
    dueAt: asIsoDate(raw.dueAt),
    labels: allowedLabels.size > 0 ? rawLabels.filter((label) => allowedLabels.has(label)) : rawLabels,
    checklist: asStringArray(raw.checklist),
    confidence: typeof raw.confidence === "number" && raw.confidence >= 0 && raw.confidence <= 1
      ? raw.confidence
      : null,
    rejectionReason: asText(raw.rejectionReason) || null,
    droppedLabels: allowedLabels.size > 0 ? rawLabels.filter((label) => !allowedLabels.has(label)) : [],
    meta: payload.meta && typeof payload.meta === "object" ? {
      model: asText(payload.meta.model) || null,
      promptVersion: asText(payload.meta.promptVersion) || null,
      latencyMs: Number.isFinite(payload.meta.latencyMs) ? payload.meta.latencyMs : null,
    } : null,
  };
}

export async function parseTaskFromImage(file, context = {}, fetchImpl = fetch) {
  validateImageFile(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", JSON.stringify({
    projectId: context.projectId || undefined,
    nowIso: context.nowIso || new Date().toISOString(),
    availableLabels: Array.isArray(context.availableLabels) ? context.availableLabels : [],
  }));

  let response;
  try {
    response = await fetchImpl(`${apiClient.baseUrl}/ai/multimodal-parse`, {
      method: "POST",
      body: formData,
    });
  } catch (cause) {
    throw new MultimodalClientError("Unable to reach the AI service. You can continue creating the task manually.", {
      code: "NETWORK_ERROR",
      details: { cause: cause?.message },
    });
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // The status-based message below is safer than rendering an arbitrary response body.
  }

  if (!response.ok) {
    throw new MultimodalClientError(
      body?.message || "The image could not be processed. You can continue creating the task manually.",
      { code: body?.error || "MULTIMODAL_REQUEST_FAILED", status: response.status }
    );
  }

  return normalizeMultimodalResult(body, context.availableLabels);
}

/** Records non-sensitive client evidence for the demo without retaining the image or its contents. */
export function recordMultimodalAudit(event, details = {}) {
  const safeDetails = {
    event,
    at: new Date().toISOString(),
    code: details.code || null,
    status: details.status || null,
    fileType: details.fileType || null,
    fileSize: Number.isFinite(details.fileSize) ? details.fileSize : null,
    model: details.model || null,
    latencyMs: Number.isFinite(details.latencyMs) ? details.latencyMs : null,
  };
  console.info("[multimodal-audit]", safeDetails);
}
