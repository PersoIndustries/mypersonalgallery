import { Bell } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Button } from './ui/button';
import { useI18n } from '@/lib/i18n';
import { getNotifications } from '@/lib/notifications.functions';

export function NotificationBell({ userId }: { userId: string }) {
  const { t } = useI18n();
  const get = useServerFn(getNotifications);
  const { data } = useQuery({ queryKey: ['notifications', userId, false, 0], queryFn: () => get({ data: { unreadOnly: false, page: 0 } }), staleTime: 60000, refetchOnWindowFocus: true });
  const count = data?.unreadCount ?? 0;
  return <Button asChild variant="ghost" size="icon" className="relative" title={t('Notifications')} aria-label={count ? t('Notifications: {count} unread', { count }) : t('Notifications')}>
    <Link to="/dashboard/notifications"><Bell className="size-4" />{count > 0 && <span aria-hidden className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count > 99 ? '99+' : count}</span>}</Link>
  </Button>;
}