import React from 'react';
import Link from 'next/link';
import AwsLogo from '@/components/AwsLogo';

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col items-center min-h-screen bg-white">
      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-[900px] mt-20 px-4 pb-20 items-center">
        {/* AWS Logo */}
        <div className="flex justify-center mb-10">
          <AwsLogo width={65} color="white" />
        </div>

        <div className="bg-white border border-[#d5dbdb] rounded-lg p-10 max-w-[500px] w-full text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#111111] mb-4">Sign Up is Coming Soon</h1>
          <p className="text-[#545b64] mb-8 text-[14px]">
            The sign up functionality is currently under development and will be available in a future update.
          </p>
          <Link 
            href="/signin"
            className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-2 px-6 rounded-full text-[14px] transition-colors border border-transparent inline-block"
          >
            Return to Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
