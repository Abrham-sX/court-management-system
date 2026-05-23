import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { useLanguage } from './i18n';

// Route protection and layouts
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Authentication
import {
  LoginForm,
  RegisterForm,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
} from './features/auth';
import { LandingPage } from './features/public/LandingPage';
import { PublicNewsArticle } from './features/public/PublicNewsArticle';

// Core dashboard
import { Dashboard } from './features/dashboard/Dashboard';

// Profile & Settings
import { Profile } from './features/profile/Profile';
import { Settings } from './features/profile/Settings';

// News, Notifications, Reports (public pages)
import { News } from './features/news/News';
import { Notifications } from './features/news/Notifications';
import { Reports } from './features/news/Reports';

// Cases
import { CaseRegisterForm } from './features/cases/CaseRegisterForm';
import { CasesList } from './features/cases/CasesList';
import { CaseStatus } from './features/cases/CaseStatus';
import { UserCases } from './features/cases/UserCases';
import { CaseDetails } from './features/cases/CaseDetails';
import { FileComplaint } from './features/cases/FileComplaint';

// Hearings
import { ScheduleHearing } from './features/hearings/ScheduleHearing';

// Judge
import { JudgeCases } from './features/judge/JudgeCases';
import { WriteJudgment } from './features/judge/WriteJudgment';
import { JudgeReports } from './features/judge/JudgeReports';
import { JudgeCaseDetail } from './features/judge/JudgeCaseDetail';

// Clerk
import { ClerkReports } from './features/judge/ClerkReports';

// Lawyer
import { LawyerCases } from './features/lawyer/LawyerCases';
import { UploadEvidence } from './features/lawyer/UploadEvidence';
import { LawyerReports } from './features/lawyer/LawyerReports';

// Admin
import { AdminUsers } from './features/admin/AdminUsers';
import { AdminLogs } from './features/admin/AdminLogs';
import { AdminBackup } from './features/admin/AdminBackup';
import { AdminReports } from './features/admin/AdminReports';
import { AdminNews } from './features/admin/AdminNews';

// Fallback pages
const Unauthorized = () => {
  const { t } = useLanguage();
  return (
    <div className="p-6">
      <div className="app-form-shell max-w-xl">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--app-error-text)' }}>
          {t('accessDenied')}
        </h1>
        <p className="app-muted mt-2">{t('notAuthorized')}</p>
      </div>
    </div>
  );
};

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div className="p-6">
      <div className="app-form-shell max-w-xl">
        <h1 className="text-2xl font-bold">{t('pageNotFound')}</h1>
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/article/:id" element={<PublicNewsArticle />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Common pages for all authenticated users */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/news" element={<News />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/cases/:caseId" element={<CaseDetails />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/backup" element={<AdminBackup />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>

            {/* Clerk Routes (Admin also has access) */}
            <Route element={<ProtectedRoute allowedRoles={['clerk', 'admin']} />}>
              <Route path="/cases/register" element={<CaseRegisterForm />} />
              <Route path="/cases/all" element={<CasesList />} />
              <Route path="/clerk/reports" element={<ClerkReports />} />
            </Route>

            {/* Shared Scheduling Route */}
            <Route element={<ProtectedRoute allowedRoles={['clerk', 'admin', 'judge']} />}>
              <Route path="/hearings/schedule" element={<ScheduleHearing />} />
            </Route>

            {/* Judge Routes */}
            <Route element={<ProtectedRoute allowedRoles={['judge']} />}>
              <Route path="/judge/cases" element={<JudgeCases />} />
              <Route path="/judge/judgments/:caseId?" element={<WriteJudgment />} />
              <Route path="/judge/reports" element={<JudgeReports />} />
              <Route path="/judge/case/:caseId?" element={<JudgeCaseDetail />} />
            </Route>

            {/* Lawyer-only routes */}
            <Route element={<ProtectedRoute allowedRoles={['lawyer']} />}>
              <Route path="/lawyer/cases" element={<LawyerCases />} />
              <Route path="/lawyer/reports" element={<LawyerReports />} />
            </Route>

            {/* Shared Public User & Lawyer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user', 'lawyer']} />}>
              <Route path="/cases/status" element={<CaseStatus />} />
              <Route path="/cases/:caseId/complaint" element={<FileComplaint />} />
              <Route path="/cases/:caseId/upload-evidence" element={<UploadEvidence />} />
            </Route>

            {/* Public User only routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/cases/my" element={<UserCases />} />
            </Route>
          </Route>
        </Route>

        {/* Redirects and Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;