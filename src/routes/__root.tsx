/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "@/shared/styles/app.css?url";
import { NotFound } from "@/shared/components/NotFound";

export const Route = createRootRoute({
  notFoundComponent: () => <NotFound />,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "./learn - Interactive dev lessons" },
      {
        name: "description",
        content:
          "Bite-sized, interactive lessons on developer topics. Navigate with your keyboard.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="h-full bg-abyss text-snow p-2 sm:p-4">
        <div className="flex h-full flex-col rounded-lg border border-charcoal bg-carbon overflow-hidden">
          {/* Terminal title bar */}
          <div className="flex shrink-0 items-center gap-2 border-b border-charcoal px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-traffic-red" />
              <span className="h-3 w-3 rounded-full bg-traffic-yellow" />
              <span className="h-3 w-3 rounded-full bg-traffic-green" />
            </div>
            <span className="ml-2 font-mono text-xs text-slate-steel">
              ./learn
            </span>
          </div>

          {/* Terminal body */}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
