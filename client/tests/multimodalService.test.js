import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_SIZE_BYTES,
  normalizeMultimodalResult,
  validateImageFile,
} from "../src/services/multimodalService";

describe("Nhi multimodal MANA integration", () => {
  it("rejects unsupported file types before requesting the AI endpoint", () => {
    expect(() => validateImageFile({ type: "application/pdf", size: 100 })).toThrow("Only PNG, JPEG, and WebP");
  });

  it("rejects images larger than the client limit", () => {
    expect(() => validateImageFile({ type: "image/png", size: MAX_IMAGE_SIZE_BYTES + 1 })).toThrow("20 MB");
  });

  it("keeps only expected MANA fields and removes unknown labels", () => {
    const draft = normalizeMultimodalResult({
      success: true,
      data: {
        isTask: true,
        title: "Fix mobile navigation",
        description: "Test on mobile browsers",
        priority: "high",
        dueAt: "2026-10-18T17:00:00.000Z",
        labels: ["Frontend", "Unknown label"],
        checklist: ["Test iOS"],
        confidence: 0.9,
        ignoredField: "must not reach MANA",
      },
    }, ["Frontend", "Bug"]);

    expect(draft.labels).toEqual(["Frontend"]);
    expect(draft.droppedLabels).toEqual(["Unknown label"]);
    expect(draft).not.toHaveProperty("ignoredField");
  });

  it("rejects malformed successful AI output", () => {
    expect(() => normalizeMultimodalResult({ success: true, data: { isTask: true } })).toThrow("task title");
  });
});
