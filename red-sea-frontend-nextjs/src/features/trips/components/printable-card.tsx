'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import redSeaLogo from '../../../../public/assets/icons/red-sea-logo.svg';
import { ITripResponse } from '../types/journey';
import { QrCode, QrCodeIcon } from 'lucide-react';

type Props = {
  data: ITripResponse;
};

export const PrintableCard = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { journey, client, driver, assistant, car, trailer, custodysource } = data || {};

  return (
    <Card ref={ref} className="p-4 shadow-none border ">
      {/* Header */}

      {/* Company + Date */}
      <div className="flex justify-between text-sm">
        {/* <Image src={redSeaLogo} alt="Red Sea" className="w-auto" /> */}
        <img src={redSeaLogo.src} alt="Red Sea" className="w-auto" />
        <div>
          <p className="font-semibold">{client?.name || '—'}</p>
          <p>كود الشركة: {client?.companyCode ?? '—'}</p>
          <p>التاريخ: {journey?.delegateDate || '—'}</p>
        </div>
      </div>

      {/* Title */}
      <h2 className=" text-center font-bold text-base">
        تفويض تحميل رقم : {journey?.delegateNumber || '—'}
      </h2>

      {/* Form Fields */}
      <div className="space-y-2">
        <Grid>
          <Field label="اسم السائق" value={driver?.name} />
          <Field label="رقم الرخصة / القومي" value={driver?.code} />
        </Grid>

        <Grid>
          <Field label="اسم مساعد السائق" value={assistant?.name} />
          <Field label="الرقم القومي" value={assistant?.code} />
        </Grid>

        <Grid>
          <Field label="سيارة رقم" value={car?.plate} />
          <Field label="مقطورة رقم" value={trailer?.plate} />
        </Grid>

        <Grid>
          <Field label="تحميل من" value={client?.name} />
          <Field label="إلى" value={journey?.direction} />
        </Grid>

        <Grid>
          <Field label="الكمية" value={`${journey?.quantity ?? '—'} طن`} />
          <Field label="رتبة الأسمنت" value={journey?.cementGrade} />
        </Grid>

        {/* <Grid>
          <Field label="نوع التعبئة" value={journey?.packingType} />
          <Field label="وقود (لتر)" value={journey?.fuelLiters?.toString()} />
        </Grid> */}

        {(journey?.receivedCompany || journey?.sellingOrderNo) && (
          <Grid>
            {journey?.receivedCompany && (
              <Field label="لتسليمها لشركة" value={journey.receivedCompany} />
            )}

            {journey?.sellingOrderNo && (
              <Field label="أمر بيع رقم" value={journey.sellingOrderNo.toString()} />
            )}
          </Grid>
        )}
      </div>

      {/* Footer */}
      <div className=" flex justify-between items-end border-t pt-4">
        <div>
          <p className="font-semibold">أحمد سيد</p>
          <p className="text-xs">مندوب الشركة</p>
        </div>

        <div className="text-xs text-left">
          <p>Email: h@procrew.pro</p>
          <p>0126746472</p>
        </div>
      </div>
    </Card>
  );
});

PrintableCard.displayName = 'PrintableCard';

/* =========================
   Helper Components
========================= */

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold">{label}</p>
      <div className="h-9 rounded-md bg-gray-100 px-3 flex items-center">{value || '—'}</div>
    </div>
  );
}
