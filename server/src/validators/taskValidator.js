import { z } from "zod";

const checklistItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});

const taskFields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: z.string(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueAt: z.string().datetime({ offset: true, message: "Invalid deadline format." }),
  startAt: z.string().datetime({ offset: true, message: "Invalid start date format." }).nullable().optional(),
  assigneeIds: z.array(z.string()),
  labels: z.array(z.string()),
  checklist: z.array(checklistItemSchema),
  reminderMinutesBefore: z.array(z.number().int().positive()),
};

export const createTaskSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format."),
  ...taskFields,
  description: taskFields.description.optional().default(""),
  status: taskFields.status.default("todo"),
  priority: taskFields.priority.default("medium"),
  assigneeIds: taskFields.assigneeIds.default([]),
  labels: taskFields.labels.default([]),
  checklist: taskFields.checklist.default([]),
  reminderMinutesBefore: taskFields.reminderMinutesBefore.default([]),
}).superRefine((value, context) => {
  if (new Date(value.dueAt) <= new Date()) {
    context.addIssue({ code: "custom", path: ["dueAt"], message: "Deadline cannot be in the past." });
  }
});

export const updateTaskSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format.").optional(),
  title: taskFields.title.optional(),
  description: taskFields.description.optional(),
  status: taskFields.status.optional(),
  priority: taskFields.priority.optional(),
  dueAt: taskFields.dueAt.optional(),
  startAt: taskFields.startAt,
  assigneeIds: taskFields.assigneeIds.optional(),
  labels: taskFields.labels.optional(),
  checklist: taskFields.checklist.optional(),
  reminderMinutesBefore: taskFields.reminderMinutesBefore.optional(),
}).superRefine((value, context) => {
  if (value.dueAt && new Date(value.dueAt) <= new Date()) {
    context.addIssue({ code: "custom", path: ["dueAt"], message: "Deadline cannot be in the past." });
  }
});
