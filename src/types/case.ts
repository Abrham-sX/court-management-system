export type CaseStatus = 'Registered' | 'Ongoing' | 'Closed' | 'Adjourned';

export interface Case {
  case_id: number;
  case_type: string;
  filing_date: string;
  status: CaseStatus;
  assigned_judge_id: number;
  plaintiff_name?: string;
  defendant_name?: string;
  description?: string;
}

export interface HearingSummary {
  hearing_id: number;
  hearing_date: string;
  status: string;
}

export interface DocumentSummary {
  document_id: number;
  file_name: string;
  file_type: string;
}

export interface CaseDetail extends Case {
  judge_name: string;
  hearings: HearingSummary[];
  documents: DocumentSummary[];
}