import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Landmark, Moon, Search, Sun, LayoutDashboard, LogOut, User2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { currentUser, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25 transition-colors group-hover:bg-primary/20">
            <Landmark className="size-4.5" />
          </span>
          <span className="font-display text-xl leading-none tracking-tight">
            MyOwn<span className="text-primary">Museum</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/explore" activeProps={{ className: "text-foreground" }}>
              Explore
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link
              to="/explore"
              search={{ tab: "collectors" }}
              className="text-muted-foreground"
            >
              Collectors
            </Link>
          </Button>
        </nav>

        <form
          className="relative ml-auto hidden w-full max-w-xs items-center sm:flex"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/explore", search: { q: query || undefined } });
          }}
        >
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search museums, objects, people"
            className="h-9 pl-9 text-sm"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full ring-1 ring-border transition hover:ring-primary/60">
                  <Avatar className="size-9">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span>{currentUser.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    @{currentUser.username}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="size-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/admin/dev" })}>
                  <LayoutDashboard className="size-4" /> Admin · Dev
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: "/u/$username",
                      params: { username: currentUser.username },
                    })
                  }
                >
                  <User2 className="size-4" /> Public profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.navigate({ to: "/" });
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start a museum
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
