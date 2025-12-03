export interface QuestionDistribution {
  uuid: string;
  category: string;
  topic: string;
  subtopic: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface PanelCandidate {
  uuid: string;
  candidate_uuid: string;
  candidate_name: string;
  candidate_email: string;
  token: string;
  token_expires_at: string;
  score: number;
  status?: string;
  session_uuid?: string;
  started_at?: string;
  completed_at?: string;
  cumulative_score?: number;
  has_report?: boolean;
}

export interface InterviewPanel {
  uuid: string;
  name: string;
  description?: string;
  total_number_of_questions: number;
  start_datetime: string;
  end_datetime: string;
  is_active: boolean;
  organization: string;
  created_at: string;
  updated_at: string;
  question_distributions: QuestionDistribution[];
  candidates: PanelCandidate[];
}

export interface CreatePanelData {
  name: string;
  description?: string;
  total_number_of_questions: number;
  start_datetime: string;
  end_datetime: string;
  category_uuid: string;
  question_distributions: QuestionDistributionInput[];
  candidate_uuids?: string[];
}

export interface QuestionDistributionInput {
  topic_uuid: string;
  subtopic_uuid: string;
  easy: number;
  medium: number;
  hard: number;
}

export interface UpdatePanelData {
  name?: string;
  description?: string;
  start_datetime?: string;
  end_datetime?: string;
}

export interface PanelsResponse {
  interview_panels: InterviewPanel[];
}

export interface Candidate {
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string; // Computed: first_name + last_name
  organization?: string;
  created_at?: string;
  updated_at?: string;
}

