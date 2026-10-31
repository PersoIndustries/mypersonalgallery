import { useI18n } from '@/lib/i18n';
import { NotificationBell } from './notification-bell';
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Landmark, Moon, Search, Sun, LayoutDashboard, LogOut, User2, Languages, CircleHelp } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export function SiteHeader() {
    const { t,locale,setLocale } = useI18n();
    const { currentUser, logout, theme, toggleTheme, isAdmin } = useStore();
    const navigate = useNavigate();
    const router = useRouter();
    const [query, setQuery] = useState("");
    return (<header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-1 px-3 sm:gap-3 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25 transition-colors group-hover:bg-primary/20">
            <Landmark className="size-4.5"/>
          </span>
          <span className="font-display text-lg leading-none sm:text-xl">{t("MyOwn")}<span className="text-primary">{t("Museum")}</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/explore" activeProps={{ className: "text-foreground" }}>{t("Explore")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/explore" search={{ tab: "collectors" }} className="text-muted-foreground">{t("Collectors")}</Link>
          </Button>
        </nav>

        <form className="relative ml-auto hidden w-full max-w-xs items-center sm:flex" onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/explore", search: { q: query || undefined } });
        }}>
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground"/>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search museums, objects, people")} className="h-9 pl-9 text-sm"/>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-2">
          {currentUser && <NotificationBell userId={currentUser.id} />}
          <Button asChild variant="ghost" size="icon" aria-label={t('Help')}><Link to="/help"><CircleHelp className="size-4"/></Link></Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={t('Language')} title={locale==='es'?'Español':'English'}><Languages className="size-4"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={()=>setLocale('en')}>English {locale==='en'?'✓':''}</DropdownMenuItem><DropdownMenuItem onClick={()=>setLocale('es')}>Español {locale==='es'?'✓':''}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          <Button variant="ghost" size="icon" aria-label={t("Toggle theme")} onClick={toggleTheme} className="text-muted-foreground">
            {theme === "dark" ? <Sun className="size-4.5"/> : <Moon className="size-4.5"/>}
          </Button>

          {currentUser ? (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full ring-1 ring-border transition hover:ring-primary/60">
                  <Avatar className="size-9">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name}/>
                    <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span>{currentUser.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{t("@")}{currentUser.username}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="size-4"/>{t(" Dashboard")}</DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onClick={() => navigate({ to: "/admin/dev" })}>
                  <LayoutDashboard className="size-4"/>{t(" Admin \u00B7 Dev")}</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => navigate({
                to: "/u/$username",
                params: { username: currentUser.username },
            })}>
                  <User2 className="size-4"/>{t(" Public profile")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut className="size-4"/>{t(" Sign out")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>) : (<>
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link to="/auth">{t("Sign in")}</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "signup" }}>{t("Start a museum")}</Link>
              </Button>
            </>)}
        </div>
      </div>
    </header>);
}
