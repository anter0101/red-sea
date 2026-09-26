import { AxiosError } from 'axios';

import type { IApiResError } from '@/types/api-res-error';

/** Extract user-facing message from NestJS / axios error responses. */
export function getApiErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim()) {
      return data.trim();
    }

    if (data && typeof data === 'object' && 'message' in data) {
      const { message } = data as IApiResError;

      if (Array.isArray(message)) {
        const joined = message
          .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
          .filter(Boolean)
          .join('\n');
        if (joined) return joined;
      }

      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback ?? 'Something went wrong';
}
