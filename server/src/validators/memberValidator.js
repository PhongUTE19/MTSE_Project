import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  mssv: z.string().trim().min(5, "MSSV must be at least 5 characters."),
  email: z.string().trim().email("Invalid email format."),
});

export const updateMemberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").optional(),
  mssv: z.string().trim().min(5, "MSSV must be at least 5 characters.").optional(),
  email: z.string().trim().email("Invalid email format.").optional(),
});
