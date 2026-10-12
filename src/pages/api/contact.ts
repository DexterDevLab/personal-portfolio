import type { APIRoute } from "astro";
import { sendContact } from "@/lib/contact";

// The only server-rendered route: it needs the Brevo secret at request time.
export const prerender = false;

export const POST: APIRoute = async ({ request, redirect, clientAddress, url }) => {
  // Browsers always send Origin on form posts: a mismatched one is a request
  // from another site. (Absent = non-browser client; validation still applies.)
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin && !(import.meta.env.DEV && origin.startsWith("http://localhost"))) {
    return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

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

  let ip: string | null = null;
  try {
    ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? clientAddress;
  } catch {}
  const result = await sendContact(input, { ip });

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
