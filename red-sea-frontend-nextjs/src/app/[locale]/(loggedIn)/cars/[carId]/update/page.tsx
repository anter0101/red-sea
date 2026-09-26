import { CarFormWizard } from '@/features/cars/components/form-wizard';

export default async function UpdateCarPage({
  params,
  searchParams,
}: {
  params: Promise<{ carId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { carId } = await params;
  const { step } = await searchParams;

  const stepNumber = typeof step === 'string' ? Number(step) : null;

  return <CarFormWizard id={Number(carId)} step={stepNumber} />;
}
