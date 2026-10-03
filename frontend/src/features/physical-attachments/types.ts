import { z } from 'zod';

export type VehicleType = 'car' | 'trailer';

export interface IPhysicalAttachment {
  id: number;
  name: string;
  date: string;
  description?: string | null;
  photoUrl?: string | null;
  price?: number | string | null;
  confirmedOk?: boolean;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  createdAt?: string;
  createdBy?: string;
}

export interface IPhysicalAttachmentCheck {
  id: number;
  physicalAttachmentId: number;
  checked: boolean;
  recordedAt: string;
  recordedBy: string;
}

export interface ICreatePhysicalAttachmentPayload {
  name: string;
  date: string;
  description?: string;
  photoUrl?: string;
  price?: number;
  carId?: number;
  trailerId?: number;
}

export interface IUpdatePhysicalAttachmentPayload {
  name?: string;
  date?: string;
  description?: string;
  photoUrl?: string | null;
  price?: number | null;
  confirmedOk?: boolean;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
}

export const physicalAttachmentFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('validation.name-required')),
    date: z.string().min(1, t('validation.date-required')),
    description: z.string().optional(),
    price: z.string().optional(),
    photo: z.custom<File | string | undefined>().optional(),
  });

export type PhysicalAttachmentFormValues = z.infer<ReturnType<typeof physicalAttachmentFormSchema>>;
