import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell me your name.").max(100),
  email: z.string().email("Please enter a valid email address."),
  message: z
    .string()
    .min(10, "A few more details would help — at least 10 characters.")
    .max(5000),
  // Honeypot — must stay empty; bots tend to fill every field.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
