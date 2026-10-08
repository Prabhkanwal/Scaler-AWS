'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarContext';
import InfoPanel from '@/components/InfoPanel';
import FlashMessage from '@/components/FlashMessage';
import { Menu, ChevronRight, ChevronDown } from 'lucide-react';

interface HostedZone {
  id: number;
  name: string;
  comment: string | null;
  type: 'public' | 'private';
  created_at: string;
  record_count?: number;
}

export default function CreateRecord({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  const [zone, setZone] = useState<HostedZone | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('A');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState(300);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeInfoPanel, setActiveInfoPanel] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchZone = async () => {
      try {
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: 'include',
        });
        if (authRes.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/signin');
          return;
        }

        const zoneRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${id}`, {
          credentials: 'include'
        });
        if (zoneRes.ok) {
          const data = await zoneRes.json();
          setZone(data);
        } else {
          router.push('/hosted-zones');
        }
      } catch (e) {
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndFetchZone();
  }, [id, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-cs-bg-layout flex items-center justify-center text-cs-text-body">Loading...</div>;
  }

  if (!isAuthenticated || !zone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsSubmitting(true);
    try {
      // Create a single record according to the backend schema
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${id}/records/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          ttl: parseInt(ttl.toString(), 10),
          value: value.trim()
        }),
        credentials: 'include'
      });

      if (res.ok) {
        setSuccess('Record created successfully.');
        setTimeout(() => {
          router.push(`/hosted-zones/${id}`);
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to create record.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInfoPanel = () => {
    switch (activeInfoPanel) {
      case 'create-record':
        return (
          <InfoPanel title="Create record" onClose={() => setActiveInfoPanel(null)}>
            <p>Records define where you want to route traffic for a domain or subdomain.</p>
          </InfoPanel>
        );
      case 'record-name':
        return (
          <InfoPanel title="Record name" onClose={() => setActiveInfoPanel(null)}>
            <p>Enter the name of the subdomain that you want to route traffic for. Keep blank to create a record for the root domain.</p>
          </InfoPanel>
        );
      case 'record-type':
        return (
          <InfoPanel title="Record type" onClose={() => setActiveInfoPanel(null)}>
            <p>The DNS record type. For example, choose A to route traffic to an IPv4 address.</p>
          </InfoPanel>
        );
      case 'value':
        return (
          <InfoPanel title="Value" onClose={() => setActiveInfoPanel(null)}>
            <p>The value corresponding to the record type. For A records, this is an IPv4 address.</p>
          </InfoPanel>
        );
      case 'ttl':
        return (
          <InfoPanel title="TTL (seconds)" onClose={() => setActiveInfoPanel(null)}>
            <p>The amount of time, in seconds, that you want DNS resolvers to cache the information in this record.</p>
          </InfoPanel>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cs-bg-layout flex flex-col font-sans">
      <TopNav />

      {/* Breadcrumb Bar */}
      <div className="h-10 border-b border-cs-border-divider flex items-center px-4 w-full bg-cs-bg-layout text-[13px]">
        <button onClick={toggleSidebar} className="text-[#3ea1fc] bg-[#3ea1fc]/10 p-1 rounded hover:bg-[#3ea1fc]/20 mr-4 transition-colors">
          <Menu size={18} />
        </button>
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/')}>Route 53</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/hosted-zones')}>Hosted zones</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push(`/hosted-zones/${id}`)}>{zone.name}</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-gray-400">Create record</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-8 max-w-[1200px]">
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-cs-text-body text-[22px] font-bold tracking-tight">Create record</h1>
            <span
              className="text-[#3ea1fc] text-[13px] font-bold cursor-pointer hover:underline"
              onClick={() => setActiveInfoPanel('create-record')}
            >
              Info
            </span>
          </div>

          {error && <FlashMessage type="error" message={error} onDismiss={() => setError('')} />}
          {success && <FlashMessage type="success" message={success} onDismiss={() => setSuccess('')} />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">

            {/* Quick create record Card */}
            <div className="bg-cs-bg-container border border-cs-border-divider rounded-lg">

              <div className="flex items-center justify-between p-4 border-b border-cs-border-divider bg-cs-bg-container rounded-t-lg">
                <h2 className="text-cs-text-body text-[16px] font-bold">Quick create record</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ChevronDown size={14} className="text-cs-text-body" />
                  <h3 className="text-cs-text-body font-bold text-[14px]">Record 1</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Record Name */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-cs-text-body text-[14px] font-bold">Record name</label>
                        <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('record-name')}>Info</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="subdomain"
                          className="flex-1 bg-cs-bg-container border border-cs-border-control rounded p-2 text-cs-text-body text-[13px] focus:outline-none focus:border-[#3ea1fc]"
                        />
                        <span className="text-cs-text-body text-[13px]">.{zone.name}</span>
                      </div>
                      <p className="text-cs-text-body text-[12px] mt-1">Keep blank to create a record for the root domain.</p>
                    </div>
                  </div>

                  {/* Record Type */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-cs-text-body text-[14px] font-bold">Record type</label>
                        <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('record-type')}>Info</span>
                      </div>
                      <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="w-full bg-cs-bg-container border border-cs-border-control rounded p-2 text-cs-text-body text-[13px] focus:outline-none focus:border-[#3ea1fc]"
                      >
                        {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'PTR', 'SRV', 'CAA'].map(t => (
                          <option key={t} value={t}>{t} - Routes traffic to specific resources</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-cs-text-body text-[14px] font-bold">Value</label>
                    <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('value')}>Info</span>
                  </div>
                  <textarea
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    required
                    placeholder="192.0.2.235"
                    className="w-full bg-cs-bg-container border border-cs-border-control rounded p-2 text-cs-text-body text-[13px] min-h-[100px] focus:outline-none focus:border-[#3ea1fc]"
                  />
                  <p className="text-cs-text-body text-[12px] mt-1">Enter multiple values on separate lines.</p>
                </div>

                {/* TTL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-cs-text-body text-[14px] font-bold">TTL (seconds)</label>
                      <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('ttl')}>Info</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={ttl}
                        onChange={e => setTtl(parseInt(e.target.value) || 0)}
                        required
                        className="w-full bg-cs-bg-container border border-cs-border-control rounded p-2 text-cs-text-body text-[13px] focus:outline-none focus:border-[#3ea1fc]"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setTtl(60)} className="px-3 py-1 bg-cs-bg-container border border-[#3ea1fc] text-[#3ea1fc] rounded-full text-[13px] hover:bg-[#3ea1fc]/10 font-bold">1m</button>
                        <button type="button" onClick={() => setTtl(3600)} className="px-3 py-1 bg-cs-bg-container border border-[#3ea1fc] text-[#3ea1fc] rounded-full text-[13px] hover:bg-[#3ea1fc]/10 font-bold">1h</button>
                        <button type="button" onClick={() => setTtl(86400)} className="px-3 py-1 bg-cs-bg-container border border-[#3ea1fc] text-[#3ea1fc] rounded-full text-[13px] hover:bg-[#3ea1fc]/10 font-bold">1d</button>
                      </div>
                    </div>
                    <p className="text-cs-text-body text-[12px] mt-1">Recommended values: 60 to 172800 (two days)</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => router.push(`/hosted-zones/${id}`)}
                className="text-[#3ea1fc] hover:underline text-[13px] font-bold px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 px-4 rounded-full text-[13px] transition-colors disabled:opacity-50"
              >
                Create records
              </button>
            </div>
          </form>
        </main>
      </div>

      {renderInfoPanel()}
    </div>
  );
}
