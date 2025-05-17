import { use } from 'react';
import { ClientDetails } from '@/components/clients/ClientDetails';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = use(Promise.resolve(params.id));
  return <ClientDetails clientId={clientId} />;
} 