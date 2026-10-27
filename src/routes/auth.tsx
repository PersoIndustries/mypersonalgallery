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
    const [country, setCountry] = useState('');
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const submit = async (e: React.FormEvent, register: boolean) => { e.preventDefault(); setBusy(true); setNotice(''); try {
        if (register) {
            const signedIn = await signup(name, username, email, password, country);
            if (!signedIn) {
                setNotice('Check your email to confirm your account before signing in.');
                return;
            }
        }
        else
            await login(email, password);
        await navigate({ to: '/dashboard' });
    }
    catch (e) {
        toast.error(e instanceof Error ? e.message : 'Unable to sign in');
    }
    finally {
        setBusy(false);
    } };
    const reset = async () => { if (!email.trim()) {
        toast.error(t("Enter your email first"));
        return;
    } setBusy(true); try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/reset-password' });
        if (error)
            throw error;
        setNotice('If an account exists, a password reset email is on its way.');
    }
    catch (e) {
        toast.error(e instanceof Error ? e.message : 'Unable to send email');
    }
    finally {
        setBusy(false);
    } };
    const credentials = <><div className="space-y-2"><Label htmlFor="email">{t("Email")}</Label><Input id="email" type="email" required autoComplete="email" value= onChange=/></div><div className="space-y-2"><Label htmlFor="password">{t("Password")}</Label><Input id="password" type="password" required minLength= autoComplete= value= onChange=/></div></>;
    return <div className="mx-auto flex max-w-md flex-col px-4 py-16"><div className="text-center"><Landmark className="mx-auto size-8 text-primary"/><h1 className="mt-5 font-display text-4xl">{t("Curator access")}</h1></div><Link to="/explore" className="mt-8 text-center text-sm text-primary">{t("Explore public museums")}</Link></div>;
}
