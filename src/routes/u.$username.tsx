import { useI18n } from '@/lib/i18n';
import { getPublicCatalog } from '@/lib/catalog.functions';
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Landmark, MapPin } from "lucide-react";
import { EmptyState, MuseumCard } from "@/components/cards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
export const Route = createFileRoute("/u/$username")({
    loader: async ({ params }) => { const c = await getPublicCatalog(); return c.users.find(u => u.username === params.username) ?? null; },
    head: ({ loaderData }) => { const title = (loaderData?.name ?? 'Collection') + ' — MyOwnMuseum'; const description = loaderData?.bio || 'A curator profile on MyOwnMuseum.'; const image = loaderData?.avatar; return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, ...(image?.startsWith('https://') ? [{ property: 'og:image', content: image }, { name: 'twitter:image', content: image }] : [])] }; },
    component: Profile,
});
function Profile() {
    const { t } = useI18n();
    const { username } = Route.useParams();
    const { users, publicMuseums: museums, publicObjects: objects, currentUser } = useStore();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
        return (<div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState icon= title={t("No collector here")} description= action=/>
      </div>);
    }
    const owned = museums.filter((m) => m.ownerId === user.id);
    const objectCount = objects.filter((o) => owned.some((m) => m.id === o.museumId)).length;
    const isMe = currentUser?.id === user.id;
    return (<div>
      <div className="border-b border-border/70 bg-surface/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-end sm:px-6">
          <Avatar className="size-24 ring-2 ring-primary/25 sm:size-28">
            <AvatarImage src= alt=/>
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex-1 fade-up">
            <p className="eyebrow">{t("Curator")}</p>
            <h1 className="mt-1 font-display text-4xl sm:text-5xl"></h1>
            <p className="mt-1 text-primary/85">{t("@")}</p>
            
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5"/>{t(" Joined ")}
              </span>
              <span>{t(" museums")}</span>
              <span>{t(" objects")}</span>
            </div>
          </div>
          
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl">{t("Museums")}</h2>
        
      </div>
    </div>);
}
void notFound;
