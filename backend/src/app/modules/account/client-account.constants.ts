export const ACCOUNT_PARENT_CLIENTS_IN_PROGRESS = 'العملاء تحت التنفيذ';
export const ACCOUNT_PARENT_REVENUE_IN_PROGRESS = 'ايرادات تحت التنفيذ';
export const ACCOUNT_PARENT_REVENUE_DONE = 'ايرادات تم تنفيذها';

export function clientRevenueAccountName(clientName: string): string {
  return `${ACCOUNT_PARENT_REVENUE_IN_PROGRESS} ${clientName.trim()}`;
}

export function clientDoneRevenueAccountName(clientName: string): string {
  return `${ACCOUNT_PARENT_REVENUE_DONE} ${clientName.trim()}`;
}
