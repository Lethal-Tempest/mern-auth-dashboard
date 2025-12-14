import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["todo", "in_progress", "done"]).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional()
});
