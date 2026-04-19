import { useMemo, useState } from "react";
import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import { useKeyZone, useZoneKeyboard } from "@/shared/hooks/useKeyZone";

const navItems = [
  { label: "~/HOME", to: "/", activePaths: ["/"] },
  { label: "~/LEARN", to: "/learn", activePaths: ["/learn", "/lessons", "/categories"] },
] as const;

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
          className="fixed inset-0 z-40 bg-abyss/80 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r bg-carbon transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isFocused ? "border-emerald-signal/30" : "border-charcoal"}
        `}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-6 pb-8">
          <Link to="/" onClick={onClose} className="cursor-pointer font-mono text-sm font-bold text-emerald-signal tracking-wider hover:text-volt-mint transition-colors">
            ./learn
          </Link>
          <p className="font-mono text-[10px] text-slate-steel mt-0.5">
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
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-xs transition-colors ${
                  isSelected
                    ? "bg-emerald-signal/15 text-emerald-signal border border-emerald-signal/40"
                    : isActive
                      ? "bg-emerald-signal/10 text-emerald-signal border border-emerald-signal/20"
                      : "text-slate-steel hover:bg-charcoal/30 hover:text-snow border border-transparent"
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
        <div className="shrink-0 px-5 py-4">
          <a
            href="https://www.linkedin.com/in/pmartin-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-steel/50 hover:text-emerald-signal transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
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
      className="lg:hidden p-1 text-slate-steel hover:text-snow transition-colors"
      aria-label="Toggle menu"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
