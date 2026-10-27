import { describe, expect, test } from 'bun:test';
import { isRateLimitError, remainingSeconds, RESET_COOLDOWN_SECONDS } from '../reset-cooldown';
describe('password email cooldown', () => {
  test('waits 60 seconds between requests', () => expect(RESET_COOLDOWN_SECONDS).toBe(60));
  test('counts down remaining seconds', () => { expect(remainingSeconds(61_000, 1_000)).toBe(60); expect(remainingSeconds(1_000, 5_000)).toBe(0); });
  test('detects Supabase rate limit errors', () => { expect(isRateLimitError(new Error('email rate limit exceeded'))).toBe(true); expect(isRateLimitError(new Error('Invalid email'))).toBe(false); });
});
