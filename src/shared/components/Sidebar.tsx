import { useCallback, useMemo, useState } from "react";
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import { useKeyZone, useZoneKeyboard } from "@/shared/hooks/useKeyZone";

const navItems = [
  { label: "Home", to: "/", activePaths: ["/"] },
  { label: "Learn", to: "/learn", activePaths: ["/learn", "/lessons", "/categories"] },
] as const;

function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );

  const toggle = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable
    }
  }, [isDark]);

  return { isDark, toggle };
}

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const matches = useMatches();
  const navigate = useNavigate();
  const currentPath = matches[matches.length - 1]?.pathname ?? "/";
  const { activeZone, setActiveZone } = useKeyZone();
  const isFocused = activeZone === "sidebar";
  const { isDark, toggle: toggleTheme } = useTheme();

  // Find the currently active nav item index based on route
  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((item) =>
      item.activePaths.some(
        (p) => currentPath === p || currentPath.startsWith(p + "/"),
      ),
    );
    return idx >= 0 ? idx : 0;
  }, [currentPath]);

  const [selected, setSelected] = useState(activeIndex);

  const [prevActiveIndex, setPrevActiveIndex] = useState(activeIndex);
  if (activeIndex !== prevActiveIndex) {
    setPrevActiveIndex(activeIndex);
    setSelected(activeIndex);
  }

  const handlers = useMemo(
    () => ({
      ArrowDown: (e: KeyboardEvent) => {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, navItems.length - 1));
      },
      ArrowUp: (e: KeyboardEvent) => {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      },
      Enter: (e: KeyboardEvent) => {
        e.preventDefault();
        const item = navItems[selected];
        if (item) {
          navigate({ to: item.to });
          setActiveZone("content");
        }
      },
    }),
    [selected, navigate, setActiveZone],
  );

  useZoneKeyboard("sidebar", handlers);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r bg-surface transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isFocused ? "border-brand/30" : "border-subtle"}
        `}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-6 pb-8">
          <Link to="/" onClick={onClose} className="cursor-pointer text-lg font-display font-semibold text-brand hover:text-brand-hover transition-colors">
            ./learn
          </Link>
          <p className="text-[11px] text-muted mt-0.5">
            beta
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item, i) => {
            const isActive = item.activePaths.some(
              (p) => currentPath === p || currentPath.startsWith(p + "/"),
            );
            const isSelected = isFocused && i === selected;

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-brand-bg text-brand border border-brand/30"
                    : isActive
                      ? "bg-brand-bg text-brand border border-brand/15"
                      : "text-primary hover:bg-surface-hover hover:text-brand border border-transparent"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/pmartin-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted/50 hover:text-brand transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://github.com/pmartin-dev/dotslashlearn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted/50 hover:text-brand transition-colors"
            aria-label="GitHub"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer text-muted/50 hover:text-brand transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              /* Sun icon — shown in dark mode */
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              /* Moon icon — shown in light mode */
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

/** Hamburger button for mobile */
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden p-1 text-muted hover:text-primary transition-colors"
      aria-label="Toggle menu"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
