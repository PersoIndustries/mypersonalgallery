import { useI18n } from '@/lib/i18n';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetCooldown, isRateLimitError } from '@/lib/reset-cooldown';
import { capturePasswordLink, passwordLinkState, canSetPassword, clearPasswordLink } from '@/lib/password-link';
export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Set password — MyOwnMuseum' }, { name: 'description', content: 'Choose a secure password for your curator account.' }, { property: 'og:title', content: 'Set password — MyOwnMuseum' }, { property: 'og:description', content: 'Reset your curator account password.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }), component: ResetPassword });
function ResetPassword() { const { t } = useI18n(); const [state, setState] = useState<'checking' | 'valid' | 'invalid'>('checking'); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [email, setEmail] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const cooldown = useResetCooldown(); const navigate = useNavigate(); useEffect(() => {
    let active = true;
    capturePasswordLink(window.location.hash, window.location.search);
    // getUser waits for callback/session initialization and verifies the user remotely.
    void supabase.auth.getUser().then(({ data, error }) => {
        if (active) setState(canSetPassword(passwordLinkState(), !error && Boolean(data.user)) ? 'valid' : 'invalid');
    }).catch(() => { if (active) setState('invalid'); });
    return () => { active = false; };
}, []);
const resend = async (e: React.FormEvent) => {
    e.preventDefault(); if (cooldown.left > 0) return; setBusy(true); setNotice('');
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        cooldown.start();
        setNotice('If an account exists, a password reset email is on its way.');
    } catch (error) { if (isRateLimitError(error)) { cooldown.start(); toast.error(t('Too many attempts. Please wait a few minutes before requesting another link.')); } else toast.error(error instanceof Error ? error.message : t('Unable to send email')); }
    finally { setBusy(false); }
};
const save = async (e: React.FormEvent) => { e.preventDefault(); if (state !== 'valid') return; if (password !== confirm) {
    toast.error(t("Passwords do not match"));
    return;
} setBusy(true); try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error)
        throw error;
    clearPasswordLink();
    sessionStorage.removeItem('museum.password-recovery');
    toast.success(t("Password saved"));
    await navigate({ to: '/dashboard' });
}
catch (e) {
    toast.error(e instanceof Error ? e.message : 'Unable to save password');
}
finally {
    setBusy(false);
} }; return <div className="mx-auto max-w-md px-4 py-16"><h1 className="font-display text-4xl">{t("Set your password")}</h1>{state === 'checking' ? <p role="status" className="mt-6 text-muted-foreground">{t('Checking password link…')}</p> : state === 'valid' ? <form onSubmit={e => void save(e)} className="mt-8 space-y-5"><Label htmlFor="new-password">{t("New password")}</Label><Input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}/><Label htmlFor="confirm-password">{t("Confirm password")}</Label><Input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)}/><Button disabled={busy} type="submit">{t("Save password")}</Button></form> : <><p role="alert" className="mt-6 text-muted-foreground">{t('This password link is invalid, expired or already used. Request a new one and open the latest email.')}</p><form onSubmit={e => void resend(e)} className="mt-6 space-y-4"><Label htmlFor="recovery-email">{t('Email')}</Label><Input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /><Button type="submit" disabled={busy || cooldown.left > 0}>{busy ? t('Please wait…') : cooldown.left > 0 ? t('Request another link in {seconds}s', { seconds: cooldown.left }) : t('Send new password link')}</Button></form>{notice && <p role="status" className="mt-4 text-sm text-primary">{t(notice)}</p>}</>}</div>; }
