import { useI18n } from '@/lib/i18n';
import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminErrors, resolveAdminError } from '@/lib/platform.functions';
const options = queryOptions({ queryKey: ['admin-errors'], queryFn: () => getAdminErrors(), staleTime: 30000 });
export const Route = createFileRoute('/_authenticated/admin/errors')({ loader: ({ context }) => context.queryClient.ensureQueryData(options), head: () => ({ meta: [{ title: 'Error diagnostics — MyOwnMuseum Admin' }, { name: 'description', content: 'Private platform error diagnostics.' }, { property: 'og:title', content: 'Error diagnostics — MyOwnMuseum Admin' }, { property: 'og:description', content: 'Administrator-only incident review.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }), component: Diagnostics });
function Diagnostics() { const { t } = useI18n(); const { data } = useSuspenseQuery(options); const resolve = useServerFn(resolveAdminError); const client = useQueryClient(); return <div className="space-y-5"><div className="flex items-center justify-between"><h2 className="font-display text-3xl">{t("Diagnostics")}</h2><Button variant="ghost" size="icon" aria-label={t("Refresh diagnostics")} onClick=><RefreshCw className="size-4"/></Button></div><p className="text-sm text-muted-foreground">{t("Latest 100 incidents \u00B7 signed-in accounts \u00B7 category, page and fingerprint only. No passwords, form values or raw error messages are stored.")}</p></div>; }
