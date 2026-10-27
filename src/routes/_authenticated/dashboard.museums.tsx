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
        <Button onClick=>
          <Plus className="size-4"/>{t(" New museum")}</Button>
      </div>

      

      <Dialog open= onOpenChange=>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              
            </DialogTitle>
            <DialogDescription>{t("Museums group objects around a theme, era or maker.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m-title">{t("Title")}</Label>
              <Input id="m-title" value= onChange= placeholder={t("Signals of the Front")}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc">{t("Description")}</Label>
              <Textarea id="m-desc" rows= value= onChange= placeholder={t("What is this collection about?")}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-cover">{t("Cover image URL")}</Label>
              <Input id="m-cover" value= onChange=/>
            </div>
            <div className="space-y-2">
              <Label>{t("Category")}</Label>
              <Select value= onValueChange=>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">{t("Public museum")}</p>
                <p className="text-xs text-muted-foreground">{t("Public museums appear in Explore and on your profile.")}</p>
              </div>
              <Switch checked= onCheckedChange=/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick=>{t("Cancel")}</Button>
            <Button onClick=>{t("Save museum")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
    </div>);
}
