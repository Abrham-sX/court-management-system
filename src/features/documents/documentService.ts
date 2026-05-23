import apiClient from '../../lib/axios';
import type { Document } from '../../types';

export const documentService = {
  uploadDocument: async (caseId: number, file: File, fileType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId.toString());
    formData.append('file_type', fileType);
    
    const response = await apiClient.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocumentsByCase: async (caseId: number) => {
    const response = await apiClient.get<Document[]>(`/documents/case/${caseId}`);
    return response.data;
  },

  downloadDocument: async (documentId: number) => {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};