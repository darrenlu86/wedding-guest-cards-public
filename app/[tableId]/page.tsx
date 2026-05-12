import VerificationForm from '@/components/VerificationForm';
import { validateTableId } from '@/lib/validation';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    tableId: string;
  }>;
}

export default async function TableVerificationPage({ params }: PageProps) {
  const { tableId } = await params;

  // 驗證桌號格式
  const validation = validateTableId(tableId);
  if (!validation.isValid) {
    redirect('/');
  }

  return <VerificationForm tableId={tableId} />;
}
