import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landmark, Boxes, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { ProductTour } from "@/components/product-tour";
import { useOnboarding } from "@/lib/use-onboarding";
import { shouldSuggestUpgrade } from "@/lib/onboarding";
export const Route = createFileRoute("/_authenticated/dashboard/")({
    validateSearch: (s: Record<string, unknown>): { tour?: boolean } => (s['tour'] === true || s['tour'] === 'true' ? { tour: true } : {}),
    head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Your collection overview — MyOwnMuseum" }, { name: "description", content: "Your collection overview." }, { property: "og:title", content: "Your collection overview — MyOwnMuseum" }, { property: "og:description", content: "Your collection overview." }, { name: "robots", content: "noindex" }] }),
    component: DashboardOverview,
});
function DashboardOverview() {
    const { t } = useI18n();
    const { tour } = Route.useSearch();
    const navigate = useNavigate();
    const { currentUser, museumsOf, objectsOf } = useStore();
    const { state, loaded, update } = useOnboarding();
    const [tourOpen, setTourOpen] = useState(false);
    const myMuseums = currentUser ? museumsOf(currentUser.id) : [];
    useEffect(() => {
        if (!loaded || !state) return;
        if (!state.welcomed && !state.skipped && myMuseums.length === 0) { void navigate({ to: '/dashboard/welcome', replace: true }); return; }
        if (tour || (!state.tourDone && state.welcomed)) setTourOpen(true);
    }, [loaded, tour]); // eslint-disable-line react-hooks/exhaustive-deps
    if (!currentUser)
        return null;
    const closeTour = () => { setTourOpen(false); void update({ tourDone: true }); if (tour) void navigate({ to: '/dashboard', replace: true }); };
    const myObjects = myMuseums.flatMap((m) => objectsOf(m.id));
    const publicCount = myMuseums.filter((m) => m.isPublic).length;
    const featured = myObjects.filter((o) => o.featured).length;
    const stats = [
        { label: "Museums", value: myMuseums.length, icon: Landmark },
        { label: "Objects catalogued", value: myObjects.length, icon: Boxes },
        { label: "Public museums", value: publicCount, icon: Eye },
        { label: "Featured pieces", value: featured, icon: Sparkles },
    ];
    return (<div className="space-y-8">
      <div data-tour="checklist">
        <OnboardingChecklist user={currentUser} museums={myMuseums.length} objects={myObjects.length} publicMuseums={publicCount} onStartTour={() => setTourOpen(true)}/>
      </div>
      {shouldSuggestUpgrade(myMuseums.length, myObjects.length) && (<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm">{t("Your collection is growing. Pro and Studio plans are coming with more space and premium presentation.")}</p>
          <Button asChild size="sm" variant="outline"><Link to="/dashboard/plans">{t("See plans")}</Link></Button>
        </div>)}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (<Card key={s.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25">
                <s.icon className="size-5"/>
              </span>
              <div>
                <p className="font-display text-3xl leading-none">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {t(s.label)}
                </p>
              </div>
            </CardContent>
          </Card>))}
      </div>

      <Card data-tour="museums">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="font-display text-2xl">{t("Your museums")}</CardTitle>
          <Button asChild size="sm">
            <Link to="/dashboard/museums">{t("Manage")}</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {myMuseums.length === 0 ? (<div className="space-y-3"><p className="text-sm text-muted-foreground">{t("You haven't opened a museum yet. Create your first one to start cataloguing.")}</p><Button asChild size="sm"><Link to="/dashboard/welcome">{t("Create my first museum")}</Link></Button></div>) : (myMuseums.map((m) => (<div key={m.id} className="flex items-center gap-4 rounded-md border border-border/70 p-3">
                <img src={m.cover} alt={m.title} loading="lazy" className="size-14 rounded object-cover"/>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {objectsOf(m.id).length}{t(" objects \u00B7 ")}{m.category}
                  </p>
                </div>
                <Badge variant={m.isPublic ? "default" : "secondary"}>
                  {m.isPublic ? t("Public") : t("Private")}
                </Badge>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/m/$slug" params={{ slug: m.slug }}>{t("View")}</Link>
                </Button>
              </div>)))}
        </CardContent>
      </Card>
      <ProductTour open={tourOpen} onClose={closeTour}/>
    </div>);
}
