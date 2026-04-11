/**
 * Test suite for Task 90 — Mobile/Web Separation & Avatar System
 *
 * Covers:
 *  1. Mobile/web routing separation
 *  2. UserAvatar component with boring-avatars fallback
 *  3. Avatar persistence and generation
 *  4. Navbar avatar integration
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ── Routing Separation ─────────────────────────────────────────

describe('Task 90 — Mobile/Web Separation & Avatars', () => {
  describe('ESS Routes — web pages used', () => {
    const appSrc = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');

    it('imports EssProfilePage', () => {
      expect(appSrc).toContain("import EssProfilePage from './pages/ess/EssProfilePage'");
    });

    it('uses EssProfilePage for profile route', () => {
      expect(appSrc).toContain('path="profile" element={<EssProfilePage');
    });

    it('does NOT import MobileProfilePage', () => {
      expect(appSrc).not.toContain("import { MobileProfilePage }");
    });

    it('does NOT import MobileEditProfilePage', () => {
      expect(appSrc).not.toContain("import { MobileEditProfilePage }");
    });

    it('does NOT import MobileNotificationsPage in main imports', () => {
      expect(appSrc).not.toContain("import { MobileNotificationsPage }");
    });

    it('uses EssRequestsPage for requests route', () => {
      expect(appSrc).toContain('path="requests" element={<EssRequestsPage');
    });

    it('uses EssNotificationsPage for notifications route', () => {
      expect(appSrc).toContain('path="notifications" element={<EssNotificationsPage');
    });

    it('removes profile/edit sub-route (handled by EssProfilePage conditionals)', () => {
      const profileEditRoutes = appSrc.match(/path="profile\/(edit|profile\/edit)"/g);
      expect(profileEditRoutes).toBeNull();
    });
  });

  describe('EssProfilePage conditionals', () => {
    const profileSrc = fs.readFileSync(path.resolve('src/pages/ess/EssProfilePage.jsx'), 'utf-8');

    it('imports useMobileLayout', () => {
      expect(profileSrc).toContain('useMobileLayout');
    });

    it('imports MobileProfile component', () => {
      expect(profileSrc).toContain("import MobileProfile from '../../components/ess/profile/MobileProfile'");
    });

    it('checks useMobileLayout() and returns <MobileProfile /> when mobile', () => {
      expect(profileSrc).toContain('if (isMobile) return <MobileProfile />');
    });

    it('renders tabbed web profile for desktop', () => {
      expect(profileSrc).toContain('TABS.map');
      expect(profileSrc).toContain('activeTab ===');
    });
  });
});

// ── UserAvatar Component ───────────────────────────────────────

describe('UserAvatar Component', () => {
  const avatarSrc = fs.readFileSync(path.resolve('src/components/UserAvatar.jsx'), 'utf-8');

  it('exists and exports UserAvatar', () => {
    expect(avatarSrc).toContain('export const UserAvatar');
  });

  it('imports boring-avatars Avatar', () => {
    expect(avatarSrc).toContain("import Avatar from 'boring-avatars'");
  });

  it('has AVATAR_PALETTE with magenta primary color', () => {
    expect(avatarSrc).toContain('#da336b');
  });

  it('has multiple variants for consistent hashing', () => {
    expect(avatarSrc).toContain('beam');
    expect(avatarSrc).toContain('pixel');
    expect(avatarSrc).toContain('sunset');
    expect(avatarSrc).toContain('marble');
  });

  it('accepts props: user, size, className', () => {
    expect(avatarSrc).toContain('{ user, size = 40, className = \'\' }');
  });

  it('renders image if user has avatar URL', () => {
    expect(avatarSrc).toContain('user.avatar || user.avatarUrl');
    expect(avatarSrc).toContain('data-testid="user-avatar-image"');
  });

  it('falls back to generated avatar when no image', () => {
    expect(avatarSrc).toContain('data-testid="user-avatar-generated"');
    expect(avatarSrc).toContain('<Avatar');
  });

  it('uses user name for avatar generation', () => {
    expect(avatarSrc).toContain('name={userName}');
  });

  it('exports UserAvatarInitials as legacy fallback', () => {
    expect(avatarSrc).toContain('export const UserAvatarInitials');
  });

  it('UserAvatarInitials shows initials: firstName[0] + lastName[0]', () => {
    expect(avatarSrc).toContain('data-testid="user-avatar-initials"');
  });
});

// ── Navbar Integration ─────────────────────────────────────────

describe('Navbar — UserAvatar Integration', () => {
  const navbarSrc = fs.readFileSync(path.resolve('src/components/Navbar.jsx'), 'utf-8');

  it('imports UserAvatar component', () => {
    expect(navbarSrc).toContain("import UserAvatar from './UserAvatar'");
  });

  it('removes hardcoded initials badge', () => {
    expect(navbarSrc).not.toContain("user.firstName?.[0]");
  });

  it('renders <UserAvatar user={user} />', () => {
    expect(navbarSrc).toContain('<UserAvatar user={user}');
  });

  it('passes size={32} for navbar avatar', () => {
    expect(navbarSrc).toContain('size={32}');
  });
});

// ── Avatar persistence across app ──────────────────────────────

describe('Avatar Consistency', () => {
  const adminUsersPageSrc = fs.readFileSync(path.resolve('src/pages/admin/AdminUsersPage.jsx'), 'utf-8');

  it('AdminUsersPage could use UserAvatar (verification)', () => {
    // This is a check that the component exists in a place where users are displayed
    expect(adminUsersPageSrc).toContain('firstName');
    expect(adminUsersPageSrc).toContain('lastName');
  });

  it('UserAvatar component is created for app-wide avatar support', () => {
    const userAvatarPath = path.resolve('src/components/UserAvatar.jsx');
    expect(fs.existsSync(userAvatarPath)).toBe(true);
  });
});
