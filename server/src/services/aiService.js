// src/services/aiService.js
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG, isAiConfigured } from "../config/ai.js";
import {
  TASK_ASSISTANT_PROMPT_VERSION,
  TASK_ASSISTANT_SYSTEM_INSTRUCTION,
  TASK_ASSISTANT_RESPONSE_SCHEMA,
  buildTaskAssistantPrompt,
} from "../prompts/task-assistant.v1.js";
import { aiTaskResponseSchema } from "../validators/aiValidator.js";

/**
 * Custom error class for AI service failures with HTTP status and structured code.
 */
export class AiServiceError extends Error {
  constructor(message, { code = "AI_ERROR", status = 500, details = null } = {}) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Maps raw model errors into standard AiServiceError instances.
 */
function mapModelError(error) {
  if (error instanceof AiServiceError) return error;

  const msg = String(error?.message || "");
  const normalized = msg.toLowerCase();

  if (msg === "MODEL_TIMEOUT") {
    return new AiServiceError(
      "The AI model took too long to respond. Please try again or create the task manually.",
      { code: "MODEL_TIMEOUT", status: 504 }
    );
  }

  if (
    normalized.includes("api key") ||
    normalized.includes("unauthenticated") ||
    normalized.includes("permission_denied")
  ) {
    return new AiServiceError(
      "Gemini API key is invalid or rejected.",
      { code: "AI_AUTH_ERROR", status: 503 }
    );
  }

  if (
    normalized.includes("quota") ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("429")
  ) {
    return new AiServiceError(
      "Gemini API quota or rate limit exceeded. Please try again later.",
      { code: "QUOTA_EXCEEDED", status: 429 }
    );
  }

  if (
    normalized.includes("not found") ||
    normalized.includes("not supported") ||
    normalized.includes("model")
  ) {
    return new AiServiceError(
      `The configured Gemini model (${AI_CONFIG.model}) is unavailable.`,
      { code: "MODEL_UNAVAILABLE", status: 503 }
    );
  }

  if (
    normalized.includes("network") ||
    normalized.includes("fetch failed") ||
    normalized.includes("enotfound") ||
    normalized.includes("econnreset")
  ) {
    return new AiServiceError(
      "Cannot connect to the AI model service. Check your internet connection.",
      { code: "MODEL_UNAVAILABLE", status: 503 }
    );
  }

  return new AiServiceError(
    error?.message || "An unexpected error occurred during AI processing.",
    { code: "AI_GENERAL_ERROR", status: 502 }
  );
}

let aiClientInstance = null;

function getAiClient() {
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({
      apiKey: AI_CONFIG.apiKey,
    });
  }
  return aiClientInstance;
}

/**
 * Parses a natural language task description into a structured task object.
 *
 * @param {string} prompt - Raw natural language text from user
 * @param {Object} [context={}] - Context info (e.g. nowIso, availableLabels)
 * @returns {Promise<{ task: Object, model: string, promptVersion: string, latencyMs: number }>}
 */
export async function parseTaskPrompt(prompt, context = {}) {
  if (!isAiConfigured()) {
    throw new AiServiceError(
      "AI Task Assistant is not configured. GEMINI_API_KEY is missing on the server.",
      { code: "AI_NOT_CONFIGURED", status: 503 }
    );
  }

  const userContent = buildTaskAssistantPrompt(prompt, context);
  const ai = getAiClient();
  const startTime = Date.now();
  let timeoutId;

  let response;
  try {
    response = await Promise.race([
      ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: userContent,
        config: {
          systemInstruction: TASK_ASSISTANT_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: TASK_ASSISTANT_RESPONSE_SCHEMA,
        },
      }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("MODEL_TIMEOUT")),
          AI_CONFIG.requestTimeoutMs
        );
      }),
    ]);
  } catch (rawError) {
    throw mapModelError(rawError);
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

  // 1. Parse JSON
  let rawJson;
  try {
    rawJson = JSON.parse(rawText);
  } catch (err) {
    throw new AiServiceError(
      "AI model returned malformed non-JSON data.",
      { code: "INVALID_OUTPUT", status: 422, details: { raw: rawText, error: err.message } }
    );
  }

  // Normalize priority & dueAt if empty strings, "null", or non-enums returned
  if (rawJson && typeof rawJson === "object") {
    if (typeof rawJson.dueAt === "string") {
      const lower = rawJson.dueAt.trim().toLowerCase();
      if (
        !lower ||
        lower === "null" ||
        lower === "none" ||
        lower === "unspecified" ||
        lower === "n/a"
      ) {
        rawJson.dueAt = null;
      }
    }
    if (!["low", "medium", "high"].includes(rawJson.priority)) {
      rawJson.priority = null;
    }
  }

  // 2. Validate against schema
  const validationResult = aiTaskResponseSchema.safeParse(rawJson);
  if (!validationResult.success) {
    throw new AiServiceError(
      "AI output failed schema validation.",
      {
        code: "INVALID_OUTPUT",
        status: 422,
        details: { issues: validationResult.error.issues, raw: rawJson },
      }
    );
  }

  return {
    task: validationResult.data,
    model: AI_CONFIG.model,
    promptVersion: TASK_ASSISTANT_PROMPT_VERSION,
    latencyMs,
  };
}

/**
 * Health/status probe for the AI assistant.
 */
export function getAiHealth() {
  return {
    configured: isAiConfigured(),
    model: AI_CONFIG.model,
    promptVersion: TASK_ASSISTANT_PROMPT_VERSION,
    timeoutMs: AI_CONFIG.requestTimeoutMs,
  };
}

export const aiService = {
  parseTaskPrompt,
  getAiHealth,
};

