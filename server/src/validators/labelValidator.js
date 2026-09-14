import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().trim().min(2, "Label name must be at least 2 characters."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid 6-character hex code (e.g. #579dff).")
    .optional()
    .default("#579dff"),
});

export const updateLabelSchema = z.object({
  name: z.string().trim().min(2, "Label name must be at least 2 characters.").optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid 6-character hex code (e.g. #579dff).")
    .optional(),
});
