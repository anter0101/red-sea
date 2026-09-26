import EmployeePageClient from '@/features/employees/components/employee-page-client';

interface PageProps {
  params: Promise<{ branchesId: string; employeeId: string }>;
}

export default async function EmployeePage({ params }: PageProps) {
  const { branchesId, employeeId } = await params;

  return <EmployeePageClient branchId={branchesId} employeeId={employeeId} />;
}
