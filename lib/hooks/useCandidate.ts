import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCandidates,
  registerCandidate,
  RegisterCandidateData,
} from "@/lib/api";

// Query Keys
export const candidateKeys = {
  all: ["candidates"] as const,
  lists: () => [...candidateKeys.all, "list"] as const,
  list: () => [...candidateKeys.lists()] as const,
};

// Get All Candidates
export function useCandidates() {
  return useQuery({
    queryKey: candidateKeys.list(),
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

// Register Candidate
export function useRegisterCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterCandidateData) => registerCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.list() });
    },
  });
}

