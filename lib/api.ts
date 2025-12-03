import { LoginCredentials, RegisterData, User } from "@/types/auth";
import { getToken } from "@/lib/jwt";
import type {
  Category,
  Topic,
  Subtopic,
  Question,
  PaginatedResponse,
  QuestionFilters,
  CreateCategoryData,
  CreateTopicData,
  CreateSubtopicData,
  ApiResponse,
  QuestionConfiguration,
  GenerateQuestionsData,
  PaginatedConfigurationResponse,
} from "@/types/question";
import type {
  InterviewPanel,
  CreatePanelData,
  UpdatePanelData,
  PanelsResponse,
  Candidate,
} from "@/types/panel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LoginResponse {
  message: string;
  status: string;
  data: {
    refresh: string;
    access: string;
  };
}

export interface RegisterResponse {
  message: string;
  status: string;
  data: {
    id: number;
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    role: {
      id: number;
      uuid: string;
      name: string;
    };
    role_uuid: string;
    is_active: boolean;
    created_at: string;
  };
}

export interface ApiError {
  message: string;
  status: string;
  errors?: string | Record<string, any>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    const error: ApiError = data;
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  return data;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse<LoginResponse>(response);
}

export async function register(data: RegisterData): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      first_name: data.name.split(" ")[0] || data.name,
      last_name: data.name.split(" ").slice(1).join(" ") || "",
    }),
  });

  return handleResponse<RegisterResponse>(response);
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  const data = await handleResponse<{
    message: string;
    status: string;
    data: { access: string };
  }>(response);
  
  return { access: data.data.access };
}

export async function logout(accessToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    // Don't throw on logout failure, just log it
    console.warn("Logout request failed");
  }
}

// Question Bank API Functions
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Categories
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const response = await fetch(`${API_URL}/api/questionbank/get-categories/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Category[]>>(response);
}

export async function createCategory(data: CreateCategoryData): Promise<ApiResponse<Category>> {
  const response = await fetch(`${API_URL}/api/questionbank/create-category/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Category>>(response);
}

