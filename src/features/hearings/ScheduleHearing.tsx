import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';
import { MagnifyingGlassIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CaseData {
  case_id: number;
  case_number: string;
  case_type: string;
  status: string;
  plaintiff_name: string;
  defendant_name: string;
}

export const ScheduleHearing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchNumber, setSearchNumber] = useState('');
  const [syncedCaseNumber, setSyncedCaseNumber] = useState('');

  const hearingSchema = z.object({
    hearing_date: z.string().min(1, t('dateRequired') || 'Date is required'),
    hearing_time: z.string().min(1, t('timeRequired') || 'Time is required'),
    notes: z.string().optional(),
  });

  type HearingFormData = z.infer<typeof hearingSchema>;

  const { data: caseData, isLoading: isSyncing, isError: syncError } = useQuery({
    queryKey: ['caseForHearing', syncedCaseNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/cases/number/${syncedCaseNumber}`);
      return data as CaseData;
    },
    enabled: !!syncedCaseNumber,
    retry: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<HearingFormData>({
    resolver: zodResolver(hearingSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: HearingFormData) => {
      if (!caseData) throw new Error('No case synced');
      // Check for existing hearings at same date and time
      const existingRes = await apiClient.get(`/hearings?date=${data.hearing_date}`);
      const existing = existingRes.data as Array<{ hearing_time: string; case_id: number }>;
      // Ensure no other hearing (any case) has the same date and time
      if (existing.some(h => h.hearing_time === data.hearing_time)) {
        throw new Error(t('hearingConflict') || 'A hearing is already scheduled at this time. Choose a different time.');
      }
      // Ensure the same case does not already have a hearing at this date and time
      if (existing.some(h => h.hearing_time === data.hearing_time && h.case_id === caseData.case_id)) {
        throw new Error(t('caseHearingConflict') || 'This case already has a hearing scheduled at this time.');
      }
      const response = await apiClient.post('/hearings', {
        ...data,
        case_id: caseData.case_id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['recentCases'] });
      queryClient.invalidateQueries({ queryKey: ['judgeCases'] });
      queryClient.invalidateQueries({ queryKey: ['lawyerCases'] });
      queryClient.invalidateQueries({ queryKey: ['caseForHearing'] });
      alert(t('hearingScheduledSuccess') || 'Hearing scheduled successfully');
      navigate('/cases/all');
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      alert(error.response?.data?.message || t('failed') || 'Failed to schedule hearing'),
  });

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNumber.trim()) {
      setSyncedCaseNumber(searchNumber.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-[var(--app-accent-soft)] rounded-2xl text-[var(--app-accent)]">
          <CalendarDaysIcon className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-black tracking-tight text-[var(--app-text)]">
          {t('scheduleHearing') || 'Schedule Hearing'}
        </h1>
      </div>

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

      {caseData && (
        <div className="app-card animate-fade-in p-8 border-[var(--app-border)] space-y-8">
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

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] ml-1">
                  {t('date') || 'Date'}
                </label>
                <input type="date" {...register('hearing_date')} className="app-input py-3" />
                {errors.hearing_date && <p className="app-error">{errors.hearing_date.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] ml-1">
                  {t('time') || 'Time'}
                </label>
                <input type="time" {...register('hearing_time')} className="app-input py-3" />
                {errors.hearing_time && <p className="app-error">{errors.hearing_time.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] ml-1">
                {t('notesOptional') || 'Notes (Optional)'}
              </label>
              <textarea
                {...register('notes')}
                className="app-textarea min-h-[100px] py-3"
                placeholder={t('addHearingNotes') || 'Add any specific instructions for this hearing...'}
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="app-btn-primary w-full py-4 text-base shadow-xl"
            >
              {mutation.isPending
                ? t('scheduling') || 'Scheduling...'
                : t('confirmSchedule') || 'Confirm & Schedule Hearing'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};