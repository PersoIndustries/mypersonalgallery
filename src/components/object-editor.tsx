import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { CATEGORIES, CONDITIONS, FEATURES, museumFeatures, type CollectionObject, type Condition, type FeatureKey, } from "@/lib/types";
interface Form {
    title: string;
    description: string;
    year: string;
    manufacturer: string;
    model: string;
    category: string;
    condition: Condition;
    images: string;
    tags: string;
    specs: string;
    history: string;
    modelUrl: string;
    price: string;
    links: string;
    isVisible: boolean;
    hiddenFeatures: FeatureKey[];
}
const toForm = (o: CollectionObject | null, category: string): Form => ({
    title: o?.title ?? "",
    description: o?.description ?? "",
    year: o?.year ?? "",
    manufacturer: o?.manufacturer ?? "",
    model: o?.model ?? "",
    category: o?.category ?? category,
    condition: o?.condition ?? "Excellent",
    images: (o?.images ?? ["https://picsum.photos/seed/newobject/1200/900"]).join("\n"),
    tags: (o?.tags ?? []).join(", "),
    specs: (o?.specs ?? []).map((s) => `${s.key}: ${s.value}`).join("\n"),
    history: o?.history ?? "",
    modelUrl: o?.modelUrl ?? "",
    price: o?.price ?? "",
    links: (o?.links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n"),
    isVisible: o?.isVisible !== false,
    hiddenFeatures: o?.hiddenFeatures ?? [],
});
const lines = (v: string) => v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
export function ObjectEditor({ museumId, object, open, onOpenChange, }: {
    museumId: string;
    object: CollectionObject | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useI18n();
    const { getMuseum, createObject, updateObject } = useStore();
    const museum = getMuseum(museumId);
    const [f, setF] = useState<Form>(() => toForm(object, museum?.category ?? CATEGORIES[0]));
    useEffect(() => {
        if (open)
            setF(toForm(object, museum?.category ?? CATEGORIES[0]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, object?.id]);
    const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
    const museumFlags = museumFeatures(museum);
    const save = async () => {
        try {
            if (!f.title.trim()) {
                toast.error(t("Give the object a title"));
                return;
            }
            const images = lines(f.images);
            const data = {
                title: f.title,
                description: f.description,
                year: f.year,
                manufacturer: f.manufacturer,
                model: f.model,
                category: f.category,
                condition: f.condition,
                tags: f.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                specs: lines(f.specs).map((l) => {
                    const i = l.indexOf(":");
                    return i === -1
                        ? { key: l, value: "" }
                        : { key: l.slice(0, i).trim(), value: l.slice(i + 1).trim() };
                }),
                history: f.history,
                images: images.length ? images : ["https://picsum.photos/seed/newobject/1200/900"],
                modelUrl: f.modelUrl.trim() || null,
                price: f.price.trim(),
                links: lines(f.links).map((l) => {
                    const [label, url] = l.includes("|") ? l.split("|").map((s) => s.trim()) : [l, l];
                    return { label: label || url || "", url: url || label || "" };
                }),
                isVisible: f.isVisible,
                hiddenFeatures: f.hiddenFeatures,
            };
            if (object) {
                await updateObject(object.id, data);
                toast.success(t("Object updated"));
            }
            else {
                await createObject(museumId, { ...data, documents: [] });
                toast.success(t("Object added to the catalogue"));
            }
            onOpenChange(false);
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "Unable to save object");
        }
    };
    const field = (id: keyof Form, label: string, placeholder?: string) => (<div className="space-y-2">
      <Label htmlFor=></Label>
      <Input id= value= placeholder= onChange=/>
    </div>);
    return (<Dialog open= onOpenChange=>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            
          </DialogTitle>
          <DialogDescription>{t("Fill in the record and decide what visitors can see.")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
            <div>
              <p className="text-sm font-medium">{t("Visible to visitors")}</p>
              <p className="text-xs text-muted-foreground">{t("Hidden objects stay in your internal catalogue only.")}</p>
            </div>
            <Switch checked= onCheckedChange=/>
          </div>

          
          <div className="grid gap-4 sm:grid-cols-2">
            
            
            
            
            <div className="space-y-2">
              <Label>{t("Condition")}</Label>
              <Select value= onValueChange=>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  
                </SelectContent>
              </Select>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="oe-desc">{t("Description")}</Label>
            <Textarea id="oe-desc" rows= value= onChange=/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oe-images">{t("Image URLs (one per line)")}</Label>
            <Textarea id="oe-images" rows= value= onChange=/>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="oe-specs">{t("Specifications (one \"Key: value\" per line)")}</Label>
            <Textarea id="oe-specs" rows= value= placeholder= onChange=/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oe-history">{t("Provenance")}</Label>
            <Textarea id="oe-history" rows= value= onChange=/>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="oe-links">{t("Links (one \"Label | URL\" per line)")}</Label>
            <Textarea id="oe-links" rows= value= placeholder={t("Wikipedia | https://en.wikipedia.org/\u2026")} onChange=/>
          </div>

          <div className="rounded-md border border-border/70 p-3">
            <p className="text-sm font-medium">{t("Public sections for this object")}</p>
            <p className="mb-3 text-xs text-muted-foreground">{t("Sections disabled at museum level are greyed out.")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick=>{t("Cancel")}</Button>
          <Button onClick=></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
