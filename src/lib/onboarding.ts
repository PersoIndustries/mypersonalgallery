import { z } from 'zod';

/** Persisted onboarding state, stored in profiles.preferences.onboarding. */
export const onboardingSchema = z.object({
  welcomed: z.boolean().optional(),
  skipped: z.boolean().optional(),
  tourDone: z.boolean().optional(),
  shared: z.boolean().optional(),
  plansSeen: z.boolean().optional(),
  interest: z.string().max(100).optional(),
});
export type Onboarding = z.infer<typeof onboardingSchema>;

/** Suggest a valid username (3–40 chars, a-z 0-9 _ -) from a full name. */
export function suggestUsername(name: string): string {
  const base = name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return base.length >= 3 ? base : base ? `${base}-curator` : '';
}

/** Two-letter country guess from a browser locale like "es-ES". */
export function countryFromLocale(locale: string | undefined, allowed: readonly string[]): string {
  const region = locale?.split(/[-_]/)[1]?.toUpperCase();
  return region && allowed.includes(region) ? region : '';
}

export type ChecklistStep = { id: 'profile' | 'museum' | 'objects' | 'publish' | 'share' | 'plans'; label: string; done: boolean; optional?: boolean };

/** Progress derived from real data; only "shared" and "plansSeen" come from stored state. */
export function onboardingChecklist(input: { bio: string; avatar: string; museums: number; objects: number; publicMuseums: number; state: Onboarding }): { steps: ChecklistStep[]; percent: number; complete: boolean } {
  const steps: ChecklistStep[] = [
    { id: 'profile', label: 'Complete your profile', done: Boolean(input.bio.trim() || input.avatar.trim()) },
    { id: 'museum', label: 'Create your first museum', done: input.museums > 0 },
    { id: 'objects', label: 'Catalogue 3 objects', done: input.objects >= 3 },
    { id: 'publish', label: 'Publish a museum', done: input.publicMuseums > 0 },
    { id: 'share', label: 'Share your museum link', done: Boolean(input.state.shared) },
    { id: 'plans', label: 'Discover the plans', done: Boolean(input.state.plansSeen), optional: true },
  ];
  const required = steps.filter(s => !s.optional);
  const percent = Math.round((required.filter(s => s.done).length / required.length) * 100);
  return { steps, percent, complete: percent === 100 };
}

/** Provisional free-plan guidance thresholds (not enforced; real limits await pricing decisions). */
export const FREE_PLAN_GUIDE = { museums: 3, objects: 50 } as const;
export function shouldSuggestUpgrade(museums: number, objects: number): boolean {
  return museums >= FREE_PLAN_GUIDE.museums || objects >= FREE_PLAN_GUIDE.objects;
}
