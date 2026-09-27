import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG, isAiConfigured } from "../config/ai.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "../middlewares/upload.js";
import {
  MULTIMODAL_PROMPT_VERSION,
  MULTIMODAL_RESPONSE_SCHEMA,
  MULTIMODAL_SYSTEM_INSTRUCTION,
  buildMultimodalPrompt,
} from "../prompts/multimodal-task-extract.v1.js";
import { AiServiceError, mapAiModelError } from "./aiService.js";
import { aiTaskResponseSchema } from "../validators/aiValidator.js";

let aiClientInstance = null;

function getAiClient() {
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey: AI_CONFIG.apiKey });
  }
  return aiClientInstance;
}

/** Test seam for deterministic service tests; production uses the lazy Gemini client. */
export function setMultimodalAiClientForTesting(client) {
  aiClientInstance = client;
}

function validateImage(fileBuffer, fileMeta) {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new AiServiceError(
      "A non-empty image buffer is required.",
      { code: "INVALID_INPUT", status: 400 }
    );
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(fileMeta?.mimetype)) {
    throw new AiServiceError(
      "Unsupported file type. Upload a PNG, JPEG, JPG, or WebP image.",
      { code: "UNSUPPORTED_FILE_TYPE", status: 400 }
    );
  }

  if (fileBuffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new AiServiceError(
      "Image file size must not exceed 10 MB.",
      { code: "FILE_TOO_LARGE", status: 413 }
    );
  }
}

function normalizeTaskOutput(rawJson) {
  if (!rawJson || typeof rawJson !== "object" || Array.isArray(rawJson)) {
    return rawJson;
  }

  if (typeof rawJson.dueAt === "string") {
    const normalizedDueAt = rawJson.dueAt.trim().toLowerCase();
    if (["", "null", "none", "unspecified", "n/a"].includes(normalizedDueAt)) {
      rawJson.dueAt = null;
    }
  }

  if (! ["low", "medium", "high"].includes(rawJson.priority)) {
    rawJson.priority = null;
  }

  return rawJson;
}

/**
 * Extracts one structured task from a validated image without persisting data.
 */
export async function parseTaskFromImage(fileBuffer, fileMeta, context = {}) {
  validateImage(fileBuffer, fileMeta);

  if (!isAiConfigured()) {
    throw new AiServiceError(
      "AI Task Assistant is not configured. GEMINI_API_KEY is missing on the server.",
      { code: "AI_NOT_CONFIGURED", status: 503 }
    );
  }

  const ai = getAiClient();
  const startTime = Date.now();
  let timeoutId;
  let response;

  try {
    response = await Promise.race([
      ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: [{
          role: "user",
          parts: [
            { text: buildMultimodalPrompt(context) },
            {
              inlineData: {
                mimeType: fileMeta.mimetype,
                data: fileBuffer.toString("base64"),
              },
            },
          ],
        }],
        config: {
          systemInstruction: MULTIMODAL_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: MULTIMODAL_RESPONSE_SCHEMA,
        },
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("MODEL_TIMEOUT")),
          AI_CONFIG.requestTimeoutMs
        );
      }),
    ]);
  } catch (error) {
    throw mapAiModelError(error);
  } finally {
    clearTimeout(timeoutId);
  }

  const latencyMs = Date.now() - startTime;
  const rawText = response?.text?.trim() || "";
  if (!rawText) {
    throw new AiServiceError(
      "AI model returned an empty response.",
      { code: "INVALID_OUTPUT", status: 422 }
    );
  }

  let rawJson;
  try {
    rawJson = JSON.parse(rawText);
  } catch {
    throw new AiServiceError(
      "AI model returned malformed non-JSON data.",
      { code: "INVALID_OUTPUT", status: 422 }
    );
  }

  const validationResult = aiTaskResponseSchema.safeParse(normalizeTaskOutput(rawJson));
  if (!validationResult.success) {
    throw new AiServiceError(
      "AI output failed schema validation.",
      { code: "INVALID_OUTPUT", status: 422 }
    );
  }

  return {
    task: validationResult.data,
    model: AI_CONFIG.model,
    promptVersion: MULTIMODAL_PROMPT_VERSION,
    latencyMs,
  };
}

export function getMultimodalHealth() {
  return {
    configured: isAiConfigured(),
    model: AI_CONFIG.model,
    promptVersion: MULTIMODAL_PROMPT_VERSION,
    timeoutMs: AI_CONFIG.requestTimeoutMs,
    supportedMimeTypes: [...ALLOWED_IMAGE_MIME_TYPES],
    maxFileSizeBytes: MAX_IMAGE_SIZE_BYTES,
  };
}

export const multimodalService = {
  parseTaskFromImage,
  getMultimodalHealth,
};
