'use client';

import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  type?: 'letters' | 'numbers';
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  dir?: 'ltr' | 'rtl';
}

const ARABIC_INDIC_ZERO = 0x0660;
const ARABIC_INDIC_NINE = 0x0669;

/** Arabic-Indic digits (٠-٩) become 0-9 so an Arabic keyboard works too. */
const normalizeChar = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_NINE) {
    return String(code - ARABIC_INDIC_ZERO);
  }
  return char;
};

/**
 * One box per character. The value is always compact ("1234", "نلن") and
 * fills from the first box, which sits on the right when dir is rtl.
 */
export default function PlateInput({
  value = '',
  onChange,
  length = 3,
  type = 'letters',
  placeholder = '',
  disabled = false,
  error = false,
  dir = 'rtl',
}: PlateInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Set while we move focus ourselves, so handleFocus does not redirect it
  // before the new value has rendered.
  const programmaticFocus = useRef<number | null>(null);

  const compactValue = value.replace(/\s+/g, '').slice(0, length);
  const chars = compactValue.split('');
  const values = Array.from({ length }, (_, i) => chars[i] ?? '');
  const firstEmpty = Math.min(chars.length, length - 1);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const isValidChar = (char: string): boolean => {
    if (type === 'numbers') {
      return /^[0-9]$/.test(char);
    }
    return /^[ء-ي]$/.test(char);
  };

  const focusBox = (index: number) => {
    programmaticFocus.current = index;
    inputRefs.current[index]?.focus();
    programmaticFocus.current = null;
  };

  const removeAt = (index: number) => {
    const next = [...chars];
    next.splice(index, 1);
    onChange(next.join(''));
  };

  const handleChange = (index: number, newValue: string) => {
    if (!newValue) {
      if (index < chars.length) {
        removeAt(index);
      }
      return;
    }

    const char = normalizeChar(newValue.slice(-1));
    if (!isValidChar(char)) {
      return;
    }

    // Never leave a gap: a box past the typed text writes into the first empty box.
    const target = Math.min(index, chars.length);
    const next = [...chars];
    next[target] = char;
    onChange(next.join(''));

    if (target < length - 1) {
      focusBox(target + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const towardStart = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const towardEnd = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (values[index]) {
        removeAt(index);
      } else if (index > 0) {
        removeAt(index - 1);
        focusBox(index - 1);
      }
    } else if (e.key === towardStart) {
      e.preventDefault();
      if (index > 0) {
        focusBox(index - 1);
      }
    } else if (e.key === towardEnd) {
      e.preventDefault();
      if (index < firstEmpty) {
        focusBox(index + 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .split('')
      .map(normalizeChar)
      .filter(isValidChar)
      .slice(0, length);

    onChange(pasted.join(''));
    focusBox(Math.min(pasted.length, length - 1));
  };

  const handleFocus = (index: number) => {
    if (programmaticFocus.current !== index && index > firstEmpty) {
      focusBox(firstEmpty);
      return;
    }
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2" dir={dir}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          dir={dir}
          inputMode={type === 'numbers' ? 'numeric' : 'text'}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={`${index + 1}`}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold',
            error && 'border-red-500 focus-visible:ring-red-500',
          )}
          maxLength={2}
        />
      ))}
    </div>
  );
}
