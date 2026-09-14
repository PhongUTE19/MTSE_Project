import express from "express";
import * as projectController from "../controllers/projectController.js";

const router = express.Router();
router.get("/", projectController.getAllProjects);
export default router;
