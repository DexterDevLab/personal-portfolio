import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell me your name.").max(100),
  email: z.email("Please enter a valid email address."),
  message: z
    .string()
    .min(10, "A few more details would help — at least 10 characters.")
    .max(5000),
  // Honeypot — real users never see it; a filled value is handled in
  // sendContact() (fake success), not rejected here, so bots learn nothing.
  company: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
