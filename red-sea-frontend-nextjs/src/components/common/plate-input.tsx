'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';

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

  const compactValue = value.replace(/\s+/g, '');
  const values = compactValue.split('').concat(Array(length).fill('')).slice(0, length);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const isValidChar = (char: string): boolean => {
    if (type === 'numbers') {
      return /^[0-9]$/.test(char);
    } else {
      // Arabic letters
      return /^[\u0621-\u064A]$/.test(char);
    }
  };

  const handleChange = (index: number, newValue: string) => {
    if (!newValue) {
      // Handle deletion
      const newValues = [...values];
      newValues[index] = '';
      onChange(newValues.join('').trim());
      return;
    }

    // Get the last character entered
    const char = newValue.slice(-1);

    if (!isValidChar(char)) {
      return;
    }

    const newValues = [...values];
    newValues[index] = char;
    onChange(newValues.join('').trim());

    // Move to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // If current input is empty, move to previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValues = [...values];
        newValues[index] = '';
        onChange(newValues.join('').trim());
      }
    } else if (e.key === 'ArrowLeft') {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    const chars = pastedData.split('').filter(isValidChar);

    const newValues = [...values];
    chars.forEach((char, i) => {
      if (i < length) {
        newValues[i] = char;
      }
    });

    onChange(newValues.join('').trim());

    // Focus the next empty input or the last one
    const nextEmptyIndex = chars.length < length ? chars.length : length - 1;
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  const handleFocus = (index: number) => {
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
          inputMode={type === 'numbers' ? 'numeric' : 'text'}
          value={values[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold',
            error && 'border-red-500 focus-visible:ring-red-500',
          )}
          maxLength={1}
        />
      ))}
    </div>
  );
}
