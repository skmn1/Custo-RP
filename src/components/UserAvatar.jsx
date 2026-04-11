/**
 * UserAvatar — Reusable avatar component for all app users
 *
 * Uses boring-avatars for SVG generation when no photo exists.
 * Provides a consistent avatar across admin, nav, profile, and ESS views.
 */
import Avatar from 'boring-avatars';

const AVATAR_PALETTE = ['#da336b', '#fe8fa8', '#8b2044', '#ffd9df', '#ffb1c0'];
const AVATAR_VARIANTS = ['beam', 'pixel', 'sunset', 'marble'];

/**
 * Hash a string to a consistent variant
 */
function getVariantForUser(userId) {
  if (!userId) return AVATAR_VARIANTS[0];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_VARIANTS[hash % AVATAR_VARIANTS.length];
}

export const UserAvatar = ({ user, size = 40, className = '' }) => {
  if (!user) return null;

  const userKey = user.id || user.email || 'Unknown';
  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'User';
  const variant = getVariantForUser(userKey);

  // If user has avatar URL, use it
  if (user.avatar || user.avatarUrl) {
    return (
      <img
        src={user.avatar || user.avatarUrl}
        alt={userName}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
        data-testid="user-avatar-image"
      />
    );
  }

  // Otherwise use generated avatar
  return (
    <div className={className} data-testid="user-avatar-generated">
      <Avatar
        name={userName}
        size={size}
        variant={variant}
        colors={AVATAR_PALETTE}
      />
    </div>
  );
};

/**
 * Initials-based fallback avatar (legacy, text-based)
 */
export const UserAvatarInitials = ({ user, size = 'md', className = '' }) => {
  if (!user) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const initials = `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
      data-testid="user-avatar-initials"
    >
      {initials || '??'}
    </div>
  );
};

export default UserAvatar;
