'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ICreateDriverFormSchema } from '../types/create-schema';

export type CreateDriverSteps = 0 | 1 | 2; // 0: personal, 1: attachments, 2: salary
export const CREATE_DRIVER_STEPS = {
  PERSONAL: 0 as CreateDriverSteps,
  ATTACHMENTS: 1 as CreateDriverSteps,
  SALARY: 2 as CreateDriverSteps,
} as const;

const stepToPath: Record<CreateDriverSteps, string> = {
  0: '/drivers/create/personal-information',
  1: '/drivers/create/attachments',
  2: '/drivers/create/salary',
};

type DriverFormValues = Partial<ICreateDriverFormSchema>;

type CreateDriverState = {
  step: CreateDriverSteps;
  form: DriverFormValues;
  setForm: (values: Partial<DriverFormValues>) => void;
  goToStep: (step: CreateDriverSteps) => void;
  nextStep: () => void;
  prevStep: () => void;
  getPathForCurrent: () => string;
  getPathForStep: (step: CreateDriverSteps) => string;
  reset: () => void;
};

const initialState: Pick<CreateDriverState, 'step' | 'form'> = {
  step: 0,
  form: {},
};

export const useCreateDriverStore = create<CreateDriverState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setForm: (values) => set((state) => ({ form: { ...state.form, ...values } })),
      goToStep: (step) => set({ step }),
      nextStep: () =>
        set((state) => ({
          step: Math.min(state.step + 1, 2) as CreateDriverSteps,
        })),
      prevStep: () =>
        set((state) => ({
          step: Math.max(state.step - 1, 0) as CreateDriverSteps,
        })),
      getPathForCurrent: () => stepToPath[get().step],
      getPathForStep: (step) => stepToPath[step],
      reset: () => set(initialState),
    }),
    {
      name: 'create-driver-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const {
          drivingLicenseImage,
          nationalIdImage,
          criminalRecordCheckImage,
          securityClearanceImage,
          medicalInsuranceImage,
          socialInsuranceImage,
          militaryServiceStatusImage,
          ...rest
        } = state.form;
        // Files are not persisted in localStorage
        return { step: state.step, form: rest } as CreateDriverState;
      },
    },
  ),
);
