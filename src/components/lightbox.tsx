import { useI18n } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";
export function Lightbox({ images, index, onClose, onIndexChange, title, }: {
    images: string[];
    index: number | null;
    onClose: () => void;
    onIndexChange: (i: number) => void;
    title?: string | undefined;
}) {
    const { t } = useI18n();
    const open = index !== null;
    const step = useCallback((dir: number) => {
        if (index === null || images.length === 0)
            return;
        onIndexChange((index + dir + images.length) % images.length);
    }, [index, images.length, onIndexChange]);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape")
                onClose();
            if (e.key === "ArrowRight")
                step(1);
            if (e.key === "ArrowLeft")
                step(-1);
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose, step]);
    if (!open)
        return null;
    return (<div className="fixed inset-0 z-50 flex flex-col bg-background/96 backdrop-blur-md animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label={title ? `${title} gallery` : t("Image gallery")}>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-sm text-muted-foreground">
          {title && <span className="mr-3 text-foreground">{title}</span>}
          {(index ?? 0) + 1}{t(" / ")}{images.length}
        </div>
        <button onClick={onClose} aria-label={t("Close gallery")} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="size-5"/>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4">
        <button onClick={() => step(-1)} aria-label={t("Previous image")} className="absolute left-2 z-10 rounded-full border border-border/70 bg-surface/80 p-3 text-foreground transition hover:border-primary/50 hover:text-primary sm:left-6">
          <ChevronLeft className="size-5"/>
        </button>
        <img key={images[index ?? 0]} src={images[index ?? 0]} alt={title ?? "Collection image"} className="max-h-full max-w-full rounded-lg object-contain plinth animate-in fade-in zoom-in-95 duration-300"/>
        <button onClick={() => step(1)} aria-label={t("Next image")} className="absolute right-2 z-10 rounded-full border border-border/70 bg-surface/80 p-3 text-foreground transition hover:border-primary/50 hover:text-primary sm:right-6">
          <ChevronRight className="size-5"/>
        </button>
      </div>

      <div className="scrollbar-thin flex justify-center gap-2 overflow-x-auto px-4 pb-6">
        {images.map((src, i) => (<button key={src} onClick={() => onIndexChange(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border transition ${i === index ? "border-primary" : "border-border/70 opacity-55 hover:opacity-100"}`}>
            <img src={src} alt="" className="size-full object-cover"/>
          </button>))}
      </div>
    </div>);
}
