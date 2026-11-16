import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { assertAdmin } from "@/lib/platform.functions";
import { Activity, AlertTriangle, Boxes, Building2, Code2, CreditCard, Users } from "lucide-react";
const sections = [
    { to: "/admin", label: "Overview", icon: Activity, exact: true },
    { to: "/admin/users", label: "Collectors", icon: Users },
    { to: "/admin/museums", label: "Museums", icon: Building2 },
    { to: "/admin/objects", label: "Objects", icon: Boxes },
    { to: "/admin/billing", label: "Billing", icon: CreditCard },
    { to: "/admin/errors", label: "Diagnostics", icon: AlertTriangle },
    { to: "/admin/dev", label: "Dev", icon: Code2 },
] as { to: "/admin" | "/admin/users" | "/admin/museums" | "/admin/objects" | "/admin/billing" | "/admin/errors" | "/admin/dev"; label: string; icon: typeof Users; exact?: boolean }[];
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/_authenticated/admin")({
    beforeLoad: async () => { await assertAdmin(); },
    head: () => ({
        meta: [
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
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
    const { t } = useI18n();
    const { currentUser, ready, isAdmin } = useStore();
    if (ready && !isAdmin)
        return <div className="py-24 text-center">{t("Administrator access required.")}</div>;
    if (!currentUser) {
        return <div className="py-24 text-center text-sm text-muted-foreground">{t("Loading\u2026")}</div>;
    }
    return (<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{t("Admin")}</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{t("Platform control room")}</h1>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-2">
        {sections.map(({ to, label, icon: Icon, exact }) => (<Link key={to} to={to} activeOptions={{ exact: !!exact }} activeProps={{ className: "bg-primary/12 text-primary" }} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"><Icon className="size-4"/>{t(label)}</Link>))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>);
}
