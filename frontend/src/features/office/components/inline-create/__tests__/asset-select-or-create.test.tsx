import { FormProvider, useForm } from 'react-hook-form';

import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({
  useTranslations: () => (k: string) => {
    const map: Record<string, string> = {
      'tabs.select': 'Select',
      'tabs.create': 'Create',
      'form.selectPlaceholder': 'Select',
    };
    return map[k] ?? k;
  },
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="tabs" {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <button role="tab" data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('@/components/common/select-with-actions', () => ({
  __esModule: true,
  default: () => <div data-testid="select-with-actions" />,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: React.PropsWithChildren) => <label>{children}</label>,
}));

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import AssetSelectOrCreate from '../asset-select-or-create';

function Harness({ isNolon }: { isNolon: boolean }) {
  const form = useForm({ defaultValues: { carId: '', carInline: undefined } });
  return (
    <FormProvider {...form}>
      <AssetSelectOrCreate
        form={form}
        label="Car"
        isNolon={isNolon}
        idField="carId"
        inlineField="carInline"
        items={[{ id: '1', name: 'Car One' }]}
        createFields={[
          { name: 'plateNumber', label: 'Plate Number' },
          { name: 'plateLetters', label: 'Plate Letters' },
        ]}
      />
    </FormProvider>
  );
}

function PlateHarness({ onForm }: { onForm: (form: UseFormReturn) => void }) {
  const form = useForm();
  onForm(form);
  return (
    <AssetSelectOrCreate
      form={form}
      label="Trailer"
      isNolon
      idField="trailerId"
      inlineField="trailerInline"
      items={[]}
      createFields={[
        { name: 'plateLetters', label: 'Plate Letters', type: 'plate-letters' },
        { name: 'plateNumber', label: 'Plate Number', type: 'plate-number' },
      ]}
    />
  );
}

describe('AssetSelectOrCreate', () => {
  it('renders plate fields as RTL boxes and stores letters spaced for the API', () => {
    let form!: UseFormReturn;
    render(<PlateHarness onForm={(f) => (form = f)} />);
    const boxes = screen.getAllByRole('textbox');
    expect(boxes).toHaveLength(7);
    expect(boxes[0].parentElement).toHaveAttribute('dir', 'rtl');

    fireEvent.change(boxes[0], { target: { value: 'ن' } });
    fireEvent.change(boxes[1], { target: { value: 'ل' } });
    fireEvent.change(boxes[3], { target: { value: '9' } });
    expect(form.getValues('trailerInline.plateLetters')).toBe('ن ل');
    expect(form.getValues('trailerInline.plateNumber')).toBe('9');
  });

  it('shows the Select and Create tabs in NOLON mode', () => {
    render(<Harness isNolon />);
    expect(screen.getByRole('tab', { name: 'Select' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Create' })).toBeInTheDocument();
  });

  it('shows no tabs (plain select only) outside NOLON', () => {
    render(<Harness isNolon={false} />);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
