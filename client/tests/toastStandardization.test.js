// tests/toastStandardization.test.js
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Standardized Server/API Failure Handling & Shared Toast", () => {
  it("verifies ToastContext and ToastProvider exist and provide centralized notifications", async () => {
    const toastContextModule = await import("../src/context/ToastContext.js");
    expect(toastContextModule.ToastContext).toBeDefined();
    expect(toastContextModule.ToastProvider).toBeDefined();
    expect(toastContextModule.useToast).toBeDefined();
  });

  it("verifies Toast notification styling positions it at the top-right corner", () => {
    const toastCssPath = path.resolve(__dirname, "../src/styles/Toast.css");
    const content = fs.readFileSync(toastCssPath, "utf-8");

    expect(content).toMatch(/position:\s*fixed/);
    expect(content).toMatch(/top:\s*24px/);
    expect(content).toMatch(/right:\s*24px/);
  });

  it("ensures TaskList.jsx does NOT render ErrorState inside the data/content area", () => {
    const taskListPath = path.resolve(__dirname, "../src/pages/TaskList.jsx");
    const content = fs.readFileSync(taskListPath, "utf-8");

    expect(content).not.toMatch(/<ErrorState/);
    expect(content).not.toMatch(/from\s+["'].*ErrorState["']/);
  });

  it("ensures TaskDetail.jsx does NOT render in-content error messages", () => {
    const taskDetailPath = path.resolve(__dirname, "../src/pages/TaskDetail.jsx");
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    expect(content).not.toMatch(/task-error-msg/);
    expect(content).not.toMatch(/task-error-title/);
    expect(content).not.toMatch(/task-error-text/);
  });

  it("ensures Dashboard.jsx does NOT render server error messages in the projects table", () => {
    const dashboardPath = path.resolve(__dirname, "../src/pages/Dashboard.jsx");
    const content = fs.readFileSync(dashboardPath, "utf-8");

    expect(content).not.toMatch(/Error:\s*\$\{error\}/);
    expect(content).not.toMatch(/error\s*\?\s*`Error:/);
  });

  it("ensures LabelsPopup.jsx does NOT render in-content error messages", () => {
    const labelsPopupPath = path.resolve(__dirname, "../src/components/LabelsPopup.jsx");
    const content = fs.readFileSync(labelsPopupPath, "utf-8");

    expect(content).not.toMatch(/labels-popup-error/);
    expect(content).toMatch(/useToast/);
  });

  it("ensures EditLabelModal.jsx does NOT render in-content error messages", () => {
    const editLabelPath = path.resolve(__dirname, "../src/components/EditLabelModal.jsx");
    const content = fs.readFileSync(editLabelPath, "utf-8");

    expect(content).not.toMatch(/edit-label-error/);
    expect(content).toMatch(/useToast/);
  });

  it("ensures all major hooks adopt the shared useToast mechanism", () => {
    const hooks = [
      "useDashboard.js",
      "useTaskList.js",
      "useTaskDetail.js",
      "useCreateTask.js",
      "useCreateProject.js",
      "useSettings.js",
    ];

    for (const hookFile of hooks) {
      const hookPath = path.resolve(__dirname, `../src/hooks/${hookFile}`);
      const content = fs.readFileSync(hookPath, "utf-8");
      expect(content).toMatch(/useToast/);
    }
  });
});
