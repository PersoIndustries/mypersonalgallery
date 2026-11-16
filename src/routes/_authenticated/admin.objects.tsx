import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { matchesQuery } from '@/lib/admin-content';
import { adminDeleteObject, adminSetObjectVisible } from '@/lib/admin-content.functions';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { adminContentOptions, DeleteButton, FilterChips, fmtDate, SectionHeader, tableWrap, td, th, useRefreshAdmin } from '@/components/admin/moderation';

export const Route = createFileRoute('/_authenticated/admin/objects')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminContentOptions),
  head: () => ({ meta: [{ title: 'Objects — MyOwnMuseum Admin' }, { name: 'description', content: 'Moderate catalogue objects.' }, { property: 'og:title', content: 'Objects — MyOwnMuseum Admin' }, { property: 'og:description', content: 'Moderate catalogue objects.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: ObjectsAdmin,
});

type Filter = 'all' | 'visible' | 'hidden';
function ObjectsAdmin() {
  const { t } = useI18n();
  const { data } = useSuspenseQuery(adminContentOptions);
  const refresh = useRefreshAdmin();
  const del = useServerFn(adminDeleteObject);
  const setVisible = useServerFn(adminSetObjectVisible);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const rows = useMemo(() => data.objects.filter((o) => matchesQuery(q, o.title, o.museumTitle) && (filter === 'all' || (filter === 'visible' && o.isVisible) || (filter === 'hidden' && !o.isVisible))), [data.objects, q, filter]);
  return (<div className="space-y-5">
    <SectionHeader title="Objects" count={rows.length} query={q} onQuery={setQ}><FilterChips value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }]} /></SectionHeader>
    <div className={tableWrap}><table className="w-full text-sm">
      <thead className="border-b border-border"><tr><th className={th}>{t('Object')}</th><th className={th}>{t('Museum')}</th><th className={th}>{t('Created')}</th><th className={th}>{t('Visible')}</th><th className={th} /></tr></thead>
      <tbody className="divide-y divide-border">{rows.map((o) => (<tr key={o.id} className="hover:bg-muted/40">
        <td className={td}><div className="flex items-center gap-3"><img src={o.image || '/placeholder-object.svg'} alt="" className="size-10 shrink-0 rounded object-cover bg-muted" loading="lazy" /><p className="font-medium">{o.title}</p></div></td>
        <td className={td}>{o.museumTitle}</td>
        <td className={`${td} text-muted-foreground`}>{fmtDate(o.createdAt)}</td>
        <td className={td}><Switch checked={o.isVisible} aria-label={t('Visible')} onCheckedChange={async (v) => { try { await setVisible({ data: { id: o.id, isVisible: v } }); await refresh(); } catch { toast.error(t('Unable to update object')); } }} /></td>
        <td className={`${td} text-right`}><div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" aria-label={t('Open object')}><Link to="/o/$objectId" params={{ objectId: o.id }}><ExternalLink className="size-4" /></Link></Button>
          <DeleteButton title={t('Delete object {name}?', { name: o.title })} description={<p>{t('The object and its uploaded photos will be removed from {museum}.', { museum: o.museumTitle })}</p>} onConfirm={async () => { await del({ data: { id: o.id } }); await refresh(); }} />
        </div></td>
      </tr>))}{rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">{t('No results')}</td></tr> : null}</tbody>
    </table></div>
  </div>);
}
