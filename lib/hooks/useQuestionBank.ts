import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  getTopicsByCategory,
  createTopic,
  getSubtopicsByTopic,
  createSubtopic,
  getAllQuestions,
  updateQuestion,
  generateQuestions,
  getQuestionConfigurationStatus,
  getAllQuestionConfigurations,
} from "@/lib/api";
import type {
  QuestionFilters,
  CreateCategoryData,
  CreateTopicData,
  CreateSubtopicData,
  GenerateQuestionsData,
} from "@/types/question";

// Query Keys
export const questionBankKeys = {
  all: ["questionBank"] as const,
  categories: () => [...questionBankKeys.all, "categories"] as const,
  topics: (categoryUuid?: string) => [...questionBankKeys.all, "topics", categoryUuid] as const,
  subtopics: (topicUuid?: string) => [...questionBankKeys.all, "subtopics", topicUuid] as const,
  questions: (filters?: QuestionFilters) => [...questionBankKeys.all, "questions", filters] as const,
  configurations: (filters?: { page?: number; page_size?: number }) => [...questionBankKeys.all, "configurations", filters] as const,
  configurationStatus: (uuid?: string) => [...questionBankKeys.all, "configurationStatus", uuid] as const,
};

// Categories
export function useCategories() {
  return useQuery({
    queryKey: questionBankKeys.categories(),
    queryFn: async () => {
      const response = await getCategories();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryData) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.categories() });
    },
  });
}

// Topics
export function useTopicsByCategory(categoryUuid: string | undefined) {
  return useQuery({
    queryKey: questionBankKeys.topics(categoryUuid),
    queryFn: async () => {
      if (!categoryUuid) return [];
      const response = await getTopicsByCategory(categoryUuid);
      return response.data;
    },
    enabled: !!categoryUuid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTopicData) => createTopic(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.topics(variables.category_uuid) });
      queryClient.invalidateQueries({ queryKey: questionBankKeys.questions() });
    },
  });
}

// Subtopics
export function useSubtopicsByTopic(topicUuid: string | undefined) {
  return useQuery({
    queryKey: questionBankKeys.subtopics(topicUuid),
    queryFn: async () => {
      if (!topicUuid) return [];
      const response = await getSubtopicsByTopic(topicUuid);
      return response.data;
    },
    enabled: !!topicUuid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSubtopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubtopicData) => createSubtopic(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.subtopics(variables.topic_uuid) });
      queryClient.invalidateQueries({ queryKey: questionBankKeys.questions() });
    },
  });
}

// Questions
export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: questionBankKeys.questions(filters),
    queryFn: () => getAllQuestions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ questionUuid, data }: { questionUuid: string; data: Partial<import("@/types/question").Question> }) =>
      updateQuestion(questionUuid, data),
    onSuccess: () => {
      // Invalidate and refetch all question queries
      queryClient.invalidateQueries({ queryKey: questionBankKeys.questions() });
      queryClient.refetchQueries({ queryKey: questionBankKeys.questions() });
    },
  });
}

// Question Generation
export function useGenerateQuestions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GenerateQuestionsData) => generateQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionBankKeys.configurations() });
    },
  });
}

export function useQuestionConfigurationStatus(configUuid: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: questionBankKeys.configurationStatus(configUuid),
    queryFn: async () => {
      if (!configUuid) return null;
      const response = await getQuestionConfigurationStatus(configUuid);
      return response.data;
    },
    enabled: enabled && !!configUuid,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      // Poll every 2 seconds if status is pending or in_progress
      return data.status === "pending" || data.status === "in_progress" ? 2000 : false;
    },
  });
}

export function useQuestionConfigurations(filters: { page?: number; page_size?: number } = {}) {
  return useQuery({
    queryKey: questionBankKeys.configurations(filters),
    queryFn: () => getAllQuestionConfigurations(filters),
    staleTime: 5 * 1000, // 5 seconds for configurations
    placeholderData: (previousData) => previousData,
  });
}

