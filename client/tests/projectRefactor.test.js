// src/tests/projectRefactor.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { projectService } from "../src/services/projectService";
import { mockApi } from "../src/services/mockApi";
import { DEFAULT_COURSE_NAME } from "../src/utils/constants";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("CreateProject Refactoring & projectService Architecture", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("projectService Abstraction Layer", () => {
    it("creates a new project with provided values", async () => {
      const newProj = await projectService.createProject({
        name: "Mobile Banking App",
        courseName: "Mobile Computing",
        description: "FinTech application for mobile platforms",
        deadline: "2026-11-20",
      });

      expect(newProj).toBeDefined();
      expect(newProj.id).toBeDefined();
      expect(newProj.name).toBe("Mobile Banking App");
      expect(newProj.courseName).toBe("Mobile Computing");
      expect(newProj.description).toBe("FinTech application for mobile platforms");
      expect(newProj.deadline).toContain("2026-11-20");
    });

    it("uses DEFAULT_COURSE_NAME ('General') when courseName is missing or empty", async () => {
      const proj = await projectService.createProject({
        name: "Untitled Capstone",
        courseName: "",
      });

      expect(proj.courseName).toBe(DEFAULT_COURSE_NAME);
      expect(DEFAULT_COURSE_NAME).toBe("General");
    });

    it("handles null or empty deadline gracefully", async () => {
      const proj = await projectService.createProject({
        name: "No Deadline Project",
        deadline: "",
      });

      expect(proj.deadline).toBeNull();
    });

    it("fetches all projects via projectService.getProjects()", async () => {
      const projects = await projectService.getProjects();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });

    it("fetches single project by ID", async () => {
      const proj = await projectService.getProjectById("project-1");
      expect(proj).toBeDefined();
      expect(proj.id).toBe("project-1");
    });

    it("deletes a project via projectService.deleteProject()", async () => {
      const newProj = await projectService.createProject({
        name: "Temporary Project To Delete",
      });
      await projectService.deleteProject(newProj.id);

      await expect(projectService.getProjectById(newProj.id)).rejects.toThrow();
    });
  });

  describe("Architectural Boundaries & Separation of Concerns", () => {
    const createProjectJsx = fs.readFileSync(
      path.resolve(__dirname, "../src/pages/CreateProject.jsx"),
      "utf-8"
    );
    const useCreateProjectJs = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useCreateProject.js"),
      "utf-8"
    );

    it("ensures CreateProject.jsx has no direct mockApi import or calls", () => {
      expect(createProjectJsx.includes("from \"../services/mockApi\"")).toBe(false);
      expect(createProjectJsx.includes("from '../services/mockApi'")).toBe(false);
      expect(createProjectJsx.includes("mockApi.")).toBe(false);
    });

    it("ensures CreateProject.jsx delegates form logic to useCreateProject", () => {
      expect(createProjectJsx.includes("useCreateProject")).toBe(true);
      expect(createProjectJsx.includes("handleSubmit")).toBe(true);
      expect(createProjectJsx.includes("handleChange")).toBe(true);
      expect(createProjectJsx.includes("handleBlur")).toBe(true);
      // Ensure inline validation function was removed from component
      expect(createProjectJsx.includes("const validate =")).toBe(false);
    });

    it("ensures useCreateProject.js does not import mockApi directly", () => {
      expect(useCreateProjectJs.includes("mockApi")).toBe(false);
    });

    it("ensures useCreateProject.js consumes projectService and validateProjectForm", () => {
      expect(useCreateProjectJs.includes("projectService")).toBe(true);
      expect(useCreateProjectJs.includes("validateProjectForm")).toBe(true);
    });
  });
});
