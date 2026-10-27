import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, Eye, EyeOff, ExternalLink, Globe, Lock, Pencil, Plus, Trash2, } from "lucide-react";
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
    if (!museum || museum.ownerId !== currentUser?.id) {
        return (<EmptyState icon= title={t("Museum not found")} description={t("This museum doesn't exist or isn't yours.")} action=/>);
    }
    const objs = objectsOf(museum.id);
    const visibleCount = objs.filter((o) => o.isVisible !== false).length;
    const flags = museumFeatures(museum);
    const setFlag = (k: FeatureKey, v: boolean) => void updateMuseum(museum.id, { features: { ...flags, [k]: v } }).catch(e => toast.error(e.message));
    const previewItems = visitorView ? objs.filter((o) => o.isVisible !== false) : objs;
    return (<div className="space-y-6">
      <Link to="/dashboard/museums" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5"/>{t(" All museums")}</Link>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-card p-4">
        <img src= alt= className="size-16 rounded object-cover"/>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-2xl"></h2>
          <p className="text-xs text-muted-foreground">
            {t(" of ")}{t(" objects visible \u00B7 ")}
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm">
          
          
          <Switch checked= onCheckedChange=/>
        </label>
        <Button asChild>
          <Link to="/m/$slug" params=>
            <ExternalLink className="size-4"/>{t(" View my museum")}</Link>
        </Button>
      </div>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">{t("Preview")}</TabsTrigger>
          <TabsTrigger value="objects">{t("Objects (")}{t(")")}</TabsTrigger>
          <TabsTrigger value="setup">{t("Setup")}</TabsTrigger>
        </TabsList>

        {/* PREVIEW */}
        <TabsContent value="preview" className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              
            </p>
            <label className="flex items-center gap-2 text-sm">{t("Visitor view")}<Switch checked= onCheckedChange=/>
            </label>
          </div>
          
        </TabsContent>

        {/* OBJECTS */}
        <TabsContent value="objects" className="mt-5 space-y-3">
          <div className="flex justify-end">
            <Button onClick=>
              <Plus className="size-4"/>{t(" Add object")}</Button>
          </div>
          
        </TabsContent>

        {/* SETUP */}
        <TabsContent value="setup" className="mt-5 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">{t("Museum details")}</CardTitle>
              <CardDescription>{t("Changes are saved automatically.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-title">{t("Title")}</Label>
                <Input id="s-title" defaultValue= onChange= onBlur=/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-desc">{t("Description")}</Label>
                <Textarea id="s-desc" rows= defaultValue= onBlur=/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-cover">{t("Cover image URL")}</Label>
                <Input id="s-cover" defaultValue= onBlur=/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">{t("Public sections")}</CardTitle>
              <CardDescription>{t("Choose what visitors see. Disabled sections stay internal. Each object can hide more from its own editor.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ObjectEditor museumId= object= open= onOpenChange=/>
    </div>);
}
