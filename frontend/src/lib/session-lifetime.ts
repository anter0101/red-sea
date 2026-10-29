/** Absolute session length. Matches the API access token. There is no refresh. */
export const SESSION_MAX_AGE_SECONDS = 6 * 60 * 60;

export function isSessionPastMaxAge(
  loggedInAtSeconds: number | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (typeof loggedInAtSeconds !== 'number') return true;
  return nowSeconds - loggedInAtSeconds >= SESSION_MAX_AGE_SECONDS;
}

export function sessionExpiresAt(loggedInAtSeconds: number): string {
  return new Date((loggedInAtSeconds + SESSION_MAX_AGE_SECONDS) * 1000).toISOString();
}
