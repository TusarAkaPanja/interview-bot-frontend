import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, refreshToken, logout as apiLogout, LoginResponse, RegisterResponse } from "@/lib/api";
import { LoginCredentials, RegisterData, User } from "@/types/auth";
import { setToken, getToken, removeToken, setRefreshToken, getRefreshToken, removeRefreshToken, decodeToken } from "@/lib/jwt";
import { useAuthStore } from "@/store/authStore";

// Helper to convert API user to app User type
function convertApiUserToUser(apiUser: RegisterResponse["data"]): User {
  return {
    id: apiUser.uuid,
    email: apiUser.email,
    first_name: apiUser.first_name || "",
    last_name: apiUser.last_name || "",
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.email,
    role: apiUser.role.name as User["role"],
  };
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await login(credentials);
      return { response, credentials }; // Return both response and credentials
    },
    onSuccess: ({ response, credentials }) => {
      // Store tokens
      setToken(response.data.access);
      setRefreshToken(response.data.refresh);
      
      // Decode token to get user info
      const decoded = decodeToken(response.data.access);
      
      // Handle JWT payload structure
      if (decoded) {
        const user_uuid = (decoded as any).user_uuid || "";
        const email = decoded.email || credentials.email;
        const first_name = decoded.first_name || "";
        const last_name = decoded.last_name || "";
        const role = decoded.role || "user";
        
        if (user_uuid && email) {
          const user: User = {
            id: user_uuid,
            email: email,
            first_name: first_name,
            last_name: last_name,
            name: `${first_name} ${last_name}`.trim() || email.split("@")[0] || "User",
            role: role as User["role"],
          };
          
          // Update auth store
          useAuthStore.setState({
            user,
            token: response.data.access,
            isAuthenticated: true,
          });
        } else {
          console.error("Missing user_uuid or email. Token payload:", decoded);
          // Still set token but without user info
          useAuthStore.setState({
            user: null,
            token: response.data.access,
            isAuthenticated: false,
          });
        }
      } else {
        console.error("Failed to decode token");
        // Still set token but without user info
        useAuthStore.setState({
          user: null,
          token: response.data.access,
          isAuthenticated: false,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      throw error;
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await register(data);
      return response;
    },
    onSuccess: async (data: RegisterResponse) => {
      // After registration, we need to login to get tokens
      // The API doesn't return tokens on registration, so we'll need to handle this
      const user = convertApiUserToUser(data.data);
      
      // Update auth store with user (without token for now)
      // In a real app, you might want to redirect to login or auto-login
      useAuthStore.setState({
        user,
        token: null,
        isAuthenticated: false,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      throw error;
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (token) {
        try {
          await apiLogout(token);
        } catch (error) {
          console.warn("Logout API call failed:", error);
        }
      }
    },
    onSuccess: () => {
      // Clear tokens
      removeToken();
      removeRefreshToken();
      
      // Clear auth store
      logoutStore();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to login
      router.push("/login");
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (!refresh) {
        throw new Error("No refresh token available");
      }
      const response = await refreshToken(refresh);
      return response;
    },
    onSuccess: (data) => {
      setToken(data.access);
      useAuthStore.setState({ token: data.access });
    },
    onError: () => {
      // If refresh fails, logout
      removeToken();
      removeRefreshToken();
      useAuthStore.getState().logout();
    },
  });
}

