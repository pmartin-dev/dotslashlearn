/// <reference types="vite/client" />
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "@/shared/styles/app.css?url";
import { NotFound } from "@/shared/components/NotFound";
import { Sidebar, SidebarToggle } from "@/shared/components/Sidebar";
import { KeyZoneContext, type Zone } from "@/shared/hooks/useKeyZone";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<Zone>("content");

  const handleTab = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      setActiveZone((z) => (z === "content" ? "sidebar" : "content"));
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [handleTab]);

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="h-full bg-abyss text-snow p-2 sm:p-4">
        <KeyZoneContext value={{ activeZone, setActiveZone }}>
          <div className="flex h-full rounded-lg border border-charcoal bg-carbon overflow-hidden">
            {/* Sidebar */}
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Mobile menu toggle */}
              <div className="flex shrink-0 items-center px-4 py-3 lg:hidden">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
              </div>

              {/* Terminal body */}
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </div>
        </KeyZoneContext>
        <Scripts />
      </body>
    </html>
  );
}
