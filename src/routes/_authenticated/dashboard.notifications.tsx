import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Bell, CheckCheck, Check, Mail, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { notificationText } from '@/lib/notifications';
import { getNotifications, markNotificationsRead } from '@/lib/notifications.functions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/_authenticated/dashboard/notifications')({
  head: () => ({ meta: [{ title: 'Your notifications — MyOwnMuseum' }, { name: 'description', content: 'Private account and museum activity for MyOwnMuseum collectors.' }, { property: 'og:title', content: 'Your notifications — MyOwnMuseum' }, { property: 'og:description', content: 'Your personal museum and account notifications.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: Notifications,
});

function Notifications() {
  const { currentUserId } = useStore();
  const { t, locale } = useI18n();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const get = useServerFn(getNotifications);
  const mark = useServerFn(markNotificationsRead);
  const query = useQuery({ queryKey: ['notifications', currentUserId, unreadOnly, page], enabled: Boolean(currentUserId), queryFn: () => get({ data: { unreadOnly, page } }), staleTime: 60000 });
  const mutation = useMutation({ mutationFn: (data: { id?: string; read: boolean }) => mark({ data }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] }); }, onError: () => toast.error(t('Unable to update notifications')) });
  return <section>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-3xl">{t('Notifications')}</h2>
      <div className="flex gap-2"><Button variant="ghost" size="icon" title={t('Refresh notifications')} aria-label={t('Refresh notifications')} onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className="size-4" /></Button><Button variant="outline" size="sm" disabled={mutation.isPending || !query.data?.unreadCount} onClick={() => mutation.mutate({ read: true })}><CheckCheck className="size-4" />{t('Mark all as read')}</Button></div>
    </div>
    <Tabs value={unreadOnly ? 'unread' : 'all'} onValueChange={value => { setUnreadOnly(value === 'unread'); setPage(0); }} className="mt-6"><TabsList><TabsTrigger value="all">{t('All')}</TabsTrigger><TabsTrigger value="unread">{t('Unread')}</TabsTrigger></TabsList></Tabs>
    {query.isPending ? <p role="status" className="py-10 text-muted-foreground">{t('Loading…')}</p> : query.isError ? <div role="alert" className="py-10"><p>{t('Unable to load notifications')}</p><Button variant="outline" className="mt-4" onClick={() => void query.refetch()}>{t('Try again')}</Button></div> : !query.data?.items.length ? <div className="py-16 text-center text-muted-foreground"><Bell className="mx-auto mb-4 size-7" /><p>{t(unreadOnly ? 'No unread notifications' : 'No notifications yet')}</p></div> : <ul className="mt-5 divide-y divide-border">{query.data.items.map(item => <li key={item.id} className={`flex items-start gap-3 py-5 ${item.read_at ? '' : 'bg-primary/5'}`}>
      <span className={`mt-2 size-2 shrink-0 rounded-full ${item.read_at ? 'bg-muted' : 'bg-primary'}`} aria-label={t(item.read_at ? 'Read' : 'Unread')} />
      <div className="min-w-0 flex-1"><p className="break-words text-sm">{notificationText(item, t)}</p><time dateTime={item.created_at} className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</time></div>
      <Button variant="ghost" size="icon" title={t(item.read_at ? 'Mark as unread' : 'Mark as read')} aria-label={t(item.read_at ? 'Mark as unread' : 'Mark as read')} disabled={mutation.isPending} onClick={() => mutation.mutate({ id: item.id, read: !item.read_at })}>{item.read_at ? <Mail className="size-4" /> : <Check className="size-4" />}</Button>
    </li>)}</ul>}
    {(page > 0 || query.data?.hasMore) && <div className="mt-6 flex justify-end gap-2"><Button variant="outline" size="icon" aria-label={t('Previous page')} disabled={page === 0} onClick={() => setPage(value => value - 1)}><ChevronLeft className="size-4" /></Button><Button variant="outline" size="icon" aria-label={t('Next page')} disabled={!query.data?.hasMore} onClick={() => setPage(value => value + 1)}><ChevronRight className="size-4" /></Button></div>}
  </section>;
}