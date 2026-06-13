import { Link } from "@tanstack/react-router";
import { ChevronLeft, Search } from "lucide-react";
import type { ReactNode } from "react";

export function TopBar({
  title,
  back = true,
  right,
  subtitle,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:static md:rounded-b-2xl md:border-b-0 md:bg-transparent md:px-0 md:py-5 md:backdrop-blur-none">
      {back && (
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold md:text-2xl md:font-bold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
      </div>
      {right ?? (
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Search className="h-4 w-4" />
        </button>
      )}
    </header>
  );
}
