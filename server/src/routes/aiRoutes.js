// src/routes/aiRoutes.js
import express from "express";
import * as aiController from "../controllers/aiController.js";
import { validate } from "../middlewares/validate.js";
import { parseTaskInputSchema } from "../validators/aiValidator.js";

const router = express.Router();

// GET /api/v1/ai/health
router.get("/health", aiController.getHealth);

// POST /api/v1/ai/parse-task
router.post("/parse-task", validate(parseTaskInputSchema), aiController.parseTask);

export default router;
