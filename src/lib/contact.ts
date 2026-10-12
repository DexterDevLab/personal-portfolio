import { BREVO_API_KEY, CONTACT_EMAIL, TURNSTILE_SECRET_KEY } from "astro:env/server";
import { contactSchema } from "@/lib/contact-schema";
import { CONTACT_MESSAGES } from "@/lib/contact-messages";
import { site } from "@/data/site";

export type ContactErrorCode =
  | "invalid-name"
  | "invalid-email"
  | "invalid-message"
  | "invalid"
  | "not-configured"
  | "challenge"
  | "failed";

export type ContactResult =
  | { ok: true }
  | { ok: false; code: ContactErrorCode; error: string; status: number };

/** Message for a given error code — used by the no-JS error page. */
export function messageForCode(code: string | null): string {
  switch (code) {
    case "invalid-name":
      return contactSchema.shape.name.safeParse("").error?.issues[0]?.message ?? CONTACT_MESSAGES.invalid;
    case "invalid-email":
      return contactSchema.shape.email.safeParse("x").error?.issues[0]?.message ?? CONTACT_MESSAGES.invalid;
    case "invalid-message":
      return contactSchema.shape.message.safeParse("").error?.issues[0]?.message ?? CONTACT_MESSAGES.invalid;
    case "invalid":
      return CONTACT_MESSAGES.invalid;
    case "not-configured":
      return CONTACT_MESSAGES.notConfigured;
    case "challenge":
      return CONTACT_MESSAGES.challenge;
    default:
      return CONTACT_MESSAGES.failed;
  }
}

/**
 * Validates the submission and delivers it through Brevo's transactional
 * email API. Reads BREVO_API_KEY / CONTACT_EMAIL from the server environment.
 */
export async function sendContact(input: unknown, meta: { ip?: string | null } = {}): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    const code: ContactErrorCode =
      field === "name" || field === "email" || field === "message" ? `invalid-${field}` : "invalid";
    return { ok: false, code, error: issue?.message ?? CONTACT_MESSAGES.invalid, status: 400 };
  }

  // Honeypot tripped, or submitted faster than a person can type — pretend
  // success so bots learn nothing.
  if (parsed.data.company || (parsed.data.elapsed !== undefined && parsed.data.elapsed < 2500)) {
    return { ok: true };
  }

  // Turnstile: when the secret is configured every submission needs a valid token.
  if (TURNSTILE_SECRET_KEY) {
    const token = parsed.data["cf-turnstile-response"];
    const passed = token ? await verifyTurnstile(TURNSTILE_SECRET_KEY, token, meta.ip) : false;
    if (!passed) {
      return { ok: false, code: "challenge", error: CONTACT_MESSAGES.challenge, status: 403 };
    }
  }

  const apiKey = BREVO_API_KEY;
  const to = CONTACT_EMAIL ?? site.email;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not configured.");
    return { ok: false, code: "not-configured", error: CONTACT_MESSAGES.notConfigured, status: 503 };
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
      return { ok: false, code: "failed", error: CONTACT_MESSAGES.failed, status: 502 };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendContact failed:", err);
    return { ok: false, code: "failed", error: CONTACT_MESSAGES.failed, status: 502 };
  }
}

/** Ask Cloudflare whether a Turnstile token is genuine (tokens are single-use). */
async function verifyTurnstile(secret: string, token: string, ip?: string | null): Promise<boolean> {
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("Turnstile rejected a token:", data["error-codes"]);
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
