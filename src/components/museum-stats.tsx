import { queryOptions, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { Clock, Eye, Lock, MoonStar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';
import { getMuseumStats } from '@/lib/metrics.functions';

function fmt(s: number) { const m = Math.floor(s / 60); return m ? `${m} min ${s % 60} s` : `${s} s`; }

export function MuseumStats({ museumId }: { museumId: string }) {
  const { t } = useI18n();
  const fn = useServerFn(getMuseumStats);
  const { data, isLoading } = useQuery(queryOptions({ queryKey: ['museum-stats', museumId], queryFn: () => fn({ data: { museumId } }), staleTime: 60_000 }));
  if (isLoading || !data) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{t('Loading…')}</CardContent></Card>;
  const view = data.locked ? { total: 128, last7: 34, avgSeconds: 192, days: [3, 5, 4, 7, 6, 4, 5].map((v, i) => ({ day: String(i), views: v })) } : data;
  const max = Math.max(1, ...view.days.map((d) => d.views));
  return (<Card className="relative overflow-hidden">
    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="size-4" />{t('Museum statistics')}</CardTitle><CardDescription>{t('Visits and average visit time of your public museum.')}</CardDescription></CardHeader>
    <CardContent className={data.locked ? 'pointer-events-none select-none blur-sm' : ''} aria-hidden={data.locked}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Eye} label={t('Total visits')} value={String(view.total)} />
        <Stat icon={TrendingUp} label={t('Last 7 days')} value={String(view.last7)} />
        <Stat icon={Clock} label={t('Average visit time')} value={fmt(view.avgSeconds)} />
      </div>
      <div className="mt-6 flex h-28 items-end gap-2">{view.days.map((d) => <div key={d.day} className="flex-1 rounded-t bg-primary/60" style={{ height: `${Math.max(4, (d.views / max) * 100)}%` }} title={`${d.day}: ${d.views}`} />)}</div>
    </CardContent>
    {data.locked && (<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 p-6 text-center backdrop-blur-[2px]">
      <div className="flex size-11 items-center justify-center rounded-full border border-primary/40 bg-primary/10"><Lock className="size-5 text-primary" /></div>
      <p className="max-w-sm text-sm">{t('Discover how many people visit your sanctuary and how long they admire your treasures.')}</p>
      <Button asChild><Link to="/dashboard/plans"><MoonStar className="size-4" />{t('Unlock with Moon Collector Pro')}</Link></Button>
    </div>)}
  </Card>);
}
function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return <div className="rounded-lg border border-border bg-muted/30 p-4"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</p><p className="mt-1 font-display text-2xl tabular-nums">{value}</p></div>;
}
