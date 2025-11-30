import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInterviewPanel,
  getAllInterviewPanels,
  getInterviewPanel,
  updateInterviewPanel,
  deleteInterviewPanel,
  getAllCandidates,
} from "@/lib/api";
import type { CreatePanelData, UpdatePanelData } from "@/types/panel";

// Query Keys
export const panelKeys = {
  all: ["panels"] as const,
  lists: () => [...panelKeys.all, "list"] as const,
  list: () => [...panelKeys.lists()] as const,
  details: () => [...panelKeys.all, "detail"] as const,
  detail: (uuid: string) => [...panelKeys.details(), uuid] as const,
};

// Get All Interview Panels
export function useInterviewPanels() {
  return useQuery({
    queryKey: panelKeys.list(),
    queryFn: async () => {
      const response = await getAllInterviewPanels();
      return response.data.interview_panels;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get Single Interview Panel
export function useInterviewPanel(panelUuid: string | undefined) {
  return useQuery({
    queryKey: panelKeys.detail(panelUuid || ""),
    queryFn: async () => {
      if (!panelUuid) return null;
      const response = await getInterviewPanel(panelUuid);
      return response.data;
    },
    enabled: !!panelUuid,
    staleTime: 2 * 60 * 1000,
  });
}

// Create Interview Panel
export function useCreateInterviewPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePanelData) => createInterviewPanel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.list() });
    },
  });
}

// Update Interview Panel
export function useUpdateInterviewPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ panelUuid, data }: { panelUuid: string; data: UpdatePanelData }) =>
      updateInterviewPanel(panelUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: panelKeys.list() });
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(variables.panelUuid) });
    },
  });
}

// Delete Interview Panel
export function useDeleteInterviewPanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (panelUuid: string) => deleteInterviewPanel(panelUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.list() });
    },
  });
}

// Get All Candidates
export function useCandidates() {
  return useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const response = await getAllCandidates();
      return response.data.map((candidate) => ({
        ...candidate,
        name: candidate.name || `${candidate.first_name} ${candidate.last_name}`.trim(),
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

