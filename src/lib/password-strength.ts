export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

/**
 * Scores a password from 0 (empty) to 3 (strong) based on length and variety.
 * Pure and deterministic so the UI and tests share the same rule.
 */
export function passwordStrength(password: string): PasswordStrength {
  if (!password) return 'none';
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}
