import { fireEvent, render, screen } from '@testing-library/react';

import { Input } from '../input';

describe('Input (text)', () => {
  it('renders a plain text input', () => {
    render(<Input placeholder="name" />);
    expect(screen.getByPlaceholderText('name').tagName).toBe('INPUT');
  });
});

describe('Input (type="number") as a text field', () => {
  it('shows an empty box for 0 and an empty value', () => {
    render(<Input type="number" placeholder="year" value={0} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('year')).toHaveValue('');
  });

  it('shows the value when it is set', () => {
    render(<Input type="number" placeholder="year" value={2020} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('year')).toHaveValue('2020');
  });

  it('renders no increment or decrement buttons', () => {
    render(<Input type="number" placeholder="year" value={1} onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'increase' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'decrease' })).toBeNull();
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

  it('clamps to max on blur', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="n" value="" max={5} onChange={onChange} />);
    const field = screen.getByPlaceholderText('n');
    fireEvent.change(field, { target: { value: '9' } });
    fireEvent.blur(field);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '5' }) }));
  });

  it('clamps to min on blur', () => {
    const onChange = jest.fn();
    render(<Input type="number" placeholder="n" value="" min={1} onChange={onChange} />);
    const field = screen.getByPlaceholderText('n');
    fireEvent.change(field, { target: { value: '0' } });
    fireEvent.blur(field);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: '1' }) }));
  });

  it('is disabled when disabled', () => {
    render(<Input type="number" placeholder="n" value={1} disabled onChange={() => {}} />);
    expect(screen.getByPlaceholderText('n')).toBeDisabled();
  });
});
