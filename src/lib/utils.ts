import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { VisitorData } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the average number of visitors from historical data
 */
export function calculateAverageVisitors(data: VisitorData[]): number {
  if (data.length === 0) return 0;
  
  const sum = data.reduce((total, day) => total + day.visitor_count, 0);
  return Math.round(sum / data.length);
}
