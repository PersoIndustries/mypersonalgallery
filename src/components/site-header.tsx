import { useI18n } from '@/lib/i18n';
import { NotificationBell } from './notification-bell';
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Moon, Search, Sun, LayoutDashboard, LogOut, User2, Languages, CircleHelp, Menu, ShieldCheck, Compass, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
    const [menuOpen, setMenuOpen] = useState(false);
    return (<header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-1 px-3 sm:gap-3 sm:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label={t("Open menu")}><Menu className="size-5"/></Button></SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader><SheetTitle className="font-display">Moon <span className="text-primary">Collector</span></SheetTitle></SheetHeader>
              <form className="relative mt-4 px-4" onSubmit={(e) => { e.preventDefault(); setMenuOpen(false); navigate({ to: "/explore", search: { q: query || undefined } }); }}>
                <Search className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search museums, objects, people")} className="h-10 pl-9 text-sm"/>
              </form>
              <nav className="mt-4 flex flex-col gap-1 px-2">
                <Button asChild variant="ghost" className="justify-start"><Link to="/explore" onClick={() => setMenuOpen(false)}><Compass className="size-4"/>{t("Explore")}</Link></Button>
                <Button asChild variant="ghost" className="justify-start"><Link to="/explore" search={{ tab: "collectors" }} onClick={() => setMenuOpen(false)}><Users className="size-4"/>{t("Collectors")}</Link></Button>
                <Button asChild variant="ghost" className="justify-start"><Link to="/help" onClick={() => setMenuOpen(false)}><CircleHelp className="size-4"/>{t("Help")}</Link></Button>
                {currentUser ? <Button asChild variant="ghost" className="justify-start"><Link to="/dashboard" onClick={() => setMenuOpen(false)}><LayoutDashboard className="size-4"/>{t("Dashboard")}</Link></Button>
                  : <Button asChild className="mt-2"><Link to="/auth" search={{ mode: "signup" }} onClick={() => setMenuOpen(false)}>{t("Start a museum")}</Link></Button>}
                {isAdmin && <Button asChild variant="ghost" className="justify-start"><Link to="/admin" onClick={() => setMenuOpen(false)}><ShieldCheck className="size-4"/>{t("Administration")}</Link></Button>}
              </nav>
            </SheetContent>
          </Sheet>
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="size-9 rounded-md ring-1 ring-primary/25 transition-transform group-hover:scale-105"/>
          <span className="font-display text-lg leading-none sm:text-xl">Moon <span className="text-primary">Collector</span>
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
          <Button asChild variant="ghost" size="icon" aria-label={t('Help')} data-tour="help" className="hidden sm:inline-flex"><Link to="/help"><CircleHelp className="size-4"/></Link></Button>
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
                {isAdmin && <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                  <ShieldCheck className="size-4"/>{t("Administration")}</DropdownMenuItem>}
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
