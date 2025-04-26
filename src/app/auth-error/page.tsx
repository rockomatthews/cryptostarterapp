'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function ErrorDisplay() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-tr from-indigo-900 to-purple-900 text-white">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        
        <div className="mb-6">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="font-medium">Error code: {error || 'Unknown error'}</p>
          </div>
          
          <div className="space-y-3 text-sm">
            {error === 'OAuthSignin' && <p>Error starting the OAuth sign-in flow. Please try again.</p>}
            {error === 'OAuthCallback' && <p>Error in the OAuth callback. The authorization code or token might be invalid.</p>}
            {error === 'OAuthCreateAccount' && <p>Could not create user account in the database.</p>}
            {error === 'EmailCreateAccount' && <p>Could not create email user in the database.</p>}
            {error === 'Callback' && <p>Error in the OAuth callback. Check the server logs for more information.</p>}
            {error === 'OAuthAccountNotLinked' && <p>This email is already associated with another provider. Please sign in using the original provider.</p>}
            {error === 'EmailSignin' && <p>Error sending the email for sign-in. Please check your email address.</p>}
            {error === 'CredentialsSignin' && <p>The credentials you provided were invalid. Please try again.</p>}
            {error === 'SessionRequired' && <p>You must be signed in to access this page.</p>}
            {error === 'Default' && <p>An unspecified authentication error occurred. Please try again later.</p>}
            {!error && <p>An authentication error occurred. Please try again later or contact support if the issue persists.</p>}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm">
            <p>Check our troubleshooting guide or contact support if you continue having issues.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Link href="/login" className="flex-1 bg-white text-purple-900 px-4 py-2 rounded-lg font-medium text-center hover:bg-white/90 transition">
              Try Again
            </Link>
            <Link href="/" className="flex-1 border border-white/30 px-4 py-2 rounded-lg font-medium text-center hover:bg-white/10 transition">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-tr from-indigo-900 to-purple-900 text-white">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we retrieve error details...</p>
        </div>
      </div>
    }>
      <ErrorDisplay />
    </Suspense>
  );
} 