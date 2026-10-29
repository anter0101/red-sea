/// <reference types="jest" />

import {
  isSessionPastMaxAge,
  SESSION_MAX_AGE_SECONDS,
  sessionExpiresAt,
} from '@/lib/session-lifetime';

describe('session lifetime', () => {
  const loggedInAt = 1_700_000_000;

  it('keeps a session for at most 6 hours', () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(6 * 60 * 60);
    expect(isSessionPastMaxAge(loggedInAt, loggedInAt + SESSION_MAX_AGE_SECONDS - 1)).toBe(false);
    expect(isSessionPastMaxAge(loggedInAt, loggedInAt + SESSION_MAX_AGE_SECONDS)).toBe(true);
  });

  it('treats a session with no login time as expired', () => {
    expect(isSessionPastMaxAge(undefined, loggedInAt)).toBe(true);
  });

  it('sets expiry 6 hours after login', () => {
    expect(sessionExpiresAt(loggedInAt)).toBe(
      new Date((loggedInAt + SESSION_MAX_AGE_SECONDS) * 1000).toISOString(),
    );
  });
});
