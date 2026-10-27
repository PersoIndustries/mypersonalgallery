import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { CountrySelect } from '@/components/country-select';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute("/_authenticated/dashboard/settings")({
    head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Curator profile settings — MyOwnMuseum" }, { name: "description", content: "Curator profile settings." }, { property: "og:title", content: "Curator profile settings — MyOwnMuseum" }, { property: "og:description", content: "Curator profile settings." }, { name: "robots", content: "noindex" }] }),
    component: DashboardSettings,
});
function DashboardSettings() {
    const { t } = useI18n();
    const { currentUser, updateProfile } = useStore();
    const [form, setForm] = useState(() => ({
        name: currentUser?.name ?? "",
        bio: currentUser?.bio ?? "",
        location: currentUser?.location ?? "",
        avatar: currentUser?.avatar ?? "",
        country: currentUser?.country ?? "",
    }));
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);
    const changePassword = async (e: React.FormEvent) => { e.preventDefault(); if (password.length < 8 || password !== confirmPassword) {
        toast.error(t("Use at least 8 characters and matching passwords"));
        return;
    } setSavingPassword(true); try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email)
            throw new Error('Sign in again to change your password');
        const verified = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword });
        if (verified.error)
            throw new Error('Current password is incorrect');
        const { error } = await supabase.auth.updateUser({ password });
        if (error)
            throw error;
        setOldPassword('');
        setPassword('');
        setConfirmPassword('');
        toast.success(t("Password changed"));
    }
    catch (e) {
        toast.error(e instanceof Error ? e.message : 'Unable to change password');
    }
    finally {
        setSavingPassword(false);
    } };
    if (!currentUser)
        return null;
    return (<div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">{t("Curator profile")}</h2>
        <p className="text-sm text-muted-foreground">{t("This is what visitors see on your public profile page.")}</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="size-16">
            <AvatarImage src= alt=/>
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-display text-xl"></CardTitle>
            <p className="text-xs text-muted-foreground">{t("@")}</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link to="/u/$username" params=>{t("View public profile")}</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="p-country">{t("Country of origin")}</Label><CountrySelect id="p-country" value= onChange=/></div>
          <div className="space-y-2">
            <Label htmlFor="p-name">{t("Display name")}</Label>
            <Input id="p-name" value= onChange=/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-avatar">{t("Avatar image URL")}</Label>
            <Input id="p-avatar" value= onChange=/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-location">{t("Location")}</Label>
            <Input id="p-location" value= onChange= placeholder={t("Antwerp, Belgium")}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-bio">{t("Bio")}</Label>
            <Textarea id="p-bio" rows= value= onChange= placeholder={t("What do you collect, and why?")}/>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick=>{t("Reset")}</Button>
            <Button disabled= onClick=>{t("Save changes")}</Button>
          </div>
        </CardContent>
      </Card>
      <section className="border-t border-border pt-6"><h3 className="font-display text-2xl">{t("Change password")}</h3><form className="mt-4 max-w-md space-y-4" onSubmit=><div className="space-y-2"><Label htmlFor="old-password">{t("Current password")}</Label><Input id="old-password" type="password" required autoComplete="current-password" value= onChange=/></div><div className="space-y-2"><Label htmlFor="new-password">{t("New password")}</Label><Input id="new-password" type="password" required minLength= autoComplete="new-password" value= onChange=/></div><div className="space-y-2"><Label htmlFor="confirm-password">{t("Confirm new password")}</Label><Input id="confirm-password" type="password" required minLength= autoComplete="new-password" value= onChange=/></div><Button type="submit" disabled=></Button></form></section>
    </div>);
}
