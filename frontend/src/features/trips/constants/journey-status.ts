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
  DELEGATION_ISSUED: '#E5E7EB',
  POLICY_COLLECTED: '#2563EB',
  INVOICE_ISSUED: '#16A34A',
};

export const JOURNEY_STATUS_TEXT_COLORS: Record<string, string> = {
  DELEGATION_ISSUED: '#111827',
  POLICY_COLLECTED: '#FFFFFF',
  INVOICE_ISSUED: '#FFFFFF',
};
