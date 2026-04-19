import { Link, useMatches } from "@tanstack/react-router";

const navItems = [
  { label: "~/HOME", to: "/" },
] as const;

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "/";

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
          fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-charcoal bg-carbon
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="shrink-0 px-5 pt-6 pb-8">
          <h1 className="font-mono text-sm font-bold text-emerald-signal tracking-wider">
            ./learn
          </h1>
          <p className="font-mono text-[10px] text-slate-steel mt-0.5">
            beta
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = currentPath === item.to;

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-xs transition-colors ${
                  isActive
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
