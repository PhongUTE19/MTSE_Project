import * as projectService from "../services/projectService.js";

export async function getAllProjects(req, res, next) {
  try {
    res.status(200).json(await projectService.getAllProjects());
  } catch (error) {
    next(error);
  }
}

