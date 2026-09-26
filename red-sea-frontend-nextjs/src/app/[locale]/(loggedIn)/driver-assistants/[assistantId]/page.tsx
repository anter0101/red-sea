import DriverAssistantPageClient from '@/features/driver-assistants/components/driver-assistant-page-client';

export default async function DriverAssistantPage({
  params,
}: {
  params: Promise<{ assistantId: string }>;
}) {
  const { assistantId } = await params;

  return <DriverAssistantPageClient assistantId={assistantId} />;
}
