import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const steps = [
  { target: 'nav', title: 'Your curator menu', body: 'Move between your overview, museums, settings, notifications and plans from here.' },
  { target: 'checklist', title: 'Your progress', body: 'Follow these steps to open your museum to the world. They tick themselves as you go.' },
  { target: 'museums', title: 'Your museums', body: 'Create museums, choose which sections visitors see and catalogue your objects.' },
  { target: 'help', title: 'Need help?', body: 'The help centre answers the most common questions. You can restart this tour from your overview at any time.' },
] as const;

export function ProductTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  useEffect(() => { if (open) setIndex(0); }, [open]);
  useEffect(() => {
    if (!open) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${(steps[index] ?? steps[0]).target}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background', 'rounded-md');
    return () => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background', 'rounded-md');
  }, [open, index]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const step = steps[index] ?? steps[0];
  const last = index === steps.length - 1;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="tour-title" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-lg sm:left-auto sm:right-6">
      <p className="text-xs text-muted-foreground">{t('Step {current} of {total}', { current: index + 1, total: steps.length })}</p>
      <h2 id="tour-title" className="mt-1 font-display text-xl">{t(step.title)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t(step.body)}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{t('Skip tour')}</Button>
        <div className="flex gap-2">
          {index > 0 && <Button variant="outline" size="sm" onClick={() => setIndex(i => i - 1)}>{t('Back')}</Button>}
          <Button size="sm" onClick={() => (last ? onClose() : setIndex(i => i + 1))}>{last ? t('Finish') : t('Next')}</Button>
        </div>
      </div>
    </div>
  );
}
