// src/controllers/aiController.js
import { aiService } from "../services/aiService.js";

/**
 * Controller to handle AI task parsing requests.
 */
export async function parseTask(req, res, next) {
  try {
    const { prompt, context } = req.body;
    const result = await aiService.parseTaskPrompt(prompt, context);

    res.status(200).json({
      success: true,
      data: result.task,
      meta: {
        model: result.model,
        promptVersion: result.promptVersion,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to check AI service status and configuration.
 */
export function getHealth(req, res) {
  const health = aiService.getAiHealth();
  res.status(200).json({
    status: "ok",
    service: "mana-ai-task-assistant",
    ...health,
  });
}
