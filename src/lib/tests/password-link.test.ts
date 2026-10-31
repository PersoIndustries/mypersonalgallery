import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePasswordLink, capturePasswordLink, passwordLinkState, clearPasswordLink, canSetPassword, completePasswordLink } from '../password-link';
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

function fakeAuth() {
  return { initialize: async () => ({ error: null }), getUser: async () => ({ data: { user: { id: 'verified' } }, error: null }), exchangeCodeForSession: async (_code: string) => ({ error: null }), verifyOtp: async (_params: { token_hash: string; type: 'invite' | 'recovery' }) => ({ error: null }) };
}
test('automatically consumed PKCE recovery code is not exchanged twice', async () => {
  clearPasswordLink(); const auth = fakeAuth(); let exchanges = 0;
  auth.exchangeCodeForSession = async () => { exchanges++; return { error: null }; };
  assert.equal(await completePasswordLink(auth, '', '?code=sample', () => ''), true);
  assert.equal(exchanges, 0); clearPasswordLink();
});
test('unconsumed PKCE code must be successfully exchanged', async () => {
  clearPasswordLink(); const auth = fakeAuth(); let exchanges = 0;
  auth.exchangeCodeForSession = async code => { assert.equal(code, 'sample'); exchanges++; return { error: null }; };
  assert.equal(await completePasswordLink(auth, '', '?code=sample', () => '?code=sample'), true);
  assert.equal(exchanges, 1); clearPasswordLink();
});
test('token hash invitations are verified with invitation type', async () => {
  clearPasswordLink(); const auth = fakeAuth(); let verifications = 0;
  auth.verifyOtp = async params => { assert.deepEqual(params, { token_hash: 'sample', type: 'invite' }); verifications++; return { error: null }; };
  assert.equal(await completePasswordLink(auth, '', '?token_hash=sample&type=invite', () => ''), true);
  assert.equal(verifications, 1); clearPasswordLink();
});
test('failed callback cannot use an existing signed-in user', async () => {
  clearPasswordLink(); const auth = { ...fakeAuth(), initialize: async () => ({ error: new Error('expired') }) };
  assert.equal(await completePasswordLink(auth, '#type=recovery', '', () => ''), false);
  clearPasswordLink();
});