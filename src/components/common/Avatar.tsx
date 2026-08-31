import React from 'react';
import { UserStatus } from '../../types';

interface AvatarProps {
  src?: string;
  name?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: UserStatus;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

const statusClasses: Record<UserStatus, string> = {
  online: 'bg-emerald-500 ring-2 ring-slate-900',
  busy: 'bg-rose-500 ring-2 ring-slate-900',
  away: 'bg-amber-500 ring-2 ring-slate-900',
  offline: 'bg-slate-500 ring-2 ring-slate-900',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  alt,
  size = 'md',
  status,
  className = '',
  onClick,
}) => {
  const displayName = (name || alt || 'User').trim();
  const initials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const safeId = displayName.toLowerCase().replace(/\s+/g, '-');

  return (
    <div
      id={`avatar-${safeId}`}
      onClick={onClick}
      className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full overflow-visible ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden border border-white/20 bg-slate-800 flex items-center justify-center text-slate-200 font-medium">
        {src ? (
          <img
            src={src}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${statusClasses[status]} ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
          }`}
        />
      )}
    </div>
  );
};
