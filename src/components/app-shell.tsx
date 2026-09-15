import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  active: "lab" | "cifra" | "ccv" | "tri";
  children: React.ReactNode;
};

export function AppShell({ active, children }: Props) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-h-11 items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[10px] bg-raised shadow-[var(--shadow-border)]">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M6.5 15.5c2.4-9 8.6-9 11 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  className="text-accent"
                />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="font-display block text-lg tracking-tight">Intuição</span>
              <span className="text-subtle hidden text-xs sm:block">laboratório de probabilidade</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto rounded-xl bg-raised p-1 shadow-[var(--shadow-border)]">
            <NavLink to="/" current={active === "lab"}>
              <span className="sm:hidden">Lab</span>
              <span className="hidden sm:inline">Probabilidade</span>
            </NavLink>
            <NavLink to="/cifra" current={active === "cifra"}>
              Cifra
            </NavLink>
            <NavLink to="/ccv" current={active === "ccv"}>
              <span className="sm:hidden">CCV</span>
              <span className="hidden sm:inline">Caderno CCV</span>
            </NavLink>
            <NavLink to="/tri" current={active === "tri"}>
              <span className="sm:hidden">ENEM</span>
              <span className="hidden sm:inline">ENEM / SiSU</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

function NavLink({
  to,
  current,
  children,
}: {
  to: "/" | "/cifra" | "/ccv" | "/tri";
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex h-10 min-w-12 items-center justify-center rounded-[10px] px-2.5 text-sm font-medium transition-colors duration-150 sm:min-w-[6.5rem] sm:px-3",
        current ? "bg-fg text-bg" : "text-muted hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
