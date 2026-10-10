import type { APIRoute } from "astro";
import { sendContact } from "@/lib/contact";

// The only server-rendered route: it needs the Brevo secret at request time.
export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const contentType = request.headers.get("content-type") ?? "";
  const wantsJson =
    contentType.includes("application/json") ||
    (request.headers.get("accept") ?? "").includes("application/json");

  let input: unknown;
  if (contentType.includes("application/json")) {
    input = await request.json().catch(() => null);
  } else {
    const formData = await request.formData().catch(() => null);
    input = formData ? Object.fromEntries(formData) : null;
  }

  const result = await sendContact(input);

  if (wantsJson) {
    const body = result.ok ? { ok: true } : { ok: false, error: result.error };
    return new Response(JSON.stringify(body), {
      status: result.ok ? 200 : result.status,
      headers: { "content-type": "application/json" },
    });
  }

  // Plain HTML form submission (no JS): POST → redirect → GET a status page.
  return redirect(result.ok ? "/contact/sent" : `/contact/error?code=${result.code}`, 303);
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { allow: "POST" } });
