// src/tests/dashboardRefactor.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { projectService } from "../src/services/projectService";
import { mockApi } from "../src/services/mockApi";
import { formatDisplayDate } from "../src/utils/date";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Dashboard Refactoring & Architecture", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("projectService Dashboard Methods", () => {
    it("fetches dashboard statistics", async () => {
      const stats = await projectService.getDashboardStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalProjects).toBe("number");
      expect(typeof stats.totalTasks).toBe("number");
      expect(typeof stats.doneTasks).toBe("number");
      expect(typeof stats.overdueTasks).toBe("number");
      expect(stats.totalProjects).toBeGreaterThanOrEqual(1);
    });

    it("fetches both projects and dashboard stats in a single coordinated getDashboardData call", async () => {
      const data = await projectService.getDashboardData();
      expect(data).toBeDefined();
      expect(Array.isArray(data.projects)).toBe(true);
      expect(data.projects.length).toBeGreaterThan(0);
      expect(data.stats).toBeDefined();
      expect(typeof data.stats.totalProjects).toBe("number");
    });
  });

  describe("formatDisplayDate Utility", () => {
    it("formats valid ISO date strings to localized date representation", () => {
      const formatted = formatDisplayDate("2026-11-20T00:00:00.000Z");
      expect(formatted).not.toBe("-");
      expect(formatted).toContain("2026");
    });

    it("returns default fallback '-' when date is null, undefined, or empty", () => {
      expect(formatDisplayDate(null)).toBe("-");
      expect(formatDisplayDate(undefined)).toBe("-");
      expect(formatDisplayDate("")).toBe("-");
    });

    it("returns custom fallback when provided", () => {
      expect(formatDisplayDate(null, "N/A")).toBe("N/A");
      expect(formatDisplayDate("", "No deadline")).toBe("No deadline");
    });

    it("handles invalid date strings gracefully without throwing", () => {
      expect(formatDisplayDate("invalid-date-string")).toBe("-");
    });
  });

  describe("Architectural Boundaries & Separation of Concerns", () => {
    const dashboardJsx = fs.readFileSync(
      path.resolve(__dirname, "../src/pages/Dashboard.jsx"),
      "utf-8"
    );
    const useDashboardJs = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useDashboard.js"),
      "utf-8"
    );

    it("ensures Dashboard.jsx does NOT import or call mockApi directly", () => {
      expect(dashboardJsx.includes("mockApi")).toBe(false);
    });

    it("ensures Dashboard.jsx delegates orchestration to useDashboard", () => {
      expect(dashboardJsx.includes("useDashboard")).toBe(true);
      expect(dashboardJsx.includes("handleConfirmDelete")).toBe(true);
      expect(dashboardJsx.includes("setProjectToDelete")).toBe(true);
    });

    it("ensures useDashboard.js does NOT import mockApi directly", () => {
      expect(useDashboardJs.includes("mockApi")).toBe(false);
    });

    it("ensures useDashboard.js consumes projectService", () => {
      expect(useDashboardJs.includes("projectService")).toBe(true);
    });
  });
});
