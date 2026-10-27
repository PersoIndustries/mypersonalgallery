import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Camera, Landmark, Radio, ScanLine, Sparkles } from "lucide-react";
import { CardSkeletonGrid, MuseumCard, ObjectCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { title: "MyOwnMuseum — Build a digital museum for your collection" },
            {
                name: "description",
                content: "Catalogue vintage radios, watches, cameras or any collection in a beautiful public museum. Images, documents, specs and provenance in one place.",
            },
            { property: "og:title", content: "MyOwnMuseum — Digital museums for collectors" },
            {
                property: "og:description",
                content: "Catalogue your collection beautifully and share it with the world.",
            },
        ],
    }),
    component: Home,
});
function Home() {
    const { t } = useI18n();
    const { publicMuseums: museums, publicObjects: objects, users, ready } = useStore();
    const featuredMuseums = museums.slice(0, 6);
    const featuredObjects = objects.filter((o) => o.featured).slice(0, 4);
    const heroObject = objects[0];
    return (<div>
      {/* Hero */}
      <section className="relative overflow-hidden vault-glow">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="fade-up">
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Sparkles className="size-3"/>{t(" For collectors and curators")}</Badge>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{t("Your collection")}<br />{t("deserves a")}{" "}
              <span className="italic text-gradient-gold">{t("museum")}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">{t("Catalogue every object with photographs, technical specifications, manuals and provenance \u2014 then publish it as a museum anyone can walk through.")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>{t("Start your museum ")}<ArrowRight className="size-4"/>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/explore">{t("Explore collections")}</Link>
              </Button>
            </div>
            <dl className="mt-12 flex gap-10">
              {[
            { label: "Museums", value: museums.length },
            { label: "Objects catalogued", value: objects.length },
            { label: "Collectors", value: users.length },
        ].map((s) => (<div key={s.label}>
                  <dt className="eyebrow">{s.label}</dt>
                  <dd className="mt-1 font-display text-3xl text-primary">{s.value}</dd>
                </div>))}
            </dl>
          </div>

          {heroObject && (<div className="relative fade-up">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/5 blur-2xl"/>
              <Link to="/o/$objectId" params={{ objectId: heroObject.id }} className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-card plinth">
                <div className="aspect-4/3 overflow-hidden">
                  <img src={heroObject.images[0]} alt={heroObject.title} className="size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"/>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-6 pt-16">
                  <p className="eyebrow">{t("Object of the day \u00B7 ")}{heroObject.year}</p>
                  <h2 className="mt-2 font-display text-2xl">{heroObject.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {heroObject.manufacturer}
                  </p>
                </div>
              </Link>
            </div>)}
        </div>
      </section>

      {/* Featured museums */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4 hairline pb-5">
          <div>
            <p className="eyebrow">{t("Now on display")}</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("Featured museums")}</h2>
          </div>
          <Button asChild variant="ghost" className="text-primary">
            <Link to="/explore">{t("View all ")}<ArrowRight className="size-4"/>
            </Link>
          </Button>
        </div>
        {!ready ? (<CardSkeletonGrid />) : (<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredMuseums.map((m) => (<MuseumCard key={m.id} museum={m} owner={users.find((u) => u.id === m.ownerId)} count={objects.filter((o) => o.museumId === m.id).length}/>))}
          </div>)}
      </section>

      {/* Featured objects */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 hairline pb-5">
          <p className="eyebrow">{t("Curator's picks")}</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("Remarkable objects")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredObjects.map((o) => (<ObjectCard key={o.id} object={o}/>))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border/80 bg-surface p-8 sm:p-12">
          <p className="eyebrow">{t("How it works")}</p>
          <h2 className="mt-2 max-w-xl font-display text-3xl sm:text-4xl">{t("Built for the way collectors actually document things")}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
            {
                icon: Landmark,
                title: "Create a museum",
                body: "One museum per collection — WWII field radios, dive watches, press cameras. Give it a cover, a category and a story.",
            },
            {
                icon: Boxes,
                title: "Catalogue objects",
                body: "Photograph galleries, key-value specifications, condition grading, provenance notes, manuals and schematics.",
            },
            {
                icon: ScanLine,
                title: "Share it publicly",
                body: "Every museum gets a public page and every object a permanent link you can send to fellow collectors.",
            },
        ].map((f) => (<div key={f.title}>
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/25">
                  <f.icon className="size-5"/>
                </span>
                <h3 className="mt-4 font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow mr-2">{t("Popular categories")}</span>
          {[
            { label: "Radios", icon: Radio },
            { label: "Aircraft Avionics", icon: ScanLine },
            { label: "Military Gear", icon: Landmark },
            { label: "Watches", icon: Sparkles },
            { label: "Cameras", icon: Camera },
        ].map((c) => (<Button key={c.label} asChild variant="outline" size="sm">
              <Link to="/explore" search={{ q: c.label }}>
                <c.icon className="size-3.5"/> {c.label}
              </Link>
            </Button>))}
        </div>
      </section>
    </div>);
}
