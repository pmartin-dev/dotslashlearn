import { Link } from "@tanstack/react-router";

export function NotFound({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="font-mono text-6xl text-emerald-signal">404</p>
      <p className="mt-4 text-parchment">
        {message ?? "This page doesn't exist yet."}
      </p>
      <Link
        to="/"
        className="mt-6 inline-block font-mono text-sm text-slate-steel hover:text-emerald-signal transition-colors"
      >
        ← back to lessons
      </Link>
    </div>
  );
}
