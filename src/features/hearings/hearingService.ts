import apiClient from '../../lib/axios';
import type { Hearing } from '../../types';

export const hearingService = {
  scheduleHearing: async (hearingData: {
    case_id: number;
    hearing_date: string;
    hearing_time: string;
    notes?: string;
  }) => {
    const response = await apiClient.post<Hearing>('/hearings', hearingData);
    return response.data;
  },

  getHearingsByCase: async (caseId: number) => {
    const response = await apiClient.get<Hearing[]>(`/hearings/case/${caseId}`);
    return response.data;
  },

  updateHearingStatus: async (hearingId: number, status: string) => {
    const response = await apiClient.patch(`/hearings/${hearingId}/status`, { status });
    return response.data;
  },
};