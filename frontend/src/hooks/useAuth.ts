'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role, RegisterData } from '@/types';
import { getUser, getToken, saveToken, saveUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { authApi } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getUser();
    const token = getToken();
    if (currentUser && token) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      saveToken(res.token);
      saveUser(res.user);
      setUser(res.user);
      if (res.user.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(data);
      saveToken(res.token);
      saveUser(res.user);
      setUser(res.user);
      if (res.user.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/login');
  }, [router]);

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated: isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout,
  };
}
