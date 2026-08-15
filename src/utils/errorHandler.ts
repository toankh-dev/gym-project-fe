/**
 * Extracts a human-readable error message from an Axios error.
 *
 * The backend error middleware wraps messages inside:
 *   { success: false, error: { message: "..." } }
 *
 * Fallback chain:
 *   1. data.error.message  — standard backend format
 *   2. data.message        — legacy / other APIs
 *   3. fallbackMessage     — default string provided by caller
 */
export function getApiErrorMessage(err: unknown, fallbackMessage: string): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as any;
    const data = axiosErr?.response?.data;

    if (data?.error?.message) return data.error.message;
    if (data?.message) return data.message;
    if (axiosErr?.message) return axiosErr.message;
  }
  return fallbackMessage;
}
