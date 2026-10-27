import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Landmark, Settings } from "lucide-react";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/_authenticated/dashboard")({
    head: () => ({
        meta: [
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { title: "Curator dashboard — MyOwnMuseum" },
            {
                name: "description",
                content: "Manage your digital museums, catalogue new objects and edit your curator profile.",
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
    { to: "/dashboard/plans", label: "Plans", icon: Landmark },
] as const;
function DashboardLayout() {
    const { t } = useI18n();
    const { currentUser, ready } = useStore();
    if (!currentUser) {
        return (<div className="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-muted-foreground sm:px-6">{t("Loading your dashboard\u2026")}</div>);
    }
    return (<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{t("Curator tools")}</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{t("Welcome back, ")}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>);
}
