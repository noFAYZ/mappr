/**
 * Enhanced formatTime function with intelligent formatting, timezone support, and relative time
 * @param timestamp - Unix timestamp in milliseconds or seconds
 * @param period - Chart period for context-aware formatting
 * @param options - Additional formatting options
 */

import { format, formatDistanceToNow, parseISO } from "date-fns";

const formatTime = (
  timestamp: number,
  period: "day" | "week" | "month" | "year" | "max",
  options?: {
    locale?: string;
    timezone?: string;
    relative?: boolean;
    compact?: boolean;
    showSeconds?: boolean;
    use24Hour?: boolean;
    includeYear?: boolean;
    includeWeekday?: boolean;
    debug?: boolean;
  },
): string => {
  const {
    locale = "en-US",
    timezone,
    relative = false,
    compact = false,
    showSeconds = false,
    use24Hour = true,
    includeYear,
    includeWeekday = false,
    debug = false,
  } = options || {};

  // Enhanced input validation and normalization
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    if (debug) console.warn("formatTime: Invalid timestamp:", timestamp);

    return "Invalid date";
  }

  // Auto-detect if timestamp is in seconds vs milliseconds
  // If timestamp is less than year 2001 in milliseconds, assume it's in seconds
  let normalizedTimestamp = timestamp;

  if (timestamp < 978307200000) {
    // Jan 1, 2001 in milliseconds
    normalizedTimestamp = timestamp * 1000;
    if (debug)
      console.log(
        "formatTime: Converted seconds to milliseconds:",
        timestamp,
        "->",
        normalizedTimestamp,
      );
  }

  // Validate the normalized timestamp creates a valid date
  const testDate = new Date(normalizedTimestamp);

  if (isNaN(testDate.getTime())) {
    if (debug)
      console.warn(
        "formatTime: Invalid date created from timestamp:",
        normalizedTimestamp,
      );

    return "Invalid date";
  }

  // Additional sanity check - ensure date is within reasonable range
  const currentYear = new Date().getFullYear();
  const dateYear = testDate.getFullYear();

  if (dateYear < 1970 || dateYear > currentYear + 10) {
    if (debug)
      console.warn("formatTime: Date outside reasonable range:", dateYear);

    return "Invalid date";
  }

  const date = new Date(normalizedTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - normalizedTimestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Check if date is in the future
  const isFuture = normalizedTimestamp > now.getTime();
  const futurePrefix = isFuture ? "in " : "";
  const pastSuffix = isFuture ? "" : " ago";

  // Base formatting options
  const baseOptions: Intl.DateTimeFormatOptions = {
    ...(timezone && { timeZone: timezone }),
  };

  // Relative time formatting (smart relative dates)
  if (relative) {
    const absDiff = Math.abs(diffSeconds);

    if (absDiff < 60) {
      return "Just now";
    } else if (absDiff < 3600) {
      // Less than 1 hour
      const minutes = Math.abs(diffMinutes);

      return `${futurePrefix}${minutes}m${pastSuffix}`;
    } else if (absDiff < 86400) {
      // Less than 1 day
      const hours = Math.abs(diffHours);

      return `${futurePrefix}${hours}h${pastSuffix}`;
    } else if (absDiff < 604800) {
      // Less than 1 week
      const days = Math.abs(diffDays);

      return `${futurePrefix}${days}d${pastSuffix}`;
    } else if (absDiff < 2592000) {
      // Less than 1 month
      const weeks = Math.abs(diffWeeks);

      return `${futurePrefix}${weeks}w${pastSuffix}`;
    } else if (absDiff < 31536000) {
      // Less than 1 year
      const months = Math.abs(diffMonths);

      return `${futurePrefix}${months}mo${pastSuffix}`;
    } else {
      const years = Math.abs(diffYears);

      return `${futurePrefix}${years}y${pastSuffix}`;
    }
  }

  // Period-specific formatting with enhanced logic
  try {
    switch (period) {
      case "day": {
        if (compact) {
          return date.toLocaleTimeString(locale, {
            ...baseOptions,
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24Hour,
          });
        }

        // Check if it's today, yesterday, or another day
        const today = new Date();
        const yesterday = new Date(today);

        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) {
          return date.toLocaleTimeString(locale, {
            ...baseOptions,
            hour: "2-digit",
            minute: "2-digit",
            ...(showSeconds && { second: "2-digit" }),
            hour12: !use24Hour,
          });
        } else if (isYesterday) {
          return `Yesterday ${date.toLocaleTimeString(locale, {
            ...baseOptions,
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24Hour,
          })}`;
        } else {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24Hour,
          });
        }
      }

      case "week": {
        const today = new Date();
        const isThisWeek =
          date >=
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - today.getDay(),
            ) &&
          date <
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - today.getDay() + 7,
            );

        if (compact) {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            weekday: "short",
          });
        }

        if (isThisWeek) {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24Hour,
          });
        } else {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            weekday: includeWeekday ? "short" : undefined,
            month: "short",
            day: "numeric",
          });
        }
      }

      case "month": {
        const currentYear = new Date().getFullYear();
        const dateYear = date.getFullYear();
        const showYear = includeYear || dateYear !== currentYear;

        if (compact) {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            month: "short",
            day: "numeric",
          });
        }

        return date.toLocaleDateString(locale, {
          ...baseOptions,
          month: "short",
          day: "numeric",
          ...(showYear && { year: "numeric" }),
        });
      }

      case "year": {
        if (compact) {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            month: "short",
            year: "2-digit",
          });
        }

        return date.toLocaleDateString(locale, {
          ...baseOptions,
          month: "long",
          year: "numeric",
        });
      }

      case "max": {
        const currentYear = new Date().getFullYear();
        const dateYear = date.getFullYear();

        if (compact) {
          // For very old dates, just show year
          if (Math.abs(currentYear - dateYear) > 5) {
            return dateYear.toString();
          }

          return date.toLocaleDateString(locale, {
            ...baseOptions,
            month: "short",
            year: "2-digit",
          });
        }

        // Adaptive formatting based on age
        if (Math.abs(currentYear - dateYear) > 10) {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            year: "numeric",
          });
        } else if (Math.abs(currentYear - dateYear) > 2) {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            month: "short",
            year: "numeric",
          });
        } else {
          return date.toLocaleDateString(locale, {
            ...baseOptions,
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      }

      default: {
        // Fallback with intelligent formatting
        const currentYear = new Date().getFullYear();
        const dateYear = date.getFullYear();
        const showYear = dateYear !== currentYear;

        return date.toLocaleDateString(locale, {
          ...baseOptions,
          month: "short",
          day: "numeric",
          ...(showYear && { year: "numeric" }),
          hour: "2-digit",
          minute: "2-digit",
          hour12: !use24Hour,
        });
      }
    }
  } catch (error) {
    // Fallback for any Intl.DateTimeFormat errors
    if (debug) console.warn("formatTime error:", error);

    // Simple fallback without Intl
    try {
      switch (period) {
        case "day":
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        case "week":
          return date.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        case "month":
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        case "year":
        case "max":
          return date.toLocaleDateString([], {
            month: "short",
            year: "numeric",
          });
        default:
          return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      }
    } catch (fallbackError) {
      if (debug) console.warn("formatTime fallback error:", fallbackError);

      // Ultimate fallback
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
    }
  }
};

