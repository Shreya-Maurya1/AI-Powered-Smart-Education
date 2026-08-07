import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getInitials(name: string): string {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'UM';
}

export function calculateGrade(score: number, total: number): string {
  if (!total || total === 0) return 'N/A';
  const pct = (score / total) * 100;
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

export function getScoreColor(score: number, total: number): string {
  if (!total || total === 0) return 'text-gray-600';
  const pct = (score / total) * 100;
  if (pct >= 70) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-600';
}
