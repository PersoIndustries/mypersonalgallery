import { test } from 'node:test';
import assert from 'node:assert/strict';
import { averageVisitSeconds, hasPaidAccess } from '../platform-rules';
test('free users have metrics locked', () => { assert.equal(hasPaidAccess({ plan: 'free', status: 'inactive' }), false); assert.equal(hasPaidAccess(null), false); });
test('active pro and studio users unlock metrics', () => { assert.equal(hasPaidAccess({ plan: 'pro', status: 'active' }), true); assert.equal(hasPaidAccess({ plan: 'studio', status: 'active' }), true); });
test('inactive paid plan stays locked', () => { assert.equal(hasPaidAccess({ plan: 'pro', status: 'inactive' }), false); });
test('average visit time uses timed visits', () => { assert.equal(averageVisitSeconds(600, 4), 150); assert.equal(averageVisitSeconds(0, 0), 0); });
