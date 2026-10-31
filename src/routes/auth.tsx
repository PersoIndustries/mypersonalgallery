import { useI18n } from '@/lib/i18n';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Landmark } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import { CountrySelect } from '@/components/country-select';
import { supabase } from '@/integrations/supabase/client';
import { useResetCooldown, isRateLimitError } from '@/lib/reset-cooldown';
import { passwordResetRedirect } from '@/lib/password-link';
export const Route = createFileRoute('/auth')({ validateSearch: (s: Record<string, unknown>): {
        mode?: 'signup' | undefined;
    } => ({ mode: s['mode'] === 'signup' ? 'signup' : undefined }), head: () => ({ meta: [{ title: 'Curator access — MyOwnMuseum' }, { name: 'description', content: 'Sign in or create your curator account.' }, { property: 'og:title', content: 'Curator access — MyOwnMuseum' }, { property: 'og:description', content: 'Sign in to manage your digital museums.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }), component: AuthPage });
function AuthPage() {
    const { t } = useI18n();
    const { mode } = Route.useSearch();
    const navigate = useNavigate();
    const { login, signup, currentUser } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [usernameEdited, setUsernameEdited] = useState(false);
    const [awaitingEmail, setAwaitingEmail] = useState('');
    const [country, setCountry] = useState('');
    useEffect(() => { setCountry(c => c || countryFromLocale(navigator.language, countryCodes)); }, []);
    const [busy, setBusy] = useState(false);
    const cooldown = useResetCooldown();
    const [notice, setNotice] = useState('');
    const submit = async (e: React.FormEvent, register: boolean) => { e.preventDefault(); setBusy(true); setNotice(''); try {
        if (register) {
            const signedIn = await signup(name, username, email, password, country);
            if (!signedIn) {
                setAwaitingEmail(email.trim());
                cooldown.start();
                return;
            }
        }
        else
            await login(email, password);
        await navigate({ to: register ? '/dashboard/welcome' : '/dashboard' });
    }
    catch (e) {
        toast.error(e instanceof Error ? e.message : 'Unable to sign in');
    }
    finally {
        setBusy(false);
    } };
    const resend = async () => { if (cooldown.left > 0) return; setBusy(true); try {
        const { error } = await supabase.auth.resend({ type: 'signup', email: awaitingEmail, options: { emailRedirectTo: window.location.origin + '/dashboard/welcome' } });
        if (error) throw error;
        cooldown.start();
        toast.success(t('Email sent again'));
    }
    catch (e) {
        if (isRateLimitError(e)) { cooldown.start(); toast.error(t('Too many attempts. Please wait a few minutes before requesting another link.')); }
        else toast.error(e instanceof Error ? e.message : t('Unable to send email'));
    }
    finally { setBusy(false); } };
    const reset = async () => { if (!email.trim()) {
        toast.error(t("Enter your email first"));
        return;
    } if (cooldown.left > 0) return; setBusy(true); try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: passwordResetRedirect(window.location.origin) });
        if (error)
            throw error;
        cooldown.start();
        setNotice('If an account exists, a password reset email is on its way.');
    }
    catch (e) {
        if (isRateLimitError(e)) { cooldown.start(); toast.error(t('Too many attempts. Please wait a few minutes before requesting another link.')); }
        else toast.error(e instanceof Error ? e.message : t('Unable to send email'));
    }
    finally {
        setBusy(false);
    } };
    const credentials = <><div className="space-y-2"><Label htmlFor="email">{t("Email")}</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}/></div><div className="space-y-2"><Label htmlFor="password">{t("Password")}</Label><Input id="password" type="password" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)}/></div></>;
    return <div className="mx-auto flex max-w-md flex-col px-4 py-16"><div className="text-center"><Landmark className="mx-auto size-8 text-primary"/><h1 className="mt-5 font-display text-4xl">{t("Curator access")}</h1></div>{awaitingEmail && !currentUser ? <div role="status" className="mt-10 space-y-4 rounded-lg border border-primary/30 bg-card p-6 text-center"><MailCheck className="mx-auto size-8 text-primary"/><h2 className="font-display text-2xl">{t("Check your email")}</h2><p className="text-sm text-muted-foreground">{t("We sent a confirmation link to {email}. Open it to start building your museum.", { email: awaitingEmail })}</p><p className="text-xs text-muted-foreground">{t("Can't find it? Check your spam folder.")}</p><Button variant="outline" disabled={busy || cooldown.left > 0} onClick={() => void resend()}>{cooldown.left > 0 ? t("Request another link in {seconds}s", { seconds: cooldown.left }) : t("Resend email")}</Button><Button variant="ghost" onClick={() => setAwaitingEmail('')}>{t("Use a different email")}</Button></div> : currentUser ? <Button className="mt-8" onClick={() => navigate({ to: '/dashboard' })}>{t("Open dashboard")}</Button> : <Tabs defaultValue={mode === 'signup' ? 'signup' : 'login'} className="mt-10"><TabsList className="w-full"><TabsTrigger value="login" className="flex-1">{t("Sign in")}</TabsTrigger><TabsTrigger value="signup" className="flex-1">{t("Create account")}</TabsTrigger></TabsList><TabsContent value="login"><form onSubmit={e => void submit(e, false)} className="mt-6 space-y-5">{credentials}<Button disabled={busy} type="submit" className="w-full">{busy ? t("Please wait\u2026") : t("Enter the museum")}</Button><Button disabled={busy || cooldown.left > 0} type="button" variant="ghost" className="w-full" onClick={() => void reset()}>{cooldown.left > 0 ? t("Request another link in {seconds}s", { seconds: cooldown.left }) : t("Forgot password?")}</Button></form></TabsContent><TabsContent value="signup"><form onSubmit={e => void submit(e, true)} className="mt-6 space-y-5"><div className="space-y-2"><Label htmlFor="name">{t("Full name")}</Label><Input id="name" required maxLength={120} value={name} onChange={e => { setName(e.target.value); if (!usernameEdited) setUsername(suggestUsername(e.target.value)); }}/></div><div className="space-y-2"><Label htmlFor="username">{t("Username")}</Label><Input id="username" required pattern="[a-zA-Z0-9_-]{3,40}" maxLength={40} value={username} onChange={e => { setUsernameEdited(true); setUsername(e.target.value); }}/><p className="text-xs text-muted-foreground">{t("Your public address: /u/{username}", { username: username || '…' })}</p></div><div className="space-y-2"><Label htmlFor="country">{t("Country of origin")}</Label><CountrySelect id="country" value={country} onChange={setCountry}/></div>{credentials}<Button disabled={busy || !country} type="submit" className="w-full">{busy ? t("Please wait\u2026") : t("Start my museum")}</Button></form></TabsContent></Tabs>}{notice && <p role="status" className="mt-5 text-sm text-primary">{t(notice)}</p>}<Link to="/explore" className="mt-8 text-center text-sm text-primary">{t("Explore public museums")}</Link></div>;
}
