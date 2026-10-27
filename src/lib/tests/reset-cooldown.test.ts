import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRateLimitError, remainingSeconds, RESET_COOLDOWN_SECONDS } from '../reset-cooldown';

test('waits 60 seconds between password email requests', () => assert.equal(RESET_COOLDOWN_SECONDS, 60));
test('counts down remaining seconds', () => { assert.equal(remainingSeconds(61_000, 1_000), 60); assert.equal(remainingSeconds(1_000, 5_000), 0); });
test('detects Supabase rate limit errors', () => { assert.equal(isRateLimitError(new Error('email rate limit exceeded')), true); assert.equal(isRateLimitError(new Error('Invalid email')), false); });
