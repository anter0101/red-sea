import EmployeeForm from '@/features/employees/components/employee-form';

interface PageProps {
  params: Promise<{ branchesId: string }>;
}

export default async function CreateEmployeePage({ params }: PageProps) {
  const { branchesId } = await params;

  return (
    <div className="pageContainer max-w-4xl mx-auto w-full">
      <EmployeeForm branchId={Number(branchesId)} />
    </div>
  );
}
