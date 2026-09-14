import * as projectService from "../services/projectService.js";

export async function getAllProjects(req, res, next) {
  try {
    res.status(200).json(await projectService.getAllProjects());
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        error: "NotFound",
        message: `Project with ID "${req.params.id}" not found.`,
      });
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.params.id);
    if (!result) {
      return res.status(404).json({
        error: "NotFound",
        message: `Project with ID "${req.params.id}" not found.`,
      });
    }
    res.status(200).json({
      success: true,
      deletedId: result.deletedId,
      message: "Project successfully deleted.",
    });
  } catch (error) {
    next(error);
  }
}

