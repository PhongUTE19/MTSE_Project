import { AiServiceError } from "../services/aiService.js";
import { multimodalService } from "../services/multimodalService.js";
import { multimodalContextSchema } from "../validators/aiValidator.js";

function parseMultimodalContext(rawContext) {
  if (rawContext === undefined) return {};

  if (typeof rawContext !== "string") {
    throw new AiServiceError(
      "Invalid multimodal context.",
      { code: "INVALID_INPUT", status: 400 }
    );
  }

  let parsedContext;
  try {
    parsedContext = JSON.parse(rawContext);
  } catch {
    throw new AiServiceError(
      "Invalid multimodal context.",
      { code: "INVALID_INPUT", status: 400 }
    );
  }

  const validationResult = multimodalContextSchema.safeParse(parsedContext);
  if (!validationResult.success) {
    throw new AiServiceError(
      "Invalid multimodal context.",
      { code: "INVALID_INPUT", status: 400 }
    );
  }

  return validationResult.data;
}

/** Handles the HTTP boundary for one validated multimodal image request. */
export async function parseMultimodalTask(req, res, next) {
  try {
    if (!req.file) {
      throw new AiServiceError(
        "An image file is required.",
        { code: "INVALID_INPUT", status: 400 }
      );
    }

    const context = parseMultimodalContext(req.body?.context);
    const result = await multimodalService.parseTaskFromImage(
      req.file.buffer,
      {
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      },
      context
    );

    res.status(200).json({
      success: true,
      data: result.task,
      meta: {
        model: result.model,
        promptVersion: result.promptVersion,
        latencyMs: result.latencyMs,
        sourceImage: {
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
