import { TrailerFormWizard } from '@/features/trailers/components/form-wizard';

interface PageProps {
  params: Promise<{ trailerId: string }>;
  searchParams: Promise<{ step?: string }>;
}

const UpdateTrailerPage = async ({ params, searchParams }: PageProps) => {
  const { trailerId } = await params;
  const { step } = await searchParams;
  const id = typeof trailerId === 'string' ? parseInt(trailerId) : null;
  const stepNumber = typeof step === 'string' ? Number(step) : null;

  return (
    <div>
      <TrailerFormWizard id={id} step={stepNumber} />
    </div>
  );
};

export default UpdateTrailerPage;
