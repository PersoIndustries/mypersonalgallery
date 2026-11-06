import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patchById, rollbackById } from '../optimistic';

test('a visibility switch changes immediately', () => {
  const original = [{ id: 'object-1', isVisible: true }];
  const updated = patchById(original, 'object-1', { isVisible: false });
  assert.equal(updated[0]?.isVisible, false);
  assert.equal(original[0]?.isVisible, true);
});

test('a failed switch rolls back to its previous value', () => {
  const original = [{ id: 'object-1', isVisible: true }];
  const attempted = { isVisible: false };
  const updated = patchById(original, 'object-1', attempted);
  assert.deepEqual(rollbackById(updated, 'object-1', attempted, original[0]!), original);
});

test('a failed save does not overwrite a newer change', () => {
  const previous = { id: 'museum-1', isPublic: true, title: 'Before' };
  const attempted = { isPublic: false, title: 'Attempted' };
  const current = [{ ...previous, ...attempted, title: 'Newer edit' }];
  const restored = rollbackById(current, previous.id, attempted, previous);
  assert.equal(restored[0]?.isPublic, true);
  assert.equal(restored[0]?.title, 'Newer edit');
});
