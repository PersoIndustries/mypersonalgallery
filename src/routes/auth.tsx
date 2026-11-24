import { useI18n } from '@/lib/i18n';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { MoonStar, MailCheck, Eye, EyeOff } from 'lucide-react';
import { usernameIssue } from '@/lib/onboarding';
import { useEffect, useState } from 'react';
import { countryFromLocale, suggestUsername } from '@/lib/onboarding';
import { countryCodes } from '@/lib/platform-rules';
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
    } => ({ mode: s['mode'] === 'signup' ? 'signup' : undefined }), head: () => ({ meta: [{ title: 'Collector access — Moon Collector' }, { name: 'description', content: 'Sign in or create your collector account.' }, { property: 'og:title', content: 'Collector access — Moon Collector' }, { property: 'og:description', content: 'Sign in to manage your digital museums.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }), component: AuthPage });
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
    const [showPassword, setShowPassword] = useState(false);
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
    useEffect(() => { if (currentUser && sessionStorage.getItem('mc-oauth')) { sessionStorage.removeItem('mc-oauth'); void navigate({ to: '/dashboard' }); } }, [currentUser, navigate]);
    const google = async () => { setBusy(true); try {
        sessionStorage.setItem('mc-oauth', '1');
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth' } });
        if (error) throw error;
    }
    catch (e) { sessionStorage.removeItem('mc-oauth'); setBusy(false); toast.error(e instanceof Error ? e.message : t('Unable to sign in')); } };
    const googleBlock = (label: string) => <div className="mt-6 space-y-4"><button type="button" disabled={busy} onClick={() => void google()} className="google-btn flex h-10 w-full items-center justify-center gap-[10px] rounded-md px-3 text-sm font-medium disabled:opacity-60"><svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg><span>{label}</span></button><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/>{t("or")}<span className="h-px flex-1 bg-border"/></div></div>;
    const consent = <p className="text-center text-xs text-muted-foreground">{t("By continuing, you accept the")} <Link to="/terms" className="text-primary underline-offset-2 hover:underline">{t("Terms of use")}</Link> {t("and the")} <Link to="/privacy" className="text-primary underline-offset-2 hover:underline">{t("Privacy policy")}</Link>.</p>;
    const credentials = <><div className="space-y-2"><Label htmlFor="email">{t("Email")}</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}/></div><div className="space-y-2"><Label htmlFor="password">{t("Password")}</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} className="pr-10" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)}/><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? t("Hide password") : t("Show password")} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></div>{password.length > 0 && password.length < 8 && <p className="text-xs text-destructive">{t("At least 8 characters")}</p>}</div></>;
    return <div className="mx-auto flex max-w-md flex-col px-4 py-16"><div className="text-center"><MoonStar className="mx-auto size-8 text-primary"/><h1 className="mt-5 font-display text-4xl">{t("Collector access")}</h1></div>{awaitingEmail && !currentUser ? <div role="status" className="mt-10 space-y-4 rounded-lg border border-primary/30 bg-card p-6 text-center"><MailCheck className="mx-auto size-8 text-primary"/><h2 className="font-display text-2xl">{t("Check your email")}</h2><p className="text-sm text-muted-foreground">{t("We sent a confirmation link to {email}. Open it to start building your museum.", { email: awaitingEmail })}</p><p className="text-xs text-muted-foreground">{t("Can't find it? Check your spam folder.")}</p><Button variant="outline" disabled={busy || cooldown.left > 0} onClick={() => void resend()}>{cooldown.left > 0 ? t("Request another link in {seconds}s", { seconds: cooldown.left }) : t("Resend email")}</Button><Button variant="ghost" onClick={() => setAwaitingEmail('')}>{t("Use a different email")}</Button></div> : currentUser ? <Button className="mt-8" onClick={() => navigate({ to: '/dashboard' })}>{t("Open dashboard")}</Button> : <Tabs defaultValue={mode === 'signup' ? 'signup' : 'login'} className="mt-10"><TabsList className="w-full"><TabsTrigger value="login" className="flex-1">{t("Sign in")}</TabsTrigger><TabsTrigger value="signup" className="flex-1">{t("Create account")}</TabsTrigger></TabsList><TabsContent value="login">{googleBlock(t("Sign in with Google"))}<form onSubmit={e => void submit(e, false)} className="mt-6 space-y-5">{credentials}<Button disabled={busy} type="submit" className="w-full">{busy ? t("Please wait\u2026") : t("Enter the museum")}</Button><Button disabled={busy || cooldown.left > 0} type="button" variant="ghost" className="w-full" onClick={() => void reset()}>{cooldown.left > 0 ? t("Request another link in {seconds}s", { seconds: cooldown.left }) : t("Forgot password?")}</Button>{consent}</form></TabsContent><TabsContent value="signup">{googleBlock(t("Sign up with Google"))}<form onSubmit={e => void submit(e, true)} className="mt-6 space-y-5"><div className="space-y-2"><Label htmlFor="name">{t("Full name")}</Label><Input id="name" required maxLength={120} value={name} onChange={e => { setName(e.target.value); if (!usernameEdited) setUsername(suggestUsername(e.target.value)); }}/></div><div className="space-y-2"><Label htmlFor="username">{t("Username")}</Label><Input id="username" required maxLength={40} aria-invalid={Boolean(username && usernameIssue(username))} value={username} onChange={e => { setUsernameEdited(true); setUsername(e.target.value); }}/>{username && usernameIssue(username) && <p role="alert" className="text-xs text-destructive">{t(usernameIssue(username)!)}</p>}<p className="text-xs text-muted-foreground">{t("Your public address: /u/{username}", { username: username || '…' })}</p></div><div className="space-y-2"><Label htmlFor="country">{t("Country of origin")}</Label><CountrySelect id="country" value={country} onChange={setCountry}/></div>{credentials}<Button disabled={busy || !country || Boolean(usernameIssue(username))} type="submit" className="w-full">{busy ? t("Please wait\u2026") : t("Start my museum")}</Button>{consent}</form></TabsContent></Tabs>}{notice && <p role="status" className="mt-5 text-sm text-primary">{t(notice)}</p>}<Link to="/explore" className="mt-8 text-center text-sm text-primary">{t("Explore public museums")}</Link><Link to="/privacy" className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground">{t("Privacy policy")}</Link><Link to="/terms" className="mt-1 text-center text-xs text-muted-foreground hover:text-foreground">{t("Terms of use")}</Link></div>;
}
