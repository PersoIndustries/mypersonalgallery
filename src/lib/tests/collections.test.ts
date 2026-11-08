import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCollection, addTag, cleanSpecs, objectsInCollection, toggleId } from '../collections';
import type { CollectionObject } from '../types';

test('tags are added one by one without duplicates', () => {
  assert.deepEqual(addTag(['WWII'], ' portable '), ['WWII', 'portable']);
  assert.deepEqual(addTag(['WWII'], 'wwii'), ['WWII']);
  assert.deepEqual(addTag(['WWII'], '  '), ['WWII']);
});

test('empty specification rows are discarded', () => {
  assert.deepEqual(cleanSpecs([{ key: 'Weight', value: '2 kg' }, { key: ' ', value: '' }]), [{ key: 'Weight', value: '2 kg' }]);
});

test('one object can belong to several collections', () => {
  const ids = toggleId(toggleId([], 'radios'), 'wwii');
  const o = { id: 'o1', collectionIds: ids } as CollectionObject;
  assert.equal(objectsInCollection([o], 'radios').length, 1);
  assert.equal(objectsInCollection([o], 'wwii').length, 1);
  assert.deepEqual(toggleId(ids, 'radios'), ['wwii']);
});

test('collection names must be unique within a museum', () => {
  const list = addCollection([], 'Radios', 'a');
  assert.equal(addCollection(list, 'radios', 'b'), list);
});
