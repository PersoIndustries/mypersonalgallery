import { useEffect } from 'react';

function send(payload: object) {
  const json = JSON.stringify(payload);
  if (navigator.sendBeacon?.(`/api/public/museum-visit`, new Blob([json], { type: 'application/json' }))) return;
  void fetch('/api/public/museum-visit', { method: 'POST', body: json, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
}

/** Counts one visit per session and the time the page was actually visible. Skips owners. */
export function useMuseumVisit(museumId: string | undefined, skip: boolean) {
  useEffect(() => {
    if (!museumId || skip) return;
    const key = `mc-visit-${museumId}`;
    if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); send({ museumId, newVisit: true, seconds: 0 }); }
    let visibleSince: number | null = document.visibilityState === 'visible' ? Date.now() : null;
    let total = 0;
    const flush = () => {
      if (visibleSince) { total += Date.now() - visibleSince; visibleSince = null; }
      const seconds = Math.min(900, Math.round(total / 1000));
      total = 0;
      if (seconds > 0) send({ museumId, newVisit: false, seconds });
    };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); else visibleSince = Date.now(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', flush);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', flush); flush(); };
  }, [museumId, skip]);
}
