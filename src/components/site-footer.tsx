import { Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25">
              <Landmark className="size-4" />
            </span>
            <span className="font-display text-lg">
              MyOwn<span className="text-primary">Museum</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A home for private collections. Catalogue your objects with the care of a curator
            and share them with the world.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div className="space-y-3">
            <p className="eyebrow">Discover</p>
            <Link to="/explore" className="block text-muted-foreground hover:text-foreground">
              Museums
            </Link>
            <Link
              to="/explore"
              search={{ tab: "collectors" }}
              className="block text-muted-foreground hover:text-foreground"
            >
              Collectors
            </Link>
            <Link
              to="/explore"
              search={{ tab: "objects" }}
              className="block text-muted-foreground hover:text-foreground"
            >
              Objects
            </Link>
          </div>
          <div className="space-y-3">
            <p className="eyebrow">Curate</p>
            <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link
              to="/dashboard/museums"
              className="block text-muted-foreground hover:text-foreground"
            >
              My museums
            </Link>
            <Link
              to="/dashboard/settings"
              className="block text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
          </div>
          <div className="space-y-3">
            <p className="eyebrow">Prototype</p>
            <p className="text-muted-foreground">
              Demo data only. Nothing you create here leaves your browser.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MyOwnMuseum — built for collectors.
      </div>
    </footer>
  );
}
