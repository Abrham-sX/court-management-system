import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CameraIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  UserIcon,
  IdentificationIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { UserAvatar } from '../../components/UserAvatar';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';

export const Profile = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const profileSchema = z.object({
    full_name: z.string().min(3, t('fullNameRequired') || 'Full name is required'),
    email: z.string().email(t('invalidEmail') || 'Invalid email address'),
    username: z.string().min(3, t('usernameRequired') || 'Username is required'),
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  const formatRole = (role?: string) => {
    if (!role) return t('notApplicable') || 'N/A';
    const roleKey = role.toLowerCase() === 'user' ? 'publicUser' : role.toLowerCase();
    return t(roleKey) || role;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  useEffect(() => {
    reset({
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    });
  }, [reset, user]);

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setFeedback({ type: 'success', message: t('profileUpdatedSuccess') || 'Profile updated successfully' });
      setIsEditing(false);
    },
    onError: (err: AxiosError<{ error?: string }>) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || t('unableToUpdateProfile') || 'Unable to update profile',
      });
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken });
      setFeedback({ type: 'success', message: t('profilePictureUpdated') || 'Profile picture updated' });
    },
    onError: (err: AxiosError<{ error?: string }>) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || t('unableToUploadPicture') || 'Unable to upload picture',
      });
    },
  });

  const avatarRemoveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/users/avatar');
      return response.data;
    },
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken });
      setFeedback({ type: 'success', message: t('profilePictureRemoved') || 'Profile picture removed' });
    },
    onError: (err: AxiosError<{ error?: string }>) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || t('unableToRemovePicture') || 'Unable to remove picture',
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    setFeedback(null);
    profileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset({
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    });
    setFeedback(null);
    setIsEditing(false);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    avatarUploadMutation.mutate(file);
    event.target.value = '';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Profile Hero Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[var(--app-accent)] to-[var(--app-accent-hover)] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
          <div className="relative">
            <UserAvatar
              avatarUrl={user?.avatar_url}
              fullName={user?.full_name}
              className="h-32 w-32 rounded-full border-4 border-white/20 shadow-2xl"
              textClassName="text-4xl font-black"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-white text-[var(--app-accent)] rounded-xl shadow-lg hover:scale-110 transition-transform"
            >
              <CameraIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">
                {formatRole(user?.role)}
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
              {user?.full_name || user?.username}
            </h1>
            <p className="text-white/70 text-lg font-medium">@{user?.username}</p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-white/60" />
                <span className="text-sm font-bold">{user?.email}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4 text-white/60" />
                <span className="text-sm font-bold capitalize">
                  {user?.status === 'active'
                    ? t('active') || 'Active'
                    : user?.status === 'inactive'
                    ? t('inactive') || 'Inactive'
                    : user?.status || t('active') || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-[var(--app-accent)] px-6 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" /> {isEditing ? (t('cancel') || 'Cancel') : (t('edit') || 'Edit')}
            </button>
            {user?.avatar_url && (
              <button
                onClick={() => avatarRemoveMutation.mutate()}
                className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" /> {t('removePicture') || 'Remove picture'}
              </button>
            )}
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {feedback && (
            <div
              className={`p-4 rounded-[20px] text-sm font-bold text-center animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                  : 'bg-red-500/10 text-red-600 border border-red-500/20'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="app-card">
            <h2 className="text-2xl font-bold font-display mb-8">
              {t('personalDetails') || 'Personal Details'}
            </h2>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput
                    label={t('fullName') || 'Full Name'}
                    registration={register('full_name')}
                    error={errors.full_name?.message}
                  />
                  <ProfileInput
                    label={t('email') || 'Email'}
                    registration={register('email')}
                    error={errors.email?.message}
                  />
                  <ProfileInput
                    label={t('username') || 'Username'}
                    registration={register('username')}
                    error={errors.username?.message}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={profileMutation.isPending} className="app-btn-primary px-8">
                    {profileMutation.isPending ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
                  </button>
                  <button type="button" onClick={handleCancel} className="app-btn-secondary px-8">
                    {t('cancel') || 'Cancel'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileDetail
                  label={t('fullName') || 'Full Name'}
                  value={user?.full_name}
                  icon={UserIcon}
                />
                <ProfileDetail
                  label={t('email') || 'Email'}
                  value={user?.email}
                  icon={EnvelopeIcon}
                />
                <ProfileDetail
                  label={t('username') || 'Username'}
                  value={user?.username}
                  icon={IdentificationIcon}
                />
                <ProfileDetail
                  label={t('role') || 'Role'}
                  value={formatRole(user?.role)}
                  icon={ScaleIcon}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="app-card bg-[var(--app-panel-soft)]">
            <h2 className="text-xl font-bold font-display mb-6">
              {t('profileTips') || 'Profile Tips'}
            </h2>
            <div className="space-y-6">
              <TipItem
                title={t('useRealPhoto') || 'Use a real photo'}
                description={t('realPhotoTip') || 'A real photo builds trust and helps court officials identify you.'}
              />
              <TipItem
                title={t('keepEmailCurrent') || 'Keep email current'}
                description={t('emailTip') || 'All notifications will be sent to this address.'}
              />
              <TipItem
                title={t('chooseCleanUsername') || 'Choose a clean username'}
                description={t('usernameTip') || 'Your username is public – keep it professional.'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDetail = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon: React.ElementType;
}) => (
  <div className="flex items-center gap-4 p-5 rounded-3xl bg-[var(--app-panel-soft)] border border-[var(--app-border)]">
    <div className="p-3 bg-white shadow-sm rounded-xl text-[var(--app-accent)]">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-1">{label}</p>
      <p className="text-sm font-bold text-[var(--app-text)]">{value || 'N/A'}</p>
    </div>
  </div>
);

const ProfileInput = ({ label, registration, error }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] ml-1">{label}</label>
    <input {...registration} className="app-input" />
    {error && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);

const TipItem = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-black text-[var(--app-text)]">{title}</p>
    <p className="text-xs text-[var(--app-muted)] leading-relaxed">{description}</p>
  </div>
);