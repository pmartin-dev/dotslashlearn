import { Link } from "@tanstack/react-router";

export function NotFound({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <p className="mt-4 text-secondary">
        {message ?? "This page doesn't exist yet."}
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm text-muted hover:text-brand transition-colors font-medium"
      >
        ← back to lessons
      </Link>
    </div>
  );
}
