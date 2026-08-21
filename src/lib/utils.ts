import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
