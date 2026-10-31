import { Link } from '@tanstack/react-router';
import { CheckCircle2, Circle, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/lib/i18n';
import { onboardingChecklist } from '@/lib/onboarding';
import { useOnboarding } from '@/lib/use-onboarding';
import type { User } from '@/lib/types';

const targets = { profile: '/dashboard/settings', museum: '/dashboard/welcome', objects: '/dashboard/museums', publish: '/dashboard/museums', share: '/dashboard/welcome', plans: '/dashboard/plans' } as const;

export function OnboardingChecklist({ user, museums, objects, publicMuseums, onStartTour }: { user: User; museums: number; objects: number; publicMuseums: number; onStartTour: () => void }) {
  const { t } = useI18n();
  const { state, loaded } = useOnboarding();
  if (!loaded || !state) return null;
  const { steps, percent, complete } = onboardingChecklist({ bio: user.bio ?? '', avatar: user.avatar ?? '', museums, objects, publicMuseums, state });
  if (complete && state.plansSeen) return null;
  return (
    <section className="rounded-lg border border-primary/30 bg-card p-5" aria-labelledby="getting-started">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="getting-started" className="font-display text-2xl">{t('Getting started')}</h2>
        <Button variant="outline" size="sm" onClick={onStartTour}><Compass className="size-4" />{t('Take the tour')}</Button>
      </div>
      <div className="mt-3 flex items-center gap-3"><Progress value={percent} className="h-2" aria-label={t('Progress')} /><span className="text-sm text-muted-foreground">{percent}%</span></div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map(s => (
          <li key={s.id}>
            <Link to={targets[s.id]} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
              {s.done ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}
              <span className={s.done ? 'text-muted-foreground line-through' : ''}>{t(s.label)}</span>
              {s.optional && <span className="text-xs text-muted-foreground">{t('(optional)')}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
