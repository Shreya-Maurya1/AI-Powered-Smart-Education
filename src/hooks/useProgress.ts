'use client';

import { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/types';
import { progressApi } from '@/lib/api';

export function useProgress(studentId?: string) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await progressApi.student(studentId);
      setProgress(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
  };
}
