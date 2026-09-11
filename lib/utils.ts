import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind classes cleanly without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Indian Rupee (INR) currency format
 * e.g., 1245000 -> ₹12,45,000.00
 */
export function formatINR(
  amount: number | null | undefined,
  options?: {
    includeSymbol?: boolean;
    compact?: boolean;
    decimals?: number;
    showSign?: boolean;
  }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }

  const {
    includeSymbol = true,
    compact = false,
    decimals = 2,
    showSign = false,
  } = options || {};

  const sign = showSign && amount > 0 ? '+' : '';
  const prefix = includeSymbol ? '₹' : '';

  if (compact) {
    const absVal = Math.abs(amount);
    if (absVal >= 10000000) {
      // Crores
      return `${sign}${prefix}${(amount / 10000000).toFixed(decimals)} Cr`;
    } else if (absVal >= 100000) {
      // Lakhs
      return `${sign}${prefix}${(amount / 100000).toFixed(decimals)} L`;
    } else if (absVal >= 1000) {
      // Thousands
      return `${sign}${prefix}${(amount / 1000).toFixed(decimals)} k`;
    }
  }

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount));

  const minusSign = amount < 0 ? '-' : '';

  return `${sign}${minusSign}${prefix}${formattedNumber}`;
}

/**
 * Formats a percentage value
 * e.g., 5.26 -> +5.26% or -3.10%
 */
export function formatPercentage(
  value: number | null | undefined,
  options?: {
    decimals?: number;
    showSign?: boolean;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const { decimals = 2, showSign = true } = options || {};
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Formats numbers such as P/E ratio, quantity, etc.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a timestamp into human-readable local time
 */
export function formatTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Returns a human-friendly relative time string e.g. "8s ago"
 */
export function getRelativeTime(timestamp: number | Date): string {
  const now = Date.now();
  const time = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const diffSeconds = Math.max(0, Math.floor((now - time) / 1000));

  if (diffSeconds < 5) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}
