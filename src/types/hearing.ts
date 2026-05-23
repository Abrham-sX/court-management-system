export interface Hearing {
  hearing_id: number;
  case_id: number;
  hearing_date: string;
  hearing_time: string;
  status: 'Scheduled' | 'Completed' | 'Postponed';
  notes?: string;
}