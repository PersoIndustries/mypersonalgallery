import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Boxes,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
import {
  FEATURES,
  museumFeatures,
  showFeature,
  type CollectionObject,
  type FeatureKey,
} from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard/museum/$museumId")({
  head: () => ({
    meta: [
      {property:"og:type",content:"website"},
      {name:"twitter:card",content:"summary_large_image"},
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
  const { museumId } = Route.useParams();
  const { getMuseum, objectsOf, updateMuseum, updateObject, deleteObject, currentUser } =
    useStore();
  const museum = getMuseum(museumId);
  const [editor, setEditor] = useState<{ object: CollectionObject | null } | null>(null);
  const [visitorView, setVisitorView] = useState(false);

  if (!museum || museum.ownerId !== currentUser?.id) {
    return (
      <EmptyState
        icon={Boxes}
        title="Museum not found"
        description="This museum doesn't exist or isn't yours."
        action={
          <Button asChild variant="outline">
            <Link to="/dashboard/museums">Back to museums</Link>
          </Button>
        }
      />
    );
  }

  const objs = objectsOf(museum.id);
  const visibleCount = objs.filter((o) => o.isVisible !== false).length;
  const flags = museumFeatures(museum);
  const setFlag = (k: FeatureKey, v: boolean) =>
    void updateMuseum(museum.id, { features: { ...flags, [k]: v } }).catch(e=>toast.error(e.message));
  const previewItems = visitorView ? objs.filter((o) => o.isVisible !== false) : objs;

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/museums"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All museums
      </Link>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-card p-4">
        <img src={museum.cover} alt={museum.title} className="size-16 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-2xl">{museum.title}</h2>
          <p className="text-xs text-muted-foreground">
            {visibleCount} of {objs.length} objects visible · {museum.category}
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
          {museum.isPublic ? (
            <Globe className="size-4 text-primary" />
          ) : (
            <Lock className="size-4 text-muted-foreground" />
          )}
          {museum.isPublic ? "Public" : "Private"}
          <Switch
            checked={museum.isPublic}
            onCheckedChange={(v) => void updateMuseum(museum.id, { isPublic: v }).then(()=>toast.success(v?"Museum is now public":"Museum is now private")).catch(e=>toast.error(e.message))}
          />
        </label>
        <Button asChild>
          <Link to="/m/$slug" params={{ slug: museum.slug }}>
            <ExternalLink className="size-4" /> View my museum
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="objects">Objects ({objs.length})</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        {/* PREVIEW */}
        <TabsContent value="preview" className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {visitorView
                ? "Showing exactly what visitors see."
                : "Showing everything, hidden items are marked."}
            </p>
            <label className="flex items-center gap-2 text-sm">
              Visitor view
              <Switch checked={visitorView} onCheckedChange={setVisitorView} />
            </label>
          </div>
          {visitorView && !museum.isPublic ? (
            <EmptyState
              icon={Lock}
              title="This museum is private"
              description="Visitors can't see it. Switch it to public to open the doors."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/80">
              <div className="relative">
                <img
                  src={museum.cover}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
                <div className="relative p-8">
                  <Badge variant="secondary">{museum.category}</Badge>
                  <h3 className="mt-3 font-display text-3xl">{museum.title}</h3>
                  {(flags.description || !visitorView) && (
                    <p
                      className={`mt-2 max-w-2xl text-sm text-muted-foreground ${flags.description ? "" : "line-through opacity-50"}`}
                    >
                      {museum.description}
                    </p>
                  )}
                </div>
              </div>
              {previewItems.length === 0 ? (
                <p className="p-10 text-center text-sm text-muted-foreground">
                  No visible objects yet.
                </p>
              ) : (
                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {previewItems.map((o) => {
                    const hidden = o.isVisible === false;
                    return (
                      <div
                        key={o.id}
                        className={`group overflow-hidden rounded-lg border border-border/80 bg-card ${hidden ? "opacity-50" : ""}`}
                      >
                        <div className="relative aspect-4/3 overflow-hidden bg-muted">
                          <img
                            src={o.images[0]}
                            alt={o.title}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                          {hidden && (
                            <Badge variant="secondary" className="absolute left-2 top-2 gap-1">
                              <EyeOff className="size-3" /> Hidden
                            </Badge>
                          )}
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                            onClick={() => setEditor({ object: o })}
                            aria-label={`Edit ${o.title}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </div>
                        <div className="p-3">
                          <p className="eyebrow">
                            {o.year} · {o.manufacturer.split(" ")[0]}
                          </p>
                          <p className="mt-1 font-display text-lg leading-snug">{o.title}</p>
                          {showFeature(museum, o, "description") && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {o.description}
                            </p>
                          )}
                          {showFeature(museum, o, "price") && o.price && (
                            <p className="mt-2 text-xs text-primary">≈ {o.price}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* OBJECTS */}
        <TabsContent value="objects" className="mt-5 space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => setEditor({ object: null })}>
              <Plus className="size-4" /> Add object
            </Button>
          </div>
          {objs.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="This gallery is empty"
              description="Add your first object to start the catalogue."
            />
          ) : (
            objs.map((o) => {
              const visible = o.isVisible !== false;
              return (
                <div
                  key={o.id}
                  className="flex items-center gap-3 rounded-lg border border-border/80 bg-card p-3"
                >
                  <img
                    src={o.images[0]}
                    alt={o.title}
                    loading="lazy"
                    className={`size-12 rounded object-cover ${visible ? "" : "opacity-40"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.manufacturer || "Unknown maker"} · {o.year || "n.d."}
                      {o.hiddenFeatures?.length
                        ? ` · ${o.hiddenFeatures.length} sections hidden`
                        : ""}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    <Switch
                      checked={visible}
                      onCheckedChange={(v) => void updateObject(o.id, { isVisible: v }).catch(e=>toast.error(e.message))}
                      aria-label="Visible to visitors"
                    />
                  </label>
                  <Button variant="ghost" size="sm" onClick={() => setEditor({ object: o })}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void deleteObject(o.id).then(()=>toast.success("Object removed")).catch(e=>toast.error(e.message))}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* SETUP */}
        <TabsContent value="setup" className="mt-5 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Museum details</CardTitle>
              <CardDescription>Changes are saved automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-title">Title</Label>
                <Input
                  id="s-title"
                  defaultValue={museum.title}
                  onChange={(e) => { e.currentTarget.dataset["draft"]=e.target.value; }}
                  onBlur={(e) => void updateMuseum(museum.id, { title: e.target.value }).catch(e=>toast.error(e.message))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-desc">Description</Label>
                <Textarea
                  id="s-desc"
                  rows={4}
                  defaultValue={museum.description}
                  onBlur={(e) => void updateMuseum(museum.id, { description: e.target.value }).catch(e=>toast.error(e.message))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-cover">Cover image URL</Label>
                <Input
                  id="s-cover"
                  defaultValue={museum.cover}
                  onBlur={(e) => void updateMuseum(museum.id, { cover: e.target.value }).catch(e=>toast.error(e.message))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Public sections</CardTitle>
              <CardDescription>
                Choose what visitors see. Disabled sections stay internal. Each object can hide
                more from its own editor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {FEATURES.map((feat) => (
                <label
                  key={feat.key}
                  className="flex items-center justify-between gap-4 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm">{feat.label}</span>
                    <span className="block text-xs text-muted-foreground">{feat.hint}</span>
                  </span>
                  <Switch checked={flags[feat.key]} onCheckedChange={(v) => setFlag(feat.key, v)} />
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ObjectEditor
        museumId={museum.id}
        object={editor?.object ?? null}
        open={!!editor}
        onOpenChange={(o) => !o && setEditor(null)}
      />
    </div>
  );
}
