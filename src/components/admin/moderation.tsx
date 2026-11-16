import { useState, type ReactNode } from 'react';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { listAdminContent } from '@/lib/admin-content.functions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const adminContentOptions = queryOptions({ queryKey: ['admin-content'], queryFn: () => listAdminContent(), staleTime: 30000 });

export function useRefreshAdmin() {
  const client = useQueryClient();
  return () => Promise.all([client.invalidateQueries({ queryKey: ['admin-content'] }), client.invalidateQueries({ queryKey: ['admin-metrics'] }), client.invalidateQueries({ queryKey: ['public-catalog'] })]);
}

export function SectionHeader({ title, count, query, onQuery, children }: { title: string; count: number; query: string; onQuery: (v: string) => void; children?: ReactNode }) {
  const { t } = useI18n();
  return (<div className="flex flex-wrap items-end justify-between gap-4">
    <div><h2 className="font-display text-3xl">{t(title)}</h2><p className="mt-1 text-sm text-muted-foreground">{t('{n} results', { n: count })}</p></div>
    <div className="flex flex-wrap items-center gap-2">{children}
      <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder={t('Search…')} aria-label={t('Search…')} className="w-64 pl-9" /></label>
    </div>
  </div>);
}

export function FilterChips<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const { t } = useI18n();
  return (<div className="flex rounded-md border border-border p-0.5">{options.map((o) => <button key={o.value} type="button" onClick={() => onChange(o.value)} className={`rounded px-3 py-1.5 text-xs ${value === o.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t(o.label)}</button>)}</div>);
}

/** Destructive confirmation; when confirmText is set the admin must type it. */
export function DeleteButton({ title, description, confirmText, onConfirm, disabled }: { title: string; description: ReactNode; confirmText?: string; onConfirm: () => Promise<void>; disabled?: boolean }) {
  const { t } = useI18n();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const ok = !confirmText || typed.trim() === confirmText;
  return (<AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTyped(''); }}>
    <AlertDialogTrigger asChild><Button size="icon" variant="ghost" disabled={disabled} aria-label={t('Delete')} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription asChild><div className="space-y-2 text-sm text-muted-foreground">{description}<p className="font-medium text-destructive">{t('This action cannot be undone.')}</p></div></AlertDialogDescription></AlertDialogHeader>
      {confirmText ? <div className="space-y-1.5"><p className="text-sm">{t('Type {text} to confirm', { text: confirmText })}</p><Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" /></div> : null}
      <AlertDialogFooter><AlertDialogCancel disabled={busy}>{t('Cancel')}</AlertDialogCancel>
        <AlertDialogAction disabled={!ok || busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async (e) => { e.preventDefault(); setBusy(true); try { await onConfirm(); toast.success(t('Deleted')); setOpen(false); } catch (err) { toast.error(t(err instanceof Error ? err.message : 'Unable to delete')); } finally { setBusy(false); } }}>{busy ? t('Deleting…') : t('Delete permanently')}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>);
}

export const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');
export const tableWrap = 'overflow-x-auto rounded-lg border border-border bg-card';
export const th = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground';
export const td = 'px-4 py-3 align-middle';
