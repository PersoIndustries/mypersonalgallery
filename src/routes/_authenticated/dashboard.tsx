import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Landmark, Settings } from "lucide-react";

import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Curator dashboard — MyOwnMuseum" },
      {
        name: "description",
        content:
          "Manage your digital museums, catalogue new objects and edit your curator profile.",
      },
      { property: "og:title", content: "Curator dashboard — MyOwnMuseum" },
      {
        property: "og:description",
        content: "Manage museums, objects and your public curator profile.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/museums", label: "Museums", icon: Landmark },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const { currentUser, ready } = useStore();


  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Curator tools</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        Welcome back, {currentUser.name.split(" ")[0]}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/dashboard" }}
              activeProps={{ className: "bg-primary/12 text-primary" }}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
