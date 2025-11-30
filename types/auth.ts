export type UserRole = "admin" | "superadmin" | "user" | "interviewer" | "hr";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string; // Computed: first_name + last_name
  role: UserRole;
}

export interface JWTPayload {
  user_uuid?: string;
  userId?: string; // Legacy support
  email?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti?: string;
  token_type?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

