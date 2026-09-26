export const VEHICLE_MODES = ['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR'] as const;
export type VehicleMode = (typeof VEHICLE_MODES)[number];

const SLUG_TO_MODE = {
  'nolon-car': 'NOLON_CAR',
  'contract-car': 'CONTRACT_CAR',
  'company-car': 'COMPANY_CAR',
} as const satisfies Record<string, VehicleMode>;

export type VehicleModeSlug = keyof typeof SLUG_TO_MODE;

export function slugToVehicleMode(slug: string): VehicleMode | undefined {
  return SLUG_TO_MODE[slug as VehicleModeSlug];
}

export function vehicleModeToSlug(mode: VehicleMode): VehicleModeSlug {
  return (Object.keys(SLUG_TO_MODE) as VehicleModeSlug[]).find(
    (slug) => SLUG_TO_MODE[slug] === mode,
  )!;
}

export const VEHICLE_MODE_SLUGS = Object.keys(SLUG_TO_MODE) as VehicleModeSlug[];
