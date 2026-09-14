import express from "express";
import * as projectController from "../controllers/projectController.js";
import * as memberController from "../controllers/memberController.js";
import * as labelController from "../controllers/labelController.js";
import * as statusController from "../controllers/statusController.js";
import { validate } from "../middlewares/validate.js";
import { createProjectSchema } from "../validators/projectValidator.js";
import { createMemberSchema, updateMemberSchema } from "../validators/memberValidator.js";
import { createLabelSchema, updateLabelSchema } from "../validators/labelValidator.js";

const router = express.Router();

// Project Routes
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.post("/", validate(createProjectSchema), projectController.createProject);
router.delete("/:id", projectController.deleteProject);

// Member Routes (project-scoped)
router.get("/:projectId/members", memberController.getMembersByProject);
router.post("/:projectId/members", validate(createMemberSchema), memberController.createMember);
router.put("/:projectId/members/:id", validate(updateMemberSchema), memberController.updateMember);
router.delete("/:projectId/members/:id", memberController.deleteMember);

// Label Routes (project-scoped)
router.get("/:projectId/labels", labelController.getLabelsByProject);
router.post("/:projectId/labels", validate(createLabelSchema), labelController.createLabel);
router.put("/:projectId/labels/:id", validate(updateLabelSchema), labelController.updateLabel);
router.delete("/:projectId/labels/:id", labelController.deleteLabel);

// Status Routes (project-scoped)
router.get("/:projectId/statuses", statusController.getStatusesByProject);
router.post("/:projectId/statuses", statusController.createStatus);

export default router;
