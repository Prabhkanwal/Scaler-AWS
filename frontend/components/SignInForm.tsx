'use client';
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [userType, setUserType] = useState<'root' | 'iam'>('root');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setError('');
      setStep('password');
    }
  };

  const handleNotYou = () => {
    setError('');
    setStep('email');
    setEmail('');
    setPassword('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
        credentials: 'include',
      });
      if (response.ok) {
        router.push('/');
      } else if (response.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('An unexpected error occurred.');
      }
    } catch (err) {
      setError('Network error. Backend might be unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'password') {
    return (
      <form onSubmit={handleSignIn} className="bg-white border border-[#d5dbdb] rounded-lg shadow-sm p-6 w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-[22px] font-bold text-[#111111]">Root user sign in</h1>
          <Info size={18} className="text-[#0073bb] cursor-pointer" />
        </div>

        <p className="text-[13px] text-[#111111] mb-6">
          Enter the password for <br />
          <span className="font-bold uppercase">{email || "GUPTAVAIBHAVG2005@GMAIL.COM"}</span>{' '}
          <button type="button" onClick={handleNotYou} className="text-[#0073bb] hover:underline font-bold">(not you?)</button>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#d91515] rounded text-[#d91515] text-[13px]">
            {error}
          </div>
        )}

        <div className="mb-2">
          <label className="block text-[13px] text-[#111111] font-bold mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-1.5 border border-cs-border-control rounded text-[14px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-colors shadow-inner"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 rounded border-gray-300 text-[#0073bb] focus:ring-[#0073bb]"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <span className="text-[13px] text-[#111111]">Show password</span>
          </label>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 rounded-full text-[14px] transition-colors border border-transparent mb-4 disabled:opacity-50">
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={handleNotYou}
          className="w-full bg-white hover:bg-[#fafafa] text-[#0073bb] font-bold py-1.5 rounded-full text-[14px] transition-colors border border-cs-border-control shadow-sm mb-4"
        >
          Sign in to a different account
        </button>

        <div className="text-center">
          <a href="/signup" className="text-[#0073bb] text-[13px] font-bold hover:underline">
            Create a new AWS account
          </a>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleNext} className="bg-white border border-[#d5dbdb] rounded-lg shadow-sm p-6 w-full max-w-[400px]">
      <h1 className="text-[22px] font-bold text-[#111111] mb-2">Sign In</h1>
      <p className="text-[13px] text-[#545b64] mb-6">Access your AWS account by user type.</p>

      <div className="mb-4">
        <label className="block text-[13px] text-[#111111] font-bold mb-2">
          User type <span className="font-normal text-[#545b64]">(not sure?)</span>
        </label>

        <div className="flex flex-col gap-2">
          {/* Root user option */}
          <label
            className={`flex items-start p-3 border rounded cursor-pointer transition-colors ${userType === 'root' ? 'border-[#0073bb] bg-[#f2f8fd]' : 'border-[#d5dbdb] hover:border-cs-border-control'
              }`}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="userType"
                value="root"
                className="w-4 h-4 text-[#0073bb] focus:ring-[#0073bb] border-gray-300"
                checked={userType === 'root'}
                onChange={() => setUserType('root')}
              />
            </div>
            <div className="ml-2">
              <span className="block text-[14px] text-[#111111]">Root user</span>
              <span className="block text-[12px] text-[#545b64]">Account owner that performs tasks requiring unrestricted access.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] text-[#111111] font-bold mb-1">
          Email address or Username
        </label>
        <input
          type="text"
          placeholder="username@example.com or admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-1.5 border border-cs-border-control rounded text-[14px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-colors shadow-inner"
        />
      </div>

      <button type="submit" className="w-full bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 rounded-full text-[14px] transition-colors border border-transparent mb-4">
        Next
      </button>

      <div className="relative flex py-4 items-center mb-2">
        <div className="flex-grow border-t border-[#d5dbdb]"></div>
        <span className="flex-shrink-0 mx-4 text-[#545b64] text-[12px] font-bold">OR</span>
        <div className="flex-grow border-t border-[#d5dbdb]"></div>
      </div>

      <button type="button" onClick={() => router.push('/signup')} className="w-full bg-white hover:bg-[#fafafa] text-[#0073bb] font-bold py-1.5 rounded-full text-[14px] transition-colors border border-cs-border-control shadow-sm">
        New to AWS? Sign up
      </button>
    </form>
  );
}
