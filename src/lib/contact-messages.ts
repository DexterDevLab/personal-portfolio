import { site } from "@/data/site";

/** User-facing contact-form strings, shared by the client script, the API
 *  endpoint, and the no-JS status pages so every path says the same thing. */
export const CONTACT_MESSAGES = {
  success: "Thanks — your message is on its way. I'll reply soon.",
  notConfigured: `The contact form isn't set up yet — please email me directly at ${site.email}.`,
  failed: `Something went wrong — please email me directly at ${site.email}.`,
  invalid: "Invalid input.",
} as const;
