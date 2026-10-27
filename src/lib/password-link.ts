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
  } as { intent: PasswordIntent | null; rejected: boolean };
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