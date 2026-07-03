import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        404
      </p>
      <h1 className="text-3xl font-semibold">This page doesn&rsquo;t exist.</h1>
      <p className="max-w-md text-muted">
        The link may be old or mistyped — but the work is still here.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-button bg-accent-strong px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Back home
      </Link>
    </main>
  );
}
