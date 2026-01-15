/**
 * Date Utilities
 * Single source of truth for all date operations in Zenner
 * Uses LOCAL timezone, never UTC
 */

/**
 * Get local date string in YYYY-MM-DD format
 * This is the PRIMARY date format for all journal/session operations
 */
export const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get local timestamp in ISO-like format but preserving local time
 * Format: YYYY-MM-DDTHH:mm:ss
 */
export const getLocalTimestamp = (date: Date = new Date()): string => {
    const dateStr = getLocalDateString(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${dateStr}T${hours}:${minutes}:${seconds}`;
};

/**
 * Parse a YYYY-MM-DD date string into a Date object at midnight local time
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Get today's date at midnight (local time)
 */
export const getToday = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Check if a date string represents today
 */
export const isToday = (dateStr: string): boolean => {
    return dateStr === getLocalDateString();
};

/**
 * Get display-friendly date string
 * e.g., "Wednesday, January 15"
 */
export const getDisplayDate = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Get short display date
 * e.g., "Jan 15"
 */
export const getShortDate = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Get time string from Date
 * e.g., "9:30 AM"
 */
export const getTimeString = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
};

/**
 * Add days to a date string, return new date string
 */
export const addDays = (dateStr: string, days: number): string => {
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + days);
    return getLocalDateString(date);
};

/**
 * Get difference in days between two date strings
 */
export const daysDifference = (dateStr1: string, dateStr2: string): number => {
    const d1 = parseLocalDate(dateStr1);
    const d2 = parseLocalDate(dateStr2);
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};
