import { render, screen } from '@testing-library/react';
import ChoiceCard from '../choice-card';

describe('ChoiceCard', () => {
  it('renders its title', () => {
    render(<ChoiceCard title="اصدار تفويض" href="/office/issue-delegation" />);
    expect(screen.getByText('اصدار تفويض')).toBeInTheDocument();
  });

  it('links to the given href', () => {
    render(<ChoiceCard title="x" href="/office/issue-delegation" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/office/issue-delegation');
  });
});