// Topics
export async function getTopicsByCategory(categoryUuid: string): Promise<ApiResponse<Topic[]>> {
  const response = await fetch(`${API_URL}/api/questionbank/get-topics-by-category/${categoryUuid}/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Topic[]>>(response);
}

export async function createTopic(data: CreateTopicData): Promise<ApiResponse<Topic>> {
  const response = await fetch(`${API_URL}/api/questionbank/create-topic/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Topic>>(response);
}

// Subtopics
export async function getSubtopicsByTopic(topicUuid: string): Promise<ApiResponse<Subtopic[]>> {
  const response = await fetch(`${API_URL}/api/questionbank/get-subtopics-by-topic/${topicUuid}/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Subtopic[]>>(response);
}

export async function createSubtopic(data: CreateSubtopicData): Promise<ApiResponse<Subtopic>> {
  const response = await fetch(`${API_URL}/api/questionbank/create-subtopic/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Subtopic>>(response);
}

// Questions
export async function getAllQuestions(filters: QuestionFilters = {}): Promise<PaginatedResponse<Question>> {
  const params = new URLSearchParams();
  
  // Build query params
  if (filters.category_uuid) params.append("category_uuid", filters.category_uuid);
  if (filters.topic_uuid) params.append("topic_uuid", filters.topic_uuid);
  if (filters.subtopic_uuid) params.append("subtopic_uuid", filters.subtopic_uuid);
  if (filters.difficulty_level) params.append("difficulty_level", filters.difficulty_level);
  if (filters.search) params.append("search", filters.search);
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.order) params.append("order", filters.order);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.page_size) params.append("page_size", filters.page_size.toString());

  const response = await fetch(`${API_URL}/api/questionbank/get-all-questions/?${params.toString()}`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    const error: ApiError = responseData;
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  // Handle new API response structure: { message, status, data: { total_count, page, page_size, next_page, results } }
  if (responseData.data && typeof responseData.data === 'object' && 'total_count' in responseData.data) {
    const data = responseData.data;
    return {
      count: data.total_count || 0,
      next: data.next_page || null,
      previous: data.previous_page || null,
      results: data.results || [],
    };
  }
  
  // Handle legacy array response format
  if (Array.isArray(responseData)) {
    const page = filters.page || 1;
    const pageSize = filters.page_size || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = responseData.slice(startIndex, endIndex);
    const totalCount = responseData.length;
    
    return {
      count: totalCount,
      next: endIndex < totalCount ? "has_next" : null,
      previous: page > 1 ? "has_previous" : null,
      results: paginatedResults,
    };
  }
  
  // Handle legacy paginated format
  if (responseData.count !== undefined) {
    return {
      count: responseData.count || 0,
      next: responseData.next || null,
      previous: responseData.previous || null,
      results: responseData.results || [],
    };
  }
  
  // Fallback
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

// Get single question by UUID
export async function getQuestionByUuid(questionUuid: string): Promise<ApiResponse<Question>> {
  const response = await fetch(`${API_URL}/api/questionbank/get-question/${questionUuid}/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Question>>(response);
}

// Update question
export async function updateQuestion(questionUuid: string, data: Partial<Question>): Promise<ApiResponse<Question>> {
  const response = await fetch(`${API_URL}/api/questionbank/update-question/${questionUuid}/`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Question>>(response);
}

// Question Generation
export async function generateQuestions(data: GenerateQuestionsData): Promise<ApiResponse<QuestionConfiguration>> {
  const response = await fetch(`${API_URL}/api/questionbank/generate-questions/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<QuestionConfiguration>>(response);
}

export async function getQuestionConfigurationStatus(configUuid: string): Promise<ApiResponse<QuestionConfiguration>> {
  const response = await fetch(`${API_URL}/api/questionbank/question-configuration-status/${configUuid}/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<QuestionConfiguration>>(response);
}

export async function getAllQuestionConfigurations(filters: { page?: number; page_size?: number } = {}): Promise<PaginatedConfigurationResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.page_size) params.append("page_size", filters.page_size.toString());

  const response = await fetch(`${API_URL}/api/questionbank/get-all-question-configurations/?${params.toString()}`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    const error: ApiError = responseData;
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  // Handle API response structure: { message, status, data: { total_count, page, page_size, next_page, results } }
  if (responseData.data && typeof responseData.data === 'object' && 'total_count' in responseData.data) {
    const data = responseData.data;
    return {
      total_count: data.total_count || 0,
      page: data.page || 1,
      page_size: data.page_size || 10,
      next_page: data.next_page || null,
      previous_page: data.previous_page || null,
      results: data.results || [],
    };
  }
  
  // Fallback
  return {
    total_count: 0,
    page: 1,
    page_size: 10,
    next_page: null,
    previous_page: null,
    results: [],
  };
}

// Interview Panel API Functions
export async function createInterviewPanel(data: CreatePanelData): Promise<ApiResponse<InterviewPanel>> {
  const response = await fetch(`${API_URL}/api/panel/create/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<InterviewPanel>>(response);
}

export async function getAllInterviewPanels(): Promise<ApiResponse<PanelsResponse>> {
  const response = await fetch(`${API_URL}/api/panel/get/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<PanelsResponse>>(response);
}

export async function getInterviewPanel(panelUuid: string): Promise<ApiResponse<InterviewPanel>> {
  const response = await fetch(`${API_URL}/api/panel/get/${panelUuid}/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<InterviewPanel>>(response);
}

export async function updateInterviewPanel(
  panelUuid: string,
  data: UpdatePanelData
): Promise<ApiResponse<InterviewPanel>> {
  const response = await fetch(`${API_URL}/api/panel/update/${panelUuid}/`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<InterviewPanel>>(response);
}

export async function deleteInterviewPanel(panelUuid: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_URL}/api/panel/delete/${panelUuid}/`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
  return handleResponse<ApiResponse<void>>(response);
}

export async function downloadCandidateReport(sessionUuid: string): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/panel/candidate/report/${sessionUuid}/download/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  return response.blob();
}

// Candidate API Functions
export async function getAllCandidates(): Promise<ApiResponse<Candidate[]>> {
  const response = await fetch(`${API_URL}/api/auth/candidates/`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    const error: ApiError = data;
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  // Handle different response formats
  if (data.data && Array.isArray(data.data)) {
    return { message: data.message || "Success", status: data.status || "success", data: data.data };
  }
  
  // If response is directly an array
  if (Array.isArray(data)) {
    return { message: "Success", status: "success", data };
  }
  
  // Fallback
  return { message: "Success", status: "success", data: [] };
}

export interface RegisterCandidateData {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
}

export interface RegisterCandidateResponse {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export async function registerCandidate(data: RegisterCandidateData): Promise<ApiResponse<RegisterCandidateResponse>> {
  const response = await fetch(`${API_URL}/api/auth/register/candidate/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<RegisterCandidateResponse>>(response);
}

// Organization API Functions
export interface Organization {
  id: number;
  uuid: string;
  name: string;
  address: string;
  email: string;
  created_at: string;
}

export interface CreateOrganizationData {
  name: string;
  address: string;
  email: string;
}

export interface AddHrUserData {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
}

export interface AddHrUserResponse {
  id: number;
  uuid: string;
  email: string;
  role: {
    id: number;
    uuid: string;
    name: string;
  };
  role_uuid: string;
  is_active: boolean;
  created_at: string;
}

export async function createOrganization(data: CreateOrganizationData): Promise<ApiResponse<Organization>> {
  const response = await fetch(`${API_URL}/api/organizations/create/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Organization>>(response);
}

export async function addHrUser(data: AddHrUserData): Promise<ApiResponse<AddHrUserResponse>> {
  const response = await fetch(`${API_URL}/api/organizations/add-hr/`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<AddHrUserResponse>>(response);
}

// Candidate Authentication API Functions
export interface CandidateLoginCredentials {
  username: string;
  password: string;
  token: string; // Panel token from URL
}

export interface CandidateLoginResponse {
  message: string;
  status: string;
  data: null;
}

export async function candidateLogin(
  credentials: CandidateLoginCredentials
): Promise<CandidateLoginResponse> {
  const response = await fetch(`${API_URL}/api/panel/start/${credentials.token}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  return handleResponse<CandidateLoginResponse>(response);
}

