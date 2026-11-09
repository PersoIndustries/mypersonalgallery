import { useI18n } from '@/lib/i18n';
import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { addTag, cleanSpecs, toggleId } from "@/lib/collections";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { ImageUploader } from "@/components/image-uploader";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { CATEGORIES, CONDITIONS, FEATURES, museumFeatures, type CollectionObject, type Condition, type FeatureKey, type SpecPair, } from "@/lib/types";
interface Form {
    title: string;
    description: string;
    year: string;
    manufacturer: string;
    model: string;
    category: string;
    condition: Condition;
    images: string;
    tags: string[];
    tagDraft: string;
    specs: SpecPair[];
    collectionIds: string[];
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
    images: (o?.images ?? []).filter((i) => !i.includes("picsum.photos/seed/newobject")).join("\n"),
    tags: o?.tags ?? [],
    tagDraft: "",
    specs: o?.specs?.length ? o.specs.map((s) => ({ ...s })) : [{ key: "", value: "" }],
    collectionIds: o?.collectionIds ?? [],
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
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const saveLock = useRef(false);
    useEffect(() => {
        if (open)
            setF(toForm(object, museum?.category ?? CATEGORIES[0]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, object?.id]);
    const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
    const museumFlags = museumFeatures(museum);
    const collections = museum?.collections ?? [];
    const setSpec = (i: number, patch: Partial<SpecPair>) => setF((p) => ({ ...p, specs: p.specs.map((s, j) => j === i ? { ...s, ...patch } : s) }));
    const commitTag = () => setF((p) => ({ ...p, tags: addTag(p.tags, p.tagDraft), tagDraft: "" }));
    const save = async () => {
        if (saveLock.current || uploading) return;
        saveLock.current = true;
        setSaving(true);
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
                tags: addTag(f.tags, f.tagDraft),
                specs: cleanSpecs(f.specs),
                collectionIds: f.collectionIds.filter((id) => collections.some((c) => c.id === id)),
                history: f.history,
                images: images.length ? images : [PLACEHOLDER_IMAGE],
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
            toast.error(e instanceof Error ? e.message : t("Unable to save object"));
        }
        finally {
            saveLock.current = false;
            setSaving(false);
        }
    };
    const field = (id: keyof Form, label: string, placeholder?: string) => (<div className="space-y-2">
      <Label htmlFor={`oe-${id}`}>{t(label)}</Label>
      <Input id={`oe-${id}`} value={f[id] as string} placeholder={placeholder} onChange={(e) => set(id, e.target.value as never)}/>
    </div>);
    return (<Dialog open={open} onOpenChange={(next) => { if (!saving && !uploading) onOpenChange(next); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {object ? t("Edit object") : t("Add object")}
          </DialogTitle>
          <DialogDescription>{t("Fill in the record and decide what visitors can see.")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
            <div>
              <p className="text-sm font-medium">{t("Visible to visitors")}</p>
              <p className="text-xs text-muted-foreground">{t("Hidden objects stay in your internal catalogue only.")}</p>
            </div>
            <Switch checked={f.isVisible} onCheckedChange={(v) => set("isVisible", v)}/>
          </div>

          {field("title", "Title", "SCR-536 Handie-Talkie")}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("manufacturer", "Manufacturer")}
            {field("model", "Model")}
            {field("year", "Year", "1942")}
            {field("price", "Approx. price", "€1,200 – €1,500")}
            <div className="space-y-2">
              <Label>{t("Condition")}</Label>
              <Select value={f.condition} onValueChange={(v) => set("condition", v as Condition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (<SelectItem key={c} value={c}>
                      {t(c)}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Category")}</Label>
              <Select value={f.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>
                      {t(c)}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oe-desc">{t("Description")}</Label>
            <Textarea id="oe-desc" rows={3} value={f.description} onChange={(e) => set("description", e.target.value)}/>
          </div>
          <div className="space-y-2">
            <Label>{t("Images")}</Label>
            <ImageUploader onUploadingChange={setUploading} images={lines(f.images).filter((i) => i !== PLACEHOLDER_IMAGE)} onChange={(fn) => setF((p) => ({ ...p, images: fn(lines(p.images).filter((i) => i !== PLACEHOLDER_IMAGE)).join("\n") }))}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oe-tags">{t("Tags")}</Label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
              {f.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  {tag}
                  <button type="button" aria-label={`${t("Remove")} ${tag}`} onClick={() => set("tags", f.tags.filter((x) => x !== tag))}><X className="size-3"/></button>
                </span>))}
              <input id="oe-tags" className="min-w-32 flex-1 bg-transparent py-1 text-sm outline-none" value={f.tagDraft} placeholder={t("Type a tag and press Enter")} onChange={(e) => { const v = e.target.value; if (v.endsWith(",")) setF((p) => ({ ...p, tags: addTag(p.tags, v), tagDraft: "" })); else set("tagDraft", v); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitTag(); } else if (e.key === "Backspace" && !f.tagDraft && f.tags.length) set("tags", f.tags.slice(0, -1)); }} onBlur={commitTag}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("Specifications")}</Label>
            <div className="space-y-2">
              {f.specs.map((sp, i) => (<div key={i} className="flex gap-2">
                  <Input aria-label={t("Name")} placeholder={t("e.g. Weight")} value={sp.key} onChange={(e) => setSpec(i, { key: e.target.value })} className="w-2/5"/>
                  <Input aria-label={t("Value")} placeholder={t("e.g. 2.3 kg")} value={sp.value} onChange={(e) => setSpec(i, { value: e.target.value })}/>
                  <Button type="button" variant="ghost" size="icon" aria-label={t("Remove")} onClick={() => set("specs", f.specs.filter((_, j) => j !== i))}><X className="size-4"/></Button>
                </div>))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("specs", [...f.specs, { key: "", value: "" }])}><Plus className="size-4"/>{t("Add specification")}</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("Collections")}</Label>
            {collections.length === 0 ? (<p className="text-xs text-muted-foreground">{t("Create collections from the museum's Collections tab to group objects.")}</p>) : (<div className="flex flex-wrap gap-2">
                {collections.map((c) => { const on = f.collectionIds.includes(c.id); return (<Button key={c.id} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => set("collectionIds", toggleId(f.collectionIds, c.id))}>{c.name}</Button>); })}
              </div>)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="oe-history">{t("Provenance")}</Label>
            <Textarea id="oe-history" rows={3} value={f.history} onChange={(e) => set("history", e.target.value)}/>
          </div>
          {field("modelUrl", "3D model URL (.glb)", "https://…/model.glb")}
          <div className="space-y-2">
            <Label htmlFor="oe-links">{t("Links (one \"Label | URL\" per line)")}</Label>
            <Textarea id="oe-links" rows={2} value={f.links} placeholder={t("Wikipedia | https://en.wikipedia.org/\u2026")} onChange={(e) => set("links", e.target.value)}/>
          </div>

          <div className="rounded-md border border-border/70 p-3">
            <p className="text-sm font-medium">{t("Public sections for this object")}</p>
            <p className="mb-3 text-xs text-muted-foreground">{t("Sections disabled at museum level are greyed out.")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURES.filter((x) => !x.museumOnly).map((feat) => {
            const enabled = museumFlags[feat.key];
            return (<label key={feat.key} className={`flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm ${enabled ? "" : "opacity-40"}`}>
                    {t(feat.label)}
                    <Switch disabled={!enabled} checked={enabled && !f.hiddenFeatures.includes(feat.key)} onCheckedChange={(v) => set("hiddenFeatures", v
                    ? f.hiddenFeatures.filter((k) => k !== feat.key)
                    : [...f.hiddenFeatures, feat.key])}/>
                  </label>);
        })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" disabled={saving || uploading} onClick={() => onOpenChange(false)}>{t("Cancel")}</Button>
          <Button disabled={saving || uploading} onClick={() => void save()}>{(saving || uploading) && <Loader2 className="animate-spin"/>}{saving ? t("Saving…") : object ? t("Save changes") : t("Add object")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
