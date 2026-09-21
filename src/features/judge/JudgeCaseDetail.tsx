import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';

interface Document {
  document_id: number;
  file_name: string;
  evidence_type?: string;
  description?: string;
  upload_date?: string;
}

interface Hearing {
  hearing_id: number;
  hearing_date: string;
  hearing_time: string;
  status: string;
  notes?: string;
}

interface Judgment {
  judgment_text: string;
  final_status?: string;
}

interface Complaint {
  complaint_id: number;
  complaint_text: string;
  date: string;
  status: string;
  user_id: number;
}

interface CaseDetail {
  case_id: number;
  case_number: string;
  case_type: string;
  plaintiff_name: string;
  defendant_name: string;
  status: string;
  Documents?: Document[];
  Hearings?: Hearing[];
  Judgment?: Judgment;
  Complaints?: Complaint[];
}

const CASE_STATUS_OPTIONS = ['Registered', 'Reviewing', 'Ongoing', 'Scheduled', 'Adjourned', 'Closed', 'Dismissed'] as const;

// Fetch case by number or id for the judge
const fetchCaseDetail = async (caseNumberOrId: string): Promise<CaseDetail> => {
  const { data } = await apiClient.get(`/judgments/case-detail/${caseNumberOrId}`);
  return data;
};

interface SaveJudgmentParams {
  caseId: number;
  judgment_text: string;
  final_status: string;
}

const saveJudgment = async ({ caseId, judgment_text, final_status }: SaveJudgmentParams) => {
  const { data } = await apiClient.post(`/judgments/case/${caseId}`, { judgment_text, final_status });
  return data;
};

interface JudgmentFormData {
  judgment_text: string;
  final_status: string;
}

interface HearingFormData {
  hearing_date: string;
  hearing_time: string;
  notes: string;
}

