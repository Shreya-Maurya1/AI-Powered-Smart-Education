import { User, Role } from '@/types';

const TOKEN_KEY = 'am_token';
const USER_KEY = 'am_user';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user: User): void {
  if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function removeUser(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}

export function getRole(): Role | null {
  const user = getUser();
  return user?.role ?? null;
}
