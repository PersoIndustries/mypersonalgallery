import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Plus, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { PLACEHOLDER_IMAGE } from '@/lib/placeholder';
import { uploadObjectImage, IMAGE_TYPES, IMAGE_MAX_BYTES } from '@/lib/images.functions';
import { resizeImage } from '@/lib/resize-image';
import { supabase } from '@/integrations/supabase/client';

type Update = (fn: (prev: string[]) => string[]) => void;

export function ImageUploader({ images, onChange }: { images: string[]; onChange: Update }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [url, setUrl] = useState('');
  const camera = useRef<HTMLInputElement>(null);
  const [canCapture, setCanCapture] = useState(false);
  useEffect(() => {
    // Phones and tablets (incl. iPadOS, which reports as Mac with touch)
    const touch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1;
    setCanCapture(touch && /Android|iPhone|iPad|iPod|Mobile|Macintosh/i.test(navigator.userAgent));
  }, []);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const original of list) {
      if (!IMAGE_TYPES.includes(original.type)) { toast.error(t('{name}: unsupported format', { name: original.name })); continue; }
      const file = await resizeImage(original);
      if (file.size > IMAGE_MAX_BYTES) { toast.error(t('{name}: larger than 10 MB', { name: file.name })); continue; }
      setUploading(n => n + 1);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const { url } = await uploadObjectImage({ data: fd });
        onChange(prev => [...prev, url]);
      } catch (e) {
        toast.error(`${file.name}: ${e instanceof Error ? e.message : t('Upload failed')}`);
      } finally { setUploading(n => n - 1); }
    }
  };

  const addUrl = () => {
    const v = url.trim();
    if (!/^https?:\/\/\S+$/i.test(v)) { toast.error(t('Enter a valid image link (https://…)')); return; }
    onChange(prev => (prev.includes(v) ? prev : [...prev, v]));
    setUrl('');
  };

  const remove = (src: string) => {
    onChange(prev => prev.filter(i => i !== src));
    const path = src.startsWith('/api/public/images/') ? src.slice('/api/public/images/'.length) : null;
    if (path) void supabase.storage.from('object-images').remove([path]);
  };
  const makeCover = (src: string) => onChange(prev => [src, ...prev.filter(i => i !== src)]);

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => input.current?.click()} disabled={uploading > 0}
        onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void upload(e.dataTransfer.files); }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'}`}>
        {uploading > 0 ? <Loader2 className="size-6 animate-spin text-primary" /> : <ImagePlus className="size-6 text-muted-foreground" />}
        <span className="font-medium">{uploading > 0 ? t('Uploading {count}…', { count: uploading }) : t('Drop images here or click to choose')}</span>
        <span className="text-xs text-muted-foreground">{t('JPG, PNG, WEBP, GIF · max 10 MB each')}</span>
      </button>
      <input ref={input} type="file" accept={IMAGE_TYPES.join(',')} multiple hidden onChange={e => { if (e.target.files?.length) void upload(e.target.files); e.target.value = ''; }} />
      {canCapture && (
        <>
          <Button type="button" variant="outline" className="w-full" disabled={uploading > 0} onClick={() => camera.current?.click()}>
            <Camera className="size-4" /> {t('Take photo')}
          </Button>
          <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={e => { if (e.target.files?.length) void upload(e.target.files); e.target.value = ''; }} />
        </>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-md border border-border">
              <img src={src} alt="" onError={e => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} className="size-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">{t('Cover')}</span>}
              <div className="absolute right-1 top-1 flex gap-1">
                {i !== 0 && <button type="button" onClick={() => makeCover(src)} aria-label={t('Use as cover')} className="rounded-full bg-background/85 p-1 text-foreground hover:bg-background"><Star className="size-3.5" /></button>}
                <button type="button" onClick={() => remove(src)} aria-label={t('Remove image')} className="rounded-full bg-background/85 p-1 text-destructive hover:bg-background"><X className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder={t('Or paste an image link (https://…)')}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }} />
        <Button type="button" variant="outline" size="icon" onClick={addUrl} aria-label={t('Add image link')}><Plus className="size-4" /></Button>
      </div>
    </div>
  );
}
