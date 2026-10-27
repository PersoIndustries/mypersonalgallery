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

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: DashboardSettings,
});

function DashboardSettings() {
  const { currentUser, updateProfile } = useStore();
  const [form, setForm] = useState(() => ({
    name: currentUser?.name ?? "",
    bio: currentUser?.bio ?? "",
    location: currentUser?.location ?? "",
    avatar: currentUser?.avatar ?? "",
  }));

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Curator profile</h2>
        <p className="text-sm text-muted-foreground">
          This is what visitors see on your public profile page.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="size-16">
            <AvatarImage src={form.avatar} alt={form.name} />
            <AvatarFallback>{form.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-display text-xl">{form.name || "Unnamed curator"}</CardTitle>
            <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link to="/u/$username" params={{ username: currentUser.username }}>
              View public profile
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Display name</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-avatar">Avatar image URL</Label>
            <Input
              id="p-avatar"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-location">Location</Label>
            <Input
              id="p-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Antwerp, Belgium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-bio">Bio</Label>
            <Textarea
              id="p-bio"
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="What do you collect, and why?"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                setForm({
                  name: currentUser.name,
                  bio: currentUser.bio,
                  location: currentUser.location,
                  avatar: currentUser.avatar,
                })
              }
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                updateProfile(form);
                toast.success("Profile saved");
              }}
            >
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
