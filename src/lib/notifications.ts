import type { Translator } from './i18n-context';

export interface CollectorNotification {
  id: string;
  kind: string;
  data: unknown;
  read_at: string | null;
  created_at: string;
}

export function notificationText(notification: CollectorNotification, t: Translator) {
  const data = notification.data && typeof notification.data === 'object' ? notification.data as Record<string, unknown> : {};
  const title = typeof data['title'] === 'string' ? data['title'] : '';
  const plan = typeof data['plan'] === 'string' ? data['plan'] : '';
  switch (notification.kind) {
    case 'welcome': return t('Welcome to MyOwnMuseum');
    case 'museum_created': return t('Your museum was created: {title}', { title });
    case 'museum_published': return t('Your museum is public: {title}', { title });
    case 'museum_private': return t('Your museum is private: {title}', { title });
    case 'plan_interest': return t('Plan interest recorded: {plan}. No payment was taken.', { plan });
    default: return t('Account notification');
  }
}