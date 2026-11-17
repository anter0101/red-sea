import { fireEvent, render, screen } from '@testing-library/react';

import { Input } from '../input';

describe('Input (text)', () => {
  it('renders a plain text input', () => {
    render(<Input placeholder="name" />);
    expect(screen.getByPlaceholderText('name').tagName).toBe('INPUT');
  });
});

describe('Input (type="number") stepper', () => {
  it('shows an empty box for 0 and an empty value', () => {
    render(<Input type="number" placeholder="year" value={0} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('year')).toHaveValue('');
  });

  it('shows the value when it is set', () => {
    render(<Input type="number" placeholder="year" value={2020} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('year')).toHaveValue('2020');
  });

  it('drops leading zeros as the user types', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="year" value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('year'), { target: { value: '05' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '5' }) }));
  });

  it('ignores non-numeric input', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="year" value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('year'), { target: { value: 'abc' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps decimals and a leading minus', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="amount" value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('amount'), { target: { value: '-1.5' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '-1.5' }) }));
  });

  it('increments and decrements by step', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="year" value={2020} step={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'increase' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '2021' }) }));
    fireEvent.click(screen.getByRole('button', { name: 'decrease' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '2019' }) }));
  });

  it('respects min and max when stepping', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="n" value={5} min={0} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'increase' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '5' }) }));
  });

  it('starts from zero when the box is empty', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="n" value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'increase' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '1' }) }));
  });

  it('disables the steppers when disabled', () => {
    render(<Input type="number" placeholder="n" value={1} disabled onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'increase' })).toBeDisabled();
  });
});
