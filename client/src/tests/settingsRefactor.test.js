// src/tests/settingsRefactor.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { projectService } from "../services/projectService";
import { mockApi } from "../services/mockApi";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Settings Refactoring & Architecture", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("projectService Member Operations", () => {
    it("fetches members for a project", async () => {
      const members = await projectService.getMembers("project-1");
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
      expect(members[0].name).toBeDefined();
    });

    it("returns empty array when projectId is empty or null", async () => {
      const empty = await projectService.getMembers("");
      expect(empty).toEqual([]);
      const nullProj = await projectService.getMembers(null);
      expect(nullProj).toEqual([]);
    });

    it("creates a new member in a project", async () => {
      const newMemberData = {
        name: "Nguyễn Văn An",
        mssv: "23110999",
        email: "an.nguyen@example.com",
      };

      const created = await projectService.createMember("project-1", newMemberData);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.name).toBe("Nguyễn Văn An");
      expect(created.mssv).toBe("23110999");

      const membersAfter = await projectService.getMembers("project-1");
      expect(membersAfter.some((m) => m.id === created.id)).toBe(true);
    });

    it("updates an existing member in a project", async () => {
      const members = await projectService.getMembers("project-1");
      const target = members[0];

      const updated = await projectService.updateMember("project-1", target.id, {
        name: "Updated Name",
        mssv: target.mssv,
        email: "updated@example.com",
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.email).toBe("updated@example.com");

      const membersAfter = await projectService.getMembers("project-1");
      const found = membersAfter.find((m) => m.id === target.id);
      expect(found.name).toBe("Updated Name");
    });

    it("deletes a member from a project", async () => {
      const membersBefore = await projectService.getMembers("project-1");
      const target = membersBefore[0];

      await projectService.deleteMember("project-1", target.id);

      const membersAfter = await projectService.getMembers("project-1");
      expect(membersAfter.some((m) => m.id === target.id)).toBe(false);
    });
  });

  describe("Architectural Boundaries & Separation of Concerns", () => {
    const settingsJsx = fs.readFileSync(
      path.resolve(__dirname, "../pages/Settings.jsx"),
      "utf-8"
    );
    const useSettingsJs = fs.readFileSync(
      path.resolve(__dirname, "../hooks/useSettings.js"),
      "utf-8"
    );

    it("ensures Settings.jsx does NOT import or call mockApi directly", () => {
      expect(settingsJsx.includes("mockApi")).toBe(false);
    });

    it("ensures Settings.jsx delegates state and mutations to useSettings", () => {
      expect(settingsJsx.includes("useSettings")).toBe(true);
      expect(settingsJsx.includes("handleSaveMember")).toBe(true);
      expect(settingsJsx.includes("handleConfirmDeleteMember")).toBe(true);
      expect(settingsJsx.includes("handleSelectProject")).toBe(true);
    });

    it("ensures useSettings.js does NOT import mockApi directly", () => {
      expect(useSettingsJs.includes("mockApi")).toBe(false);
    });

    it("ensures useSettings.js consumes projectService", () => {
      expect(useSettingsJs.includes("projectService")).toBe(true);
    });
  });
});
