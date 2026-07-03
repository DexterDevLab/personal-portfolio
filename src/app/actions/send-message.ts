"use server";

import { contactSchema } from "@/lib/contact-schema";
import { site } from "@/lib/site";

export type SendMessageResult =
  | { ok: true }
  | { ok: false; error: string };

const FALLBACK_ERROR = `Something went wrong — please email me directly at ${site.email}.`;

export async function sendMessage(
  input: unknown,
): Promise<SendMessageResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  // Honeypot tripped — pretend success so bots learn nothing.
  if (parsed.data.company) {
    return { ok: true };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.CONTACT_EMAIL ?? site.email;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not configured.");
    return {
      ok: false,
      error: `The contact form isn't set up yet — please email me directly at ${site.email}.`,
    };
  }

  const { name, email, message } = parsed.data;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Portfolio Contact", email: to },
        to: [{ email: to, name: site.person }],
        replyTo: { email, name },
        subject: `Portfolio inquiry from ${name}`,
        textContent: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.error("Brevo error:", res.status, await res.text());
      return { ok: false, error: FALLBACK_ERROR };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendMessage failed:", err);
    return { ok: false, error: FALLBACK_ERROR };
  }
}
