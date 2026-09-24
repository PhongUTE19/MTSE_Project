// src/validators/aiValidator.js
import { z } from "zod";

/**
 * Validates the client request body for parsing a task via AI.
 */
export const parseTaskInputSchema = z.object({
  prompt: z
    .string({ required_error: "Task prompt is required." })
    .trim()
    .min(2, "Task prompt must be at least 2 characters.")
    .max(2000, "Task prompt cannot exceed 2000 characters."),
  context: z
    .object({
      nowIso: z.string().datetime({ offset: true }).optional(),
      availableLabels: z.array(z.string().trim()).optional(),
      projectId: z.string().uuid().optional(),
    })
    .optional(),
});

/**
 * Validates the structured output returned by the LLM.
 * Throws if the LLM output violates constraints or produces malformed data.
 */
export const aiTaskResponseSchema = z.object({
  isTask: z.boolean({ required_error: "'isTask' flag is required." }),
  title: z.string().trim().default(""),
  description: z.string().default(""),
  priority: z.enum(["low", "medium", "high"]).nullable().optional().default(null),
  dueAt: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val) return null;
      const lower = String(val).trim().toLowerCase();
      if (
        lower === "null" ||
        lower === "none" ||
        lower === "unspecified" ||
        lower === "n/a" ||
        !lower
      ) {
        return null;
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    })
    .or(z.literal(null)),
  labels: z
    .array(z.string())
    .default([])
    .transform((items) => items.map((s) => String(s).trim()).filter(Boolean)),
  checklist: z
    .array(z.string())
    .default([])
    .transform((items) => items.map((s) => String(s).trim()).filter(Boolean)),
  confidence: z.number().min(0).max(1).optional().default(1.0),
  rejectionReason: z.string().nullable().optional().default(null),
}).superRefine((val, ctx) => {
  if (val.isTask) {
    if (!val.title || val.title.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "AI marked item as a task but did not provide a valid title (minimum 2 characters).",
      });
    }
  }
});
