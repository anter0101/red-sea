export const JOURNEY_STATUS_OPTIONS = [
  { value: 'DELEGATION_ISSUED', labelKey: 'DELEGATION_ISSUED' },
  { value: 'POLICY_COLLECTED', labelKey: 'POLICY_COLLECTED' },
  { value: 'INVOICE_ISSUED', labelKey: 'INVOICE_ISSUED' },
] as const;

export const JOURNEY_STATUS_LABELS: Record<string, string> = {
  DELEGATION_ISSUED: 'تم اصدار التفويض',
  POLICY_COLLECTED: 'تم تحصيل البوليصه',
  INVOICE_ISSUED: 'تم اصدار فاتوره',
};

export const JOURNEY_STATUS_COLORS: Record<string, string> = {
  DELEGATION_ISSUED: 'var(--BG-Color, #e2e2e2)',
  POLICY_COLLECTED: 'var(--Light-Blue-BG-Color, #148d34)',
  INVOICE_ISSUED: 'var(--Available-Green-Color, #282bd8)',
};
