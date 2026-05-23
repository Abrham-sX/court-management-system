import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';
import { MagnifyingGlassIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CaseData {
  case_id: number;
  case_number: string;
  case_type: string;
  status: string;
  plaintiff_name: string;
  defendant_name: string;
}

interface JudgmentData {
  judgment_text: string;
}

export const WriteJudgment = () => {
  const { t } = useLanguage();
  const { caseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchNumber, setSearchNumber] = useState('');
  const [syncedCaseNumber, setSyncedCaseNumber] = useState('');

  const { data: caseData, isLoading: isSyncing, isError: syncError } = useQuery({
    queryKey: ['caseForJudgment', syncedCaseNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/cases/number/${syncedCaseNumber}`);
      return data as CaseData;
    },
    enabled: !!syncedCaseNumber,
    retry: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<JudgmentData>();

  const mutation = useMutation({
    mutationFn: async (data: JudgmentData) => {
      if (!caseData && !caseId) throw new Error('No case synced');
      const targetId = caseData ? caseData.case_id : caseId;
      return apiClient.post(`/judgments/${targetId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['recentCases'] });
      queryClient.invalidateQueries({ queryKey: ['judgeCases'] });
      queryClient.invalidateQueries({ queryKey: ['lawyerCases'] });
      queryClient.invalidateQueries({ queryKey: ['caseForJudgment'] });
      alert(t('judgmentSaved') || 'Judgment saved successfully');
      navigate('/judge/cases');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      alert(err.response?.data?.message || t('failed') || 'Failed to save judgment');
    },
  });

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNumber.trim()) {
      setSyncedCaseNumber(searchNumber.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-[var(--app-accent-soft)] rounded-2xl text-[var(--app-accent)]">
          <DocumentTextIcon className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight text-[var(--app-text)]">
          {t('writeJudgment') || 'Write Judgment'}
        </h1>
      </div>

      {!caseId && (
        <div className="app-card border-2 border-[var(--app-accent-soft)] p-8">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--app-muted)] block mb-3">
            {t('syncCaseToSchedule') || 'Sync Case By Number'}
          </label>
          <form onSubmit={handleSync} className="flex gap-3">
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder={t('enterCaseNumber') || 'Enter Case Number (e.g. CAS-2026-001)'}
              className="app-input flex-1 py-4 text-lg font-bold"
            />
            <button
              type="submit"
              disabled={!searchNumber.trim()}
              className="app-btn-primary px-8 disabled:opacity-50"
            >
              <MagnifyingGlassIcon className="h-6 w-6 mr-2 inline" />
              {t('sync') || 'Sync'}
            </button>
          </form>

          {isSyncing && (
            <p className="mt-4 text-sm text-[var(--app-muted)] font-bold animate-pulse">
              {t('syncing') || 'Syncing case data...'}
            </p>
          )}
          {syncError && (
            <p className="mt-4 text-sm text-rose-500 font-bold">
              {t('caseNotFound') || 'Case not found. Please verify the case number.'}
            </p>
          )}
        </div>
      )}

      {(caseData || caseId) && (
        <div className="app-card animate-fade-in p-8 border-[var(--app-border)] space-y-8 shadow-2xl">
          {caseData && (
            <>
              <div className="flex items-center gap-3 pb-6 border-b border-[var(--app-border)]">
                <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                <div>
                  <h3 className="text-xl font-black">{caseData.case_number}</h3>
                  <p className="text-sm font-bold text-[var(--app-muted)] uppercase tracking-widest">
                    {caseData.case_type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-[var(--app-border)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-1">
                    {t('plaintiff') || 'Plaintiff'}
                  </p>
                  <p className="font-bold">{caseData.plaintiff_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-1">
                    {t('defendant') || 'Defendant'}
                  </p>
                  <p className="font-bold">{caseData.defendant_name}</p>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] ml-1">
                {t('judgmentDetails') || 'Official Judgment Text'}
              </label>
              <textarea
                {...register('judgment_text', { required: true })}
                className="app-textarea min-h-[300px] py-4 leading-relaxed text-lg"
                placeholder={t('enterJudgmentDetails') || 'Write the final verdict and judgment details here...'}
              />
              {errors.judgment_text && (
                <p className="text-rose-500 text-xs font-bold mt-1">
                  {t('judgmentRequired') || 'Judgment text is required'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="app-btn-primary w-full py-4 text-lg shadow-xl"
            >
              {mutation.isPending
                ? t('saving') || 'Saving...'
                : t('saveJudgment') || 'Save Official Judgment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};