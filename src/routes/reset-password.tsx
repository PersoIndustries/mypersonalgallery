import { useI18n } from '@/lib/i18n';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Set password — MyOwnMuseum' }, { name: 'description', content: 'Choose a secure password for your curator account.' }, { property: 'og:title', content: 'Set password — MyOwnMuseum' }, { property: 'og:description', content: 'Reset your curator account password.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }), component: ResetPassword });
function ResetPassword() { const { t } = useI18n(); const [valid, setValid] = useState(false); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false); const navigate = useNavigate(); useEffect(() => { const params = new URLSearchParams(window.location.hash.slice(1)); const type = params.get('type'); const permitted = type === 'recovery' || type === 'invite' || sessionStorage.getItem('museum.password-recovery') === 'true'; if (permitted) {
    sessionStorage.setItem('museum.password-recovery', 'true');
    void supabase.auth.getUser().then(({ data }) => setValid(Boolean(data.user)));
} }, []); const save = async (e: React.FormEvent) => { e.preventDefault(); if (password !== confirm) {
    toast.error(t("Passwords do not match"));
    return;
} setBusy(true); try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error)
        throw error;
    sessionStorage.removeItem('museum.password-recovery');
    toast.success(t("Password saved"));
    await navigate({ to: '/dashboard' });
}
catch (e) {
    toast.error(e instanceof Error ? e.message : 'Unable to save password');
}
finally {
    setBusy(false);
} }; return <div className="mx-auto max-w-md px-4 py-16"><h1 className="font-display text-4xl">{t("Set your password")}</h1></div>; }
