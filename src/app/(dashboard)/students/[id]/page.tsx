import { Student360View } from '@/components/features/Student360View';

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Student360View studentId={id} />;
}
