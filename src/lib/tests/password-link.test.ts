import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePasswordLink, capturePasswordLink, passwordLinkState, clearPasswordLink, canSetPassword } from '../password-link';
test('invitation and recovery intent survives fragment consumption but requires verified user', () => {
  for (const type of ['invite', 'recovery']) {
    clearPasswordLink();
    capturePasswordLink(`#type=${type}`);
    capturePasswordLink('');
    assert.equal(canSetPassword(passwordLinkState(), true), true);
    assert.equal(canSetPassword(passwordLinkState(), false), false);
  }
  clearPasswordLink();
});
test('expired link cannot enable password form even with a signed-in user', () => {
  capturePasswordLink('#type=invite');
  capturePasswordLink('#error=access_denied&error_code=otp_expired');
  assert.equal(canSetPassword(passwordLinkState(), true), false);
  assert.equal(parsePasswordLink('', '?error_code=otp_expired').rejected, true);
  clearPasswordLink();
  assert.equal(canSetPassword(passwordLinkState(), true), false);
});