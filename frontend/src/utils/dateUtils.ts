import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format a date string or Date object
 * @param date - Date string or Date object
 * @param formatType - Type of formatting ('short', 'long', 'relative', 'time')
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  formatType: 'short' | 'long' | 'relative' | 'time' = 'short'
): string => {
  if (!date) return '';

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  switch (formatType) {
    case 'short':
      return format(dateObj, 'MMM d, yyyy');
    case 'long':
      return format(dateObj, 'MMMM d, yyyy');
    case 'relative':
      return formatDistanceToNow(dateObj, { addSuffix: true });
    case 'time':
      return format(dateObj, 'MMM d, yyyy h:mm a');
    default:
      return format(dateObj, 'MMM d, yyyy');
  }
};

/**
 * Check if a date is overdue (past current date)
 * @param date - Date string or Date object
 * @returns Boolean indicating if date is overdue
 */
export const isOverdue = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return false;
  }

  return dateObj < new Date();
};

/**
 * Get relative time from now
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: string | Date | null | undefined): string => {
  return formatDate(date, 'relative');
};

/**
 * Format date for form inputs (YYYY-MM-DD)
 * @param date - Date string or Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return '';
  }

  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Format datetime for form inputs (YYYY-MM-DDTHH:mm)
 * @param date - Date string or Date object
 * @returns Datetime string in YYYY-MM-DDTHH:mm format
 */
export const formatDateTimeForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return '';
  }

  return format(dateObj, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Get days until/since a date
 * @param date - Date string or Date object
 * @returns Number of days (negative if past, positive if future)
 */
export const getDaysUntil = (date: string | Date | null | undefined): number => {
  if (!date) return 0;

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    return 0;
  }

  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Boolean indicating if dates are same day
 */
export const isSameDay = (
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): boolean => {
  if (!date1 || !date2) return false;

  let dateObj1: Date;
  let dateObj2: Date;
  
  if (typeof date1 === 'string') {
    dateObj1 = parseISO(date1);
  } else {
    dateObj1 = date1;
  }

  if (typeof date2 === 'string') {
    dateObj2 = parseISO(date2);
  } else {
    dateObj2 = date2;
  }

  if (!isValid(dateObj1) || !isValid(dateObj2)) {
    return false;
  }

  return format(dateObj1, 'yyyy-MM-dd') === format(dateObj2, 'yyyy-MM-dd');
};
