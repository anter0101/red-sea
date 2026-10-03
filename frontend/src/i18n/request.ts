import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Load messages with proper namespace structure
  const [
    commonMessages,
    authMessages,
    driversMessages,
    carsMessages,
    trailersMessages,
    employeesMessages,
    driverAssistantsMessages,
    clientsMessages,
    branchesMessages,
    partnersMessages,
    suppliersMessages,
    accountingMessages,
    officeMessages,
    custodyMessages,
    officeRequestsMessages,
    physicalAttachmentsMessages,
    tripsMessages,
    invoicesMessages,
    maintenanceMessages,
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/drivers.json`),
    import(`../../messages/${locale}/cars.json`),
    import(`../../messages/${locale}/trailers.json`),
    import(`../../messages/${locale}/employees.json`),
    import(`../../messages/${locale}/driver-assistants.json`),
    import(`../../messages/${locale}/clients.json`),
    import(`../../messages/${locale}/branches.json`),
    import(`../../messages/${locale}/partners.json`),
    import(`../../messages/${locale}/suppliers.json`),
    import(`../../messages/${locale}/accounting.json`),
    import(`../../messages/${locale}/office.json`),
    import(`../../messages/${locale}/custody.json`),
    import(`../../messages/${locale}/office-requests.json`),
    import(`../../messages/${locale}/physical-attachments.json`),
    import(`../../messages/${locale}/trips.json`),
    import(`../../messages/${locale}/invoices.json`),
    import(`../../messages/${locale}/maintenance.json`),
  ]);

  return {
    locale,
    messages: {
      common: commonMessages.default,
      auth: authMessages.default,
      drivers: driversMessages.default,
      cars: carsMessages.default,
      trailers: trailersMessages.default,
      employees: employeesMessages.default,
      driverAssistants: driverAssistantsMessages.default,
      clients: clientsMessages.default,
      branches: branchesMessages.default,
      partners: partnersMessages.default,
      suppliers: suppliersMessages.default,
      accounting: accountingMessages.default,
      office: officeMessages.default,
      custody: custodyMessages.default,
      officeRequests: officeRequestsMessages.default,
      physicalAttachments: physicalAttachmentsMessages.default,
      trips: tripsMessages.default,
      invoices: invoicesMessages.default,
      maintenance: maintenanceMessages.default,
    },
  };
});
