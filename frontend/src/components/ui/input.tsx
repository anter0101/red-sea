import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'>;

const INPUT_CLASS =
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

const toText = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '';
  if (Number(value) === 0) return '';
  return String(value);
};

/**
 * Numeric field shown as a text box with − / + steppers.
 * - Empty stays empty (no forced "0" on the left).
 * - Leading zeros are dropped as the user types ("05" → "5").
 * - Still reports a string event so existing `Number(e.target.value)` handlers keep working.
 */
function NumberStepperInput({
  className,
  value,
  onChange,
  onBlur,
  name,
  id,
  min,
  max,
  step = 1,
  disabled,
  placeholder,
  readOnly,
}: InputProps) {
  const [text, setText] = React.useState(() => toText(value));

  // Sync from the form only when the outside value really differs from what is typed.
  React.useEffect(() => {
    const typed = text === '' ? 0 : Number(text);
    const external = value === undefined || value === null || value === '' ? 0 : Number(value);
    if (typed !== external) setText(toText(value));
  }, [value, text]);

  const emit = (raw: string) => {
    setText(raw);
    onChange?.({ target: { value: raw, name } } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleTyped = (raw: string) => {
    if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
    emit(raw.replace(/^(-?)0+(?=\d)/, '$1'));
  };

  const bump = (direction: 1 | -1) => {
    let next = (text === '' ? 0 : Number(text)) + direction * Number(step);
    if (max !== undefined && max !== '' && next > Number(max)) next = Number(max);
    if (min !== undefined && min !== '' && next < Number(min)) next = Number(min);
    emit(String(next));
  };

  const stepperClass =
    'text-muted-foreground hover:text-foreground flex h-full w-8 shrink-0 items-center justify-center text-lg disabled:opacity-40';

  return (
    <div
      className={cn(
        'border-input dark:bg-input/30 flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent shadow-xs',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        className={stepperClass}
        onClick={() => bump(-1)}
        disabled={disabled || readOnly}
        aria-label="decrease"
      >
        −
      </button>
      <input
        id={id}
        name={name}
        type="text"
        inputMode={Number.isInteger(Number(step)) ? 'numeric' : 'decimal'}
        dir="ltr"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onBlur={onBlur}
        onChange={(e) => handleTyped(e.target.value)}
        className="placeholder:text-muted-foreground h-full w-full min-w-0 bg-transparent px-1 text-center text-base outline-none md:text-sm"
      />
      <button
        type="button"
        tabIndex={-1}
        className={stepperClass}
        onClick={() => bump(1)}
        disabled={disabled || readOnly}
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

function Input({ className, type, ...props }: InputProps) {
  if (type === 'number') {
    return <NumberStepperInput className={className} {...props} />;
  }

  return <input type={type} data-slot="input" className={cn(INPUT_CLASS, className)} {...props} />;
}

export { Input };
