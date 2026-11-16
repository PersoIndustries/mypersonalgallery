import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractImagePaths, matchesQuery, withoutObjectInCollections } from '../admin-content';

const p = '11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222.webp';
test('finds uploaded photo paths once, ignores external URLs', () => {
  assert.deepEqual(extractImagePaths({ images: [`/api/public/images/${p}`, `/api/public/images/${p}`, 'https://x.com/a.jpg'] }), [p]);
});
test('deleted object leaves every collection', () => {
  assert.deepEqual(withoutObjectInCollections([{ objectIds: ['a', 'b'] }, { objectIds: ['b'] }], 'b'), [{ objectIds: ['a'] }, { objectIds: [] }]);
});
test('search matches any field', () => {
  assert.equal(matchesQuery('carl', 'x', 'Carlos'), true);
  assert.equal(matchesQuery('zzz', 'Carlos'), false);
});
