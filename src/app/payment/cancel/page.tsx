import { Suspense } from 'react';
import PaymentCancelContent from './PaymentCancelContent';

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
} 