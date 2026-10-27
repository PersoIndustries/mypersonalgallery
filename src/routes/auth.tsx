import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" | undefined } => ({
    mode: search["mode"] === "signup" ? ("signup" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or start your museum — MyOwnMuseum" },
      {
        name: "description",
        content:
          "Sign in to curate your digital museum, or create a free account and start cataloguing your collection today.",
      },
      { property: "og:title", content: "Sign in — MyOwnMuseum" },
      {
        property: "og:description",
        content: "Curate, catalogue and share your collection as a digital museum.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { login, signup, users } = useStore();
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(identifier);
    toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
    navigate({ to: "/dashboard" });
  };

  const doSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tell us your name first");
      return;
    }
    const user = signup(name, username);
    toast.success(`Your vault is ready, @${user.username}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="fade-up text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/25">
          <Landmark className="size-5" />
        </span>
        <h1 className="mt-5 font-display text-4xl">Curator access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A demo account keeps everything on this device — no email required.
        </p>
      </div>

      <Tabs defaultValue={mode === "signup" ? "signup" : "login"} className="mt-10">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            Sign in
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Create account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-8">
          <form onSubmit={doLogin} className="space-y-5 rounded-xl border border-border/80 bg-card p-6 plinth">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="@marcusv"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Enter the museum
            </Button>
            <div className="border-t border-border/70 pt-4">
              <p className="text-xs text-muted-foreground">Demo curators:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {users.slice(0, 4).map((u) => (
                  <Button
                    key={u.id}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIdentifier(u.username)}
                  >
                    @{u.username}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-8">
          <form onSubmit={doSignup} className="space-y-5 rounded-xl border border-border/80 bg-card p-6 plinth">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ada"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Start my museum
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Just browsing?{" "}
        <Link to="/explore" className="text-primary hover:underline">
          Explore public museums
        </Link>
      </p>
    </div>
  );
}
