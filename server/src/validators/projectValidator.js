import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, "Project name must be at least 3 characters."),
  courseName: z.string().trim().optional().default("General"),
  description: z.string().optional().default(""),
  deadline: z.string().datetime({ offset: true, message: "Invalid deadline format." }).nullable().optional(),
});
