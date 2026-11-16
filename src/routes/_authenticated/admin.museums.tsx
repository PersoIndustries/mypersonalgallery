import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { matchesQuery } from '@/lib/admin-content';
import { adminDeleteMuseum, adminSetMuseumPublic } from '@/lib/admin-content.functions';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { adminContentOptions, DeleteButton, FilterChips, fmtDate, SectionHeader, tableWrap, td, th, useRefreshAdmin } from '@/components/admin/moderation';

export const Route = createFileRoute('/_authenticated/admin/museums')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminContentOptions),
  head: () => ({ meta: [{ title: 'Museums — MyOwnMuseum Admin' }, { name: 'description', content: 'Moderate museums.' }, { property: 'og:title', content: 'Museums — MyOwnMuseum Admin' }, { property: 'og:description', content: 'Moderate museums.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: MuseumsAdmin,
});

type Filter = 'all' | 'public' | 'private' | 'empty';
function MuseumsAdmin() {
  const { t } = useI18n();
  const { data } = useSuspenseQuery(adminContentOptions);
  const refresh = useRefreshAdmin();
  const del = useServerFn(adminDeleteMuseum);
  const setPublic = useServerFn(adminSetMuseumPublic);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const rows = useMemo(() => data.museums.filter((m) => matchesQuery(q, m.title, m.slug, m.ownerName) && (filter === 'all' || (filter === 'public' && m.isPublic) || (filter === 'private' && !m.isPublic) || (filter === 'empty' && m.objects === 0))), [data.museums, q, filter]);
  return (<div className="space-y-5">
    <SectionHeader title="Museums" count={rows.length} query={q} onQuery={setQ}><FilterChips value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }, { value: 'empty', label: 'Empty' }]} /></SectionHeader>
    <div className={tableWrap}><table className="w-full text-sm">
      <thead className="border-b border-border"><tr><th className={th}>{t('Museum')}</th><th className={th}>{t('Owner')}</th><th className={th}>{t('Objects')}</th><th className={th}>{t('Created')}</th><th className={th}>{t('Public')}</th><th className={th} /></tr></thead>
      <tbody className="divide-y divide-border">{rows.map((m) => (<tr key={m.id} className="hover:bg-muted/40">
        <td className={td}><div className="flex items-center gap-3"><img src={m.cover || '/placeholder-object.svg'} alt="" className="size-10 shrink-0 rounded object-cover bg-muted" loading="lazy" /><div className="min-w-0"><p className="font-medium">{m.title}</p><p className="font-mono text-xs text-muted-foreground">/{m.slug}</p></div></div></td>
        <td className={td}>{m.ownerName}</td>
        <td className={`${td} tabular-nums`}>{m.objects}</td>
        <td className={`${td} text-muted-foreground`}>{fmtDate(m.createdAt)}</td>
        <td className={td}><Switch checked={m.isPublic} aria-label={t('Public')} onCheckedChange={async (v) => { try { await setPublic({ data: { id: m.id, isPublic: v } }); await refresh(); toast.success(v ? t('Museum published') : t('Museum made private')); } catch { toast.error(t('Unable to update museum')); } }} /></td>
        <td className={`${td} text-right`}><div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" aria-label={t('Open museum')}><Link to="/dashboard/museum/$museumId" params={{ museumId: m.id }}><ExternalLink className="size-4" /></Link></Button>
          <DeleteButton title={t('Delete museum {name}?', { name: m.title })} confirmText={m.slug} description={<p>{t('This museum contains {n} objects that will also be deleted, together with their photos.', { n: m.objects })}</p>} onConfirm={async () => { await del({ data: { id: m.id } }); await refresh(); }} />
        </div></td>
      </tr>))}{rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">{t('No results')}</td></tr> : null}</tbody>
    </table></div>
  </div>);
}
