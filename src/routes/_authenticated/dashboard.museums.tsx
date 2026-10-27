import { useI18n } from '@/lib/i18n';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Boxes, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ObjectEditor } from "@/components/object-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { CATEGORIES, type CollectionObject } from "@/lib/types";
export const Route = createFileRoute("/_authenticated/dashboard/museums")({
    head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Manage museums — MyOwnMuseum" }, { name: "description", content: "Manage museums." }, { property: "og:title", content: "Manage museums — MyOwnMuseum" }, { property: "og:description", content: "Manage museums." }, { name: "robots", content: "noindex" }] }),
    component: DashboardMuseums,
});
interface MuseumForm {
    title: string;
    description: string;
    cover: string;
    category: string;
    isPublic: boolean;
}
const emptyMuseum: MuseumForm = {
    title: "",
    description: "",
    cover: "https://picsum.photos/seed/newmuseum/1200/800",
    category: CATEGORIES[0],
    isPublic: true,
};
function DashboardMuseums() {
    const { t } = useI18n();
    const { currentUser, museumsOf, objectsOf, createMuseum, updateMuseum, deleteMuseum, deleteObject } = useStore();
    const [museumDialog, setMuseumDialog] = useState<{
        id: string | null;
    } | null>(null);
    const [museumForm, setMuseumForm] = useState<MuseumForm>(emptyMuseum);
    const [objectDialog, setObjectDialog] = useState<string | null>(null);
    const [editObj, setEditObj] = useState<CollectionObject | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    if (!currentUser)
        return null;
    const myMuseums = museumsOf(currentUser.id);
    const openNewMuseum = () => {
        setMuseumForm(emptyMuseum);
        setMuseumDialog({ id: null });
    };
    const openEditMuseum = (id: string) => {
        const m = myMuseums.find((x) => x.id === id);
        if (!m)
            return;
        setMuseumForm({
            title: m.title,
            description: m.description,
            cover: m.cover,
            category: m.category,
            isPublic: m.isPublic,
        });
        setMuseumDialog({ id });
    };
    const saveMuseum = async () => {
        try {
            if (!museumForm.title.trim()) {
                toast.error(t("Give your museum a title"));
                return;
            }
            if (museumDialog?.id) {
                await updateMuseum(museumDialog.id, museumForm);
                toast.success(t("Museum updated"));
            }
            else {
                await createMuseum(museumForm);
                toast.success(t("Museum created"));
            }
            setMuseumDialog(null);
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "Unable to save museum");
        }
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{t("Museums")}</h2>
          <p className="text-sm text-muted-foreground">{t("Create galleries and catalogue the objects inside them.")}</p>
        </div>
        <Button onClick={openNewMuseum}>
          <Plus className="size-4"/>{t(" New museum")}</Button>
      </div>

      {myMuseums.length === 0 ? (<Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">{t("No museums yet. Create your first gallery to begin.")}</CardContent>
        </Card>) : (<div className="space-y-4">
          {myMuseums.map((m) => {
                const objs = objectsOf(m.id);
                const open = expanded === m.id;
                return (<Card key={m.id}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <img src={m.cover} alt={m.title} loading="lazy" className="size-16 rounded object-cover"/>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate font-display text-xl">{m.title}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {objs.length}{t(" objects \u00B7 ")}{m.category}
                    </p>
                  </div>
                  <Badge variant={m.isPublic ? t("default") : t("secondary")}>
                    {m.isPublic ? t("Public") : t("Private")}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button asChild size="sm">
                      <Link to="/dashboard/museum/$museumId" params={{ museumId: m.id }}>
                        <Settings2 className="size-4"/>{t(" Set up")}</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(open ? null : m.id)}>
                      <Boxes className="size-4"/>{t(" Objects")}</Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditMuseum(m.id)}>
                      <Pencil className="size-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void deleteMuseum(m.id).then(() => toast.success(t("Museum removed"))).catch(e => toast.error(e.message))}>
                      <Trash2 className="size-4 text-destructive"/>
                    </Button>
                  </div>
                </CardHeader>

                {open && (<CardContent className="space-y-2 border-t border-border/70 pt-4">
                    <div className="flex justify-end">
                      <Button size="sm" variant="secondary" onClick={() => {
                            setEditObj(null);
                            setObjectDialog(m.id);
                        }}>
                        <Plus className="size-4"/>{t(" Add object")}</Button>
                    </div>
                    {objs.length === 0 ? (<p className="py-4 text-center text-sm text-muted-foreground">{t("This gallery is empty.")}</p>) : (objs.map((o) => (<div key={o.id} className="flex items-center gap-3 rounded-md border border-border/70 p-2">
                          <img src={o.images[0]} alt={o.title} loading="lazy" className="size-10 rounded object-cover"/>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{o.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {o.manufacturer || t("Unknown maker")}{t(" \u00B7 ")}{o.year || t("n.d.")}
                            </p>
                          </div>
                          {o.isVisible === false && (<Badge variant="outline" className="text-[10px]">{t("Hidden")}</Badge>)}
                          <Button variant="ghost" size="icon" onClick={() => setEditObj(o)} aria-label={t("Edit object")}>
                            <Pencil className="size-4"/>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/o/$objectId" params={{ objectId: o.id }}>{t("Open")}</Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => void deleteObject(o.id).then(() => toast.success(t("Object removed"))).catch(e => toast.error(e.message))}>
                            <Trash2 className="size-4 text-destructive"/>
                          </Button>
                        </div>)))}
                  </CardContent>)}
              </Card>);
            })}
        </div>)}

      <Dialog open={!!museumDialog} onOpenChange={(o) => !o && setMuseumDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {museumDialog?.id ? t("Edit museum") : t("New museum")}
            </DialogTitle>
            <DialogDescription>{t("Museums group objects around a theme, era or maker.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m-title">{t("Title")}</Label>
              <Input id="m-title" value={museumForm.title} onChange={(e) => setMuseumForm({ ...museumForm, title: e.target.value })} placeholder={t("Signals of the Front")}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc">{t("Description")}</Label>
              <Textarea id="m-desc" rows={4} value={museumForm.description} onChange={(e) => setMuseumForm({ ...museumForm, description: e.target.value })} placeholder={t("What is this collection about?")}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-cover">{t("Cover image URL")}</Label>
              <Input id="m-cover" value={museumForm.cover} onChange={(e) => setMuseumForm({ ...museumForm, cover: e.target.value })}/>
            </div>
            <div className="space-y-2">
              <Label>{t("Category")}</Label>
              <Select value={museumForm.category} onValueChange={(v) => setMuseumForm({ ...museumForm, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">{t("Public museum")}</p>
                <p className="text-xs text-muted-foreground">{t("Public museums appear in Explore and on your profile.")}</p>
              </div>
              <Switch checked={museumForm.isPublic} onCheckedChange={(v) => setMuseumForm({ ...museumForm, isPublic: v })}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMuseumDialog(null)}>{t("Cancel")}</Button>
            <Button onClick={saveMuseum}>{t("Save museum")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {objectDialog && (<ObjectEditor museumId={objectDialog} object={editObj} open={!!objectDialog} onOpenChange={(o) => {
                if (!o) {
                    setObjectDialog(null);
                    setEditObj(null);
                }
            }}/>)}
    </div>);
}
