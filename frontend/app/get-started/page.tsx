'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import { Menu, ChevronRight } from 'lucide-react';

const Shield53 = ({ className = "w-12 h-12", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <text x="12" y="15.5" textAnchor="middle" fill={color} stroke="none" fontSize="8" fontWeight="bold" fontFamily="sans-serif">53</text>
  </svg>
);

const RegisterDomainSVG = () => (
  <div className="flex items-center gap-2">
    <Shield53 className="w-14 h-14 text-white" />
    <div className="flex flex-col gap-1.5 w-12">
      <div className="border-t-[1.5px] border-dashed border-[#3ea1fc] w-full" />
      <div className="border-t-[1.5px] border-dashed border-[#3ea1fc] w-full opacity-60" />
      <div className="border-t-[1.5px] border-dashed border-[#3ea1fc] w-full" />
    </div>
    <div className="relative">
      <svg className="w-16 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20" />
        <circle cx="6" cy="6" r="0.5" fill="currentColor" />
        <circle cx="8" cy="6" r="0.5" fill="currentColor" />
        <circle cx="10" cy="6" r="0.5" fill="currentColor" />
        <path d="M14 13a2 2 0 0 0-2-2 2.5 2.5 0 0 0-4.5 1.5 1.5 1.5 0 0 0 1.5 1.5h5a1 1 0 0 0 0-2" />
      </svg>
      <svg className="w-6 h-6 text-cs-text-link absolute -bottom-2 -right-2 drop-shadow-md" viewBox="0 0 24 24" fill="#0f1b2a" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>
    </div>
  </div>
);

const TransferDomainSVG = () => (
  <div className="flex items-center gap-2">
    <svg className="w-8 h-6 text-cs-text-body" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
    </svg>
    <div className="border-t-[1.5px] border-dashed border-[#3ea1fc] w-6" />
    <Shield53 className="w-12 h-12 text-white" />
    <div className="border-t-[1.5px] border-dashed border-[#3ea1fc] w-6" />
    <div className="relative">
      <svg className="w-8 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20" />
      </svg>
      <svg className="w-4 h-4 text-cs-text-link absolute -bottom-1 -right-2 drop-shadow-md" viewBox="0 0 24 24" fill="#0f1b2a" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      </svg>
    </div>
  </div>
);

const CreateHostedZonesSVG = () => (
  <div className="relative w-36 h-20 flex items-center justify-center">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 80">
      <path d="M 40 25 C 70 10, 100 25 100 25" stroke="#3b82f6" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 40 25 L 72 40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 100 25 L 72 40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 115 50 L 72 40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 100 25 C 115 35, 115 50 115 50" stroke="#3b82f6" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
    <div className="absolute top-1 left-4"><Shield53 className="w-8 h-8 text-cs-text-body" /></div>
    <div className="absolute top-1 right-8"><Shield53 className="w-8 h-8 text-cs-text-body" /></div>
    <div className="absolute top-10 right-2"><Shield53 className="w-8 h-8 text-cs-text-body" /></div>

    <div className="z-10 bg-cs-bg-container rounded-full p-0.5"><Shield53 className="w-12 h-12 text-white" /></div>
  </div>
);

const ConfigureHealthChecksSVG = () => (
  <div className="flex items-center w-full justify-center">
    <svg className="w-16 h-10 text-cs-text-link" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 10 h15 l3 -6 l6 12 l3 -6 h15" />
    </svg>
    <Shield53 className="w-12 h-12 text-white -mx-2 z-10 bg-cs-bg-container rounded-full" />
    <svg className="w-16 h-10 text-cs-text-link" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 10 h15 l3 -6 l6 12 l3 -6 h15" />
    </svg>
  </div>
);

const ConfigureTrafficFlowSVG = () => (
  <div className="relative w-32 h-20 flex items-center">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 80">
      <path d="M 30 40 C 50 40, 50 20, 70 20" stroke="#3b82f6" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 30 40 C 50 40, 50 35, 70 35" stroke="#3b82f6" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 30 40 C 50 40, 50 50, 70 50" stroke="#3b82f6" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 30 40 C 50 40, 50 65, 70 65" stroke="#3b82f6" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />

      <path d="M 75 20 L 110 10" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 75 20 L 110 20" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 75 35 L 110 30" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 75 35 L 110 40" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
    <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-cs-bg-container rounded-full">
      <Shield53 className="w-10 h-10 text-white" />
    </div>
    <div className="absolute left-[65px] top-1/2 -translate-y-1/2 flex flex-col gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#3ea1fc] bg-cs-bg-container" />
      ))}
    </div>
    <div className="absolute left-[105px] top-1/2 -translate-y-1/2 flex flex-col gap-[3px]">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full border-[1.5px] border-white bg-cs-bg-container" />
      ))}
    </div>
  </div>
);

