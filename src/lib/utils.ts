import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formate un nombre de secondes en "HH:MM:SS" ou "MM:SS". */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function formatEstimatedEnd(secondsFromNow: number): string {
  const end = new Date(Date.now() + secondsFromNow * 1000);
  return end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
