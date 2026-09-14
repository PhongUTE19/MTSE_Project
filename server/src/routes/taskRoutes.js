import express from "express";
import * as taskController from "../controllers/taskController.js";
import { validate } from "../middlewares/validate.js";
import { createTaskSchema, updateTaskSchema } from "../validators/taskValidator.js";

const router = express.Router();
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.put("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
export default router;
