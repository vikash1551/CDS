import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, LogOut, BarChart4, BrainCircuit, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { CustomLogo } from "@/components/Logo";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin-reports", label: "AI Reports", icon: BrainCircuit },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/admin" ? path === "/admin" : path.startsWith(to));

  return (
    <div
      className="min-h-screen bg-background md:flex admin-theme text-foreground"
      style={{
        "--color-primary": "#4f46e5", // Indigo 600
        "--color-primary-foreground": "#ffffff",
        "--color-brand": "#4f46e5",
        "--color-brand-foreground": "#ffffff",
        "--color-ring": "#6366f1",
      } as React.CSSProperties}
    >
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:h-screen md:w-[220px] md:shrink-0 md:flex-col md:border-r md:border-border/40 md:bg-[#0f172a] md:text-slate-200 md:px-4 md:py-6 lg:w-[260px] xl:w-[280px]">
        <Link to="/admin" className="flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">Campus Flow <span className="text-[10px] font-semibold text-indigo-400">ADMIN</span></span>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {tabs.map((t) => {
            const active = isActive(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-indigo-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.4} />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4">
          <button
            onClick={() => navigate({ to: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.4} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:min-w-0 md:pl-[220px] lg:pl-[260px] xl:pl-[280px] bg-slate-50 dark:bg-background">
        <div className="mx-auto w-full max-w-none pb-28 sm:max-w-[640px] md:max-w-[1240px] md:px-8 md:pb-12 md:pt-2 lg:max-w-[1400px] lg:px-10 xl:max-w-[1600px] xl:px-12 2xl:max-w-[1800px] animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full border-t border-border bg-[#0f172a] px-2 pb-3 pt-2 md:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <ul className="flex items-center justify-between">
          {tabs.map((t) => {
            const active = isActive(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to} className="flex-1">
                <Link
                  to={t.to}
                  className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${active ? "text-indigo-400" : "text-slate-500"}`}
                >
                  <span
                    className={`flex h-9 w-12 items-center justify-center rounded-full transition-all ${active ? "bg-indigo-500/20 text-indigo-400" : ""}`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
