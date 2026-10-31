import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { countryFromLocale, onboardingChecklist, onboardingSchema, shouldSuggestUpgrade, suggestUsername } from '../onboarding';

const base = { bio: '', avatar: '', museums: 0, objects: 0, publicMuseums: 0, state: {} };

test('username suggestion strips accents and spaces', () => {
  assert.equal(suggestUsername('José Pérez Núñez'), 'jose-perez-nunez');
  assert.equal(suggestUsername('Al'), 'al-curator');
  assert.match(suggestUsername('A'.repeat(80)), /^[a-z0-9_-]{3,40}$/);
});

test('country comes from browser region only when allowed', () => {
  assert.equal(countryFromLocale('es-ES', ['ES', 'FR']), 'ES');
  assert.equal(countryFromLocale('en', ['ES']), '');
  assert.equal(countryFromLocale('xx-ZZ', ['ES']), '');
});

test('checklist starts at 0% and reaches 100% with five required steps; plans are optional', () => {
  assert.equal(onboardingChecklist(base).percent, 0);
  const done = onboardingChecklist({ bio: 'hi', avatar: '', museums: 1, objects: 3, publicMuseums: 1, state: { shared: true } });
  assert.equal(done.percent, 100);
  assert.equal(done.complete, true);
  assert.equal(done.steps.find(s => s.id === 'plans')?.done, false);
});

test('three objects are required for the catalogue step', () => {
  assert.equal(onboardingChecklist({ ...base, objects: 2 }).steps.find(s => s.id === 'objects')?.done, false);
});

test('upgrade prompt appears at 3 museums or 50 objects', () => {
  assert.equal(shouldSuggestUpgrade(2, 49), false);
  assert.equal(shouldSuggestUpgrade(3, 0), true);
  assert.equal(shouldSuggestUpgrade(0, 50), true);
});

test('onboarding state rejects unknown fields like roles', () => {
  assert.deepEqual(onboardingSchema.parse({ shared: true, role: 'admin' }), { shared: true });
});

test('anonymous visitors cannot read the onboarding funnel', async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  assert.ok(url); assert.ok(key);
  const c = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await c.rpc('admin_onboarding_funnel' as never);
  assert.ok(error);
  assert.equal(data, null);
});
