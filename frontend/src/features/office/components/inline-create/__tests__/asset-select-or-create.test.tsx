import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';

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

describe('AssetSelectOrCreate', () => {
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
