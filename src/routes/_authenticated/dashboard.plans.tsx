import { useI18n } from '@/lib/i18n';
import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getBilling, selectPlan } from '@/lib/platform.functions';
const options = queryOptions({ queryKey: ['billing'], queryFn: () => getBilling(), staleTime: 60000 });
export const Route = createFileRoute('/_authenticated/dashboard/plans')({ loader: ({ context }) => context.queryClient.ensureQueryData(options), head: () => ({ meta: [{ title: 'Museum plans — MyOwnMuseum' }, { name: 'description', content: 'Your private museum plan selection.' }, { property: 'og:title', content: 'Museum plans — MyOwnMuseum' }, { property: 'og:description', content: 'Manage your museum plan interest.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }), component: Plans });
function Plans() {
    const { t } = useI18n();
    const { data } = useSuspenseQuery(options);
    const save = useServerFn(selectPlan);
    const client = useQueryClient();
    const [busy, setBusy] = useState(false);
    return <div className="space-y-6"><h2 className="font-display text-3xl">{t("Museum plans")}</h2><p className="text-sm text-muted-foreground">{t("Current plan: ")}{data.subscription.plan}{t(". Payments are not available yet. Selecting an upcoming plan records your interest only; no charge or upgrade is applied.")}</p><div className="grid gap-4 sm:grid-cols-3">{(['free', 'pro', 'studio'] as const).map(plan => <article key={plan} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5"><h3 className="font-display text-2xl capitalize">{plan}</h3><p className="text-sm text-muted-foreground">{plan === 'free' ? t("Current museum access") : t("Coming soon \u00B7 pricing and benefits to be confirmed")}</p><Button disabled={busy || data.interest === plan} variant={data.interest === plan ? 'secondary' : 'outline'} onClick={async () => { setBusy(true); try {
        await save({ data: plan });
        await client.invalidateQueries({ queryKey: ['billing'] });
        toast.success('Plan interest saved');
    }
    catch {
        toast.error('Unable to save plan');
    }
    finally {
        setBusy(false);
    } }}>{data.interest === plan ? t("Selected") : plan === 'free' ? t("Select Free") : t("Register interest")}</Button></article>)}</div></div>;
}
