import { useQuery } from '@tanstack/react-query';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface NotificationRecipient {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
  delivery_type?: 'broadcast' | 'direct';
  recipient?: NotificationRecipient | null;
}

const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await apiClient.get('/notifications');
  return data;
};

const getRelatedLink = (message: string): string | null => {
  const caseNumberRegex = /[A-Z0-9]+-\d{4}-\d+/i;
  const match = message.match(caseNumberRegex);
  if (match) {
    return `/cases/status?number=${encodeURIComponent(match[0])}`;
  }

  if (message.toLowerCase().includes('complaint')) {
    return '/complaints/new';
  }

  if (message.toLowerCase().includes('hearing') || message.toLowerCase().includes('ችሎት')) {
    return '/dashboard';
  }

  if (message.toLowerCase().includes('profile') || message.toLowerCase().includes('መገለጫ')) {
    return '/profile';
  }

  return null;
};

const getIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-rose-500" />;
    default:
      return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
  }
};

export const NotificationsWidget = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const canBroadcast = ['admin', 'clerk'].includes(user?.role || '');

  // Helper to translate notification type
  const translateType = (type: string): string => {
    const key = `notifType_${type}`;
    return t(key) || type;
  };

  // Helper to get translated scope label
  const getNotificationScopeLabel = (notification: Notification): string => {
    if (notification.delivery_type === 'direct') {
      const recipientLabel =
        notification.recipient?.username ||
        notification.recipient?.email ||
        (t('specificUser') || 'Specific user');
      return `${t('directTo') || 'Direct to'} ${recipientLabel}`;
    }
    return t('broadcast') || 'Broadcast';
  };

  return (
    <div className="app-card overflow-hidden flex h-[480px] flex-col transition-all">
      <div className="flex flex-col gap-4 flex-shrink-0 mb-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="app-heading text-lg font-black flex items-center min-w-0">
            <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl mr-3 relative shrink-0">
              <BellIcon className="h-6 w-4 text-[var(--app-accent)]" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <span className="truncate">{t('notifications') || 'Notifications'}</span>
          </h2>

          <div className="flex items-center gap-3 shrink-0">
            {canBroadcast && (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--app-panel-soft)] border border-[var(--app-border)]">
                <MegaphoneIcon className="h-4 w-4 text-[var(--app-accent)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                  {t('broadcastCenter') || 'Broadcast Center'}
                </span>
              </div>
            )}
            <Link
              to="/notifications"
              className="text-xs font-black text-[var(--app-accent)] hover:opacity-70 transition-opacity"
            >
              {t('viewAll') || 'View All'}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">
          <div className="h-2 w-2 rounded-full bg-[var(--app-accent)]"></div>
          <span>{t('stayInformed') || 'Stay informed'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-2xl"
              ></div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((n) => {
              const relatedLink = getRelatedLink(n.message);
              const notificationTypeLabel = translateType(n.type);
              const scopeLabel = getNotificationScopeLabel(n);
              const viewRelatedPageLabel = t('viewRelatedPage') || 'View Related Page →';
              const toLabel = t('to') || 'To';

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (relatedLink) {
                      navigate(relatedLink);
                    }
                  }}
                  className={`app-card group flex items-start gap-4 transition-all ${
                    relatedLink ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl' : ''
                  } ${
                    !n.read
                      ? 'border-l-4 border-l-[var(--app-accent)] bg-white dark:bg-stone-900 shadow-md'
                      : 'opacity-80 grayscale-[0.35]'
                  }`}
                >
                  <div className="p-3 rounded-2xl bg-[var(--app-panel-soft)] shadow-inner transition-colors group-hover:bg-white shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                        {notificationTypeLabel}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-2 py-1 rounded-lg">
                          {scopeLabel}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--app-muted)]">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {n.delivery_type === 'direct' && n.recipient && (
                      <p className="text-[10px] font-bold text-[var(--app-muted)] mb-2">
                        {toLabel} {n.recipient.username} · {n.recipient.email}
                      </p>
                    )}

                    <p
                      className={`text-sm leading-relaxed ${
                        !n.read
                          ? 'font-bold text-[var(--app-text)]'
                          : 'text-[var(--app-muted)]'
                      }`}
                    >
                      {n.message}
                    </p>

                    {relatedLink && (
                      <span className="inline-flex items-center mt-2 text-xs font-black text-[var(--app-accent)] hover:underline">
                        {viewRelatedPageLabel}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 shrink-0">
                    {!n.read ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                        <CheckCircleIcon className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--app-panel-soft)] text-[var(--app-muted)]">
                        <CheckCircleIcon className="h-5 w-5 opacity-60" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[var(--app-border)] rounded-3xl">
            <BellIcon className="h-8 w-8 text-[var(--app-muted)] opacity-20 mb-2" />
            <p className="text-xs font-medium text-[var(--app-muted)]">
              {t('noNotifications') || 'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};