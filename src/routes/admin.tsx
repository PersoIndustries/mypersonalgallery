import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Code2, Shield } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — MyOwnMuseum" },
      { name: "description", content: "Platform administration for MyOwnMuseum." },
      { property: "og:title", content: "Admin — MyOwnMuseum" },
      { property: "og:description", content: "Platform administration for MyOwnMuseum." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { currentUser, ready } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !currentUser) navigate({ to: "/auth" });
  }, [ready, currentUser, navigate]);

  if (!currentUser) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Platform control room</h1>
      <nav className="mt-6 flex gap-1 border-b border-border pb-2">
        <Link
          to="/admin"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-primary/12 text-primary" }}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <Shield className="size-4" /> Overview
        </Link>
        <Link
          to="/admin/dev"
          activeProps={{ className: "bg-primary/12 text-primary" }}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <Code2 className="size-4" /> Dev
        </Link>
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
