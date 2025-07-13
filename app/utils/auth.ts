// utils/auth.ts
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';

interface UserData {
  id: string;
  email: string;
  role: string;
  exp: number;
}
const LAST_VISITED_URL_COOKIE = 'last_visited_url';

// Store the last visited URL
export const storeLastVisitedUrl = (url: string): void => {
  Cookies.set(LAST_VISITED_URL_COOKIE, url, COOKIE_OPTIONS);
};

// Retrieve the last visited URL
export const getLastVisitedUrl = (): string | null => {
  return Cookies.get(LAST_VISITED_URL_COOKIE) || null;
};
// Cookie configuration
const AUTH_COOKIE = 'auth_token';
const USER_COOKIE = 'user_data';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

export const setToken = (token: string): void => {
  Cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS);
};

export const getToken = (): string | undefined => {
  return Cookies.get(AUTH_COOKIE);
};

export const removeToken = (): void => {
  Cookies.remove(AUTH_COOKIE);
  Cookies.remove(USER_COOKIE);
};

export const setUser = (user: Partial<UserData>): void => {
  Cookies.set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTIONS);
};

export const getUser = (): UserData | null => {
  const userData = Cookies.get(USER_COOKIE);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as UserData;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<UserData>(token);
    // Check if token is expired
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const hasRequiredRole = (allowedRoles: string[] = []): boolean => {
  // If no roles specified, any authenticated user can access
  if (allowedRoles.length === 0) return true;
  
  const user = getUser();
  return user !== null && allowedRoles.includes(user.role);
};

// Use this in server components to redirect if not authenticated
export const requireAuth = (allowedRoles: string[] = []): void => {
  if (!isAuthenticated()) {
    redirect('/login');
  }
  
  if (allowedRoles.length > 0 && !hasRequiredRole(allowedRoles)) {
    redirect('/unauthorized');
  }
};