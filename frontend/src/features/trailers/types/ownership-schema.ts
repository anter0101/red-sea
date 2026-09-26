import { z } from 'zod';

import { OwnerShipTypes } from '@/enums/ownership';

const MAX_PERCENTAGE = 100;

export const TrailerOwnershipTypeSchema = (t: (key: string) => string) =>
  z.object({
    ownerShip: z.nativeEnum(OwnerShipTypes, {
      message: t('validation.ownership-required'),
    }),
  });

export type ITrailerOwnershipTypeValues = z.infer<
  ReturnType<typeof TrailerOwnershipTypeSchema>
>;

export const TrailerContractOwnerSchema = (t: (key: string) => string) =>
  z.object({
    singleOwnerId: z.number({
      error: t('validation.owner-required'),
    }),
  });

export type ITrailerContractOwnerValues = z.infer<
  ReturnType<typeof TrailerContractOwnerSchema>
>;

export const PartnerEntrySchema = (t: (key: string) => string) =>
  z.object({
    partnerId: z.number().optional(),
    partnerName: z.string().optional(),
    percentage: z
      .number()
      .min(0)
      .max(MAX_PERCENTAGE, { message: t('validation.percentage-exceeds-100') }),
    contractUrl: z.string().optional(),
    notes: z.string().optional(),
    isNew: z.boolean().optional(),
  });

export const TrailerSharePartnersSchema = (t: (key: string) => string) =>
  z
    .object({
      partners: z.array(PartnerEntrySchema(t)).min(1, {
        message: t('validation.minimum-partners'),
      }),
    })
    .refine(
      (data) => {
        const totalPercentage = data.partners.reduce((sum, p) => sum + (p.percentage || 0), 0);
        return totalPercentage === MAX_PERCENTAGE;
      },
      {
        message: t('validation.percentage-must-equal-100'),
        path: ['partners'],
      },
    )
    .refine(
      (data) => {
        const partnerIds = data.partners.map((p) => p.partnerId).filter((id) => id !== undefined);
        const uniqueIds = new Set(partnerIds);
        return partnerIds.length === uniqueIds.size;
      },
      {
        message: t('validation.duplicate-partner'),
        path: ['partners'],
      },
    );

export type ITrailerSharePartnersValues = z.infer<
  ReturnType<typeof TrailerSharePartnersSchema>
>;

/** @deprecated Use TrailerSharePartnersSchema for SHARE-only partner step */
export const TrailerOwnershipFormSchema = TrailerSharePartnersSchema;

export type ITrailerOwnershipFormValues = ITrailerSharePartnersValues;

export type IPartnerEntry = z.infer<ReturnType<typeof PartnerEntrySchema>>;