export const JudgeCaseDetail = () => {
  const { t } = useLanguage();
  const { caseId: paramCaseId } = useParams();
  const [searchNumber, setSearchNumber] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm<JudgmentFormData>();
  const {
    register: registerHearing,
    handleSubmit: handleHearingSubmit,
    reset: resetHearing,
    setValue: setHearingValue,
  } = useForm<HearingFormData>({ defaultValues: { hearing_date: '', hearing_time: '', notes: '' } });

  const caseIdentifier = paramCaseId || searchValue;

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['judgeCaseDetail', caseIdentifier],
    queryFn: () => fetchCaseDetail(caseIdentifier),
    enabled: !!caseIdentifier,
  });

  const saveMutation = useMutation({
    mutationFn: saveJudgment,
    onSuccess: () => {
      setSuccess(t('judgmentSavedSuccess') || 'Judgment saved successfully');
      queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', caseIdentifier] });
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err.response?.data?.message || t('saveFailed') || 'Failed to save judgment'),
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!caseData) throw new Error('No case');
      const { data } = await apiClient.patch(`/judge/cases/${caseData.case_id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      setSuccess(t('statusUpdatedSuccess') || 'Case status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', caseIdentifier] });
      queryClient.invalidateQueries({ queryKey: ['judgeCases'] });
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err.response?.data?.message || t('statusUpdateFailed') || 'Failed to update status'),
  });

  // Schedule hearing mutation
  const scheduleMutation = useMutation({
    mutationFn: async (data: HearingFormData) => {
      if (!caseData) throw new Error('No case');
      const res = await apiClient.post('/hearings', {
        case_id: caseData.case_id,
        hearing_date: data.hearing_date,
        hearing_time: data.hearing_time,
        notes: data.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(t('hearingScheduledSuccess') || 'Hearing scheduled successfully');
      setShowScheduleForm(false);
      resetHearing();
      queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', caseIdentifier] });
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err.response?.data?.message || t('failed') || 'Scheduling failed'),
  });

  // Reschedule hearing mutation
  const rescheduleMutation = useMutation({
    mutationFn: async ({ hearingId, ...data }: HearingFormData & { hearingId: number }) => {
      const res = await apiClient.put(`/hearings/${hearingId}`, {
        hearing_date: data.hearing_date,
        hearing_time: data.hearing_time,
        notes: data.notes || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(t('hearingRescheduledSuccess') || 'Hearing rescheduled successfully');
      setRescheduleId(null);
      resetHearing();
      queryClient.invalidateQueries({ queryKey: ['judgeCaseDetail', caseIdentifier] });
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err.response?.data?.message || t('failed') || 'Rescheduling failed'),
  });

  const handleSearch = () => {
    if (!searchNumber.trim()) return;
    setSearchValue(searchNumber.trim());
    setError('');
    setSuccess('');
  };

  const onJudgmentSubmit = (formData: JudgmentFormData) => {
    if (!caseData) return;
    saveMutation.mutate({
      caseId: caseData.case_id,
      judgment_text: formData.judgment_text,
      final_status: formData.final_status,
    });
  };

  const onScheduleSubmit = (formData: HearingFormData) => {
    setError('');
    scheduleMutation.mutate(formData);
  };

  const onRescheduleSubmit = (formData: HearingFormData) => {
    if (rescheduleId === null) return;
    setError('');
    rescheduleMutation.mutate({ ...formData, hearingId: rescheduleId });
  };

  const startReschedule = (hearing: Hearing) => {
    setRescheduleId(hearing.hearing_id);
    setShowScheduleForm(false);
    setHearingValue('hearing_date', hearing.hearing_date);
    setHearingValue('hearing_time', hearing.hearing_time);
    setHearingValue('notes', hearing.notes || '');
  };

  const cancelHearingForm = () => {
    setShowScheduleForm(false);
    setRescheduleId(null);
    resetHearing();
  };

  useEffect(() => {
    if (caseData?.Judgment) {
      reset({
        judgment_text: caseData.Judgment.judgment_text,
        final_status: caseData.Judgment.final_status || '',
      });
    }
  }, [caseData, reset]);

  useEffect(() => {
    if (caseData?.status) {
      setStatusDraft(caseData.status);
    }
  }, [caseData?.status]);

  const previewFile = async (doc: Document) => {
    try {
      const response = await apiClient.get(`/documents/${doc.document_id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert(t('couldNotDownloadFile') || 'Could not download file');
    }
  };

  const hasEvidence = (caseData?.Documents?.length ?? 0) > 0;
  const hasComplaints = (caseData?.Complaints?.length ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search bar (if not opened from a list) */}
      {!paramCaseId && (
        <div className="app-card">
          <h1 className="app-heading text-2xl font-bold mb-4">
            {t('caseJudgment') || 'Case Judgment'}
          </h1>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder={t('enterCaseNumber') || 'Enter case number'}
              className="app-input flex-1"
            />
            <button onClick={handleSearch} className="app-btn-primary">
              <MagnifyingGlassIcon className="h-5 w-5 mr-1 inline" /> {t('sync') || 'Sync'}
            </button>
          </div>
        </div>
      )}

      {error && <div className="app-alert-error">{error}</div>}
      {success && (
        <div
          className="p-3 rounded-lg"
          style={{ color: 'var(--app-success-text)', background: 'var(--app-success-bg)' }}
        >
          {success}
        </div>
      )}

      {isLoading && <p className="app-muted">{t('loadingCase') || 'Loading case...'}</p>}

      {caseData && (
        <>
          <div className="app-card">
            <div className="flex flex-wrap gap-2 mb-4">
              <a
                href="#evidence-section"
                className="app-link text-sm font-bold"
              >
                {t('viewEvidence') || 'View Evidence'}
              </a>
              <a
                href="#complaints-section"
                className="app-link text-sm font-bold"
              >
                {t('viewComplaints') || 'View Complaints'}
              </a>
            </div>
          </div>

          {/* Case Info Card */}
          <div className="app-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="app-heading text-xl font-bold">
                  {caseData.case_number} — {caseData.case_type}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="app-muted text-sm">{t('plaintiff') || 'Plaintiff'}</p>
                    <p className="app-heading font-medium">{caseData.plaintiff_name}</p>
                  </div>
                  <div>
                    <p className="app-muted text-sm">{t('defendant') || 'Defendant'}</p>
                    <p className="app-heading font-medium">{caseData.defendant_name}</p>
                  </div>
                  <div>
                    <p className="app-muted text-sm">{t('status') || 'Status'}</p>
                    <div className="flex flex-col gap-2">
                      <span className="app-badge-neutral capitalize">{caseData.status}</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={statusDraft}
                          onChange={(e) => setStatusDraft(e.target.value)}
                          className="app-select min-w-0"
                        >
                          {CASE_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {t(`status_${status.toLowerCase()}`) || status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate(statusDraft)}
                          disabled={statusMutation.isPending || statusDraft === caseData.status}
                          className="app-btn-primary whitespace-nowrap"
                        >
                          {statusMutation.isPending
                            ? (t('saving') || 'Saving...')
                            : (t('updateStatus') || 'Update Status')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance badges */}
              <div className="flex flex-col gap-2 shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    hasEvidence
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}
                >
                  {hasEvidence ? (
                    <ShieldCheckIcon className="h-4 w-4" />
                  ) : (
                    <ShieldExclamationIcon className="h-4 w-4" />
                  )}
                  {hasEvidence
                    ? `${caseData.Documents!.length} ${t('evidence') || 'Evidence'} ${t('uploaded') || 'Uploaded'}`
                    : t('noEvidenceUploaded') || 'No Evidence Uploaded'}
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    hasComplaints
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}
                >
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                  {hasComplaints
                    ? `${caseData.Complaints!.length} ${t('complaint') || 'Complaint'}${caseData.Complaints!.length > 1 ? 's' : ''} ${t('filed') || 'Filed'}`
                    : t('noComplaintsFiled') || 'No Complaints Filed'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence List */}
          <div className="app-card" id="evidence-section">
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="app-heading text-lg font-semibold">
                  {t('evidence') || 'Evidence'}
                </h3>
                {!hasEvidence && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-rose-500">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {t('notCompliant') || 'Not Compliant'}
                  </span>
                )}
                {hasEvidence && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-500">
                    <CheckCircleIcon className="h-4 w-4" />
                    {t('compliant') || 'Compliant'}
                  </span>
                )}
              </div>
              {!hasEvidence ? (
                <div
                  className="text-center py-8 rounded-xl border-2 border-dashed border-rose-200"
                  style={{ background: 'var(--app-panel-soft)' }}
                >
                  <ShieldExclamationIcon className="h-8 w-8 mx-auto mb-2 text-rose-400" />
                  <p className="app-muted text-sm">
                    {t('noEvidenceUploaded') || 'No evidence has been uploaded for this case.'}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {caseData.Documents?.map((doc) => (
                    <li
                      key={doc.document_id}
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: 'var(--app-panel-soft)' }}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <DocumentTextIcon className="h-5 w-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{doc.file_name}</p>
                          {doc.evidence_type && (
                            <p className="app-muted text-xs capitalize">{doc.evidence_type}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => previewFile(doc)}
                        className="shrink-0 text-sm ml-2"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <EyeIcon className="h-4 w-4 inline mr-1" /> {t('view') || 'View'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Complaints Filed */}
          <div className="app-card" id="complaints-section">
            <div className="flex items-center gap-2 mb-4">
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-amber-500" />
                <h3 className="app-heading text-lg font-semibold">
                  {t('complaints') || 'Complaints'}
                </h3>
                {hasComplaints && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {caseData.Complaints!.length} {t('filed') || 'filed'}
                  </span>
                )}
              </div>
              {!hasComplaints ? (
                <div
                  className="text-center py-8 rounded-xl border-2 border-dashed"
                  style={{ borderColor: 'var(--app-border)', background: 'var(--app-panel-soft)' }}
                >
                  <ChatBubbleLeftEllipsisIcon className="h-8 w-8 mx-auto mb-2 app-muted opacity-30" />
                  <p className="app-muted text-sm">
                    {t('noComplaintsFiled') || 'No complaints have been filed on this case.'}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {caseData.Complaints?.map((c) => (
                    <li
                      key={c.complaint_id}
                      className="p-3 rounded-xl space-y-2"
                      style={{ background: 'var(--app-panel-soft)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest app-muted">
                          {new Date(c.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            c.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : c.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{c.complaint_text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Hearings Section with Schedule / Reschedule */}
          <div className="app-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="app-heading text-lg font-semibold">
                  {t('hearings') || 'Hearings'}
                </h3>
              </div>
              {!showScheduleForm && rescheduleId === null && (
                <button
                  onClick={() => {
                    setShowScheduleForm(true);
                    resetHearing();
                    setError('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  {t('scheduleHearing') || 'Schedule Hearing'}
                </button>
              )}
            </div>

            {/* Schedule / Reschedule Inline Form */}
            {(showScheduleForm || rescheduleId !== null) && (
              <form
                onSubmit={handleHearingSubmit(rescheduleId !== null ? onRescheduleSubmit : onScheduleSubmit)}
                className="mb-6 p-4 rounded-xl border-2 border-dashed space-y-4 animate-fade-in"
                style={{ borderColor: 'var(--app-accent)', background: 'var(--app-panel-soft)' }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--app-accent)' }}>
                    {rescheduleId !== null
                      ? (t('rescheduleHearing') || 'Reschedule Hearing')
                      : (t('scheduleNewHearing') || 'Schedule New Hearing')}
                  </h4>
                  <button
                    type="button"
                    onClick={cancelHearingForm}
                    className="text-sm app-muted hover:text-rose-500 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest app-muted block mb-1">
                      {t('date') || 'Date'}
                    </label>
                    <input
                      type="date"
                      {...registerHearing('hearing_date', { required: true })}
                      className="app-input"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest app-muted block mb-1">
                      {t('time') || 'Time'}
                    </label>
                    <input
                      type="time"
                      {...registerHearing('hearing_time', { required: true })}
                      className="app-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest app-muted block mb-1">
                    {t('notesOptional') || 'Notes (Optional)'}
                  </label>
                  <textarea
                    {...registerHearing('notes')}
                    className="app-textarea"
                    rows={2}
                    placeholder={t('addHearingNotes') || 'Add notes...'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending || rescheduleMutation.isPending}
                  className="app-btn-primary w-full"
                >
                  {rescheduleId !== null ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 inline mr-1" />
                      {rescheduleMutation.isPending
                        ? (t('saving') || 'Saving...')
                        : (t('confirmReschedule') || 'Confirm Reschedule')}
                    </>
                  ) : (
                    <>
                      <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                      {scheduleMutation.isPending
                        ? (t('scheduling') || 'Scheduling...')
                        : (t('confirmSchedule') || 'Confirm & Schedule')}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Hearing List */}
            {caseData.Hearings?.length === 0 && !showScheduleForm ? (
              <div
                className="text-center py-8 rounded-xl border-2 border-dashed"
                style={{ borderColor: 'var(--app-border)', background: 'var(--app-panel-soft)' }}
              >
                <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2 app-muted opacity-30" />
                <p className="app-muted text-sm">
                  {t('noHearingsScheduled') || 'No hearings scheduled yet.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {caseData.Hearings?.map((hearing) => (
                  <li
                    key={hearing.hearing_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-2"
                    style={{ background: 'var(--app-panel-soft)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          hearing.status === 'Scheduled'
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <div>
                        <span className="font-bold text-sm">
                          {new Date(hearing.hearing_date).toLocaleDateString()} at{' '}
                          {hearing.hearing_time}
                        </span>
                        {hearing.notes && (
                          <p className="text-xs app-muted mt-0.5 italic">"{hearing.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          hearing.status === 'Scheduled'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}
                      >
                        {hearing.status}
                      </span>
                      {hearing.status === 'Scheduled' && rescheduleId !== hearing.hearing_id && (
                        <button
                          onClick={() => startReschedule(hearing)}
                          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                        >
                          <ArrowPathIcon className="h-3 w-3" />
                          {t('reschedule') || 'Reschedule'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Judgment Form */}
          <div className="app-card">
            <h3 className="app-heading text-lg font-semibold mb-4">
              <PencilIcon className="h-5 w-5 inline mr-2" style={{ color: 'var(--color-primary)' }} />
              {caseData.Judgment ? (t('updateJudgment') || 'Update Judgment') : (t('writeJudgment') || 'Write Judgment')}
            </h3>
            <form onSubmit={handleSubmit(onJudgmentSubmit)} className="space-y-4">
              <div>
                <label className="app-label">{t('judgmentText') || 'Judgment Text'}</label>
                <textarea
                  {...register('judgment_text', { required: true })}
                  rows={8}
                  className="app-textarea"
                  placeholder={t('writeYourJudgment') || 'Write your judgment here...'}
                />
              </div>
              <div>
                <label className="app-label">{t('finalDecision') || 'Final Decision'}</label>
                <select {...register('final_status')} className="app-select">
                  <option value="">-- {t('select') || 'Select'} --</option>
                  <option value="Granted">{t('granted') || 'Granted'}</option>
                  <option value="Denied">{t('denied') || 'Denied'}</option>
                  <option value="Settled">{t('settled') || 'Settled'}</option>
                  <option value="Dismissed">{t('dismissed') || 'Dismissed'}</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="app-btn-primary"
              >
                <CheckCircleIcon className="h-5 w-5 inline mr-1" />
                {saveMutation.isPending ? (t('saving') || 'Saving...') : (t('saveJudgment') || 'Save Judgment')}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
