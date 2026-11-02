import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { PLACEHOLDER_IMAGE } from '@/lib/placeholder';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX = 10 * 1024 * 1024;

export function ImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(0);

  const upload = async (files: FileList | File[]) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) { toast.error(t('Sign in to upload images')); return; }
    const list = Array.from(files);
    const added: string[] = [];
    setUploading(n => n + list.length);
    for (const file of list) {
      try {
        if (!TYPES.includes(file.type)) { toast.error(t('{name}: unsupported format', { name: file.name })); continue; }
        if (file.size > MAX) { toast.error(t('{name}: larger than 10 MB', { name: file.name })); continue; }
        const ext = (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
        const path = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('object-images').upload(path, file, { contentType: file.type });
        if (error) throw error;
        added.push(`/api/public/images/${path}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('Upload failed'));
      } finally { setUploading(n => n - 1); }
    }
    if (added.length) onChange([...images, ...added]);
  };

  const remove = async (src: string) => {
    onChange(images.filter(i => i !== src));
    const path = src.startsWith('/api/public/images/') ? src.slice('/api/public/images/'.length) : null;
    if (path) await supabase.storage.from('object-images').remove([path]);
  };
  const makeCover = (src: string) => onChange([src, ...images.filter(i => i !== src)]);

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => input.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void upload(e.dataTransfer.files); }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'}`}>
        {uploading > 0 ? <Loader2 className="size-6 animate-spin text-primary" /> : <ImagePlus className="size-6 text-muted-foreground" />}
        <span className="font-medium">{uploading > 0 ? t('Uploading {count}…', { count: uploading }) : t('Drop images here or click to choose')}</span>
        <span className="text-xs text-muted-foreground">{t('JPG, PNG, WEBP, GIF · max 10 MB each')}</span>
      </button>
      <input ref={input} type="file" accept={TYPES.join(',')} multiple hidden onChange={e => { if (e.target.files?.length) void upload(e.target.files); e.target.value = ''; }} />
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-md border border-border">
              <img src={src || PLACEHOLDER_IMAGE} alt="" className="size-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">{t('Cover')}</span>}
              <div className="absolute right-1 top-1 flex gap-1">
                {i !== 0 && <button type="button" onClick={() => makeCover(src)} aria-label={t('Use as cover')} className="rounded-full bg-background/85 p-1 text-foreground hover:bg-background"><Star className="size-3.5" /></button>}
                <button type="button" onClick={() => void remove(src)} aria-label={t('Remove image')} className="rounded-full bg-background/85 p-1 text-destructive hover:bg-background"><X className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
