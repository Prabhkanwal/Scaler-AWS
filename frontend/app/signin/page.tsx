import React from 'react';
import SignInForm from '@/components/SignInForm';
import PromoBanner from '@/components/PromoBanner';
import AwsLogo from '@/components/AwsLogo';

export default function SignInPage() {
  return (
    <div className="flex-1 flex flex-col items-center">

      {/* Top Header Navigation */}
      <header className="w-full flex justify-end items-center px-6 py-4 text-[#0073bb] text-[13px] font-bold gap-6">

      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-[1000px] mt-8 px-4">

        {/* AWS Logo */}
        <div className="flex justify-center mb-8">
          <AwsLogo width={65} color="white" />
        </div>

        {/* Two Column Container */}
        <div className="flex flex-col md:flex-row items-stretch gap-0 bg-transparent rounded-lg w-full mb-16 relative z-10 mx-auto justify-center">

          {/* Left Column - Form Container */}
          <div className="flex-1 md:flex-none flex justify-end min-w-[400px]">
            <SignInForm />
          </div>

          {/* Right Column - Promo Banner */}
          <PromoBanner />

        </div>
      </main>
    </div>
  );
}
