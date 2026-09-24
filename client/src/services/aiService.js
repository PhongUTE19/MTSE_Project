// src/services/aiService.js
import { apiClient } from "./apiClient";

const USE_MOCK =
  import.meta.env?.VITE_USE_MOCK_DATA === "true" ||
  import.meta.env?.MODE === "test";

export const AI_ERROR_TYPES = {
  TIMEOUT: "TIMEOUT",
  UNAVAILABLE: "UNAVAILABLE",
  INVALID_OUTPUT: "INVALID_OUTPUT",
  QUOTA: "QUOTA",
  GENERAL: "GENERAL",
};

export const AI_UI_STATES = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  TIMEOUT: "TIMEOUT",
  UNAVAILABLE: "UNAVAILABLE",
  INVALID_OUTPUT: "INVALID_OUTPUT",
  ERROR: "ERROR",
};

/**
 * Service to interact with the backend AI Task Assistant API.
 * Never calls Gemini directly from the client.
 */
export const aiService = {
  /**
   * Parse a natural language prompt into a structured task object.
   * Backend endpoint: POST /api/v1/ai/parse-task
   *
   * @param {string} prompt - Raw natural language description
   * @param {Object} [context={}] - Optional context (nowIso, availableLabels, projectId)
   * @returns {Promise<Object>} Structured task data
   */
  async parseTask(prompt, context = {}) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        isTask: true,
        title: prompt.slice(0, 60),
        description: `Parsed from input: "${prompt}"`,
        priority: "medium",
        dueAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        labels: ["Feature"],
        checklist: ["Review requirements", "Implement changes", "Run tests"],
        confidence: 0.95,
      };
    }

    try {
      const response = await apiClient.post("ai/parse-task", {
        prompt,
        context,
      });

      return response?.data || response;
    } catch (error) {
      const status = error?.status;
      const errorCode = error?.data?.error;
      const message = error?.message || "Failed to process task with AI.";

      let errorType = AI_ERROR_TYPES.GENERAL;
      if (status === 504 || errorCode === "MODEL_TIMEOUT") {
        errorType = AI_ERROR_TYPES.TIMEOUT;
      } else if (
        status === 503 ||
        errorCode === "MODEL_UNAVAILABLE" ||
        errorCode === "AI_NOT_CONFIGURED" ||
        errorCode === "AI_AUTH_ERROR"
      ) {
        errorType = AI_ERROR_TYPES.UNAVAILABLE;
      } else if (status === 422 || errorCode === "INVALID_OUTPUT") {
        errorType = AI_ERROR_TYPES.INVALID_OUTPUT;
      } else if (status === 429 || errorCode === "QUOTA_EXCEEDED") {
        errorType = AI_ERROR_TYPES.QUOTA;
      }

      const enhancedError = new Error(message);
      enhancedError.errorType = errorType;
      enhancedError.status = status;
      enhancedError.code = errorCode;
      throw enhancedError;
    }
  },

  /**
   * Checks backend AI service availability.
   */
  async getHealth() {
    if (USE_MOCK) {
      return { status: "ok", service: "mock-ai", configured: true };
    }
    return apiClient.get("ai/health");
  },
};
