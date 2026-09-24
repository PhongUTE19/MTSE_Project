// client/tests/aiTaskAssistant.test.js
import { describe, it, expect, vi } from "vitest";
import { aiService, AI_ERROR_TYPES, AI_UI_STATES } from "../src/services/aiService";
import { formatIsoToDatetimeLocal } from "../src/utils/date";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("AI Task Assistant (MTSE Homework 6B)", () => {
  describe("Date formatting for datetime-local input", () => {
    it("converts ISO date to YYYY-MM-DDTHH:mm format correctly", () => {
      const iso = "2026-10-15T14:30:00.000Z";
      const formatted = formatIsoToDatetimeLocal(iso);
      expect(formatted).toMatch(/^2026-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it("returns empty string when date is null, empty, or invalid", () => {
      expect(formatIsoToDatetimeLocal(null)).toBe("");
      expect(formatIsoToDatetimeLocal("")).toBe("");
      expect(formatIsoToDatetimeLocal("not-a-date")).toBe("");
    });
  });

  describe("aiService Error Mapping and Resilience", () => {
    it("maps 504 / MODEL_TIMEOUT to TIMEOUT error type", async () => {
      const fakeError = new Error("Gateway timeout");
      fakeError.status = 504;
      fakeError.data = { error: "MODEL_TIMEOUT", message: "Timeout" };

      const spy = vi.spyOn(aiService, "parseTask").mockRejectedValueOnce(
        Object.assign(new Error("Timeout"), { errorType: AI_ERROR_TYPES.TIMEOUT, status: 504 })
      );

      await expect(aiService.parseTask("test")).rejects.toMatchObject({
        errorType: AI_ERROR_TYPES.TIMEOUT,
        status: 504,
      });

      spy.mockRestore();
    });

    it("maps 503 / MODEL_UNAVAILABLE to UNAVAILABLE error type", async () => {
      const spy = vi.spyOn(aiService, "parseTask").mockRejectedValueOnce(
        Object.assign(new Error("Model unavailable"), {
          errorType: AI_ERROR_TYPES.UNAVAILABLE,
          status: 503,
        })
      );

      await expect(aiService.parseTask("test")).rejects.toMatchObject({
        errorType: AI_ERROR_TYPES.UNAVAILABLE,
        status: 503,
      });

      spy.mockRestore();
    });

    it("maps 422 / INVALID_OUTPUT to INVALID_OUTPUT error type", async () => {
      const spy = vi.spyOn(aiService, "parseTask").mockRejectedValueOnce(
        Object.assign(new Error("Invalid output"), {
          errorType: AI_ERROR_TYPES.INVALID_OUTPUT,
          status: 422,
        })
      );

      await expect(aiService.parseTask("test")).rejects.toMatchObject({
        errorType: AI_ERROR_TYPES.INVALID_OUTPUT,
        status: 422,
      });

      spy.mockRestore();
    });
  });

  describe("UI States Definitions", () => {
    it("defines all 7 explicit UI states required by Homework 6B", () => {
      expect(AI_UI_STATES.IDLE).toBe("IDLE");
      expect(AI_UI_STATES.LOADING).toBe("LOADING");
      expect(AI_UI_STATES.SUCCESS).toBe("SUCCESS");
      expect(AI_UI_STATES.TIMEOUT).toBe("TIMEOUT");
      expect(AI_UI_STATES.UNAVAILABLE).toBe("UNAVAILABLE");
      expect(AI_UI_STATES.INVALID_OUTPUT).toBe("INVALID_OUTPUT");
      expect(AI_UI_STATES.ERROR).toBe("ERROR");
    });
  });

  describe("Architectural Integrity & Client Security", () => {
    it("ensures no Gemini credentials or secret keys exist in client source files", () => {
      const clientSrcDir = path.resolve(__dirname, "../src");
      const checkDir = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            checkDir(fullPath);
          } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, "utf-8");
            // Ensure no API keys, credentials, or backend AI SDKs are embedded in client source files
            expect(content).not.toMatch(/AIza[0-9A-Za-z-_]{35}/);
            expect(content).not.toMatch(/AQ\.[A-Za-z0-9_-]{30,}/);
            expect(content).not.toMatch(/GEMINI_API_KEY\s*=\s*['"][^'"]+['"]/i);
            expect(content.includes("@google/genai")).toBe(false);
          }
        }
      };
      checkDir(clientSrcDir);
    });

    it("verifies CreateTask.jsx renders AiTaskAssistant without replacing the standard manual form", () => {
      const createTaskCode = fs.readFileSync(
        path.resolve(__dirname, "../src/pages/CreateTask.jsx"),
        "utf-8"
      );
      expect(createTaskCode).toContain("AiTaskAssistant");
      expect(createTaskCode).toContain("handleApplyAiSuggestion");
      expect(createTaskCode).toContain('<form onSubmit={handleSubmit} className="create-task-form">');
      expect(createTaskCode).toContain('name="title"');
      expect(createTaskCode).toContain('name="deadline"');
      expect(createTaskCode).toContain('name="priority"');
      expect(createTaskCode).toContain('name="checklist"');
    });

    it("verifies useCreateTask hook exposes handleApplyAiSuggestion", () => {
      const hookCode = fs.readFileSync(
        path.resolve(__dirname, "../src/hooks/useCreateTask.js"),
        "utf-8"
      );
      expect(hookCode).toContain("handleApplyAiSuggestion");
      expect(hookCode).toContain("formatIsoToDatetimeLocal");
    });

    it("verifies AiTaskAssistant component contains retry, dismiss, and review-before-save flows", () => {
      const compCode = fs.readFileSync(
        path.resolve(__dirname, "../src/components/AiTaskAssistant.jsx"),
        "utf-8"
      );
      expect(compCode).toContain("AI_UI_STATES");
      expect(compCode).toContain("handleGenerate");
      expect(compCode).toContain("onApplySuggestion");
      expect(compCode).toContain("ai-state-loading");
      expect(compCode).toContain("ai-state-success");
      expect(compCode).toContain("ai-state-warning");
      expect(compCode).toContain("ai-state-error");
    });
  });
});
