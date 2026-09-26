import { ExampleMultiStepForm } from '@/features/drivers/components/form-stepper';

interface PageProps {
  params: Promise<{ driverId: string }>;
}

const page = async ({ params }: PageProps) => {
  const { driverId } = await params;
  const id = typeof driverId === 'string' ? parseInt(driverId) : null;

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <ExampleMultiStepForm id={id} />
    </div>
  );
};

export default page;
