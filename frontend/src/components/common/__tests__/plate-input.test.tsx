import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import PlateInput from '../plate-input';

type HarnessProps = {
  initial?: string;
  dir?: 'rtl' | 'ltr';
};

function Harness({ initial = '', dir = 'rtl' }: HarnessProps) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PlateInput value={value} onChange={setValue} length={4} type="numbers" dir={dir} />
      <output data-testid="value">{value}</output>
    </>
  );
}

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];
const value = () => screen.getByTestId('value').textContent;

describe('PlateInput', () => {
  it('lays the boxes out right to left', () => {
    render(<Harness />);
    expect(boxes()[0]).toHaveAttribute('dir', 'rtl');
    expect(boxes()[0].parentElement).toHaveAttribute('dir', 'rtl');
  });

  it('fills from the first box and moves focus to the next', () => {
    render(<Harness />);
    fireEvent.change(boxes()[0], { target: { value: '1' } });
    expect(boxes()[1]).toHaveFocus();
    fireEvent.change(boxes()[1], { target: { value: '2' } });
    expect(value()).toBe('12');
    expect(boxes().map((b) => b.value)).toEqual(['1', '2', '', '']);
  });

  it('writes into the first empty box when a later box is typed in', () => {
    render(<Harness initial="1" />);
    fireEvent.change(boxes()[3], { target: { value: '7' } });
    expect(value()).toBe('17');
    expect(boxes().map((b) => b.value)).toEqual(['1', '7', '', '']);
  });

  it('moves focus to the first empty box when a later box is clicked', () => {
    render(<Harness initial="1" />);
    boxes()[3].focus();
    expect(boxes()[1]).toHaveFocus();
  });

  it('turns Arabic-Indic digits into 0-9', () => {
    render(<Harness />);
    fireEvent.change(boxes()[0], { target: { value: '٥' } });
    expect(value()).toBe('5');
  });

  it('ignores characters of the wrong kind', () => {
    render(<Harness />);
    fireEvent.change(boxes()[0], { target: { value: 'a' } });
    expect(value()).toBe('');
  });

  it('Backspace on an empty box deletes the previous character', () => {
    render(<Harness initial="12" />);
    fireEvent.keyDown(boxes()[2], { key: 'Backspace' });
    expect(value()).toBe('1');
    expect(boxes()[1]).toHaveFocus();
  });

  it.each([
    ['rtl', 'ArrowLeft', 'ArrowRight'],
    ['ltr', 'ArrowRight', 'ArrowLeft'],
  ] as const)('in %s, %s moves forward and %s moves back', (dir, forward, back) => {
    render(<Harness initial="123" dir={dir} />);
    boxes()[1].focus();
    fireEvent.keyDown(boxes()[1], { key: forward });
    expect(boxes()[2]).toHaveFocus();
    fireEvent.keyDown(boxes()[2], { key: back });
    expect(boxes()[1]).toHaveFocus();
  });

  it('pastes a whole plate', () => {
    render(<Harness />);
    fireEvent.paste(boxes()[0], { clipboardData: { getData: () => '98x76' } });
    expect(value()).toBe('9876');
  });
});
