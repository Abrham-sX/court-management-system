import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/axios';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  MegaphoneIcon,
  UserIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

import { useLanguage } from '../../i18n';
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

const markAsRead = async (id: number) => {
  await apiClient.patch(`/notifications/${id}/read`);
};

const createNotification = async (payload: { recipient?: string; message: string; type: string }) => {
  const { data } = await apiClient.post('/notifications', payload);
  return data;
};

export const Notifications = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'broadcast'>('all');

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetRecipient, setTargetRecipient] = useState('');
  const [deliveryType, setDeliveryType] = useState<'broadcast' | 'direct'>('broadcast');
  const [notifType, setNotifType] = useState('info');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    data: notifications = [],
    isLoading,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const broadcastMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      setIsSuccess(true);
      setBroadcastMessage('');
      setTargetRecipient('');
      setTimeout(() => setIsSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const canBroadcast = ['admin', 'clerk'].includes(user?.role || '');

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

  // Translate notification type for display
  const translateType = (type: string): string => {
    const key = `notifType_${type}`;
    return t(key) || type;
  };

  // Translate delivery scope label
  const getNotificationScopeLabel = (notification: Notification): string => {
    if (notification.delivery_type === 'direct') {
      const recipientLabel =
        notification.recipient?.username ||
        notification.recipient?.email ||
        t('targetUser') ||
        'target user';
      return `${t('directTo') || 'Direct to'} ${recipientLabel}`;
    }
    return t('broadcast') || 'Broadcast';
  };

  const handleSubmitBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    broadcastMutation.mutate({
      message: broadcastMessage,
      recipient: deliveryType === 'direct' ? targetRecipient.trim() || undefined : undefined,
      type: notifType,
    });
  };

  if (isLoading) return <div className="p-8 text-center app-muted">{t('loading') || 'Loading...'}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight text-[var(--app-text)]">
            {t('notificationsCenter') || 'Notifications Center'}
          </h1>
          <p className="text-[var(--app-muted)] font-medium mt-1">
            {t('stayInformed') || 'Stay informed about your case activities'}
          </p>
        </div>

        {canBroadcast && (
          <div className="flex p-1 bg-[var(--app-panel-soft)] rounded-2xl border border-[var(--app-border)]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white shadow-sm text-[var(--app-accent)]'
                  : 'text-[var(--app-muted)]'
              }`}
            >
              {t('notifications') || 'Notifications'}
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'broadcast'
                  ? 'bg-white shadow-sm text-[var(--app-accent)]'
                  : 'text-[var(--app-muted)]'
              }`}
            >
              {t('broadcastCenter') || 'Broadcast Center'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'broadcast' && canBroadcast ? (
        <div className="app-card border-2 border-[var(--app-accent-soft)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MegaphoneIcon className="h-32 w-32" />
          </div>

          <form onSubmit={handleSubmitBroadcast} className="space-y-6 relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl">
                <MegaphoneIcon className="h-5 w-5 text-[var(--app-accent)]" />
              </div>
              <h2 className="text-xl font-bold font-display">
                {t('sendNotification') || 'Send Notification'}
              </h2>
            </div>

            {isSuccess && (
              <div className="app-alert-success animate-bounce">
                {t('notificationSentSuccess') || 'Notification sent successfully!'}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="app-label">{t('notificationType') || 'Notification Type'}</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="app-input"
                >
                  <option value="info">{t('info') || 'Info'}</option>
                  <option value="success">{t('successType') || 'Success'}</option>
                  <option value="warning">{t('warning') || 'Warning'}</option>
                  <option value="error">{t('errorType') || 'Error'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="app-label">{t('deliveryMode') || 'Delivery Mode'}</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as 'broadcast' | 'direct')}
                  className="app-input"
                >
                  <option value="broadcast">{t('broadcastToAll') || 'Broadcast to all users'}</option>
                  <option value="direct">{t('specificUser') || 'Specific user'}</option>
                </select>
              </div>

              {deliveryType === 'direct' && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="app-label">{t('targetUser') || 'Target User'}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--app-muted)]" />
                    <input
                      type="text"
                      value={targetRecipient}
                      onChange={(e) => setTargetRecipient(e.target.value)}
                      className="app-input pl-11"
                      placeholder={t('recipientPlaceholder') || 'Username or email address'}
                      required={deliveryType === 'direct'}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 md:col-span-2">
                <label className="app-label">{t('broadcastMessage') || 'Message'}</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="app-input min-h-[120px] py-4"
                  placeholder={t('broadcastPlaceholder') || 'Type your message here...'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={broadcastMutation.isPending || !broadcastMessage}
              className="app-btn-primary w-full md:w-auto px-10 flex items-center justify-center space-x-2"
            >
              {broadcastMutation.isPending ? (
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5" />
                  <span>{t('Send') || 'Send'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="app-card text-center py-20 bg-[var(--app-panel-soft)] border-dashed border-2">
              <BellIcon className="h-12 w-12 text-[var(--app-muted)] mx-auto mb-4 opacity-20" />
              <p className="app-muted font-bold">
                {t('noNotificationsYet') || 'No notifications yet'}
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const relatedLink = getRelatedLink(n.message);
              return (
                <div
                  key={n.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button') || target.tagName === 'BUTTON') {
                      return;
                    }
                    if (!n.read) {
                      markMutation.mutate(n.id);
                    }
                    if (relatedLink) {
                      navigate(relatedLink);
                    }
                  }}
                  className={`app-card group flex items-start gap-5 transition-all ${
                    relatedLink ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl' : ''
                  } ${
                    !n.read
                      ? 'border-l-4 border-l-[var(--app-accent)] bg-white dark:bg-stone-900 shadow-md'
                      : 'opacity-80 grayscale-[0.5]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl bg-[var(--app-panel-soft)] shadow-inner transition-colors group-hover:bg-white`}
                  >
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                        {translateType(n.type)}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-2 py-1 rounded-lg">
                          {getNotificationScopeLabel(n)}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--app-muted)]">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {n.delivery_type === 'direct' && n.recipient && (
                      <p className="text-[10px] font-bold text-[var(--app-muted)] mb-2">
                        {t('to') || 'To'} {n.recipient.username} · {n.recipient.email}
                      </p>
                    )}
                    <p
                      className={`text-base font-medium leading-relaxed ${
                        !n.read ? 'text-[var(--app-text)]' : 'text-[var(--app-muted)]'
                      }`}
                    >
                      {n.message}
                    </p>
                    {relatedLink && (
                      <span className="inline-flex items-center mt-2 text-xs font-black text-[var(--app-accent)] hover:underline">
                        {t('viewRelatedPage') || 'View Related Page →'}
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markMutation.mutate(n.id);
                      }}
                      className="p-2 rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)] hover:bg-[var(--app-accent)] hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title={t('markRead') || 'Mark as read'}
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};