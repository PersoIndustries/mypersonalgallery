export const PLACEHOLDER_IMAGE = '/placeholder-object.svg';

/** Swap any broken or empty <img> for the neutral placeholder. Returns a cleanup. */
export function installImageFallback(doc: Document) {
  const swap = (img: HTMLImageElement) => {
    if (img.dataset.fallback || img.src.endsWith(PLACEHOLDER_IMAGE)) return;
    img.dataset.fallback = '1';
    img.src = PLACEHOLDER_IMAGE;
  };
  const onError = (e: Event) => { if (e.target instanceof HTMLImageElement) swap(e.target); };
  doc.addEventListener('error', onError, true);
  doc.querySelectorAll('img').forEach(img => { if (img.complete && img.naturalWidth === 0 && img.getAttribute('src') !== null) swap(img); });
  return () => doc.removeEventListener('error', onError, true);
}
