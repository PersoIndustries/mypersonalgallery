import { useI18n } from '@/lib/i18n';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetCooldown, isRateLimitError } from '@/lib/reset-cooldown';
import { completePasswordLink, clearPasswordLink, passwordResetRedirect } from '@/lib/password-link';
import { passwordStrength, type PasswordStrength } from '@/lib/password-strength';

export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Set password — MyOwnMuseum' }, { name: 'description', content: 'Choose a secure password for your curator account.' }, { property: 'og:title', content: 'Set password — MyOwnMuseum' }, { property: 'og:description', content: 'Reset your curator account password.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }), component: ResetPassword });

let callbackCheck: Promise<boolean> | undefined;

const STRENGTH_WIDTH: Record<PasswordStrength, string> = { none: '0%', weak: '33%', medium: '66%', strong: '100%' };

function PasswordField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={value} onChange={e => onChange(e.target.value)} className="pr-10" />
        <button type="button" onClick={() => setVisible(v => !v)} aria-label={visible ? t('Hide password') : t('Show password')} aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

function ResetPassword() {
  const { t } = useI18n();
  const [state, setState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const cooldown = useResetCooldown();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    // Single flight also protects token-hash callbacks against StrictMode remounts.
    callbackCheck ??= completePasswordLink(supabase.auth, window.location.hash, window.location.search, () => window.location.search);
    const check = callbackCheck;
    void check.then(valid => {
      if (!active) return;
      setState(valid ? 'valid' : 'invalid');
      const url = new URL(window.location.href);
      for (const key of ['code', 'token_hash', 'type', 'error', 'error_code', 'error_description']) url.searchParams.delete(key);
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    }).catch(() => { if (active) setState('invalid'); });
    return () => { active = false; setTimeout(() => { if (callbackCheck === check) callbackCheck = undefined; }, 0); };
  }, []);

  const resend = async (e: React.FormEvent) => {
    e.preventDefault(); if (cooldown.left > 0) return; setBusy(true); setNotice('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: passwordResetRedirect(window.location.origin) });
      if (error) throw error;
      cooldown.start();
      setNotice('If an account exists, a password reset email is on its way.');
    } catch (error) { if (isRateLimitError(error)) { cooldown.start(); toast.error(t('Too many attempts. Please wait a few minutes before requesting another link.')); } else toast.error(error instanceof Error ? error.message : t('Unable to send email')); }
    finally { setBusy(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (state !== 'valid') return;
    if (password !== confirm) {
      toast.error(t('Passwords do not match'));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      clearPasswordLink();
      sessionStorage.removeItem('museum.password-recovery');
      toast.success(t('Password saved'));
      await navigate({ to: '/dashboard' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to save password');
    } finally {
      setBusy(false);
    }
  };

  const strength = passwordStrength(password);
  const strengthLabel = strength === 'weak' ? t('Weak') : strength === 'medium' ? t('Medium') : strength === 'strong' ? t('Strong') : '';
  const matchState = confirm.length === 0 ? 'none' : password === confirm ? 'match' : 'mismatch';

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">{t('Set your password')}</h1>
      {state === 'checking' ? (
        <p role="status" className="mt-6 text-muted-foreground">{t('Checking password link…')}</p>
      ) : state === 'valid' ? (
        <form onSubmit={e => void save(e)} className="mt-8 space-y-5">
          <PasswordField id="new-password" label={t('New password')} value={password} onChange={setPassword} />
          {password.length > 0 && (
            <div className="space-y-1" aria-live="polite">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={3} aria-valuenow={strength === 'weak' ? 1 : strength === 'medium' ? 2 : 3} aria-label={t('Password strength')}>
                <div className={`h-full rounded-full transition-all ${strength === 'strong' ? 'bg-primary' : strength === 'medium' ? 'bg-accent-foreground' : 'bg-destructive'}`} style={{ width: STRENGTH_WIDTH[strength] }} />
              </div>
              <p className={`text-xs ${strength === 'strong' ? 'text-primary' : strength === 'medium' ? 'text-muted-foreground' : 'text-destructive'}`}>{t('Password strength')}: {strengthLabel}</p>
            </div>
          )}
          <PasswordField id="confirm-password" label={t('Confirm password')} value={confirm} onChange={setConfirm} />
          {matchState !== 'none' && (
            <p role="status" className={`text-sm ${matchState === 'match' ? 'text-primary' : 'text-destructive'}`}>
              {matchState === 'match' ? t('Passwords match') : t('Passwords do not match')}
            </p>
          )}
          <Button disabled={busy || matchState === 'mismatch'} type="submit">{t('Save password')}</Button>
        </form>
      ) : (
        <>
          <p role="alert" className="mt-6 text-muted-foreground">{t('This password link is invalid, expired or already used. Request a new one and open the latest email.')}</p>
          <p className="mt-3 text-sm text-muted-foreground">{t('Open the latest email in your browser. Email security scanners can consume single-use links; avoid opening older messages.')}</p>
          <form onSubmit={e => void resend(e)} className="mt-6 space-y-4">
            <Label htmlFor="recovery-email">{t('Email')}</Label>
            <Input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <Button type="submit" disabled={busy || cooldown.left > 0}>{busy ? t('Please wait…') : cooldown.left > 0 ? t('Request another link in {seconds}s', { seconds: cooldown.left }) : t('Send new password link')}</Button>
          </form>
          {notice && <p role="status" className="mt-4 text-sm text-primary">{t(notice)}</p>}
        </>
      )}
    </div>
  );
}
