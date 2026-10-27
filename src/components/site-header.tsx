import { useI18n } from '@/lib/i18n';
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Landmark, Moon, Search, Sun, LayoutDashboard, LogOut, User2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export function SiteHeader() {
    const { t } = useI18n();
    const { currentUser, logout, theme, toggleTheme, isAdmin } = useStore();
    const navigate = useNavigate();
    const router = useRouter();
    const [query, setQuery] = useState("");
    return (<header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25 transition-colors group-hover:bg-primary/20">
            <Landmark className="size-4.5"/>
          </span>
          <span className="font-display text-xl leading-none tracking-tight">{t("MyOwn")}<span className="text-primary">{t("Museum")}</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/explore" activeProps=>{t("Explore")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/explore" search= className="text-muted-foreground">{t("Collectors")}</Link>
          </Button>
        </nav>

        <form className="relative ml-auto hidden w-full max-w-xs items-center sm:flex" onSubmit=>
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground"/>
          <Input value= onChange= placeholder={t("Search museums, objects, people")} className="h-9 pl-9 text-sm"/>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-2">
          <Button variant="ghost" size="icon" aria-label={t("Toggle theme")} onClick= className="text-muted-foreground">
            
          </Button>

          
        </div>
      </div>
    </header>);
}
