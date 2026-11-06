import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, Eye, EyeOff, ExternalLink, Globe, Lock, Pencil, Plus, Trash2, } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/cards";
import { ObjectEditor } from "@/components/object-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { FEATURES, museumFeatures, showFeature, type CollectionObject, type FeatureKey, } from "@/lib/types";
export const Route = createFileRoute("/_authenticated/dashboard/museum/$museumId")({
    head: () => ({
        meta: [
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { title: "Museum setup — MyOwnMuseum" },
            { name: "description", content: "Configure visibility and public sections of your museum." },
            { property: "og:title", content: "Museum setup — MyOwnMuseum" },
            { property: "og:description", content: "Preview and configure your digital museum." },
            { name: "robots", content: "noindex" },
        ],
    }),
    component: MuseumSetup,
});
function MuseumSetup() {
    const { t } = useI18n();
    const { museumId } = Route.useParams();
    const { getMuseum, objectsOf, updateMuseum, updateObject, deleteObject, currentUser } = useStore();
    const museum = getMuseum(museumId);
    const [editor, setEditor] = useState<{
        object: CollectionObject | null;
    } | null>(null);
    const [visitorView, setVisitorView] = useState(false);
    const [pendingSwitch, setPendingSwitch] = useState<string | null>(null);
    const switchLock = useRef(false);
    if (!museum || museum.ownerId !== currentUser?.id) {
        return (<EmptyState icon={Boxes} title={t("Museum not found")} description={t("This museum doesn't exist or isn't yours.")} action={<Button asChild variant="outline">
            <Link to="/dashboard/museums">{t("Back to museums")}</Link>
          </Button>}/>);
    }
    const objs = objectsOf(museum.id);
    const visibleCount = objs.filter((o) => o.isVisible !== false).length;
    const flags = museumFeatures(museum);
    const setFlag = (k: FeatureKey, v: boolean) => void updateMuseum(museum.id, { features: { ...flags, [k]: v } }).catch(e => toast.error(e.message));
    const previewItems = visitorView ? objs.filter((o) => o.isVisible !== false) : objs;
    return (<div className="space-y-6">
      <Link to="/dashboard/museums" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5"/>{t(" All museums")}</Link>

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
        <div className="min-w-0">
          <p className="eyebrow">{museum.category}</p>
          <h1 className="mt-1 truncate font-display text-3xl sm:text-4xl">{museum.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={museum.isPublic ? "default" : "secondary"} className="gap-1">
              {museum.isPublic ? <Globe className="size-3"/> : <Lock className="size-3"/>}
              {museum.isPublic ? t("Public") : t("Private")}
            </Badge>
            <span>{t("{count} objects", { count: objs.length })}</span>
            <span>·</span>
            <span>{t("{count} visible to visitors", { count: visibleCount })}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/m/$slug" params={{ slug: museum.slug }}>
              <ExternalLink className="size-4"/>{t("View public page")}</Link>
          </Button>
          <Button onClick={() => setEditor({ object: null })}>
            <Plus className="size-4"/>{t("Add object")}</Button>
        </div>
      </header>

      <Tabs defaultValue="objects">
        <TabsList>
          <TabsTrigger value="objects">{t("Objects")} ({objs.length})</TabsTrigger>
          <TabsTrigger value="preview">{t("Preview")}</TabsTrigger>
          <TabsTrigger value="setup">{t("Settings")}</TabsTrigger>
        </TabsList>

        {/* PREVIEW */}
        <TabsContent value="preview" className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {visitorView
            ? t("Showing exactly what visitors see.") : t("Showing everything, hidden items are marked.")}
            </p>
            <label className="flex items-center gap-2 text-sm">{t("Visitor view")}<Switch checked={visitorView} onCheckedChange={setVisitorView}/>
            </label>
          </div>
          {visitorView && !museum.isPublic ? (<EmptyState icon={Lock} title={t("This museum is private")} description={t("Visitors can't see it. Switch it to public to open the doors.")}/>) : (<div className="overflow-hidden rounded-xl border border-border/80">
              <div className="relative">
                <img src={museum.cover} alt="" className="absolute inset-0 size-full object-cover opacity-25"/>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50"/>
                <div className="relative p-8">
                  <Badge variant="secondary">{museum.category}</Badge>
                  <h3 className="mt-3 font-display text-3xl">{museum.title}</h3>
                  {(flags.description || !visitorView) && (<p className={`mt-2 max-w-2xl text-sm text-muted-foreground ${flags.description ? "" : "line-through opacity-50"}`}>
                      {museum.description}
                    </p>)}
                </div>
              </div>
              {previewItems.length === 0 ? (<p className="p-10 text-center text-sm text-muted-foreground">{t("No visible objects yet.")}</p>) : (<div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {previewItems.map((o) => {
                    const hidden = o.isVisible === false;
                    return (<div key={o.id} className={`group overflow-hidden rounded-lg border border-border/80 bg-card ${hidden ? "opacity-50" : ""}`}>
                        <div className="relative aspect-4/3 overflow-hidden bg-muted">
                          <img src={o.images[0]} alt={o.title} loading="lazy" className="size-full object-cover"/>
                          {hidden && (<Badge variant="secondary" className="absolute left-2 top-2 gap-1">
                              <EyeOff className="size-3"/>{t(" Hidden")}</Badge>)}
                          <Button size="icon" variant="secondary" className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100" onClick={() => setEditor({ object: o })} aria-label={`Edit ${o.title}`}>
                            <Pencil className="size-4"/>
                          </Button>
                        </div>
                        <div className="p-3">
                          <p className="eyebrow">
                            {o.year}{t(" \u00B7 ")}{o.manufacturer.split(" ")[0]}
                          </p>
                          <p className="mt-1 font-display text-lg leading-snug">{o.title}</p>
                          {showFeature(museum, o, "description") && (<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {o.description}
                            </p>)}
                          {showFeature(museum, o, "price") && o.price && (<p className="mt-2 text-xs text-primary">{t("\u2248 ")}{o.price}</p>)}
                        </div>
                      </div>);
                })}
                </div>)}
            </div>)}
        </TabsContent>

        {/* OBJECTS */}
        <TabsContent value="objects" className="mt-5">
          {objs.length === 0 ? (<EmptyState icon={Boxes} title={t("This gallery is empty")} description={t("Add your first object to start the catalogue.")} action={<Button onClick={() => setEditor({ object: null })}><Plus className="size-4"/>{t("Add object")}</Button>}/>) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {objs.map((o) => {
            const visible = o.isVisible !== false;
            return (<div key={o.id} className="group overflow-hidden rounded-lg border border-border/80 bg-card">
                    <button type="button" onClick={() => setEditor({ object: o })} className="relative block aspect-4/3 w-full overflow-hidden bg-muted" aria-label={`${t("Edit")} ${o.title}`}>
                      <img src={o.images[0]} alt={o.title} loading="lazy" className={`size-full object-cover transition group-hover:scale-[1.02] ${visible ? "" : "opacity-40"}`}/>
                      {!visible && (<Badge variant="secondary" className="absolute left-2 top-2 gap-1"><EyeOff className="size-3"/>{t("Hidden")}</Badge>)}
                    </button>
                    <div className="space-y-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-lg leading-snug">{o.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{o.manufacturer || t("Unknown maker")}{t(" \u00B7 ")}{o.year || t("n.d.")}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          {visible ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}
                          {visible ? t("Visible") : t("Hidden")}
                          <Switch checked={visible} onCheckedChange={(v) => void updateObject(o.id, { isVisible: v }).catch(e => toast.error(e.message))} aria-label={t("Visible to visitors")}/>
                        </label>
                        <div className="flex">
                          <Button variant="ghost" size="icon" onClick={() => setEditor({ object: o })} aria-label={t("Edit")}><Pencil className="size-4"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => void deleteObject(o.id).then(() => toast.success(t("Object removed"))).catch(e => toast.error(e.message))} aria-label={t("Delete")}><Trash2 className="size-4 text-destructive"/></Button>
                        </div>
                      </div>
                    </div>
                  </div>);
        })}
            </div>)}
        </TabsContent>

        {/* SETUP */}
        <TabsContent value="setup" className="mt-5 grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="flex items-start gap-3">
                {museum.isPublic ? <Globe className="mt-0.5 size-5 text-primary"/> : <Lock className="mt-0.5 size-5 text-muted-foreground"/>}
                <div>
                  <p className="text-sm font-medium">{museum.isPublic ? t("Your museum is public") : t("Your museum is private")}</p>
                  <p className="text-xs text-muted-foreground">{museum.isPublic ? t("Anyone with the link can visit it.") : t("Only you can see it until you publish it.")}</p>
                </div>
              </div>
              <Switch checked={museum.isPublic} aria-label={t("Public")} onCheckedChange={(v) => void updateMuseum(museum.id, { isPublic: v }).then(() => toast.success(v ? t("Museum is now public") : t("Museum is now private"))).catch(e => toast.error(e.message))}/>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">{t("Museum details")}</CardTitle>
              <CardDescription>{t("Changes are saved automatically.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-title">{t("Title")}</Label>
                <Input id="s-title" defaultValue={museum.title} onChange={(e) => { e.currentTarget.dataset["draft"] = e.target.value; }} onBlur={(e) => void updateMuseum(museum.id, { title: e.target.value }).catch(e => toast.error(e.message))}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-desc">{t("Description")}</Label>
                <Textarea id="s-desc" rows={4} defaultValue={museum.description} onBlur={(e) => void updateMuseum(museum.id, { description: e.target.value }).catch(e => toast.error(e.message))}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-cover">{t("Cover image URL")}</Label>
                <Input id="s-cover" defaultValue={museum.cover} onBlur={(e) => void updateMuseum(museum.id, { cover: e.target.value }).catch(e => toast.error(e.message))}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">{t("Public sections")}</CardTitle>
              <CardDescription>{t("Choose what visitors see. Disabled sections stay internal. Each object can hide more from its own editor.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {FEATURES.map((feat) => (<label key={feat.key} className="flex items-center justify-between gap-4 rounded-md px-2 py-2 hover:bg-muted/50">
                  <span>
                    <span className="block text-sm">{t(feat.label)}</span>
                    <span className="block text-xs text-muted-foreground">{t(feat.hint)}</span>
                  </span>
                  <Switch checked={flags[feat.key]} onCheckedChange={(v) => setFlag(feat.key, v)}/>
                </label>))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ObjectEditor museumId={museum.id} object={editor?.object ?? null} open={!!editor} onOpenChange={(o) => !o && setEditor(null)}/>
    </div>);
}
