import { useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ImageUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { uploadObjectImage, IMAGE_TYPES, IMAGE_MAX_BYTES } from '@/lib/images.functions';
import { resizeImage } from '@/lib/resize-image';

/** Museum cover: upload a photo (shrunk to WebP on the device) or paste a link. */
export function CoverUpload({ id, value, onChange }: { id: string; value: string; onChange: (url: string) => void }) {
  const { t } = useI18n();
  const upload = useServerFn(uploadObjectImage);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState(value);

  async function pick(file?: File) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) { toast.error(t('Unsupported image format')); return; }
    setBusy(true);
    try {
      const small = await resizeImage(file, 1600, 0.78);
      if (small.size > IMAGE_MAX_BYTES) throw new Error(t('Image is larger than 10 MB'));
      const fd = new FormData(); fd.append('file', small);
      const res = await upload({ data: fd });
      setUrl(res.url); onChange(res.url);
    } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <img src={url || '/placeholder-object.svg'} alt="" className="h-16 w-24 rounded border border-border object-cover"/>
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="size-4 animate-spin"/> : <ImageUp className="size-4"/>}
          {busy ? t('Uploading…') : t('Upload cover photo')}
        </Button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={e => void pick(e.target.files?.[0])}/>
      </div>
      <Input id={id} value={url} placeholder="https://…" onChange={e => setUrl(e.target.value)} onBlur={() => url !== value && onChange(url)}/>
    </div>
  );
}