// Enhanced format with business context
const formatBusinessTime = (
  timestamp: number,
  options?: {
    showBusinessHours?: boolean;
    showMarketStatus?: boolean;
    timezone?: string;
    debug?: boolean;
  },
): string => {
  const {
    showBusinessHours = false,
    showMarketStatus = false,
    timezone = "America/New_York",
    debug = false,
  } = options || {};

  // Normalize timestamp (handle seconds vs milliseconds)
  let normalizedTimestamp = timestamp;

  if (timestamp < 978307200000) {
    normalizedTimestamp = timestamp * 1000;
  }

  const date = new Date(normalizedTimestamp);

  // Validate date
  if (isNaN(date.getTime())) {
    if (debug)
      console.warn(
        "formatBusinessTime: Invalid date from timestamp:",
        timestamp,
      );

    return "Invalid date";
  }

  const hour = date.getHours();
  const day = date.getDay();

  let result = formatTime(timestamp, "day", { timezone, compact: true, debug });

  if (showBusinessHours) {
    const isBusinessHours = hour >= 9 && hour < 17 && day >= 1 && day <= 5;
    const businessStatus = isBusinessHours
      ? "🟢 Business Hours"
      : "🔴 After Hours";

    result += ` • ${businessStatus}`;
  }

  if (showMarketStatus) {
    const isMarketHours = hour >= 9.5 && hour < 16 && day >= 1 && day <= 5;
    const marketStatus = isMarketHours ? "📈 Market Open" : "📉 Market Closed";

    result += ` • ${marketStatus}`;
  }

  return result;
};

