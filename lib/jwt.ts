import { JWTPayload, UserRole } from "@/types/auth";
import Cookies from "js-cookie";

const TOKEN_KEY = "vecna_token";
const REFRESH_TOKEN_KEY = "vecna_refresh_token";

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires: 30, // 30 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function removeRefreshToken(): void {
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

export function hasRole(token: string | undefined, requiredRole: UserRole): boolean {
  if (!token) return false;
  if (isTokenExpired(token)) return false;
  const decoded = decodeToken(token);
  if (!decoded) return false;

  const roleHierarchy: Record<UserRole, number> = {
    superadmin: 4,
    admin: 3,
    interviewer: 2,
    user: 1,
  };

  return roleHierarchy[decoded.role] >= roleHierarchy[requiredRole];
}

export function canAccessRoute(token: string | undefined, requiredRole?: UserRole): boolean {
  if (!token) return false;
  if (isTokenExpired(token)) return false;
  if (!requiredRole) return true;
  return hasRole(token, requiredRole);
}

