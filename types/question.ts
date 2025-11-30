export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Category {
  id: number;
  uuid: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  uuid: string;
  name: string;
  description: string;
  category: number;
  created_at: string;
  updated_at: string;
}

export interface Subtopic {
  id: number;
  uuid: string;
  name: string;
  description: string;
  topic: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  uuid: string;
  name: string;
  question: string;
  description?: string;
  difficulty_level: DifficultyLevel;
  category: number;
  topic: number;
  subtopic: number | null;
  expected_answer?: string;
  expected_time_in_seconds?: number;
  ideal_answer_summary?: string;
  red_flags?: string[];
  expected_keywords?: string[];
  expected_keywords_coverage?: number;
  score_weight_technical?: number;
  score_weight_domain_knowledge?: number;
  score_weight_communication?: number;
  score_weight_problem_solving?: number;
  score_weight_creativity?: number;
  score_weight_attention_to_detail?: number;
  score_weight_time_management?: number;
  score_weight_stress_management?: number;
  score_weight_adaptability?: number;
  score_weight_confidence?: number;
  created_at: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginatedQuestionResponse {
  total_count: number;
  page: number;
  page_size: number;
  next_page: string | null;
  previous_page?: string | null;
  results: Question[];
}

export interface QuestionFilters {
  category_uuid?: string;
  topic_uuid?: string;
  subtopic_uuid?: string;
  difficulty_level?: DifficultyLevel;
  search?: string;
  page?: number;
  page_size?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export interface CreateTopicData {
  name: string;
  description: string;
  category_uuid: string;
}

export interface CreateSubtopicData {
  name: string;
  description: string;
  topic_uuid: string;
}

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface QuestionConfiguration {
  id: number;
  uuid: string;
  name: string;
  organization: number;
  category: number;
  topic: number;
  subtopic: number | null;
  status: "pending" | "in_progress" | "completed" | "failed";
  number_of_questions_to_generate: number;
  number_of_questions_failed: number;
  number_of_questions_completed: number;
  number_of_questions_pending: number;
  number_of_questions_in_progress: number;
  time_taken_in_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateQuestionsData {
  category_uuid: string;
  topic_uuid: string;
  subtopic_uuid?: string;
  number_of_questions: number;
  difficulty_partitions: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface PaginatedConfigurationResponse {
  total_count: number;
  page: number;
  page_size: number;
  next_page: string | null;
  previous_page?: string | null;
  results: QuestionConfiguration[];
}

