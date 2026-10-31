import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminMetrics } from '@/lib/platform.functions';
import { RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getOnboardingFunnel } from '@/lib/onboarding.functions';
const options = queryOptions({ queryKey: ['admin-metrics'], queryFn: () => getAdminMetrics(), staleTime: 60000 });
export const Route = createFileRoute("/_authenticated/admin/")({
    loader: ({ context }) => context.queryClient.ensureQueryData(options),
    head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Platform overview — MyOwnMuseum" }, { name: "description", content: "Platform overview." }, { property: "og:title", content: "Platform overview — MyOwnMuseum" }, { property: "og:description", content: "Platform overview." }, { name: "robots", content: "noindex" }] }),
    component: AdminOverview,
});
function AdminOverview() {
    const { t } = useI18n();
    const { data } = useSuspenseQuery(options);
    const client = useQueryClient();
    const stats = [
        { label: "Accounts", value: data.accounts },
        { label: "New accounts · 30 days", value: data.new_accounts_30d },
        { label: "Museums", value: data.museums },
        { label: "Public museums", value: data.public_museums },
        { label: "Objects", value: data.objects },
        { label: "Open incidents", value: data.open_errors },
        { label: "Incidents · 7 days", value: data.errors_7d },
        { label: "Open dev tasks", value: data.open_tasks },
    ];
    return (<div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="font-display text-3xl">{t("Platform overview")}</h2><Button variant="ghost" size="icon" aria-label={t("Refresh metrics")} onClick={() => void client.invalidateQueries({ queryKey: ['admin-metrics'] })}><RefreshCw className="size-4"/></Button></div>
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (<div key={t(s.label)} className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t(s.label)}</p>
            <p className="mt-2 font-display text-4xl">{s.value}</p>
          </div>))}
      </div>
      <section className="space-y-4 border-y border-border py-6"><h3 className="font-display text-2xl">{t("Monetization")}</h3><p className="text-sm text-muted-foreground">{t("Payments inactive \u00B7 plan selections are expressions of interest, not subscriptions.")}</p><dl className="grid gap-4 sm:grid-cols-3"><div><dt className="text-muted-foreground">{t("Active paid subscriptions")}</dt><dd className="text-2xl">{t('Not available')}</dd></div><div><dt className="text-muted-foreground">{t("Monthly recurring revenue")}</dt><dd>{t('Not available')}</dd></div><div><dt className="text-muted-foreground">{t("Plan interest")}</dt><dd>{Object.entries(data.plan_interests).map(([plan, count]) => <p key={plan}>{plan}{t(": ")}{count}</p>)}{Object.keys(data.plan_interests).length === 0 ? t("No selections yet") : null}</dd></div></dl><Button asChild variant="outline" className="mt-4"><Link to="/admin/billing">{t('Billing administration')}</Link></Button></section>
      <OnboardingFunnelSection/>
      <section><h3 className="font-display text-2xl">{t("Countries of origin")}</h3><div className="mt-3 flex flex-wrap gap-4 text-sm">{Object.entries(data.countries).map(([code, count]) => <p key={code}>{new Intl.DisplayNames(['en'], { type: 'region' }).of(code)}{t(": ")}{count}</p>)}{Object.keys(data.countries).length === 0 ? <p className="text-muted-foreground">{t("No country data yet.")}</p> : null}</div></section>
      <Button asChild>
        <Link to="/admin/dev">{t("Open dev backlog")}</Link>
      </Button>
    </div>);
}

function OnboardingFunnelSection() {
    const { t } = useI18n();
    const { data, isError } = useQuery({ queryKey: ['admin-funnel'], queryFn: () => getOnboardingFunnel(), staleTime: 60000 });
    const rows = data ? [
        { label: 'Sign-ups', value: data.signups },
        { label: 'Email confirmed', value: data.confirmed },
        { label: 'First museum', value: data.first_museum },
        { label: 'First object', value: data.first_object },
        { label: 'Published', value: data.published },
        { label: 'Shared', value: data.shared },
        { label: 'Plans seen', value: data.plans_seen },
    ] : [];
    const base = data?.signups || 0;
    return (<section className="space-y-4 border-b border-border pb-6"><h3 className="font-display text-2xl">{t("New user funnel")}</h3>
      {isError ? <p className="text-sm text-destructive">{t("Unable to load funnel")}</p> : !data ? <p className="text-sm text-muted-foreground">{t("Loading…")}</p> : <ul className="space-y-2">{rows.map(r => {
            const pct = base ? Math.round((r.value / base) * 100) : 0;
            return <li key={r.label} className="grid grid-cols-[10rem_1fr_5rem] items-center gap-3 text-sm"><span>{t(r.label)}</span><span className="h-2 rounded-full bg-muted"><span className="block h-2 rounded-full bg-primary" style={{ width: `${pct}%` }}/></span><span className="text-right tabular-nums">{r.value} · {pct}%</span></li>;
        })}</ul>}
      <p className="text-xs text-muted-foreground">{t("Counts accounts with a login; demo curators are excluded.")}</p>
    </section>);
}
