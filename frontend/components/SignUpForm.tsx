'use client';
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'password'>('details');
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Signup is coming soon. Backend registration is currently not supported. Please use the login page with the mock user.');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Signup is coming soon. Backend registration is currently not supported. Please use the login page with the mock user.');
  };

  if (step === 'password') {
    return (
      <form onSubmit={handleSignUp} className="bg-white border-l border-[#d5dbdb]/50 p-8 pt-10 w-full max-w-[480px]">
        <h1 className="text-[22px] font-bold text-[#111111] mb-6">Create a password</h1>
        
        <p className="text-[13px] text-[#111111] mb-6">
          Setting up password for <strong>{email}</strong>
        </p>
        
        <div className="mb-6">
          <label className="block text-[13px] text-[#111111] font-bold mb-1">
            Password
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-1.5 border border-cs-border-control rounded text-[14px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-colors shadow-inner"
          />
        </div>

        <button type="submit" className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 rounded-full text-[14px] transition-colors border border-transparent mb-6">
          Sign up
        </button>
        
        <button 
          type="button" 
          onClick={() => setStep('details')}
          className="w-full bg-white hover:bg-[#fafafa] text-[#0073bb] font-bold py-1.5 rounded-full text-[14px] transition-colors border border-[#0073bb] shadow-sm mb-6"
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleNext} className="bg-white border-l border-[#d5dbdb]/50 p-8 pt-10 w-full max-w-[480px]">
      <h1 className="text-[22px] font-bold text-[#111111] mb-6">Sign up for AWS</h1>
      
      <div className="mb-6">
        <label className="block text-[13px] text-[#111111] font-bold mb-1">
          Root user email address
        </label>
        <p className="text-[12px] text-[#545b64] mb-2 leading-tight">
          Used for account recovery and as described in the <br />
          <a href="#" className="text-[#0073bb] hover:underline font-bold inline-flex items-center gap-1">
            AWS Privacy Notice <ExternalLink size={10} />
          </a>
        </p>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-1.5 border border-cs-border-control rounded text-[14px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-colors shadow-inner"
        />
      </div>

      <div className="mb-6">
        <label className="block text-[13px] text-[#111111] font-bold mb-1">
          AWS account name
        </label>
        <p className="text-[12px] text-[#545b64] mb-2 leading-tight">
          Choose a name for your account. You can change this<br />
          name in your account settings after you sign up.
        </p>
        <input 
          type="text" 
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
          className="w-full px-3 py-1.5 border border-cs-border-control rounded text-[14px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-colors shadow-inner"
        />
      </div>

      <button type="submit" className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 rounded-full text-[14px] transition-colors border border-transparent mb-6">
        Verify email address
      </button>

      <div className="relative flex items-center mb-6">
        <div className="flex-grow border-t border-[#d5dbdb]"></div>
        <span className="flex-shrink-0 mx-4 text-[#545b64] text-[12px] font-bold">OR</span>
        <div className="flex-grow border-t border-[#d5dbdb]"></div>
      </div>

      <button type="button" onClick={() => router.push('/signin')} className="w-full bg-white hover:bg-[#fafafa] text-[#0073bb] font-bold py-1.5 rounded-full text-[14px] transition-colors border border-[#0073bb] shadow-sm mb-6">
        Sign in to an existing AWS account
      </button>

      <p className="text-[12px] text-[#545b64] leading-relaxed">
        This site uses essential cookies. See our <a href="#" className="text-[#0073bb] hover:underline inline-flex items-center gap-1">Cookie<br />Notice <ExternalLink size={10} /></a> for more information.
      </p>
    </form>
  );
}