const ConfigureResolversSVG = () => (
  <div className="flex items-center gap-2">
    <svg className="w-8 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <rect x="6" y="8" width="2" height="2" fill="currentColor" />
      <rect x="6" y="15" width="2" height="2" fill="currentColor" />
    </svg>

    <div className="flex flex-col -space-y-2 text-cs-text-link text-[10px]">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M15 7l5 5-5 5" /></svg>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M9 7l-5 5 5 5" /></svg>
    </div>

    <Shield53 className="w-12 h-12 text-white" />

    <div className="flex flex-col -space-y-2 text-cs-text-link text-[10px]">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M15 7l5 5-5 5" /></svg>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M9 7l-5 5 5 5" /></svg>
    </div>

    <svg className="w-12 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.5 19C19.985 19 22 16.985 22 14.5C22 12.181 20.252 10.274 18.01 10.038C17.447 6.618 14.475 4 10.875 4C6.91 4 3.696 7.203 3.696 11.168C3.696 11.458 3.714 11.745 3.749 12.025C1.656 12.756 0.125 14.73 0.125 17.062C0.125 19.79 2.335 22 5.062 22H17.5V19Z" />
      <path d="M12 11l-2.5 1.5v3c0 2 2.5 3.5 2.5 3.5s2.5-1.5 2.5-3.5v-3L12 11z" />
    </svg>
  </div>
);

const options = [
  {
    id: 'register-domain',
    title: 'Register a domain',
    description: 'Register the name, such as example.com, that your users use to access your application.',
    svg: <RegisterDomainSVG />
  },
  {
    id: 'transfer-domain',
    title: 'Transfer domain',
    description: 'You can transfer domain names to Route 53 that you registered with another domain registrar.',
    svg: <TransferDomainSVG />
  },
  {
    id: 'create-hosted-zones',
    title: 'Create hosted zones',
    description: 'A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.',
    svg: <CreateHostedZonesSVG />
  },
  {
    id: 'configure-health-checks',
    title: 'Configure health checks',
    description: 'Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.',
    svg: <ConfigureHealthChecksSVG />
  },
  {
    id: 'configure-traffic-flow',
    title: 'Configure traffic flow',
    description: 'A visual tool that lets you easily create policies for multiple endpoints in complex configurations.',
    svg: <ConfigureTrafficFlowSVG />
  },
  {
    id: 'configure-resolvers',
    title: 'Configure resolvers',
    description: 'A regional service that lets you route DNS queries between your VPCs and your network.',
    svg: <ConfigureResolversSVG />
  }
];

export default function GetStartedPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('register-domain');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/signin');
        }
      } catch (error) {
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-cs-bg-layout flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  const handleGetStarted = () => {
    if (selectedOption === 'create-hosted-zones') {
      router.push('/hosted-zones/create');
    } else {
      setShowComingSoon(true);
    }
  };

  return (
    <div className="min-h-screen bg-cs-bg-layout flex flex-col font-sans">
      <TopNav />

      {/* Breadcrumb Bar */}
      <div className="h-10 border-b border-cs-border-divider flex items-center px-4 w-full bg-cs-bg-layout text-[13px]">
        <button className="text-gray-400 hover:text-white mr-4 transition-colors">
          <Menu size={18} />
        </button>
        <span className="text-cs-text-link cursor-pointer hover:underline font-bold" onClick={() => router.push('/')}>Route 53</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-gray-400">Get started</span>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-end gap-3 mb-6">
          <h1 className="text-white text-3xl font-bold tracking-tight">Get started</h1>
        </div>

        {/* Main Card Container */}
        <div className="bg-cs-bg-container border border-cs-border-divider rounded-lg p-6 mb-6">
          <h2 className="text-white text-[18px] font-bold mb-4">Choose your starting point</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`relative flex flex-col p-4 rounded-lg cursor-pointer border-[1.5px] ${isSelected ? 'border-[#3ea1fc] bg-cs-bg-layout/40' : 'border-cs-border-divider hover:border-gray-500'
                    } transition-colors min-h-[220px]`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center ${isSelected ? 'border-[#3ea1fc]' : 'border-gray-400'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[15px] mb-1 leading-tight">{opt.title}</h3>
                      <p className="text-cs-text-body text-[13px] leading-snug pr-4">{opt.description}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end justify-center mt-6 pb-2">
                    {opt.svg}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end items-center gap-4 mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-[#3ea1fc] hover:underline font-bold text-sm px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleGetStarted}
            className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 px-6 rounded-full text-[14px] transition-colors border border-transparent"
          >
            Get started
          </button>
        </div>
      </main>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-cs-bg-container border border-cs-border-divider rounded-lg p-6 max-w-[400px] w-full shadow-2xl">
            <h3 className="text-white text-[18px] font-bold mb-3 flex items-center gap-2">
              <span className="text-[#ff9900]">⚠️</span> Coming Soon
            </h3>
            <p className="text-cs-text-body text-[14px] mb-6 leading-relaxed">
              This feature is not available in this Route 53 clone yet. </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowComingSoon(false)}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-1.5 px-6 rounded-full text-[14px] transition-colors"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
