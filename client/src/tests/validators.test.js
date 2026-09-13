import { describe, it, expect } from "vitest";
import { validateTaskForm } from "../utils/validators";

describe("validateTaskForm - Unit Tests", () => {
  it("should fail validation when title is empty or only whitespace", () => {
    const res1 = validateTaskForm({ title: "", deadline: "2026-12-31T23:59" });
    expect(res1.title).toBe("Title is required.");

    const res2 = validateTaskForm({ title: "   ", deadline: "2026-12-31T23:59" });
    expect(res2.title).toBe("Title is required.");
  });

  it("should fail validation when title is shorter than 3 characters", () => {
    const res = validateTaskForm({ title: "ab", deadline: "2026-12-31T23:59" });
    expect(res.title).toBe("Title must be at least 3 characters.");
  });

  it("should fail validation when deadline is missing", () => {
    const res = validateTaskForm({ title: "Valid Title", deadline: "" });
    expect(res.deadline).toBe("Deadline is required.");
  });

  it("should fail validation when deadline is in the past", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const res = validateTaskForm({ title: "Valid Title", deadline: pastDate });
    expect(res.deadline).toBe("Deadline cannot be in the past.");
  });

  it("should fail validation when deadline format is invalid", () => {
    const res = validateTaskForm({ title: "Valid Title", deadline: "invalid-date" });
    expect(res.deadline).toBe("Invalid deadline format.");
  });

  it("should pass validation with zero errors when all fields are valid", () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = validateTaskForm({
      title: "Implement API integration",
      deadline: futureDate,
      priority: "high",
    });
    expect(Object.keys(res).length).toBe(0);
  });
});
