import { useI18n } from '@/lib/i18n';
import { getPublicCatalog } from '@/lib/catalog.functions';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Calendar, Download, FileText, Rotate3d, ShieldCheck, Tag, } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/cards";
import { Lightbox } from "@/components/lightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/o/$objectId")({
    loader: async ({ params }) => { const c = await getPublicCatalog(); return c.objects.find(o => o.id === params.objectId) ?? null; },
    head: ({ loaderData }) => { const title = (loaderData?.title ?? 'Collection') + ' — MyOwnMuseum'; const description = loaderData?.description || 'A collection object on MyOwnMuseum.'; const image = loaderData?.images?.[0]; return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, ...(image?.startsWith('https://') ? [{ property: 'og:image', content: image }, { name: 'twitter:image', content: image }] : [])] }; },
    component: ObjectPage,
});
function ObjectPage() {
    const { t } = useI18n();
    const { objectId } = Route.useParams();
    const { getObject, museums, users } = useStore();
    const object = getObject(objectId);
    const [active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState<number | null>(null);
    if (!object) {
        return (<div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState icon= title={t("Object not found")} description={t("This record is no longer in the catalogue.")} action=/>
      </div>);
    }
    const museum = museums.find((m) => m.id === object.museumId);
    const owner = users.find((u) => u.id === museum?.ownerId);
    return (<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link to="/explore" className="hover:text-foreground">{t("Explore")}</Link>
        <span>{t("/")}</span>
        
        <span className="text-foreground"></span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="fade-up">
          <button onClick= className="group block w-full overflow-hidden rounded-xl border border-border/80 bg-muted plinth" aria-label={t("Open full-size gallery")}>
            <img src= alt= className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"/>
          </button>
          <div className="scrollbar-thin mt-3 flex gap-3 overflow-x-auto pb-1">
            
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/25">
                <Rotate3d className="size-5"/>
              </span>
              <div>
                <p className="text-sm font-medium">{t("3D model")}</p>
                <p className="text-xs text-muted-foreground">
                  
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled=>
              
            </Button>
          </div>
        </div>

        <div className="fade-up">
          <p className="eyebrow">
            {t(" \u00B7 ")}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl"></h1>
          <p className="mt-2 text-muted-foreground">
             
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat icon= label={t("Year")} value=/>
            <Stat icon= label={t("Condition")} value=/>
            <Stat icon= label={t("Catalogued")} value=/>
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground"></p>

          <div className="mt-5 flex flex-wrap gap-2">
            
          </div>

          

          <Tabs defaultValue="specs" className="mt-8">
            <TabsList>
              <TabsTrigger value="specs">{t("Specifications")}</TabsTrigger>
              <TabsTrigger value="history">{t("Provenance")}</TabsTrigger>
              <TabsTrigger value="docs">{t("Documents (")}{t(")")}</TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-5">
              <dl className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80">
                
              </dl>
            </TabsContent>

            <TabsContent value="history" className="mt-5">
              <div className="rounded-xl border border-border/80 bg-surface/40 p-5 text-sm leading-relaxed text-muted-foreground">
                
              </div>
            </TabsContent>

            <TabsContent value="docs" className="mt-5">
              
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Lightbox images= index= onClose= onIndexChange= title=/>
    </div>);
}
function Stat({ icon: Icon, label, value, }: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    label: string;
    value: string;
}) {
    const { t } = useI18n();
    return (<div className="rounded-lg border border-border/80 bg-surface/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5"/> 
      </p>
      <p className="mt-1 truncate text-sm"></p>
    </div>);
}
