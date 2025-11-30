import { create } from "zustand";
import { User } from "@/types/auth";
import { getToken, removeToken, removeRefreshToken, decodeToken, isTokenExpired } from "@/lib/jwt";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      if (decoded) {
        // Use user_uuid from token (actual field name in JWT)
        const user_uuid = (decoded as any).user_uuid || decoded.userId || "";
        const email = decoded.email || "";
        const first_name = decoded.first_name || "";
        const last_name = decoded.last_name || "";
        
        if (user_uuid) {
          set({
            token,
            user: {
              id: user_uuid,
              email: email || "user@example.com",
              first_name: first_name,
              last_name: last_name,
              name: `${first_name} ${last_name}`.trim() || (email ? email.split("@")[0] : "User"),
              role: decoded.role,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    }
    set({ isLoading: false });
  },

  logout: () => {
    removeToken();
    removeRefreshToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

