import { safeString } from './generic-helpers';

export type FieldMap<T> = {
  label: string;
  getValue: (source: T) => unknown;
};

export const mapToInfoItems = <T>(source: T | null | undefined, fields: FieldMap<T>[]) => {
  return fields.map((field) => ({
    label: field.label,
    value: source ? safeString(field.getValue(source)) : '-',
  }));
};
