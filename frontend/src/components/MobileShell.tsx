import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, ShoppingBag, Repeat2, MapPin, User, Zap, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { IncomingOrderPopup } from "./IncomingOrderPopup";
import { GlobalFloatingCart } from "./GlobalFloatingCart";
import { CustomLogo } from "@/components/Logo";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/store", label: "Store", icon: ShoppingBag },
  { to: "/lend", label: "Lend & Borrow", icon: Repeat2 },
  { to: "/track", label: "Track", icon: MapPin },
  { to: "/profile", label: "Me", icon: User },
] as const;

export function MobileShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  // Hide global floating cart on dashboard, detail, and lend-related pages
  const hideFloatingCart = path === "/" || path === "/dashboard" || path.startsWith("/merchant") || path === "/cart" || path.startsWith("/product") || path.startsWith("/lend");
  const hideMobileNav = path === "/cart" || path.startsWith("/product") || path.startsWith("/lend");

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:h-screen md:w-[240px] md:shrink-0 md:flex-col md:border-r md:border-black md:bg-card md:px-4 md:py-6 lg:w-[280px]">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
            <CustomLogo className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold tracking-tight">UniDrop</span>
        </Link>
        <nav className="mt-8 flex-1 space-y-2">
          {tabs.map((t) => {
            const active = isActive(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: active ? "var(--color-primary)" : "transparent",
                  color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                }}
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.4} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:min-w-0 md:pl-[240px] lg:pl-[280px]">
        <div className="mx-auto w-full max-w-[480px] pb-28 md:max-w-[1240px] md:px-8 md:pb-12 md:pt-3 sm:max-w-[640px] animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>
      </div>

      {/* Global floating cart (hidden on cart page) */}
      {!hideFloatingCart && <GlobalFloatingCart />}

      {/* Mobile bottom nav */}
      {!hideMobileNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] sm:max-w-[640px] border-t border-border bg-card/95 px-2 pb-3 pt-2 backdrop-blur-lg md:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
          <ul className="flex items-center justify-between gap-1">
            {tabs.map((t) => {
              const active = isActive(t.to);
              const Icon = t.icon;
              return (
                <li key={t.to} className="flex-1">
                  <Link
                    to={t.to}
                    aria-current={active ? "page" : undefined}
                    className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition-all duration-200"
                    style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                      style={{
                        background: active ? "var(--color-brand)" : "transparent",
                        color: active ? "var(--color-brand-foreground)" : "inherit",
                      }}
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
      )}
      <IncomingOrderPopup />
    </div>
  );
}