export { formatTime, formatRelativeTime, formatBusinessTime };

/**
 * Convert various timestamp formats to PostgreSQL timestampz format
 * @param timestamp - Unix timestamp (seconds/milliseconds), ISO string, or Date object
 * @param options - Formatting options
 * @returns PostgreSQL timestampz formatted string
 */
const toTimestampz = (
  timestamp: number | string | Date,
  options?: {
    timezone?: string; // Target timezone (e.g., 'UTC', 'America/New_York', 'Asia/Karachi')
    includeMicroseconds?: boolean; // Add .000000 microseconds
    customOffset?: string; // Custom offset like '+05:00', '-08:00'
    debug?: boolean;
  },
): string => {
  const {
    timezone = "UTC",
    includeMicroseconds = false,
    customOffset,
    debug = false,
  } = options || {};

  let date: Date;

  try {
    // Normalize input to Date object
    if (timestamp instanceof Date) {
      date = timestamp;
      if (debug) console.log("toTimestampz: Date object input");
    } else if (typeof timestamp === "string") {
      // Handle string inputs (ISO, timestampz, etc.)
      if (/^\d+(\.\d+)?$/.test(timestamp.trim())) {
        // Numeric string
        const numericValue = parseFloat(timestamp);

        date = new Date(
          numericValue < 9999999999 ? numericValue * 1000 : numericValue,
        );
      } else {
        // Date string
        date = new Date(timestamp);
      }
      if (debug)
        console.log(
          "toTimestampz: String input parsed to:",
          date.toISOString(),
        );
    } else if (typeof timestamp === "number") {
      // Handle numeric timestamps
      if (timestamp.toString().length <= 10) {
        // Likely seconds
        date = new Date(timestamp * 1000);
        if (debug) console.log("toTimestampz: Seconds timestamp converted");
      } else {
        // Likely milliseconds or higher precision
        const timestampStr = timestamp.toString();
        const length = timestampStr.replace(".", "").length;

        if (length >= 16) {
          // Microseconds
          date = new Date(Math.floor(timestamp / 1000));
        } else {
          // Milliseconds
          date = new Date(timestamp);
        }
        if (debug)
          console.log("toTimestampz: High precision timestamp converted");
      }
    } else {
      throw new Error("Invalid timestamp type");
    }

    // Validate date
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date created from timestamp");
    }

    // Convert to target timezone if specified and not UTC
    let targetDate = date;

    if (timezone !== "UTC" && !customOffset) {
      // For non-UTC timezones, we need to adjust the date
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
        hour12: false,
      });

      const parts = formatter.formatToParts(date);
      const formattedParts: Record<string, string> = {};

      parts.forEach((part) => {
        formattedParts[part.type] = part.value;
      });

      // Reconstruct the date string in the target timezone
      const targetDateStr = `${formattedParts.year}-${formattedParts.month}-${formattedParts.day}T${formattedParts.hour}:${formattedParts.minute}:${formattedParts.second}.${formattedParts.fractionalSecond}`;

      targetDate = new Date(targetDateStr);

      if (debug) console.log("toTimestampz: Converted to timezone:", timezone);
    }

    // Get timezone offset
    let timezoneOffset: string;

    if (customOffset) {
      timezoneOffset = customOffset;
    } else if (timezone === "UTC") {
      timezoneOffset = "+00";
    } else {
      // Calculate offset for the specified timezone
      const utcTime = date.getTime();
      const localTime = targetDate.getTime();
      const offsetMinutes = (localTime - utcTime) / (1000 * 60);

      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? "+" : "-";

      timezoneOffset = `${sign}${offsetHours.toString().padStart(2, "0")}:${offsetMins.toString().padStart(2, "0")}`;
    }

    // Format as timestampz
    const isoString = (timezone === "UTC" ? date : targetDate).toISOString();
    const [datePart, timePart] = isoString.split("T");
    const timeWithoutZ = timePart.replace("Z", "");

    // Handle microseconds
    let finalTimePart = timeWithoutZ;

    if (includeMicroseconds) {
      if (finalTimePart.includes(".")) {
        // Extend existing milliseconds to microseconds
        finalTimePart = finalTimePart.replace(/(\.\d{3})/, "$1000");
      } else {
        // Add microseconds
        finalTimePart = finalTimePart.replace(/(\d{2})$/, "$1.000000");
      }
    }

    const result = `${datePart} ${finalTimePart}${timezoneOffset}`;

    if (debug) console.log("toTimestampz: Final result:", result);

    return result;
  } catch (error) {
    if (debug) console.warn("toTimestampz: Error:", error);
    throw new Error(`Failed to convert timestamp to timestampz: ${error}`);
  }
};

