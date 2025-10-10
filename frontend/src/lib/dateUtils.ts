import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

/**
 * Get the user's local timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert a UTC date string to the user's local timezone
 */
export const convertUtcToLocal = (utcDateString: string): Date => {
  if (!utcDateString) {
    return new Date();
  }

  const utcDate = parseISO(utcDateString);
  if (!isValid(utcDate)) {
    return new Date();
  }

  const userTimezone = getUserTimezone();
  return toZonedTime(utcDate, userTimezone);
};

/**
 * Convert a local date to UTC for server submission
 */
export const convertLocalToUtc = (localDate: Date): Date => {
  // In date-fns-tz v3, we can use regular Date methods for UTC conversion
  // since we're working with Date objects that are already timezone-aware
  const offsetMinutes = localDate.getTimezoneOffset();
  return new Date(localDate.getTime() - offsetMinutes * 60 * 1000);
};

/**
 * Format a UTC date string in the user's local timezone
 */
export const formatDateInUserTimezone = (
  utcDateString: string,
  formatPattern: string = "MMM dd, yyyy 'at' h:mm a"
): string => {
  if (!utcDateString) {
    return "Date not available";
  }

  const utcDate = parseISO(utcDateString);
  if (!isValid(utcDate)) {
    return "Invalid date";
  }

  const userTimezone = getUserTimezone();
  return formatInTimeZone(utcDate, userTimezone, formatPattern);
};

/**
 * Format a relative time (e.g., "2 hours ago") from a UTC date string
 */
export const formatRelativeTimeFromUtc = (utcDateString: string): string => {
  if (!utcDateString) {
    return "Date not available";
  }

  const localDate = convertUtcToLocal(utcDateString);
  if (!isValid(localDate)) {
    return "Invalid date";
  }

  return formatDistanceToNow(localDate, { addSuffix: true });
};

/**
 * Format a date for datetime-local input (used in forms)
 * Converts UTC date to local timezone and formats for HTML datetime-local input
 */
export const formatDateForInput = (utcDateString: string): string => {
  if (!utcDateString) {
    return "";
  }

  const localDate = convertUtcToLocal(utcDateString);
  if (!isValid(localDate)) {
    return "";
  }

  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  return format(localDate, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Parse datetime-local input value to UTC for server submission
 */
export const parseInputDateToUtc = (inputValue: string): string => {
  if (!inputValue) {
    return "";
  }

  try {
    // Parse as local date
    const localDate = new Date(inputValue);
    if (!isValid(localDate)) {
      return "";
    }

    // Convert to UTC
    const utcDate = convertLocalToUtc(localDate);
    return utcDate.toISOString();
  } catch {
    return "";
  }
};

/**
 * Common date formatting presets
 */
export const DateFormats = {
  // Full date and time
  FULL: "EEEE, MMMM dd, yyyy 'at' h:mm a",
  // Short date and time
  SHORT: "MMM dd, yyyy 'at' h:mm a",
  // Date only
  DATE_ONLY: "MMM dd, yyyy",
  // Time only
  TIME_ONLY: "h:mm a",
  // ISO format but in local timezone
  ISO_LOCAL: "yyyy-MM-dd HH:mm:ss",
} as const;

/**
 * Format post publication date with contextual formatting
 */
export const formatPostDate = (
  utcDateString: string,
  options: {
    showRelative?: boolean;
    format?: keyof typeof DateFormats;
  } = {}
): string => {
  const { showRelative = false, format = "SHORT" } = options;

  if (!utcDateString) {
    return "Date not available";
  }

  if (showRelative) {
    const localDate = convertUtcToLocal(utcDateString);
    const now = new Date();
    const diffInHours =
      (now.getTime() - localDate.getTime()) / (1000 * 60 * 60);

    // Show relative time if less than 7 days old
    if (diffInHours < 168) {
      return formatRelativeTimeFromUtc(utcDateString);
    }
  }

  return formatDateInUserTimezone(utcDateString, DateFormats[format]);
};

/**
 * Get timezone display info for UI
 */
export const getTimezoneInfo = () => {
  const timezone = getUserTimezone();
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(now);
  const timeZoneName =
    parts.find((part) => part.type === "timeZoneName")?.value || timezone;

  return {
    timezone,
    timeZoneName,
    offset: format(now, "xxx"), // e.g., "+05:30"
  };
};
