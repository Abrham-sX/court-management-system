import apiClient from '../../lib/axios';
import type { Case, CaseDetail } from '../../types';

export const caseService = {
  registerCase: async (caseData: {
    case_type: string;
    plaintiff_name: string;
    defendant_name: string;
    description?: string;
  }) => {
    const response = await apiClient.post<Case>('/cases', caseData);
    return response.data;
  },

  getAllCases: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get<{ cases: Case[]; total: number }>('/cases', { params });
    return response.data;
  },

  getCaseById: async (caseId: number) => {
    const response = await apiClient.get<CaseDetail>(`/cases/${caseId}`);
    return response.data;
  },

  updateCase: async (caseId: number, updates: Partial<Case>) => {
    const response = await apiClient.put<Case>(`/cases/${caseId}`, updates);
    return response.data;
  },

  deleteCase: async (caseId: number) => {
    const response = await apiClient.delete(`/cases/${caseId}`);
    return response.data;
  },
};