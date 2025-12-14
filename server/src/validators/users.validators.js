import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120)
});
