export interface Document {
  document_id: number;
  case_id: number;
  file_name: string;
  file_url: string;
  uploaded_by: number;
  upload_date: string;
  file_type: 'Evidence' | 'Judgment' | 'Complaint' | 'Other';
}