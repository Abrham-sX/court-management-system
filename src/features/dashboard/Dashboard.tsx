import { useAuthStore } from '../../stores/authStore';
import { AdminDashboard } from './AdminDashboard';
import { ClerkDashboard } from './ClerkDashboard';
import { JudgeDashboard } from './JudgeDashboard';
import { LawyerDashboard } from './LawyerDashboard';
import { PublicUserDashboard } from './PublicUserDashboard';
import { useLanguage } from '../../i18n';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  if (!user) return <div className="p-8 text-center app-muted">{t('loading')}</div>;

  switch (user.role.toLowerCase()) {
    case 'admin':
      return <AdminDashboard />;
    case 'clerk':
      return <ClerkDashboard />;
    case 'judge':
      return <JudgeDashboard />;
    case 'lawyer':
      return <LawyerDashboard />;
    case 'user':
    case 'client':
      return <PublicUserDashboard />;
    default:
      return <div className="p-8 text-center text-red-500">{t('accessDenied')}</div>;
  }
};