/**
 * Convert timestamp to timestampz with common timezone presets
 */
const toTimestampzPresets = {
  utc: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, { timezone: "UTC", includeMicroseconds }),

  est: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, {
      timezone: "America/New_York",
      includeMicroseconds,
    }),

  pst: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, {
      timezone: "America/Los_Angeles",
      includeMicroseconds,
    }),

  cet: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, { timezone: "Europe/Berlin", includeMicroseconds }),

  jst: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, { timezone: "Asia/Tokyo", includeMicroseconds }),

  ist: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, { timezone: "Asia/Kolkata", includeMicroseconds }),

  pkt: (timestamp: number | string | Date, includeMicroseconds = false) =>
    toTimestampz(timestamp, { timezone: "Asia/Karachi", includeMicroseconds }),

  // Custom offset versions
  withOffset: (
    timestamp: number | string | Date,
    offset: string,
    includeMicroseconds = false,
  ) => toTimestampz(timestamp, { customOffset: offset, includeMicroseconds }),
};

/**
 * Batch convert multiple timestamps to timestampz
 */
const batchToTimestampz = (
  timestamps: (number | string | Date)[],
  options?: Parameters<typeof toTimestampz>[1],
): Array<{ input: number | string | Date; output: string; error?: string }> => {
  return timestamps.map((timestamp) => {
    try {
      return {
        input: timestamp,
        output: toTimestampz(timestamp, options),
      };
    } catch (error) {
      return {
        input: timestamp,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
};

/**
 * Validate if a string is a valid timestampz format
 */
const isValidTimestampz = (timestampz: string): boolean => {
  const timestamptzRegex =
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(\.\d{3,6})?([+-]\d{2}):?(\d{2})?$/;

  return timestamptzRegex.test(timestampz.trim());
};

/**
 * Extract components from timestampz string
 */
const parseTimestampz = (
  timestampz: string,
): {
  date: string;
  time: string;
  milliseconds?: string;
  microseconds?: string;
  timezone: string;
  offset: { hours: number; minutes: number; sign: "+" | "-" };
} | null => {
  const regex =
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(\.\d{3}(\d{3})?)?([+-])(\d{2}):?(\d{2})?$/;
  const match = timestampz.trim().match(regex);

  if (!match) return null;

  const [, date, time, fullMs, microseconds, sign, hours, minutes = "00"] =
    match;

  return {
    date,
    time,
    milliseconds: fullMs?.substring(1, 4),
    microseconds: microseconds,
    timezone: `${sign}${hours}:${minutes}`,
    offset: {
      hours: parseInt(hours),
      minutes: parseInt(minutes),
      sign: sign as "+" | "-",
    },
  };
};

export {
  toTimestampz,
  toTimestampzPresets,
  batchToTimestampz,
  isValidTimestampz,
  parseTimestampz,
  examples,
};

/**
 * Convert PostgreSQL timestampz format to user-readable format
 * @param timestampz - PostgreSQL timestampz string
 * @param options - Formatting options
 * @returns User-friendly formatted string
 */
const timestampzToReadable = (
  timestampz: string,
  options?: {
    format?: "full" | "short" | "relative" | "smart" | "business" | "custom";
    locale?: string;
    targetTimezone?: string;
    showTimezone?: boolean;
    showSeconds?: boolean;
    use24Hour?: boolean;
    includeDate?: boolean;
    includeTime?: boolean;
    includeYear?: boolean;
    includeWeekday?: boolean;
    relativeThreshold?: number; // Hours threshold for relative time
    customFormat?: Intl.DateTimeFormatOptions;
    debug?: boolean;
  },
): string => {
  const {
    format = "smart",
    locale = "en-US",
    targetTimezone,
    showTimezone = false,
    showSeconds = false,
    use24Hour = false,
    includeDate = true,
    includeTime = true,
    includeYear,
    includeWeekday = false,
    relativeThreshold = 24, // 24 hours
    customFormat,
    debug = false,
  } = options || {};

  try {
    // Parse the timestampz string
    const parsed = parseTimestampzString(timestampz, debug);

    if (!parsed) {
      throw new Error("Invalid timestampz format");
    }

    const { date: parsedDate, timezone: originalTimezone } = parsed;

    // Convert to target timezone if specified
    let displayDate = parsedDate;
    let displayTimezone = originalTimezone;

    if (targetTimezone && targetTimezone !== "original") {
      try {
        const utcDate = new Date(parsedDate.toISOString());

        displayDate = new Date(
          utcDate.toLocaleString("en-US", { timeZone: targetTimezone }),
        );
        displayTimezone = targetTimezone;
        if (debug)
          console.log(
            "timestampzToReadable: Converted to timezone:",
            targetTimezone,
          );
      } catch (e) {
        if (debug)
          console.warn(
            "timestampzToReadable: Timezone conversion failed, using original",
          );
      }
    }

    // Calculate relative time info
    const now = new Date();
    const diffMs = now.getTime() - displayDate.getTime();
    const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);
    const isRecent = diffHours <= relativeThreshold;
    const isFuture = diffMs < 0;

    if (debug) {
      console.log("timestampzToReadable: Parsed date:", displayDate);
      console.log("timestampzToReadable: Diff hours:", diffHours);
      console.log("timestampzToReadable: Is recent:", isRecent);
    }

    // Handle different format types
    switch (format) {
      case "relative":
        return formatRelativeTime(displayDate, locale, debug);

      case "smart":
        // Smart format: relative if recent, otherwise absolute
        if (isRecent) {
          const relativeTime = formatRelativeTime(displayDate, locale, debug);
          const timeOnly = displayDate.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
            ...(showSeconds && { second: "2-digit" }),
            hour12: !use24Hour,
            ...(showTimezone && targetTimezone && { timeZone: targetTimezone }),
          });

          return `${relativeTime} (${timeOnly})`;
        } else {
          return formatAbsoluteTime(displayDate, locale, {
            includeDate,
            includeTime,
            includeYear,
            includeWeekday,
            showSeconds,
            use24Hour,
            showTimezone,
            targetTimezone: showTimezone ? displayTimezone : undefined,
          });
        }

      case "business":
        return formatBusinessReadable(displayDate, locale, {
          showTimezone,
          targetTimezone: displayTimezone,
          debug,
        });

      case "full":
        return formatAbsoluteTime(displayDate, locale, {
          includeDate: true,
          includeTime: true,
          includeYear: true,
          includeWeekday: true,
          showSeconds: true,
          use24Hour,
          showTimezone: true,
          targetTimezone: displayTimezone,
        });

      case "short":
        return formatAbsoluteTime(displayDate, locale, {
          includeDate: !isRecent,
          includeTime: true,
          includeYear: false,
          includeWeekday: false,
          showSeconds: false,
          use24Hour,
          showTimezone: false,
        });

      case "custom":
        if (customFormat) {
          return displayDate.toLocaleDateString(locale, {
            ...customFormat,
            ...(showTimezone && targetTimezone && { timeZone: targetTimezone }),
          });
        }

        // Fallback to smart format
        return timestampzToReadable(timestampz, {
          ...options,
          format: "smart",
        });

      default:
        return formatAbsoluteTime(displayDate, locale, {
          includeDate,
          includeTime,
          includeYear,
          includeWeekday,
          showSeconds,
          use24Hour,
          showTimezone,
          targetTimezone: showTimezone ? displayTimezone : undefined,
        });
    }
  } catch (error) {
    if (debug) console.warn("timestampzToReadable: Error:", error);

    return `Invalid timestamp: ${timestampz}`;
  }
};

/**
 * Parse timestampz string into components
 */
const parseTimestampzString = (
  timestampz: string,
  debug: boolean = false,
): {
  date: Date;
  timezone: string;
  components: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    milliseconds?: number;
    microseconds?: number;
  };
} | null => {
  const trimmed = timestampz.trim();

  // Enhanced regex to handle various timestampz formats including ISO 8601
  // Supports both space and 'T' separators, with or without colons in timezone
  const regex =
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d{3,6})?([+-])(\d{2}):?(\d{2})?$/;
  const match = trimmed.match(regex);

  if (!match) {
    if (debug)
      console.warn("parseTimestampzString: Failed to match regex:", trimmed);
    // Try additional common formats
    const fallbackFormats = [
      // ISO 8601 with Z (UTC)
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d{3,6})?Z$/,
      // Without timezone
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d{3,6})?$/,
    ];

    for (const fallbackRegex of fallbackFormats) {
      const fallbackMatch = trimmed.match(fallbackRegex);

      if (fallbackMatch) {
        if (debug)
          console.log("parseTimestampzString: Matched fallback format");
        // Handle Z timezone or missing timezone
        const [, year, month, day, hour, minute, second, fractional] =
          fallbackMatch;
        const isZulu = trimmed.endsWith("Z");
        const adjustedMatch = [
          trimmed,
          year,
          month,
          day,
          hour,
          minute,
          second,
          fractional || "",
          isZulu ? "+" : "+",
          "00",
          "00",
        ];

        return parseMatchedTimestamp(adjustedMatch, debug);
      }
    }

    return null;
  }

  return parseMatchedTimestamp(match, debug);
};

