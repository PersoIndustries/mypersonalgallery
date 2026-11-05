import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitWithin } from '../resize-image';

test('caps the longest side at 1080', () => { assert.deepEqual(fitWithin(4000, 3000), { width: 1080, height: 810 }); });
test('never upscales small images', () => { assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 }); });
