import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notificationText } from '../notifications';
import { readFileSync } from 'node:fs';

test('museum names remain user authored while surrounding notification is localized', () => {
  const es = JSON.parse(readFileSync(new URL('../locales/es.json', import.meta.url), 'utf8'));
  const text = notificationText({ id: 'n1', kind: 'museum_published', data: { title: 'My Radio Museum' }, read_at: null, created_at: '2026-10-31T07:39:00Z' }, (key, values) => es[key].replace('{title}', values?.title));
  assert.equal(text, 'Tu museo es público: My Radio Museum');
});