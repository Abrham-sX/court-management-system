import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../stores/authStore';

interface FoundCase {
  case_id: number;
  case_number: string;
  case_type: string;
  plaintiff_name: string;
  defendant_name: string;
  status: string;
  lawyer_id?: number | null;
}

// Case lookup by ID
const lookupCaseById = async (caseId: string): Promise<FoundCase> => {
  const { data } = await apiClient.get(`/cases/${caseId}`);
  return data;
};

// Submit complaint — case_id is always required
const submitComplaint = async (payload: {
  subject: string;
  description: string;
  case_id: number;
}) => {
  const { data } = await apiClient.post('/complaints', payload);
  return data;
};

export const FileComplaint = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const { caseId } = useParams();
  const queryClient = useQueryClient();
  const [foundCase, setFoundCase] = useState<FoundCase | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Helper to translate status
  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  // Always load case from URL param
  useEffect(() => {
    if (caseId) {
      setLoading(true);
      lookupCaseById(caseId)
        .then((caseData) => setFoundCase(caseData))
        .catch(() => setLoadError(t('caseNotFoundSync') || 'Case not found'))
        .finally(() => setLoading(false));
    } else {
      setLoadError('No case specified.');
      setLoading(false);
    }
  }, [caseId]);

  const complaintSchema = z.object({
    subject: z.string().min(5, t('subjectRequired') || 'Subject must be at least 5 characters'),
    description: z
      .string()
      .min(20, t('provideDetails') || 'Description must be at least 20 characters'),
  });

  type ComplaintFormData = z.infer<typeof complaintSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const complaintMutation = useMutation({
    mutationFn: submitComplaint,
    onSuccess: () => {
      setSuccessMsg(t('complaintSubmittedSuccess') || 'Complaint submitted successfully.');
      reset();
      if (foundCase) {
        queryClient.invalidateQueries({
          queryKey: ['caseDetail', String(foundCase.case_id)],
        });
        queryClient.invalidateQueries({ queryKey: ['caseDetail', caseId] });
        queryClient.invalidateQueries({
          queryKey: ['judgeCaseDetail', String(foundCase.case_id)],
        });
        queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', caseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['userCases'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setFormError(
        err.response?.data?.message || t('submissionFailed') || 'Submission failed'
      ),
  });

  const onSubmit = (data: ComplaintFormData) => {
    if (!foundCase) return;
    setFormError('');
    complaintMutation.mutate({
      ...data,
      case_id: foundCase.case_id,
    });
  };

  if (loading)
    return <div className="p-8 text-center app-muted">{t('loading') || 'Loading...'}</div>;

  if (loadError)
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold app-muted hover:text-[var(--app-accent)] transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('backToDashboard') || 'Back to Dashboard'}
        </Link>
        <div className="app-card text-center py-10">
          <p className="text-rose-500 font-bold">{loadError}</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back to Case link */}
      <Link
        to={`/cases/${caseId}`}
        className="inline-flex items-center gap-2 text-sm font-bold app-muted hover:text-[var(--app-accent)] transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('backToCase') || 'Back to Case'}
      </Link>

      {/* Case Info Card */}
      <div className="app-card">
        <h1 className="app-heading text-2xl font-bold mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 mr-2" style={{ color: 'var(--color-primary)' }} />
          {t('fileComplaintTitle') || 'File a Complaint'}
        </h1>

        {foundCase && (
          <div className="p-3 rounded-lg" style={{ background: 'var(--app-panel-soft)' }}>
            <p className="app-heading font-semibold">
              {foundCase.case_number} - {foundCase.case_type}
            </p>
            <p className="app-muted text-sm">
              {foundCase.plaintiff_name} vs {foundCase.defendant_name}
            </p>
            <p className="app-muted text-sm">
              {t('status') || 'Status'}: {translateStatus(foundCase.status)}
            </p>
          </div>
        )}
      </div>

      {/* Complaint Form */}
      <div className="app-card">
        {successMsg && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{
              color: 'var(--app-success-text)',
              background: 'var(--app-success-bg)',
            }}
          >
            {successMsg}
          </div>
        )}
        {formError && <div className="app-alert-error mb-4">{formError}</div>}
        {foundCase && foundCase.lawyer_id && user?.role === 'user' ? (
          <div className="p-4 rounded-lg bg-[var(--app-error-bg)] text-[var(--app-error-text)] border border-[var(--app-error-text)] opacity-90">
            {t('lawyerAssignedWarning') ||
              'A lawyer is assigned to this case. By law, you cannot file a complaint. Please consult your lawyer.'}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="app-label">{t('subjectLabel') || 'Subject'}</label>
              <input
                type="text"
                placeholder={t('briefSubject') || 'Brief subject of complaint'}
                {...register('subject')}
                className="app-input"
              />
              {errors.subject && (
                <p className="app-error">
                  {errors.subject.message ||
                    (t('subjectRequired') || 'Subject must be at least 5 characters')}
                </p>
              )}
            </div>
            <div>
              <label className="app-label">{t('descriptionLabel') || 'Description'}</label>
              <textarea
                rows={5}
                placeholder={t('describeDetail') || 'Describe the issue in detail...'}
                {...register('description')}
                className="app-textarea"
              />
              {errors.description && (
                <p className="app-error">
                  {errors.description.message ||
                    (t('provideDetails') ||
                      'Description must be at least 20 characters')}
                </p>
              )}
            </div>
            {foundCase && (
              <p className="app-muted text-sm">
                {t('linkedToCase') || 'Linked to case'}{' '}
                <strong>{foundCase.case_number}</strong>.
              </p>
            )}
            <button
              type="submit"
              disabled={complaintMutation.isPending}
              className="app-btn-primary w-full py-3"
            >
              {complaintMutation.isPending
                ? t('submitting') || 'Submitting...'
                : t('submitComplaint') || 'Submit Complaint'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};