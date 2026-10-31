type PasswordIntent = 'recovery' | 'invite';
let intent: PasswordIntent | null = null;
let rejected = false;

export function parsePasswordLink(hash: string, search = '') {
  const fragment = new URLSearchParams(hash.replace(/^#/, ''));
  const query = new URLSearchParams(search.replace(/^\?/, ''));
  const value = fragment.get('type') ?? query.get('type');
  return {
    intent: value === 'recovery' || value === 'invite' ? value : null,
    rejected: Boolean(fragment.get('error') || fragment.get('error_code') || query.get('error') || query.get('error_code')),
    code: query.get('code'),
    tokenHash: query.get('token_hash'),
  } as { intent: PasswordIntent | null; rejected: boolean; code: string | null; tokenHash: string | null };
}

// Capture before Supabase initializes: it consumes and removes the callback fragment.
export function capturePasswordLink(hash: string, search = '') {
  const link = parsePasswordLink(hash, search);
  if (link.rejected) { intent = null; rejected = true; }
  else if (link.intent) { intent = link.intent; rejected = false; }
}
export function markPasswordRecovery() { intent = 'recovery'; rejected = false; }
export function passwordLinkState() { return { intent, rejected }; }
export function clearPasswordLink() { intent = null; rejected = false; }
export function canSetPassword(link: ReturnType<typeof passwordLinkState>, verifiedUser: boolean) {
  return !link.rejected && link.intent !== null && verifiedUser;
}

type CallbackAuth = {
  initialize: () => Promise<{ error: unknown }>;
  exchangeCodeForSession: (code: string) => Promise<{ error: unknown }>;
  verifyOtp: (params: { token_hash: string; type: PasswordIntent }) => Promise<{ error: unknown }>;
  getUser: () => Promise<{ data: { user: unknown }; error: unknown }>;
};

// The SDK owns implicit/PKCE initialization. Never exchange a code twice.
export async function completePasswordLink(auth: CallbackAuth, hash: string, search: string, remainingSearch: () => string) {
  capturePasswordLink(hash, search);
  const link = parsePasswordLink(hash, search);
  if (link.rejected) return false;
  const initialized = await auth.initialize();
  if (initialized.error) { intent = null; rejected = true; return false; }
  if (link.tokenHash) {
    if (!link.intent) return false;
    const result = await auth.verifyOtp({ token_hash: link.tokenHash, type: link.intent });
    if (result.error) { intent = null; rejected = true; return false; }
  } else if (link.code) {
    // Automatic PKCE processing removes the code from the current URL.
    if (new URLSearchParams(remainingSearch()).has('code')) {
      const result = await auth.exchangeCodeForSession(link.code);
      if (result.error) { intent = null; rejected = true; return false; }
    }
    intent = link.intent ?? 'recovery';
  }
  const verified = await auth.getUser();
  return canSetPassword(passwordLinkState(), !verified.error && Boolean(verified.data.user));
}

export function passwordResetRedirect(origin: string) {
  return new URL('/reset-password', origin).href;
}