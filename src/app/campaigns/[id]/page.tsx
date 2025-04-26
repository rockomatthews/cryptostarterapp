import { Suspense } from 'react';
import CampaignClientPage from './client-page';

// Simple server component that resolves params and passes them to client component
export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<div>Loading campaign...</div>}>
      <CampaignClientPage id={resolvedParams.id} />
    </Suspense>
  );
} 