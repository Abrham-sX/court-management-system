import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../lib/axios';
import {
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

interface CaseDetail {
  case_id: number;
  case_number: string;
  case_type: string;
  plaintiff_name: string;
  defendant_name: string;
  status: string;
  filing_date: string;
  description: string;
  judge?: { full_name: string };
  lawyer?: { full_name: string };
  case_user_name?: string;
  Hearings?: {
    hearing_id: number;
    hearing_date: string;
    hearing_time: string;
    status: string;
    notes: string;
  }[];
  Documents?: {
    document_id: number;
    file_name: string;
    file_type: string;
    upload_date: string;
  }[];
  Complaints?: {
    complaint_id: number;
    complaint_text: string;
    date: string;
    status: string;
    user_id: number;
  }[];
}

const statusSteps = ['Pending', 'Registered', 'Ongoing', 'Judgment', 'Closed'];

export const CaseDetails = () => {
  const { caseId } = useParams();
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const showCaseActions = user?.role === 'user' || user?.role === 'lawyer';

  const { data: caseData, isLoading, isError } = useQuery({
    queryKey: ['caseDetail', caseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/cases/${caseId}`);
      return data as CaseDetail;
    },
    enabled: !!caseId,
  });

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const response = await apiClient.get(`/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center app-muted">{t('loading')}</div>;
  }

  if (isError || !caseData) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold">
        {t('caseNotFound') || 'Case Not Found'}
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(caseData.status);

  let parsedDesc: any = null;
  try {
    if (
      caseData.description &&
      (caseData.description.trim().startsWith('{') ||
        caseData.description.trim().startsWith('['))
    ) {
      parsedDesc = JSON.parse(caseData.description);
    }
  } catch (e) {
    parsedDesc = null;
  }

  const translateHearingStatus = (status: string) => {
    const key = `hearing_status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  const translateCaseStatus = (status: string) => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[var(--app-accent-soft)] p-2 rounded-lg">
              <ScaleIcon className="h-6 w-6 text-[var(--app-accent)]" />
            </div>
            <h1 className="app-heading text-3xl font-black">{caseData.case_number}</h1>
          </div>
          <p className="app-muted font-bold tracking-widest uppercase text-xs">
            {caseData.case_type}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showCaseActions && (
            <>
              <Link
                to={`/cases/${caseId}/complaint`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 hover:scale-105"
              >
                <PencilSquareIcon className="h-4 w-4" />
                {t('fileComplaint') || 'File Complaint'}
              </Link>
              <Link
                to={`/cases/${caseId}/upload-evidence`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 hover:scale-105"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                {t('uploadEvidence') || 'Upload Evidence'}
              </Link>
            </>
          )}
          <div
            className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest border ${
              caseData.status === 'Closed'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-[var(--app-accent-soft)] text-[var(--app-accent)] border-[var(--app-border)]'
            }`}
          >
            {translateCaseStatus(caseData.status)}
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="app-card overflow-hidden">
        <h2 className="text-sm font-black uppercase tracking-widest app-muted mb-4">
          {t('caseProgress') || 'Case Progress'}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {statusSteps.map((step, index) => {
            const stepKey = step.toLowerCase();
            return (
              <span key={step} className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                    index === currentStepIndex
                      ? 'bg-emerald-500 text-white'
                      : index < currentStepIndex
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-[var(--app-panel-soft)] text-[var(--app-muted)]'
                  }`}
                >
                  {t(stepKey) || step}
                </span>
                {index < statusSteps.length - 1 && (
                  <span className="text-[var(--app-muted)] text-xs">→</span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Description */}
        <div className="lg:col-span-2 space-y-6">
          {parsedDesc ? (
            <div className="space-y-6">
              {/* Rich Specifications Panel */}
              <div className="app-card grid grid-cols-2 md:grid-cols-4 gap-6 bg-[var(--app-panel-soft)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest app-muted mb-1">
                    {t('division') || 'Division'}
                  </p>
                  <p className="font-bold text-sm">
                    {parsedDesc.filing_division || t('general') || 'General'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest app-muted mb-1">
                    {t('urgency') || 'Urgency'}
                  </p>
                  <span
                    className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full ${
                      parsedDesc.urgency_level === 'Urgent' ||
                      parsedDesc.urgency_level === 'Expedited'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {parsedDesc.urgency_level || t('regular') || 'Regular'}
                  </span>
                </div>
                {parsedDesc.claim_amount && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest app-muted mb-1">
                      {t('claimAmount') || 'Claim Amount'}
                    </p>
                    <p className="font-extrabold text-sm text-[var(--app-accent)]">
                      {Number(parsedDesc.claim_amount).toLocaleString()} {t('currency_etb') || 'ETB'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest app-muted mb-1">
                    {t('filingDate') || 'Filing Date'}
                  </p>
                  <p className="font-bold text-sm">
                    {new Date(caseData.filing_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Parties Detailed Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plaintiff / Petitioner Card */}
                <div className="app-card space-y-4 border border-[var(--app-border)]">
                  <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest app-muted">
                      {t('plaintiffPetitioner') || 'Plaintiff / Petitioner'}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="font-extrabold text-lg text-blue-600">
                      {caseData.plaintiff_name}
                    </p>
                    {parsedDesc.plaintiff_phone && (
                      <p className="text-xs">
                        <strong>{t('phoneLabel') || 'Phone'}</strong> {parsedDesc.plaintiff_phone}
                      </p>
                    )}
                    {parsedDesc.plaintiff_email && (
                      <p className="text-xs">
                        <strong>{t('emailLabel') || 'Email'}</strong> {parsedDesc.plaintiff_email}
                      </p>
                    )}
                    {parsedDesc.plaintiff_address && (
                      <p className="text-xs">
                        <strong>{t('residenceLabel') || 'Residence'}</strong> {parsedDesc.plaintiff_address}
                      </p>
                    )}
                    <p className="text-xs pt-1 border-t border-[var(--app-border)] mt-2">
                      <strong>{t('counselLabel') || 'Counsel'}</strong>{' '}
                      {caseData.lawyer?.full_name ||
                        parsedDesc.lawyer_name ||
                        t('proSe') || 'Pro Se (No Counsel)'}
                    </p>
                  </div>
                </div>

                {/* Defendant / Respondent Card */}
                <div className="app-card space-y-4 border border-[var(--app-border)]">
                  <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest app-muted">
                      {t('defendantRespondent') || 'Defendant / Respondent'}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="font-extrabold text-lg text-red-500">
                      {caseData.defendant_name}
                    </p>
                    {parsedDesc.defendant_phone && (
                      <p className="text-xs">
                        <strong>{t('phoneLabel') || 'Phone'}</strong> {parsedDesc.defendant_phone}
                      </p>
                    )}
                    {parsedDesc.defendant_email && (
                      <p className="text-xs">
                        <strong>{t('emailLabel') || 'Email'}</strong> {parsedDesc.defendant_email}
                      </p>
                    )}
                    {parsedDesc.defendant_address && (
                      <p className="text-xs">
                        <strong>{t('residenceLabel') || 'Residence'}</strong> {parsedDesc.defendant_address}
                      </p>
                    )}
                    <p className="text-xs pt-1 border-t border-[var(--app-border)] mt-2">
                      <strong>{t('counselLabel') || 'Counsel'}</strong>{' '}
                      {parsedDesc.defendant_lawyer || t('proSe') || 'Pro Se (No Counsel)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignments Panel */}
              <div className="app-card space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest app-muted border-b border-[var(--app-border)] pb-2">
                  {t('judicialRegistryDetails') || 'Judicial Registry Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest app-muted">
                      {t('assignedJudge') || 'Assigned Judge'}
                    </p>
                    <p className="font-bold text-sm mt-1">
                      {caseData.judge?.full_name || t('notAssigned') || 'Not Assigned'}
                    </p>
                  </div>
                  {caseData.case_user_name && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest app-muted">
                        {t('citizenPortalAccess') || 'Citizen Portal Access'}
                      </p>
                      <span className="inline-block text-xs font-mono font-bold bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded border border-amber-500/20 mt-1">
                        @{caseData.case_user_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Case Context / Summary */}
              <div className="app-card space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest app-muted border-b border-[var(--app-border)] pb-2">
                  {t('claimsDescription') || 'Claims & Description'}
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line bg-[var(--app-panel-soft)] p-5 rounded-2xl border border-[var(--app-border)]">
                  {parsedDesc.factual_summary ||
                    t('noFactualDescription') || 'No factual description submitted for this case file.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="app-card space-y-6">
              <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-4">
                <InformationCircleIcon className="h-5 w-5 text-[var(--app-accent)]" />
                <h3 className="font-black uppercase tracking-widest text-sm">
                  {t('caseDetails') || 'Case Details'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest app-muted mb-1">
                    {t('plaintiff') || 'Plaintiff'}
                  </p>
                  <p className="font-bold text-lg">{caseData.plaintiff_name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest app-muted mb-1">
                    {t('defendant') || 'Defendant'}
                  </p>
                  <p className="font-bold text-lg">{caseData.defendant_name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest app-muted mb-1">
                    {t('judge') || 'Judge'}
                  </p>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 app-muted" />
                    <p className="font-bold">
                      {caseData.judge?.full_name || t('notAssigned') || 'Not Assigned'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest app-muted mb-1">
                    {t('filingDate') || 'Filing Date'}
                  </p>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 app-muted" />
                    <p className="font-bold">
                      {new Date(caseData.filing_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest app-muted mb-2">
                  {t('description') || 'Description'}
                </p>
                <div className="p-4 rounded-xl bg-[var(--app-panel-soft)] text-sm leading-relaxed border border-[var(--app-border)]">
                  {caseData.description || t('noDescription') || 'No description provided.'}
                </div>
              </div>
            </div>
          )}

          {/* Complaints Table */}
          <div className="app-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-amber-500" />
                <h3 className="font-black uppercase tracking-widest text-sm">
                  {t('complaints') || 'Complaints'}
                </h3>
              </div>
              <span className="text-xs font-black px-2 py-1 bg-amber-500/10 rounded text-amber-600">
                {caseData.Complaints?.length || 0} {t('files') || 'Files'}
              </span>
            </div>

            {caseData.Complaints?.length === 0 ? (
              <div className="text-center py-10 app-panel-soft rounded-2xl border-2 border-dashed border-[var(--app-border)]">
                <InformationCircleIcon className="h-8 w-8 mx-auto mb-2 app-muted opacity-20" />
                <p className="app-muted text-sm">
                  {t('noComplaintsFiled') || 'No complaints available for this case.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {caseData.Complaints?.map((complaint) => {
                  const complaintStatusKey = `complaint_status_${complaint.status.toLowerCase()}`;
                  const statusLabel = t(complaintStatusKey) || complaint.status;
                  return (
                    <div
                      key={complaint.complaint_id}
                      className="p-4 rounded-xl bg-[var(--app-panel-soft)] border border-transparent hover:border-[var(--app-border)] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest app-muted">
                          {new Date(complaint.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            complaint.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : complaint.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {complaint.complaint_text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents Table */}
          <div className="app-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-[var(--app-accent)]" />
                <h3 className="font-black uppercase tracking-widest text-sm">
                  {t('caseFiles') || 'Case Files'}
                </h3>
              </div>
              <span className="text-xs font-black px-2 py-1 bg-[var(--app-accent-soft)] rounded text-[var(--app-accent)]">
                {caseData.Documents?.length || 0} {t('files') || 'Files'}
              </span>
            </div>

            {caseData.Documents?.length === 0 ? (
              <div className="text-center py-10 app-panel-soft rounded-2xl border-2 border-dashed border-[var(--app-border)]">
                <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 app-muted opacity-20" />
                <p className="app-muted text-sm">
                  {t('noDocumentsAvailable') || 'No documents available for this case.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {caseData.Documents?.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--app-panel-soft)] hover:bg-[var(--app-panel)] transition-colors border border-transparent hover:border-[var(--app-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] app-muted uppercase tracking-widest">
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(doc.document_id, doc.file_name)}
                      className="p-2 hover:bg-[var(--app-accent-soft)] rounded-lg text-[var(--app-accent)] transition-colors"
                      aria-label={t('download') || 'Download'}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hearings Timeline */}
        <div className="space-y-6">
          <div className="app-card">
            <div className="flex items-center gap-2 mb-6">
              <ClockIcon className="h-5 w-5 text-[var(--app-accent)]" />
              <h3 className="font-black uppercase tracking-widest text-sm">
                {t('hearings') || 'Hearings'}
              </h3>
            </div>

            {caseData.Hearings?.length === 0 ? (
              <p className="app-muted text-sm text-center py-4">
                {t('noHearingsScheduled') || 'No hearings scheduled yet.'}
              </p>
            ) : (
              <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--app-border)]">
                {caseData.Hearings?.map((h) => (
                  <div key={h.hearing_id} className="relative pl-8">
                    <div
                      className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white ${
                        h.status === 'Scheduled'
                          ? 'bg-blue-500 ring-2 ring-blue-100'
                          : 'bg-emerald-500'
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-black">
                        {new Date(h.hearing_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs app-muted font-bold">{h.hearing_time}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            h.status === 'Scheduled'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {translateHearingStatus(h.status)}
                        </span>
                      </div>
                      {h.notes && (
                        <p className="mt-2 text-xs p-2 bg-[var(--app-panel-soft)] rounded-lg italic">
                          {h.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};