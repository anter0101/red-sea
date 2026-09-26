import EmployeeForm from '@/features/employees/components/employee-form';

interface PageProps {
  params: Promise<{ branchesId: string; employeeId: string }>;
}

export default async function UpdateEmployeePage({ params }: PageProps) {
  const { branchesId, employeeId } = await params;
  const id = typeof employeeId === 'string' ? parseInt(employeeId) : null;

  return (
    <div className="pageContainer max-w-4xl mx-auto w-full">
      <EmployeeForm branchId={Number(branchesId)} employeeId={id} />
    </div>
  );
}
