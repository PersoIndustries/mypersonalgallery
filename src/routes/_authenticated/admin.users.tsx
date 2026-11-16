import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Ban, ShieldCheck, Undo2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { matchesQuery } from '@/lib/admin-content';
import { adminDeleteUser, adminSetUserBanned } from '@/lib/admin-content.functions';
import { adminSetUserPlan } from '@/lib/metrics.functions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminContentOptions, DeleteButton, FilterChips, fmtDate, SectionHeader, tableWrap, td, th, useRefreshAdmin } from '@/components/admin/moderation';

export const Route = createFileRoute('/_authenticated/admin/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminContentOptions),
  head: () => ({ meta: [{ title: 'Collectors — Moon Collector Admin' }, { name: 'description', content: 'Manage collector accounts.' }, { property: 'og:title', content: 'Collectors — Moon Collector Admin' }, { property: 'og:description', content: 'Manage collector accounts.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: UsersAdmin,
});

type Filter = 'all' | 'accounts' | 'demo' | 'suspended';
function UsersAdmin() {
  const { t } = useI18n();
  const { data } = useSuspenseQuery(adminContentOptions);
  const refresh = useRefreshAdmin();
  const del = useServerFn(adminDeleteUser);
  const ban = useServerFn(adminSetUserBanned);
  const setPlan = useServerFn(adminSetUserPlan);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const rows = useMemo(() => data.users.filter((u) => matchesQuery(q, u.name, u.username, u.email) && (filter === 'all' || (filter === 'accounts' && u.userId) || (filter === 'demo' && !u.userId) || (filter === 'suspended' && u.banned))), [data.users, q, filter]);
  return (<div className="space-y-5">
    <SectionHeader title="Collectors" count={rows.length} query={q} onQuery={setQ}><FilterChips value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'accounts', label: 'With login' }, { value: 'demo', label: 'Demo' }, { value: 'suspended', label: 'Suspended' }]} /></SectionHeader>
    <div className={tableWrap}><table className="w-full text-sm">
      <thead className="border-b border-border"><tr><th className={th}>{t('Collector')}</th><th className={th}>{t('Email')}</th><th className={th}>{t('Country')}</th><th className={th}>{t('Museums')}</th><th className={th}>{t('Objects')}</th><th className={th}>{t('Plan')}</th><th className={th}>{t('Joined')}</th><th className={th}>{t('Last sign-in')}</th><th className={th} /></tr></thead>
      <tbody className="divide-y divide-border">{rows.map((u) => {
        const self = u.userId === data.me;
        return (<tr key={u.id} className="hover:bg-muted/40">
          <td className={td}><div className="flex items-center gap-2"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">{u.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><Link to="/u/$username" params={{ username: u.username }} className="font-medium hover:underline">{u.name}</Link><p className="text-xs text-muted-foreground">@{u.username}</p></div>
            {u.isAdmin ? <Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3" />{t('Admin')}</Badge> : null}
            {u.banned ? <Badge variant="destructive">{t('Suspended')}</Badge> : null}
            {!u.userId ? <Badge variant="outline">{t('Demo')}</Badge> : null}</div></td>
          <td className={`${td} text-muted-foreground`}>{u.email ?? '—'}</td>
          <td className={td}>{u.country ?? '—'}</td>
          <td className={`${td} tabular-nums`}>{u.museums}</td>
          <td className={`${td} tabular-nums`}>{u.objects}</td>
          <td className={td}>{u.userId ? <select aria-label={t('Plan')} className="rounded-md border border-border bg-background px-2 py-1 text-sm capitalize" value={u.plan} onChange={async (e) => { const plan = e.target.value as 'free' | 'pro' | 'studio'; try { await setPlan({ data: { userId: u.userId!, plan } }); await refresh(); toast.success(t('Plan updated')); } catch (err) { toast.error(t(err instanceof Error ? err.message : 'Unable to update plan')); } }}><option value="free">Free</option><option value="pro">Pro</option><option value="studio">Studio</option></select> : '—'}</td>
          <td className={`${td} text-muted-foreground`}>{fmtDate(u.createdAt)}</td>
          <td className={`${td} text-muted-foreground`}>{fmtDate(u.lastSignIn)}</td>
          <td className={`${td} text-right`}><div className="flex justify-end gap-1">
            {u.userId && !u.isAdmin && !self ? <Button size="icon" variant="ghost" aria-label={u.banned ? t('Reactivate') : t('Suspend')} title={u.banned ? t('Reactivate') : t('Suspend and make museums private')} onClick={async () => { try { await ban({ data: { userId: u.userId!, banned: !u.banned } }); await refresh(); toast.success(u.banned ? t('Account reactivated') : t('Account suspended')); } catch (e) { toast.error(t(e instanceof Error ? e.message : 'Unable to update account')); } }}>{u.banned ? <Undo2 className="size-4" /> : <Ban className="size-4" />}</Button> : null}
            <DeleteButton disabled={u.isAdmin || self} title={t('Delete collector {name}?', { name: u.name })} confirmText={u.username}
              description={<><p>{t('This removes the profile, {m} museums and {o} objects, their photos, notifications and plan data.', { m: u.museums, o: u.objects })}</p>{u.userId ? <p>{t('The login account will also be deleted.')}</p> : null}</>}
              onConfirm={async () => { await del({ data: { profileId: u.id } }); await refresh(); }} />
          </div></td>
        </tr>);
      })}{rows.length === 0 ? <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">{t('No results')}</td></tr> : null}</tbody>
    </table></div>
  </div>);
}
