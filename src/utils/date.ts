/**
 * Utility functions for date transformation, formatting, and payload sanitization
 */

/**
 * Transforms any date input (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Date object)
 * into a standardized ISO date string (YYYY-MM-DD) ready for API payload transmission.
 * Returns undefined for empty or invalid values.
 */
export const formatToISODate = (value?: string | Date | null): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined;
    return value.toISOString().split('T')[0];
  }

  const str = String(value).trim();
  if (!str) return undefined;

  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[2].length === 4) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    if (parts[0].length === 4 && parts[1].length <= 2 && parts[2].length <= 2) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return undefined;
};

/**
 * Format date for display in UI (e.g. "Aug 15, 2026" or "15/08/2026")
 */
export const formatDisplayDate = (
  value?: string | Date | null,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(locale, options);
};

/**
 * Utility to sanitize form payload objects before sending to backend:
 * - Converts empty string values ("") to undefined
 * - Automatically transforms specified date fields using formatToISODate
 */
export const sanitizePayload = <T extends Record<string, any>>(
  data: T,
  dateFields: (keyof T)[] = []
): Partial<T> => {
  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (dateFields.includes(key as keyof T)) {
        result[key] = formatToISODate(value);
      } else if (value === '' || value === null) {
        result[key] = undefined;
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

export default {
  formatToISODate,
  formatDisplayDate,
  sanitizePayload,
};
