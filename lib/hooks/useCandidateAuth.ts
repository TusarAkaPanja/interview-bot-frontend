import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { candidateLogin, CandidateLoginCredentials } from "@/lib/api";

export function useCandidateLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: CandidateLoginCredentials) => {
      const response = await candidateLogin(credentials);
      return { response, credentials };
    },
    onSuccess: ({ response, credentials }) => {
      // API only validates token and credentials, returns success message
      // Store the panel token in sessionStorage for the interview
      if (typeof window !== "undefined") {
        sessionStorage.setItem("interview_panel_token", credentials.token);
        sessionStorage.setItem("candidate_username", credentials.username);
      }
      
      // No JWT tokens are returned, so we don't update auth store
      // The panel token is used for WebSocket connection
    },
    onError: (error: Error) => {
      console.error("Candidate login error:", error);
      throw error;
    },
  });
}

