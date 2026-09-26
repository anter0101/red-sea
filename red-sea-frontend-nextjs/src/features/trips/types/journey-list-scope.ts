export type JourneyListScope = {
  driverId?: number;
  carId?: number;
  trailerId?: number;
  clientId?: number;
  driverAssistantId?: number;
  branchId?: number;
};

export function journeyScopeToParams(scope?: JourneyListScope): Record<string, number> {
  if (!scope) return {};
  return Object.fromEntries(
    Object.entries(scope).filter(([, value]) => value !== undefined),
  ) as Record<string, number>;
}
