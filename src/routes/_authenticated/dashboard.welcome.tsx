import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/types';
import { useOnboarding } from '@/lib/use-onboarding';
import { selectPlan } from '@/lib/platform.functions';

export const Route = createFileRoute('/_authenticated/dashboard/welcome')({
  head: () => ({ meta: [{ title: 'Welcome to your museum — MyOwnMuseum' }, { name: 'description', content: 'Open your first digital museum in three steps.' }, { property: 'og:title', content: 'Welcome to your museum — MyOwnMuseum' }, { property: 'og:description', content: 'Open your first digital museum in three steps.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: Welcome,
});

const covers: Record<string, string> = {
  Radios: 'https://images.unsplash.com/photo-1593078165899-c7d2ac0d6aea?w=1200',
  Watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200',
  Cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200',
  Cars: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200',
  'Vinyl Records': 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=1200',
  Fossils: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200',
};
const defaultCover = 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1200';

function Welcome() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { currentUser, museumsOf, objectsOf, createMuseum, createObject, updateMuseum } = useStore();
  const { state, update } = useOnboarding();
  const savePlan = useServerFn(selectPlan);
  const [category, setCategory] = useState<string>(state?.interest ?? '');
  const [title, setTitle] = useState('');
  const [objectTitle, setObjectTitle] = useState('');
  const [objectImage, setObjectImage] = useState('');
  const [busy, setBusy] = useState(false);
  if (!currentUser) return null;
  const museums = museumsOf(currentUser.id);
  const museum = museums[museums.length - 1];
  const objects = museum ? objectsOf(museum.id) : [];
  const step = !category && !museum ? 0 : !museum ? 1 : objects.length === 0 ? 2 : !museum.isPublic || !state?.shared ? 3 : state?.plansSeen ? 5 : 4;
  const publicUrl = museum ? `${typeof window === 'undefined' ? '' : window.location.origin}/m/${museum.slug}` : '';
  const act = async (fn: () => Promise<unknown>) => { setBusy(true); try { await fn(); } catch (e) { toast.error(e instanceof Error ? e.message : t('Something went wrong')); } finally { setBusy(false); } };
  const skip = async () => { await update({ skipped: true, welcomed: true }); await navigate({ to: '/dashboard' }); };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: museum.title, url: publicUrl });
      else { await navigator.clipboard.writeText(publicUrl); toast.success(t('Link copied')); }
      await update({ shared: true });
    } catch { /* share dialog dismissed */ }
  };
  const labels = ['Your collection', 'Your museum', 'First object', 'Publish & share', 'Plans'];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-3xl">{t('Welcome, {name}!', { name: currentUser.name.split(' ')[0] })}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('Open your museum in a few minutes. You can skip this and come back from your overview.')}</p>
      </div>
      <ol className="flex flex-wrap gap-2 text-xs" aria-label={t('Steps')}>
        {labels.map((l, i) => <li key={l} aria-current={i === step ? 'step' : undefined} className={`rounded-full border px-3 py-1 ${i < step ? 'border-primary/40 text-primary' : i === step ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>{i < step && <Check className="mr-1 inline size-3" />}{t(l)}</li>)}
      </ol>

      <section className="rounded-lg border border-border bg-card p-6">
        {step === 0 && <div className="space-y-4">
          <h3 className="font-display text-2xl">{t('What do you collect?')}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map(c => <Button key={c} variant="outline" disabled={busy} onClick={() => void act(async () => { setCategory(c); await update({ interest: c, welcomed: true }); })}>{t(c)}</Button>)}
          </div>
        </div>}

        {step === 1 && <form className="space-y-4" onSubmit={e => { e.preventDefault(); void act(() => createMuseum({ title: title.trim(), description: '', cover: covers[category] ?? defaultCover, category: category || 'Other', isPublic: false })); }}>
          <h3 className="font-display text-2xl">{t('Name your museum')}</h3>
          <div className="space-y-2"><Label htmlFor="museum-title">{t('Museum title')}</Label><Input id="museum-title" required maxLength={200} value={title} placeholder={t('e.g. My vintage camera collection')} onChange={e => setTitle(e.target.value)} /></div>
          <p className="text-xs text-muted-foreground">{t('We add a suggested cover; you can change it later.')}</p>
          <Button type="submit" disabled={busy || !title.trim()}>{t('Create museum')}</Button>
        </form>}

        {step === 2 && museum && <form className="space-y-4" onSubmit={e => { e.preventDefault(); void act(() => createObject(museum.id, { title: objectTitle.trim(), description: '', year: '', manufacturer: '', model: '', category: museum.category, tags: [], specs: [], history: '', images: objectImage.trim() ? [objectImage.trim()] : [], modelUrl: null, documents: [], condition: 'Good' })); }}>
          <h3 className="font-display text-2xl">{t('Add your first object')}</h3>
          <div className="space-y-2"><Label htmlFor="object-title">{t('Object name')}</Label><Input id="object-title" required maxLength={200} value={objectTitle} onChange={e => setObjectTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="object-image">{t('Photo link (optional)')}</Label><Input id="object-image" type="url" placeholder="https://" value={objectImage} onChange={e => setObjectImage(e.target.value)} /></div>
          <Button type="submit" disabled={busy || !objectTitle.trim()}>{t('Add object')}</Button>
        </form>}

        {step === 3 && museum && <div className="space-y-4">
          <h3 className="font-display text-2xl">{t('Publish and share')}</h3>
          {!museum.isPublic ? <>
            <p className="text-sm text-muted-foreground">{t('Your museum is private. Publish it so visitors can find it in Explore.')}</p>
            <Button disabled={busy} onClick={() => void act(() => updateMuseum(museum.id, { isPublic: true }))}>{t('Publish museum')}</Button>
          </> : <>
            <p className="text-sm text-muted-foreground">{t('Your museum is live. Share the link with friends and collector communities.')}</p>
            <div className="flex gap-2"><Input readOnly value={publicUrl} aria-label={t('Public link')} /><Button variant="outline" size="icon" aria-label={t('Copy')} onClick={() => void navigator.clipboard.writeText(publicUrl).then(() => { toast.success(t('Link copied')); return update({ shared: true }); })}><Copy className="size-4" /></Button></div>
            <div className="flex flex-wrap gap-2"><Button onClick={() => void share()}><Share2 className="size-4" />{t('Share')}</Button><Button variant="ghost" onClick={() => void update({ shared: true })}>{t('Later')}</Button></div>
          </>}
        </div>}

        {step === 4 && <div className="space-y-4">
          <h3 className="font-display text-2xl">{t('Choose how far your museum goes')}</h3>
          <p className="text-sm text-muted-foreground">{t('Free is enough to start. Pro and Studio are coming soon; choosing one only records your interest and never charges you.')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['free', 'pro', 'studio'] as const).map(plan => <article key={plan} className="flex flex-col gap-3 rounded-md border border-border p-4">
              <h4 className="font-display text-xl capitalize">{t(plan)}</h4>
              <p className="flex-1 text-xs text-muted-foreground">{plan === 'free' ? t('Your museums and objects, public pages and sharing.') : plan === 'pro' ? t('For growing collections: more museums and premium presentation.') : t('For institutions and serious collectors: advanced tools.')}</p>
              <Button size="sm" variant={plan === 'free' ? 'default' : 'outline'} disabled={busy} onClick={() => void act(async () => { await savePlan({ data: plan }); await update({ plansSeen: true }); })}>{plan === 'free' ? t('Continue free') : t('Register interest')}</Button>
            </article>)}
          </div>
        </div>}

        {step === 5 && <div className="space-y-4 text-center">
          <h3 className="font-display text-2xl">{t('Your museum is open!')}</h3>
          <p className="text-sm text-muted-foreground">{t('Keep cataloguing objects or take a quick tour of your tools.')}</p>
          <div className="flex justify-center gap-2"><Button asChild><Link to="/dashboard" search={{ tour: true }}>{t('Take the tour')}</Link></Button><Button asChild variant="outline"><Link to="/dashboard/museums">{t('Manage museums')}</Link></Button></div>
        </div>}
      </section>
      {step < 5 && <Button variant="ghost" onClick={() => void skip()}>{t('Skip for now')}</Button>}
    </div>
  );
}
