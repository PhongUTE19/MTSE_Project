import * as statusService from "../services/statusService.js";

export async function getStatusesByProject(req, res, next) {
  try {
    const statuses = await statusService.getStatuses(req.params.projectId);
    res.status(200).json(statuses);
  } catch (error) {
    next(error);
  }
}

export async function createStatus(req, res, next) {
  try {
    const status = await statusService.createStatus(req.params.projectId, req.body);
    res.status(201).json(status);
  } catch (error) {
    next(error);
  }
}