const parseMatchedTimestamp = (
  match: string[] | RegExpMatchArray,
  debug: boolean = false,
): {
  date: Date;
  timezone: string;
  components: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    milliseconds?: number;
    microseconds?: number;
  };
} => {
  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
    second,
    fractional,
    tzSign,
    tzHours,
    tzMinutes = "00",
  ] = match;

  // Parse fractional seconds
  let milliseconds: number | undefined;
  let microseconds: number | undefined;

  if (fractional) {
    const fractionalStr = fractional.substring(1); // Remove the dot

    milliseconds = parseInt(fractionalStr.substring(0, 3).padEnd(3, "0"));
    if (fractionalStr.length > 3) {
      microseconds = parseInt(fractionalStr.substring(3, 6).padEnd(3, "0"));
    }
  }

  // Create date object - handle both space and T separators
  const dateSeparator = match[0].includes("T") ? "T" : " ";
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${fractional || ".000"}${tzSign}${tzHours}:${tzMinutes}`;
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    if (debug)
      console.warn("parseMatchedTimestamp: Invalid date created:", isoString);
    throw new Error(`Invalid date created from: ${isoString}`);
  }

  const timezone = `${tzSign}${tzHours}:${tzMinutes}`;

  if (debug) {
    console.log("parseMatchedTimestamp: Parsed successfully");
    console.log("- Original:", match[0]);
    console.log("- ISO string:", isoString);
    console.log("- Date:", date.toISOString());
    console.log("- Timezone:", timezone);
  }

  return {
    date,
    timezone,
    components: {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      minute: parseInt(minute),
      second: parseInt(second),
      milliseconds,
      microseconds,
    },
  };
};

/**
 * Format relative time (ago/from now)
 */
const formatRelativeTime = (
  date: Date,
  locale: string,
  debug: boolean = false,
): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const absDiffMs = Math.abs(diffMs);
  const isFuture = diffMs < 0;

  // Time units in milliseconds
  const units = [
    {
      name: "year",
      ms: 365 * 24 * 60 * 60 * 1000,
      threshold: 365 * 24 * 60 * 60 * 1000,
    },
    {
      name: "month",
      ms: 30 * 24 * 60 * 60 * 1000,
      threshold: 30 * 24 * 60 * 60 * 1000,
    },
    {
      name: "week",
      ms: 7 * 24 * 60 * 60 * 1000,
      threshold: 7 * 24 * 60 * 60 * 1000,
    },
    { name: "day", ms: 24 * 60 * 60 * 1000, threshold: 24 * 60 * 60 * 1000 },
    { name: "hour", ms: 60 * 60 * 1000, threshold: 60 * 60 * 1000 },
    { name: "minute", ms: 60 * 1000, threshold: 60 * 1000 },
    { name: "second", ms: 1000, threshold: 1000 },
  ];

  // Handle "just now" case
  if (absDiffMs < 30000) {
    // Less than 30 seconds
    return "just now";
  }

  // Use Intl.RelativeTimeFormat if available
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style: "long",
    });

    for (const unit of units) {
      if (absDiffMs >= unit.threshold) {
        const value = Math.round(diffMs / unit.ms) * (isFuture ? 1 : -1);

        return rtf.format(value, unit.name as Intl.RelativeTimeFormatUnit);
      }
    }
  } catch (e) {
    if (debug)
      console.warn(
        "formatRelativeTime: Intl.RelativeTimeFormat failed, using fallback",
      );
  }

  // Fallback for unsupported browsers
  for (const unit of units) {
    if (absDiffMs >= unit.threshold) {
      const value = Math.round(absDiffMs / unit.ms);
      const unitName = value === 1 ? unit.name : unit.name + "s";

      return isFuture ? `in ${value} ${unitName}` : `${value} ${unitName} ago`;
    }
  }

  return "just now";
};

/**
 * Format absolute time
 */
const formatAbsoluteTime = (
  date: Date,
  locale: string,
  options: {
    includeDate?: boolean;
    includeTime?: boolean;
    includeYear?: boolean;
    includeWeekday?: boolean;
    showSeconds?: boolean;
    use24Hour?: boolean;
    showTimezone?: boolean;
    targetTimezone?: string;
  },
): string => {
  const {
    includeDate = true,
    includeTime = true,
    includeYear,
    includeWeekday = false,
    showSeconds = false,
    use24Hour = false,
    showTimezone = false,
    targetTimezone,
  } = options;

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  const shouldShowYear = includeYear ?? dateYear !== currentYear;

  const formatOptions: Intl.DateTimeFormatOptions = {};

  if (includeDate) {
    if (includeWeekday) formatOptions.weekday = "long";
    formatOptions.year = shouldShowYear ? "numeric" : undefined;
    formatOptions.month = "long";
    formatOptions.day = "numeric";
  }

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    if (showSeconds) formatOptions.second = "2-digit";
    formatOptions.hour12 = !use24Hour;
  }

  if (showTimezone && targetTimezone) {
    formatOptions.timeZone = targetTimezone;
    formatOptions.timeZoneName = "short";
  }

  return date.toLocaleDateString(locale, formatOptions);
};

/**
 * Format for business context
 */
const formatBusinessReadable = (
  date: Date,
  locale: string,
  options: {
    showTimezone?: boolean;
    targetTimezone?: string;
    debug?: boolean;
  },
): string => {
  const { showTimezone = false, targetTimezone, debug = false } = options;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);

  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  let dayLabel: string;

  if (dateOnly.getTime() === today.getTime()) {
    dayLabel = "Today";
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    dayLabel = "Yesterday";
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    dayLabel = "Tomorrow";
  } else {
    const diffDays = Math.abs(
      Math.floor(
        (dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    if (diffDays <= 7) {
      dayLabel = date.toLocaleDateString(locale, { weekday: "long" });
    } else {
      dayLabel = date.toLocaleDateString(locale, {
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  if (showTimezone && targetTimezone) {
    timeOptions.timeZone = targetTimezone;
    timeOptions.timeZoneName = "short";
  }

  const timeLabel = date.toLocaleTimeString(locale, timeOptions);

  // Add business context
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  const isBusinessHours =
    hour >= 9 && hour < 17 && dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let context = "";

  if (isWeekend) {
    context = " 📅 Weekend";
  } else if (isBusinessHours) {
    context = " 🏢 Business Hours";
  } else if (hour < 9) {
    context = " 🌅 Before Business Hours";
  } else {
    context = " 🌆 After Business Hours";
  }

  return `${dayLabel} at ${timeLabel}${context}`;
};

/**
 * Preset formatters for common use cases
 */
const timestampzPresets = {
  // Quick formats
  quick: (timestampz: string) =>
    timestampzToReadable(timestampz, { format: "short" }),
  full: (timestampz: string) =>
    timestampzToReadable(timestampz, { format: "full" }),
  relative: (timestampz: string) =>
    timestampzToReadable(timestampz, { format: "relative" }),
  business: (timestampz: string) =>
    timestampzToReadable(timestampz, { format: "business" }),

  // Timezone specific
  local: (timestampz: string, timezone: string) =>
    timestampzToReadable(timestampz, {
      targetTimezone: timezone,
      showTimezone: true,
    }),

  utc: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      targetTimezone: "UTC",
      showTimezone: true,
    }),

  est: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      targetTimezone: "America/New_York",
      showTimezone: true,
    }),

  pst: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      targetTimezone: "America/Los_Angeles",
      showTimezone: true,
    }),

  ist: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      targetTimezone: "Asia/Kolkata",
      showTimezone: true,
    }),

  // Chat/social media style
  chat: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      format: "smart",
      relativeThreshold: 168, // 1 week
      use24Hour: false,
    }),

  // Financial/trading style
  trading: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      format: "business",
      showSeconds: true,
      use24Hour: true,
      showTimezone: true,
      targetTimezone: "America/New_York", // NYSE timezone
    }),

  // Log/audit style
  audit: (timestampz: string) =>
    timestampzToReadable(timestampz, {
      format: "full",
      showSeconds: true,
      use24Hour: true,
      showTimezone: true,
    }),
};

/**
 * Batch convert multiple timestampz values
 */
const batchTimestampzToReadable = (
  timestampzArray: string[],
  options?: Parameters<typeof timestampzToReadable>[1],
): Array<{ input: string; output: string; error?: string }> => {
  return timestampzArray.map((timestampz) => {
    try {
      return {
        input: timestampz,
        output: timestampzToReadable(timestampz, options),
      };
    } catch (error) {
      return {
        input: timestampz,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
};

// Usage examples and tests
const examples = () => {
  console.log("=== Timestampz to Readable Examples ===\n");

  const testTimestampz = "2025-07-31 11:30:00.000+00";

  console.log("Input timestampz:", testTimestampz);
  console.log("");

  // Different formats
  console.log("1. Different Formats:");
  console.log("Smart:", timestampzPresets.quick(testTimestampz));
  console.log("Full:", timestampzPresets.full(testTimestampz));
  console.log("Relative:", timestampzPresets.relative(testTimestampz));
  console.log("Business:", timestampzPresets.business(testTimestampz));
  console.log("");

  // Different timezones
  console.log("2. Different Timezones:");
  console.log("UTC:", timestampzPresets.utc(testTimestampz));
  console.log("EST:", timestampzPresets.est(testTimestampz));
  console.log("PST:", timestampzPresets.pst(testTimestampz));
  console.log("IST:", timestampzPresets.ist(testTimestampz));
  console.log("");

  // Specialized formats
  console.log("3. Specialized Formats:");
  console.log("Chat style:", timestampzPresets.chat(testTimestampz));
  console.log("Trading style:", timestampzPresets.trading(testTimestampz));
  console.log("Audit style:", timestampzPresets.audit(testTimestampz));
  console.log("");

  // Recent timestamp for relative formatting
  const recentTimestamp = new Date();

  recentTimestamp.setMinutes(recentTimestamp.getMinutes() - 30);
  const recentTimestampz = recentTimestamp
    .toISOString()
    .replace("T", " ")
    .replace("Z", "+00");

  console.log("4. Recent Timestamp (30 minutes ago):");
  console.log("Input:", recentTimestampz);
  console.log("Smart:", timestampzPresets.quick(recentTimestampz));
  console.log("Relative:", timestampzPresets.relative(recentTimestampz));
  console.log("Chat:", timestampzPresets.chat(recentTimestampz));
};

export {
  timestampzToReadable,
  timestampzPresets,
  batchTimestampzToReadable,
  parseTimestampzString,
};

export const timestampzToChart = (
  timestampz: string,
  formatType: "relative" | "smart" | "full" | "short" = "smart",
): string => {
  try {
    // Convert PostgreSQL timestampz to ISO format
    const isoString = timestampz
      .replace(" ", "T")
      .replace(
        /([+-]\d{2}):?(\d{2})?$/,
        (match, hours, mins = "00") => `${hours}:${mins}`,
      );

    const date = parseISO(isoString);

    switch (formatType) {
      case "relative":
        return formatDistanceToNow(date, { addSuffix: true });
      case "full":
        return format(date, "EEEE, MMMM do, yyyy 'at' h:mm:ss a");
      case "short":
        return format(date, "MMM d, h:mm a");
      case "smart":
      default:
        const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);

        return Math.abs(hoursAgo) < 24
          ? formatDistanceToNow(date, { addSuffix: true })
          : format(date, "MMM d, h:mm a");
    }
  } catch (error) {
    return "Invalid date";
  }
};
