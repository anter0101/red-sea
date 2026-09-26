/**
 * GPS_SYNC_ENABLED=false turns off outbound calls to gps.fmsgps.co.
 * Any other value (or unset) keeps sync on so production is unchanged.
 */
export function isGpsSyncEnabled(): boolean {
  return process.env.GPS_SYNC_ENABLED !== 'false';
}
