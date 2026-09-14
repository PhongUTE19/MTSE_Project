import { describe, it, expect } from "vitest";
import {
  validateTaskForm,
  validateProjectForm,
  validateMemberForm,
} from "../utils/validators";

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

describe("validateProjectForm - Unit Tests", () => {
  it("should fail validation when project name is empty or only whitespace", () => {
    const res1 = validateProjectForm({ name: "" });
    expect(res1.name).toBe("Project name is required.");

    const res2 = validateProjectForm({ name: "   " });
    expect(res2.name).toBe("Project name is required.");

    const res3 = validateProjectForm({});
    expect(res3.name).toBe("Project name is required.");
  });

  it("should fail validation when project name has fewer than 3 characters", () => {
    const res1 = validateProjectForm({ name: "ab" });
    expect(res1.name).toBe("Project name must be at least 3 characters.");

    const res2 = validateProjectForm({ name: " a " });
    expect(res2.name).toBe("Project name must be at least 3 characters.");
  });

  it("should pass validation when project name has 3 or more characters", () => {
    const res = validateProjectForm({
      name: "Capstone Project",
      courseName: "Software Engineering",
      description: "Final semester project",
      deadline: "2026-12-31",
    });
    expect(Object.keys(res).length).toBe(0);
  });
});

describe("validateMemberForm - Unit Tests", () => {
  it("should fail validation when name is missing or too short", () => {
    expect(validateMemberForm({ name: "" }).name).toBe("Member name is required.");
    expect(validateMemberForm({ name: "   " }).name).toBe("Member name is required.");
    expect(validateMemberForm({ name: "a" }).name).toBe("Member name must be at least 2 characters.");
  });

  it("should fail validation when MSSV is missing or invalid format", () => {
    expect(validateMemberForm({ name: "Phong", mssv: "" }).mssv).toBe("MSSV is required.");
    expect(validateMemberForm({ name: "Phong", mssv: "12" }).mssv).toBe("MSSV must be between 3 and 20 alphanumeric characters.");
    expect(validateMemberForm({ name: "Phong", mssv: "invalid@mssv!" }).mssv).toBe("MSSV must be between 3 and 20 alphanumeric characters.");
  });

  it("should fail validation when email is missing or invalid format", () => {
    expect(validateMemberForm({ name: "Phong", mssv: "19110131", email: "" }).email).toBe("Email is required.");
    expect(validateMemberForm({ name: "Phong", mssv: "19110131", email: "not-an-email" }).email).toBe("Invalid email format.");
  });

  it("should pass validation with zero errors when all member fields are valid", () => {
    const res = validateMemberForm({
      name: "Bùi Duy Phong",
      mssv: "19110131",
      email: "phong@example.com",
    });
    expect(Object.keys(res).length).toBe(0);
  });
});
