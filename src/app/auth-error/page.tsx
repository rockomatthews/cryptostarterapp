'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [authConfig, setAuthConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch auth configuration for debugging
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        setAuthConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching auth config:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Authentication Error</h1>
        
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-xl font-semibold mb-2">Error Details</h2>
          <p className="mb-1"><strong>Error Code:</strong> {error || 'Unknown'}</p>
          {error === 'Callback' && (
            <div className="mt-2 text-sm">
              <p>This typically indicates an issue with the OAuth callback configuration.</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Make sure your Google OAuth credentials are correctly configured.</li>
                <li>Verify that the correct callback URL is added to your Google OAuth settings.</li>
                <li>Check that environment variables are properly set in your deployment.</li>
              </ul>
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading configuration details...</p>
        ) : (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Auth Configuration</h2>
            <div className="bg-gray-50 p-4 rounded overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(authConfig, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link href="/login" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            Return to Login
          </Link>
          <Link href="/" className="block w-full text-center border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 