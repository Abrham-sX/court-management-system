import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  HomeIcon,
  ScaleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  FolderIcon,
  PencilSquareIcon,
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  BellIcon,
  NewspaperIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { UserAvatar } from '../components/UserAvatar';
import { useLanguage } from '../i18n';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseNav = [
    { name: t('home'), href: '/dashboard', icon: HomeIcon },
    { name: t('news'), href: '/news', icon: NewspaperIcon },
    { name: t('notifications'), href: '/notifications', icon: BellIcon },
    { name: t('profile'), href: '/profile', icon: UserCircleIcon },
    { name: t('settings'), href: '/settings', icon: AdjustmentsHorizontalIcon },
  ];

  const roleNav = () => {
    switch (user?.role.toLowerCase()) {
      case 'admin':
        return [
          { name: t('manageUsers'), href: '/admin/users', icon: UserGroupIcon },
          { name: t('systemLogs'), href: '/admin/logs', icon: DocumentTextIcon },
          { name: t('newsGenerator'), href: '/admin/news', icon: NewspaperIcon },
          { name: t('backupData'), href: '/admin/backup', icon: Cog6ToothIcon },
          { name: t('allCases'), href: '/cases/all', icon: FolderIcon },
          { name: t('reports'), href: '/admin/reports', icon: DocumentChartBarIcon },
        ];
      case 'clerk':
        return [
          { name: t('reports'), href: '/clerk/reports', icon: DocumentChartBarIcon },
          { name: t('registerCase'), href: '/cases/register', icon: PencilSquareIcon },
          { name: t('allCases'), href: '/cases/all', icon: FolderIcon },
        ];
      case 'judge':
        return [
          { name: t('reports'), href: '/judge/reports', icon: DocumentChartBarIcon },
          { name: t('myCases'), href: '/judge/cases', icon: ScaleIcon },
        ];
      case 'lawyer':
        return [
          { name: t('reports'), href: '/lawyer/reports', icon: DocumentChartBarIcon },
          { name: t('myCases'), href: '/lawyer/cases', icon: ScaleIcon },
        ];
      case 'user':
        return [
          { name: t('myCases'), href: '/cases/my', icon: FolderIcon },
        ];
      default:
        return [];
    }
  };

  const navItems = [...baseNav, ...roleNav()];

  return (
    <div className="dashboard-layout flex min-h-screen relative">
      <div className="hidden md:block w-[88px] shrink-0" />

      <aside
        className="group hidden w-[88px] hover:w-72 flex-col bg-[image:var(--app-sidebar-bg)] shadow-2xl md:flex transition-[width] duration-300 ease-in-out z-50 fixed inset-y-0 left-0 overflow-hidden"
        style={{ color: 'var(--app-text)' }}
      >
        <div className="px-4 pt-6 pb-4">
          <Link to="/" className="flex items-center space-x-4 rounded-2xl px-4 py-3.5 transition-all duration-300 overflow-hidden hover:bg-white/5">
            <ScaleIcon className="h-6 w-6 shrink-0 text-white transition-transform duration-300 hover:scale-110" strokeWidth={2} />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-xl font-display font-bold tracking-tight text-white">{t("cms")}</span>
          </Link>
        </div>

        <div
          className="mx-3 group-hover:mx-6 mb-8 rounded-3xl p-3 group-hover:p-5 backdrop-blur-lg border transition-all duration-300 flex items-center overflow-hidden shrink-0"
          style={{ background: 'var(--app-panel-soft)', borderColor: 'var(--app-border)' }}
        >
          <div className="flex items-center gap-4 w-full">
            <UserAvatar
              avatarUrl={null}
              fullName={user?.full_name}
              className="h-10 w-10 group-hover:h-12 group-hover:w-12 rounded-2xl shadow-lg ring-2 ring-white/20 shrink-0 transition-all duration-300"
            />
            <div className="min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <p className="truncate text-sm font-bold">
                {user?.full_name || t('user')}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider" style={{ color: 'var(--app-sidebar-muted)' }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-4 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 group/item overflow-hidden ${isActive
                  ? 'app-sidebar-item-active text-white'
                  : 'text-[var(--app-sidebar-muted)] hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon
                  className={`h-6 w-6 shrink-0 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-[var(--app-sidebar-muted)] group-hover/item:text-white group-hover/item:scale-110'
                    }`}
                  strokeWidth={2}
                />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 mt-auto border-t border-white/10 pt-2 px-4 pb-4">
          <button
            onClick={toggleLanguage}
            className="flex w-full items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 text-[var(--app-sidebar-muted)] hover:bg-white/5 hover:text-white overflow-hidden"
          >
            <LanguageIcon className="h-6 w-6 shrink-0 transition-transform duration-300 hover:scale-110" strokeWidth={2} />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-wide">
              {language === 'en' ? 'አማርኛ' : 'English'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 text-[var(--app-sidebar-muted)] hover:bg-white/5 hover:text-white overflow-hidden"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0 transition-transform duration-300 hover:scale-110" strokeWidth={2} />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-wide">{t('signOut')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-10 animate-fade-in bg-transparent min-w-0">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
