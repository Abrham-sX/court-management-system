import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../lib/axios';
import {
  DocumentTextIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../stores/authStore';

interface Case {
  case_id: number;
  case_number: string;
  case_type: string;
  plaintiff_name: string;
  defendant_name: string;
  status: string;
  lawyer_id?: number | null;
}

interface Evidence {
  document_id: number;
  file_name: string;
  evidence_type?: string;
  evidence_date?: string;
  description?: string;
  upload_date: string;
}

// Case lookup by ID
const lookupCaseById = async (caseId: string): Promise<Case> => {
  const { data } = await apiClient.get(`/cases/${caseId}`);
  return data;
};

// Fetch evidence for a case
const fetchEvidence = async (caseId: number): Promise<Evidence[]> => {
  const { data } = await apiClient.get(`/documents/case/${caseId}`);
  return data;
};

export const UploadEvidence = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const { caseId } = useParams();
  const queryClient = useQueryClient();

  // Case state
  const [foundCase, setFoundCase] = useState<Case | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  // Evidence form state
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState('');
  const [evidenceDate, setEvidenceDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Existing evidence list
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Always load case from URL param
  useEffect(() => {
    if (caseId) {
      setLoading(true);
      lookupCaseById(caseId)
        .then((caseData) => {
          setFoundCase(caseData);
          loadEvidence(caseData.case_id);
        })
        .catch(() => setLoadError(t('caseNotFound') || 'Case not found'))
        .finally(() => setLoading(false));
    } else {
      setLoadError('No case specified.');
      setLoading(false);
    }
  }, [caseId]);

  const loadEvidence = async (id: number) => {
    setLoadingEvidence(true);
    try {
      const data = await fetchEvidence(id);
      setEvidenceList(data);
    } catch (err) {
      console.error('Failed to load evidence', err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  // Helper to translate status
  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!foundCase || !file) return;
      const formData = new FormData();
      formData.append('case_id', foundCase.case_id.toString());
      formData.append('file', file);
      formData.append('file_type', 'Evidence');
      formData.append('evidence_type', evidenceType);
      formData.append('evidence_date', evidenceDate);
      formData.append('description', description);
      const response = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg(t('evidenceUploadedSuccess') || 'Evidence uploaded successfully');
      setFile(null);
      setEvidenceType('');
      setEvidenceDate('');
      setDescription('');
      setError('');
      // Refresh evidence list and any case views that depend on this case
      if (foundCase) {
        loadEvidence(foundCase.case_id);
        queryClient.invalidateQueries({ queryKey: ['caseDetail', String(foundCase.case_id)] });
        queryClient.invalidateQueries({ queryKey: ['caseDetail', caseId] });
        queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', String(foundCase.case_id)] });
        queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', caseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['userCases'] });
      queryClient.invalidateQueries({ queryKey: ['lawyerCases'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setError(err.response?.data?.message || t('uploadFailed') || 'Upload failed');
    },
  });

  const handleUpload = () => {
    if (!foundCase || !file) {
      setError(t('caseAndFileRequired') || 'Case and file are required');
      return;
    }
    setError('');
    setSuccessMsg('');
    uploadMutation.mutate();
  };

  const previewFile = async (doc: Evidence) => {
    try {
      const response = await apiClient.get(`/documents/${doc.document_id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.body.appendChild(document.createElement('a'));
      link.href = url;
      link.setAttribute('download', doc.file_name);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert(t('couldNotDownloadFile') || 'Could not download file');
    }
  };

  if (loading) return <div className="p-8 text-center app-muted">{t('loading') || 'Loading...'}</div>;
  if (loadError)
    return (
      <div className="max-w-4xl mx-auto space-y-4">
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back to Case link */}
      <Link
        to={`/cases/${caseId}`}
        className="inline-flex items-center gap-2 text-sm font-bold app-muted hover:text-[var(--app-accent)] transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('backToCase') || 'Back to Case'}
      </Link>

      {/* Case Info & Upload Card */}
      <div className="app-card">
        <h1 className="app-heading text-2xl font-bold mb-6 flex items-center">
          <ArrowUpTrayIcon className="h-6 w-6 mr-2" style={{ color: 'var(--color-primary)' }} />
          {t('uploadEvidence') || 'Upload Evidence'}
        </h1>

        {/* Case Info */}
        {foundCase && (
          <div
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: 'var(--app-panel-soft)', color: 'var(--app-text)' }}
          >
            <p className="font-semibold">
              {foundCase.case_number} - {foundCase.case_type}
            </p>
            <p className="app-muted text-sm">
              {foundCase.plaintiff_name} vs {foundCase.defendant_name}
            </p>
            <p className="app-muted text-sm capitalize">
              {t('status') || 'Status'}: {translateStatus(foundCase.status)}
            </p>
          </div>
        )}

        {foundCase && foundCase.lawyer_id && user?.role === 'user' ? (
          <div className="p-4 rounded-lg bg-[var(--app-error-bg)] text-[var(--app-error-text)] border border-[var(--app-error-text)] opacity-90 mb-4 mt-2">
            {t('lawyerAssignedUploadWarning') ||
              'A lawyer is assigned to this case. By law, you cannot upload evidence. Please consult your lawyer.'}
          </div>
        ) : foundCase ? (
          <>
            {error && <div className="app-alert-error mb-4">{error}</div>}
            {successMsg && (
              <div
                className="p-3 rounded-lg mb-4"
                style={{ color: 'var(--app-success-text)', background: 'var(--app-success-bg)' }}
              >
                {successMsg}
              </div>
            )}

            <div className="space-y-4 border-t pt-4" style={{ borderColor: 'var(--app-border)' }}>
              {/* Evidence Type */}
              <div>
                <label className="app-label">{t('evidenceType') || 'Evidence Type'}</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="app-select"
                >
                  <option value="">-- {t('selectType') || 'Select type'} --</option>
                  <option value="document">{t('document') || 'Document'}</option>
                  <option value="photo">{t('photo') || 'Photo'}</option>
                  <option value="audio">{t('audio') || 'Audio'}</option>
                  <option value="video">{t('video') || 'Video'}</option>
                  <option value="other">{t('other') || 'Other'}</option>
                </select>
              </div>

              {/* Evidence Date */}
              <div>
                <label className="app-label">{t('dateOfEvidence') || 'Date of Evidence'}</label>
                <input
                  type="date"
                  value={evidenceDate}
                  onChange={(e) => setEvidenceDate(e.target.value)}
                  className="app-input"
                />
              </div>

              {/* File Selector */}
              <div>
                <label className="app-label">{t('file') || 'File'}</label>
                {file ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--app-panel-soft)' }}
                  >
                    <span className="text-sm">{file.name}</span>
                    <button onClick={() => setFile(null)} style={{ color: 'var(--app-error-text)' }}>
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="app-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="app-label">{t('descriptionOptional') || 'Description (Optional)'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="app-textarea"
                  rows={3}
                  placeholder={t('whatEvidenceShows') || 'What does this evidence show?'}
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="app-btn-primary w-full py-3 text-base font-semibold"
              >
                <ArrowUpTrayIcon className="h-5 w-5 inline mr-2" />
                {uploadMutation.isPending
                  ? t('uploading') || 'Uploading...'
                  : t('uploadEvidenceBtn') || 'Upload Evidence'}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Existing Evidence for This Case */}
      {foundCase && (
        <div className="app-card">
          <h2 className="app-heading text-xl font-semibold mb-4">
            {t('evidenceFor') || 'Evidence for'} {foundCase.case_number}
          </h2>
          {loadingEvidence ? (
            <p className="app-muted">{t('loadingEvidence') || 'Loading evidence...'}</p>
          ) : evidenceList.length === 0 ? (
            <p className="app-muted">{t('noEvidenceUploadedYet') || 'No evidence uploaded yet.'}</p>
          ) : (
            <ul className="space-y-3">
              {evidenceList.map((doc) => (
                <li
                  key={doc.document_id}
                  className="flex items-start justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--app-panel-soft)' }}
                >
                  <div className="flex items-start space-x-3">
                    <DocumentTextIcon
                      className="h-6 w-6 flex-shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                    />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--app-text)' }}>
                        {doc.file_name}
                      </p>
                      {doc.evidence_type && (
                        <p className="text-xs capitalize" style={{ color: 'var(--app-muted)' }}>
                          {t('typeLabel') || 'Type'}: {t(doc.evidence_type) || doc.evidence_type}
                          {doc.evidence_date ? ` • ${t('dateLabel') || 'Date'}: ${doc.evidence_date}` : ''}
                        </p>
                      )}
                      {doc.description && (
                        <p className="text-sm" style={{ color: 'var(--app-muted)' }}>
                          {doc.description}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
                        {t('uploadedLabel') || 'Uploaded'}: {new Date(doc.upload_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => previewFile(doc)}
                    className="flex items-center text-sm font-medium"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" /> {t('view') || 'View'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};