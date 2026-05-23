import type { CSSProperties } from 'react';
import { resolveMediaUrl } from '../lib/media';

interface UserAvatarProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  className?: string;
  textClassName?: string;
}

const getInitials = (fullName?: string | null) => {
  if (!fullName) return 'U';

  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
};

export const UserAvatar = ({
  avatarUrl,
  fullName,
  className = 'h-12 w-12',
  textClassName = 'text-sm',
}: UserAvatarProps) => {
  const resolvedAvatarUrl = resolveMediaUrl(avatarUrl);

  if (resolvedAvatarUrl) {
    return (
      <img
        src={resolvedAvatarUrl}
        alt={fullName || 'User avatar'}
        className={`${className} rounded-2xl object-cover shadow-sm ring-2 ring-white/70`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-2xl shadow-sm ring-2 flex items-center justify-center font-semibold ${textClassName}`}
      style={{
        background: 'linear-gradient(135deg, var(--app-accent-soft), var(--app-panel-muted))',
        color: 'var(--app-text)',
      } as CSSProperties}
    >
      {getInitials(fullName)}
    </div>
  );
};
