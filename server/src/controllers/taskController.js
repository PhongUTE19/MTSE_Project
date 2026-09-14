import * as taskService from "../services/taskService.js";

export async function getAllTasks(req, res, next) {
  try {
    res.status(200).json(await taskService.getAllTasks({ projectId: req.query.projectId, status: req.query.status }));
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "NotFound", message: `Task with ID "${req.params.id}" not found.` });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    res.status(201).json(await taskService.createTask(req.body));
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "NotFound", message: `Task with ID "${req.params.id}" not found.` });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const result = await taskService.deleteTask(req.params.id);
    if (!result) return res.status(404).json({ error: "NotFound", message: `Task with ID "${req.params.id}" not found.` });
    res.status(200).json({ success: true, deletedId: result.deletedId, message: "Task successfully deleted." });
  } catch (error) {
    next(error);
  }
}
