import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Receipt, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { getBillingHistory, requestRefund } from '@/lib/billing.functions';
import { invoiceDocumentUrl, refundable } from '@/lib/billing-rules';
const options = (page: number) => queryOptions({ queryKey: ['billing-history', page], queryFn: () => getBillingHistory({ data: { page } }), staleTime: 60000 });
export const Route = createFileRoute('/_authenticated/dashboard/billing')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options(0)),
  head: () => ({ meta: [{ title: 'Invoices and refunds — MyOwnMuseum' }, { name: 'description', content: 'Private collector billing history and refund requests.' }, { property: 'og:title', content: 'Invoices and refunds — MyOwnMuseum' }, { property: 'og:description', content: 'Collector invoices and refund requests.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: Billing,
});
function Billing() {
  const { t, locale } = useI18n(); const [page, setPage] = useState(0);
  const { data } = useSuspenseQuery(options(page)); const client = useQueryClient(); const submit = useServerFn(requestRefund);
  const [invoiceId, setInvoiceId] = useState<string | null>(null); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false);
  return <div className="space-y-6">
    <h2 className="font-display text-3xl">{t('Invoices and refunds')}</h2>
    <p className="text-sm text-muted-foreground">{t('Stripe is not connected. No payments, invoices or refunds have been processed.')}</p>
    <div className="flex flex-wrap gap-3"><Button variant="outline" disabled>{t('Manage subscription')}</Button><Button variant="outline" disabled>{t('Update payment method')}</Button></div>
    {!data.invoices.length ? <div className="border-y border-border py-12 text-center"><Receipt className="mx-auto mb-3 size-8 text-muted-foreground"/><p>{t('No invoices yet')}</p></div> : <div className="divide-y divide-border">{data.invoices.map(invoice => {
      const pdf = invoiceDocumentUrl(invoice.invoice_pdf_url); const hosted = invoiceDocumentUrl(invoice.hosted_invoice_url);
      const request = data.requests.find(r => r.invoice_id === invoice.id && ['pending','approved_pending_provider'].includes(r.status));
      return <article key={invoice.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><p>{invoice.number ?? invoice.id}</p><p className="text-sm text-muted-foreground">{new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(invoice.amount_paid_minor / 100)} · {t(invoice.status)} · {t(invoice.environment === 'sandbox' ? 'Test' : 'Live')}</p></div><div className="flex flex-wrap gap-2">{hosted && <Button asChild variant="outline"><a href={hosted} target="_blank" rel="noopener noreferrer">{t('View invoice')}</a></Button>}{pdf && <Button asChild variant="ghost"><a href={pdf} target="_blank" rel="noopener noreferrer"><Download className="size-4"/>{t('Download invoice')}</a></Button>}<Button variant="outline" disabled={!refundable(invoice) || Boolean(request)} onClick={() => { setInvoiceId(invoice.id); setReason(''); }}>{request ? t(request.status) : t('Request refund')}</Button></div></article>;
    })}</div>}
    <section className="space-y-3"><h3 className="font-display text-2xl">{t('Refund requests')}</h3>{!data.requests.length ? <p className="text-muted-foreground">{t('No refund requests')}</p> : data.requests.map(r => <article key={r.id} className="border-b border-border py-3"><p>{t(r.status)}</p><p className="break-words text-sm">{r.reason}</p>{r.review_note && <p className="break-words text-sm text-muted-foreground">{r.review_note}</p>}</article>)}</section>
    <div className="flex gap-2"><Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>{t('Previous page')}</Button><Button variant="outline" disabled={!data.hasMore} onClick={() => setPage(p => p + 1)}>{t('Next page')}</Button></div>
    <Dialog open={invoiceId !== null} onOpenChange={open => { if (!open && !busy) setInvoiceId(null); }}><DialogContent><DialogHeader><DialogTitle>{t('Request refund')}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={async event => { event.preventDefault(); if (!invoiceId) return; setBusy(true); try { await submit({ data: { invoiceId, reason } }); setInvoiceId(null); await client.invalidateQueries({ queryKey: ['billing-history'] }); toast.success(t('Refund request submitted')); } catch { toast.error(t('Unable to request refund')); } finally { setBusy(false); } }}><label htmlFor="refund-reason">{t('Reason for refund')}</label><Textarea id="refund-reason" value={reason} minLength={10} maxLength={2000} required onChange={e => setReason(e.target.value)}/><p className="text-sm text-muted-foreground">{t('A request does not refund money or cancel your subscription.')}</p><Button type="submit" disabled={busy || reason.trim().length < 10}>{t(busy ? 'Saving…' : 'Submit request')}</Button></form></DialogContent></Dialog>
  </div>;
}