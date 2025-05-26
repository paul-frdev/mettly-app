import { ClientDetails } from '@/components/clients/ClientDetails';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  return <ClientDetails clientId={params.id} />;
} 