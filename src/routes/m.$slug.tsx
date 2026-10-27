import { useI18n } from '@/lib/i18n';
import { getPublicCatalog } from '@/lib/catalog.functions';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Landmark, Lock, Search, Settings2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, ObjectCard } from "@/components/cards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/m/$slug")({
    loader: async ({ params }) => { const c = await getPublicCatalog(); return c.museums.find(m => m.slug === params.slug) ?? null; },
    head: ({ loaderData }) => { const title = (loaderData?.title ?? 'Collection') + ' — MyOwnMuseum'; const description = loaderData?.description || 'A curated digital museum on MyOwnMuseum.'; const image = loaderData?.cover; return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, ...(image?.startsWith('https://') ? [{ property: 'og:image', content: image }, { name: 'twitter:image', content: image }] : [])] }; },
    component: MuseumPage,
});
function MuseumPage() {
    const { t } = useI18n();
    const { slug } = Route.useParams();
    const { getMuseum, objectsOf, users, currentUser } = useStore();
    const museum = getMuseum(slug);
    const [query, setQuery] = useState("");
    if (!museum) {
        return (<div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState icon={Landmark} title={t("Museum not found")} description={t("This museum may have been closed or renamed.")} action={<Button asChild variant="outline">
              <Link to="/explore">{t("Explore museums")}</Link>
            </Button>}/>
      </div>);
    }
    const owner = users.find((u) => u.id === museum.ownerId);
    const items = objectsOf(museum.id);
    const term = query.toLowerCase();
    const shown = items.filter((o) => !term ||
        [o.title, o.manufacturer, o.model, o.year, ...o.tags].join(" ").toLowerCase().includes(term));
    const isOwner = currentUser?.id === museum.ownerId;
    return (<div>
      <section className="relative overflow-hidden border-b border-border/70">
        <img src={museum.cover} alt={museum.title} className="absolute inset-0 size-full object-cover opacity-30"/>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50"/>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{museum.category}</Badge>
            {!museum.isPublic && (<Badge variant="outline" className="gap-1">
                <Lock className="size-3"/>{t(" Private")}</Badge>)}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            {museum.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            {museum.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            {owner && (<Link to="/u/$username" params={{ username: owner.username }} className="group flex items-center gap-2.5">
                <Avatar className="size-9 ring-1 ring-border">
                  <AvatarImage src={owner.avatar} alt={owner.name}/>
                  <AvatarFallback>{owner.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  <span className="block transition-colors group-hover:text-primary">
                    {owner.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">{t("Curator")}</span>
                </span>
              </Link>)}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Boxes className="size-4"/> {items.length}{t(" objects")}</span>
            <span className="text-sm text-muted-foreground">{t("Opened ")}{museum.createdAt}</span>
            {isOwner && (<Button asChild size="sm" variant="outline" className="ml-auto">
                <Link to="/dashboard/museums">
                  <Settings2 className="size-4"/>{t(" Manage")}</Link>
              </Button>)}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl">{t("The catalogue")}</h2>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search this museum")} className="pl-9"/>
          </div>
        </div>

        {shown.length === 0 ? (<div className="mt-8">
            <EmptyState icon={Boxes} title={items.length === 0 ? t("No objects yet") : t("Nothing matches that search")} description={items.length === 0
                ? t("The curator hasn't catalogued anything in this museum.") : t("Try a different manufacturer, year or tag.")}/>
          </div>) : (<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((o) => (<ObjectCard key={o.id} object={o}/>))}
          </div>)}
      </div>
    </div>);
}
