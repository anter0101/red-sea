import { render, screen } from '@testing-library/react';
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
import VehicleModeSelection from '../vehicle-mode-selection';

describe('VehicleModeSelection', () => {
  it('renders three mode cards linking to each mode route', () => {
    render(<VehicleModeSelection />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/office/nolon-car', '/office/contract-car', '/office/company-car']),
    );
  });
});
