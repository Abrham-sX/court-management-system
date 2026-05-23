import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDaysIcon, ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';

interface UpcomingHearingCase {
  case_number?: string;
  case_type?: string;
}

interface UpcomingHearing {
  hearing_id: number;
  case_id: number;
  hearing_date: string;
  hearing_time: string;
  status: 'Scheduled' | 'Completed' | 'Postponed' | string;
  notes?: string;
  case?: UpcomingHearingCase;
  Case?: UpcomingHearingCase;
  case_number?: string;
  case_type?: string;
}

const fetchUpcomingHearings = async (): Promise<UpcomingHearing[]> => {
  const { data } = await apiClient.get('/hearings/upcoming');
  return Array.isArray(data) ? data : data?.data || [];
};

const formatDateTime = (hearingDate: string, hearingTime: string) => {
  const date = new Date(`${hearingDate}T${hearingTime}`);
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: hearingDate, timeLabel: hearingTime };
  }

  return {
    dateLabel: date.toLocaleDateString(undefined, { dateStyle: 'medium' }),
    timeLabel: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
};

const getStatusClass = (status: string) => {
  if (status === 'Scheduled' || status === 'Ongoing') {
    return 'app-badge-info';
  }
  if (status === 'Postponed') {
    return 'app-badge-warning';
  }
  if (status === 'Completed') {
    return 'app-badge-success';
  }
  return 'app-badge-neutral';
};

export const UpcomingHearingsWidget = () => {
  const { t } = useLanguage();

  const { data: hearings = [], isLoading } = useQuery({
    queryKey: ['upcomingHearings'],
    queryFn: fetchUpcomingHearings,
  });

  const upcomingHearings = useMemo(() => {
    return [...hearings]
      .filter((hearing) => hearing.status === 'Scheduled' || hearing.status === 'Ongoing')
      .sort((a, b) => {
        const left = new Date(`${a.hearing_date}T${a.hearing_time}`).getTime();
        const right = new Date(`${b.hearing_date}T${b.hearing_time}`).getTime();
        return left - right;
      })
      .slice(0, 8);
  }, [hearings]);

  // Helper to translate hearing status
  const translateHearingStatus = (status: string): string => {
    const key = `hearing_status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  return (
    <div className="app-card overflow-hidden flex h-[480px] flex-col transition-all">
      <div className="flex flex-col gap-4 flex-shrink-0 mb-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="app-heading text-lg font-black flex items-center min-w-0">
            <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl mr-3 shrink-0">
              <CalendarDaysIcon className="h-6 w-6 text-[var(--app-accent)]" />
            </div>
            <span className="truncate">{t('upcomingHearings') || 'Upcoming Hearings'}</span>
          </h2>

          <Link
            to="/hearings/schedule"
            className="text-xs font-black text-[var(--app-accent)] hover:opacity-70 transition-opacity shrink-0"
          >
            {t('scheduleHearing') || 'Schedule'}
          </Link>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">
          <div className="h-2 w-6 rounded-full bg-[var(--app-accent)]"></div>
          <span>{t('scheduledHearingList') || 'Scheduled hearing list'}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex flex-col">
            <div className="sticky top-0 z-10 grid grid-cols-[1.45fr_1fr_1.15fr_auto] gap-4 px-5 py-3 border-b border-[var(--app-border)] bg-[var(--app-panel-muted)]/90 backdrop-blur-sm">
              <div className="h-3 w-24 bg-[var(--app-panel-muted)] rounded-full"></div>
              <div className="h-3 w-16 bg-[var(--app-panel-muted)] rounded-full"></div>
              <div className="h-3 w-20 bg-[var(--app-panel-muted)] rounded-full"></div>
              <div className="h-3 w-14 bg-[var(--app-panel-muted)] rounded-full justify-self-end"></div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 pb-1">
              <div className="divide-y divide-[var(--app-border)]">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.45fr_1fr_1.15fr_auto] gap-4 items-center px-5 py-4 animate-pulse hover:bg-[var(--app-panel-muted)]/40"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="h-3 w-28 bg-[var(--app-panel-muted)] rounded-full"></div>
                      <div className="h-4 w-20 bg-[var(--app-panel-muted)] rounded-full"></div>
                    </div>
                    <div className="h-3 w-24 bg-[var(--app-panel-muted)] rounded-full"></div>
                    <div className="space-y-2 min-w-0">
                      <div className="h-3 w-24 bg-[var(--app-panel-muted)] rounded-full"></div>
                      <div className="h-4 w-16 bg-[var(--app-panel-muted)] rounded-full"></div>
                    </div>
                    <div className="h-8 w-24 bg-[var(--app-panel-muted)] rounded-full justify-self-end"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : upcomingHearings.length > 0 ? (
          <div className="h-full flex flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-panel-soft)]">
            <div className="sticky top-0 z-10 grid grid-cols-[1.45fr_1fr_1.15fr_auto] gap-4 px-5 py-3 border-b border-[var(--app-border)] bg-[var(--app-panel-muted)]/90 backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                {t('caseNumber') || 'Case'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                {t('caseType') || 'Type'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                {t('nextHearing') || 'Hearing'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] text-right">
                {t('status') || 'Status'}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-1">
              <div className="divide-y divide-[var(--app-border)]">
                {upcomingHearings.map((hearing) => {
                  const hearingCase = hearing.case || hearing.Case || {};
                  const caseNumber =
                    hearing.case_number ||
                    hearingCase.case_number ||
                    `${t('caseLabel') || 'Case'} #${hearing.case_id}`;
                  const caseType =
                    hearing.case_type || hearingCase.case_type || (t('case') || 'Case');
                  const { dateLabel, timeLabel } = formatDateTime(
                    hearing.hearing_date,
                    hearing.hearing_time
                  );
                  const translatedStatus = translateHearingStatus(hearing.status);
                  const statusClass = getStatusClass(hearing.status);

                  return (
                    <Link
                      key={hearing.hearing_id}
                      to={`/cases/${hearing.case_id}`}
                      className="group grid grid-cols-[1.45fr_1fr_1.15fr_auto] gap-4 items-center px-5 py-4 hover:bg-[var(--app-panel-muted)] transition-colors"
                    >
                      <div className="min-w-0">
                        <h3 className="app-heading font-black text-sm leading-tight truncate group-hover:text-[var(--app-accent)] transition-colors">
                          {caseNumber}
                        </h3>
                        <p className="app-muted text-[11px] font-medium mt-1 truncate">
                          #{hearing.case_id}
                        </p>
                      </div>

                      <p className="app-muted text-xs leading-relaxed truncate">{caseType}</p>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)] truncate">
                          <ClockIcon className="h-3.5 w-3.5 text-[var(--app-accent)] shrink-0" />
                          <span className="truncate">{dateLabel}</span>
                        </div>
                        <p className="text-xs font-black text-[var(--app-text)] mt-1 truncate">
                          {timeLabel}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <span className={`app-badge ${statusClass}`}>{translatedStatus}</span>
                        <span className="inline-flex items-center justify-center text-[var(--app-accent)] group-hover:translate-x-0.5 transition-transform">
                          <ArrowRightIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[var(--app-border)] rounded-3xl">
            <CalendarDaysIcon className="h-8 w-8 text-[var(--app-muted)] opacity-20 mb-2" />
            <p className="text-xs font-medium text-[var(--app-muted)]">
              {t('noHearingsToday') || 'No upcoming hearings found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};