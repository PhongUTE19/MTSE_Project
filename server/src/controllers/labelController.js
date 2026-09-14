import * as labelService from "../services/labelService.js";

export async function getLabelsByProject(req, res, next) {
  try {
    const labels = await labelService.getLabels(req.params.projectId);
    res.status(200).json(labels);
  } catch (error) {
    next(error);
  }
}

export async function createLabel(req, res, next) {
  try {
    const label = await labelService.createLabel(req.params.projectId, req.body);
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
}

export async function updateLabel(req, res, next) {
  try {
    const label = await labelService.updateLabel(
      req.params.projectId,
      req.params.id,
      req.body
    );
    if (!label) {
      return res.status(404).json({
        error: "NotFound",
        message: `Label with ID "${req.params.id}" not found in project "${req.params.projectId}".`,
      });
    }
    res.status(200).json(label);
  } catch (error) {
    next(error);
  }
}

export async function deleteLabel(req, res, next) {
  try {
    const result = await labelService.deleteLabel(req.params.projectId, req.params.id);
    if (!result) {
      return res.status(404).json({
        error: "NotFound",
        message: `Label with ID "${req.params.id}" not found in project "${req.params.projectId}".`,
      });
    }
    res.status(200).json({
      success: true,
      deletedId: result.deletedId,
      message: "Label successfully deleted.",
    });
  } catch (error) {
    next(error);
  }
}
