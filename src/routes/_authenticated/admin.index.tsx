import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { users, museums, objects } = useStore();
  const stats = [
    { label: "Users", value: users.length },
    { label: "Museums", value: museums.length },
    { label: "Public museums", value: museums.filter((m) => m.isPublic).length },
    { label: "Objects", value: objects.length },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-4xl">{s.value}</p>
          </div>
        ))}
      </div>
      <Button asChild>
        <Link to="/admin/dev">Open dev backlog</Link>
      </Button>
    </div>
  );
}
