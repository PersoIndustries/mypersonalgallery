import { Link } from '@tanstack/react-router';
import { ArrowRight, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export function CreateMuseumCta() {
  const { t } = useI18n();
  return (
    <aside className="flex flex-col items-start gap-4 rounded-lg border border-primary/30 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Landmark className="mt-1 size-6 shrink-0 text-primary" />
        <div>
          <p className="font-display text-xl">{t('Do you collect too?')}</p>
          <p className="text-sm text-muted-foreground">{t('Create your own digital museum for free in a few minutes.')}</p>
        </div>
      </div>
      <Button asChild><Link to="/auth" search={{ mode: 'signup' }}>{t('Create my museum')}<ArrowRight className="size-4" /></Link></Button>
    </aside>
  );
}
