import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLanguage } from '../i18n';
import type { UserRole } from '../types/user';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useLanguage();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        logout();
        window.alert(t('loggedOutInactivity'));
      }, INACTIVITY_TIMEOUT);
    };

    // Initialize timer on mount
    handleActivity();

    // Listeners for activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated, logout, t]);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};