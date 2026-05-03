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

/**
 * Inline script to apply the saved theme before first paint (prevents flash).
 * This is a static constant — not user-provided content — so it's safe to inject.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){document.documentElement.classList.remove('dark')}})()`;

export const Route = createRootRoute({
  notFoundComponent: () => <NotFound />,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
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
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=Poppins:wght@500&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
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

function getInitialDark(): boolean {
  if (typeof document === "undefined") return false; // SSR default: light
  return document.documentElement.classList.contains("dark");
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<Zone>("content");
  const [isDark, setIsDark] = useState(getInitialDark);

  // Sync with Sidebar's toggle via DOM observation
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${isDark ? "dark" : ""}`}>
      <head>
        <HeadContent />
        {/* Static theme-init script — safe, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full bg-surface text-primary">
        <KeyZoneContext value={{ activeZone, setActiveZone }}>
          <div className="flex h-full overflow-hidden">
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex shrink-0 items-center px-4 py-3 lg:hidden">
                <SidebarToggle onClick={() => setSidebarOpen(true)} />
              </div>

              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </div>
        </KeyZoneContext>
        <Scripts />
      </body>
    </html>
  );
}
