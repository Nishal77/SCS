import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse a date string or Date object
 * @param {string|Date} dateInput - The date to parse
 * @param {Date} fallback - Fallback date if parsing fails (defaults to current time)
 * @returns {Date} - Parsed date or fallback
 */
export const safeParseDate = (dateInput, fallback = new Date()) => {
  if (!dateInput) {
    return fallback;
  }
  
  // If it's already a Date object, validate it
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? fallback : dateInput;
  }
  
  // If it's a string, try to parse it
  if (typeof dateInput === 'string') {
    try {
      const parsedDate = new Date(dateInput);
      return isNaN(parsedDate.getTime()) ? fallback : parsedDate;
    } catch (error) {
      console.warn('Error parsing date string:', dateInput, error);
      return fallback;
    }
  }
  
  // For any other type, return fallback
  console.warn('Unsupported date input type:', typeof dateInput, dateInput);
  return fallback;
};

/**
 * Format a date to a readable time string
 * @param {string|Date} dateInput - The date to format
 * @param {string} locale - Locale for formatting (defaults to 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string
 */
export const formatTime = (dateInput, locale = 'en-US', options = {}) => {
  const date = safeParseDate(dateInput);
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return date.toLocaleTimeString(locale, defaultOptions);
};

/**
 * Calculate a future time by adding minutes
 * @param {string|Date} baseDate - Base date to add minutes to
 * @param {number} minutes - Minutes to add
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted future time string
 */
export const calculateFutureTime = (baseDate, minutes, locale = 'en-US') => {
  const date = safeParseDate(baseDate);
  const futureDate = new Date(date.getTime() + minutes * 60000);
  return formatTime(futureDate, locale);
};
