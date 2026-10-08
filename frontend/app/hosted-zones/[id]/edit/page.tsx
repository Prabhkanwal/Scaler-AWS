'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarContext';
import InfoPanel from '@/components/InfoPanel';
import FlashMessage from '@/components/FlashMessage';
import { Menu, ChevronRight } from 'lucide-react';

interface HostedZone {
  id: number;
  name: string;
  comment: string | null;
  type: 'public' | 'private';
  created_at: string;
  record_count?: number;
}

export default function EditHostedZone({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [description, setDescription] = useState('');

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
          try {
            const recRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${id}/records`, { credentials: 'include' });
            if (recRes.ok) {
              const recData = await recRes.json();
              data.record_count = recData.total !== undefined ? recData.total : (recData.items?.length || 0);
            } else {
              data.record_count = 0;
            }
          } catch (e) {
            data.record_count = 0;
          }
          setZone(data);
          setDescription(data.comment || '');
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

    if (description.length > 256) {
      setError('Description cannot exceed 256 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: zone.name,
          type: zone.type,
          comment: description.trim() || null
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Hosted zone updated successfully.');
        setTimeout(() => {
          router.push(`/hosted-zones/${id}`);
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to update hosted zone.');
      }
    } catch (err) {
      setError('Network failure: Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInfoPanel = () => {
    switch (activeInfoPanel) {
      case 'edit-hosted-zone':
        return (
          <InfoPanel 
            title="Edit hosted zone" 
            onClose={() => setActiveInfoPanel(null)}
          >
            <p>A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.</p>
          </InfoPanel>
        );
      case 'description':
        return (
          <InfoPanel title="Description - optional" onClose={() => setActiveInfoPanel(null)}>
            <p>A description of the hosted zone.</p>
          </InfoPanel>
        );
      case 'tags':
        return (
          <InfoPanel title="Tags" onClose={() => setActiveInfoPanel(null)}>
            <p>Apply tags to hosted zones to help organize and identify them.</p>
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
        <span className="text-gray-400">Edit</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-8 max-w-[1000px]">
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-cs-text-body text-[22px] font-bold tracking-tight">Edit {zone.name}</h1>
            <span 
              className="text-[#3ea1fc] text-[13px] font-bold cursor-pointer hover:underline"
              onClick={() => setActiveInfoPanel('edit-hosted-zone')}
            >
              Info
            </span>
          </div>

          {error && <FlashMessage type="error" message={error} onDismiss={() => setError('')} />}
          {success && <FlashMessage type="success" message={success} onDismiss={() => setSuccess('')} />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">

            {/* Main Card */}
            <div className="bg-cs-bg-container border border-cs-border-divider rounded-lg p-6">
              <h2 className="text-cs-text-body text-[16px] font-bold mb-1">Edit hosted zone</h2>
              <p className="text-cs-text-body text-[13px] mb-6">A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.</p>

              <div className="flex flex-col gap-6">
                
                {/* Domain name (Read-only) */}
                <div>
                  <label className="block text-cs-text-body text-[13px] font-bold mb-1">Domain name</label>
                  <p className="text-cs-text-body text-[13px]">{zone.name}</p>
                </div>

                {/* Hosted zone ID (Read-only) */}
                <div>
                  <label className="block text-cs-text-body text-[13px] font-bold mb-1">Hosted zone ID</label>
                  <p className="text-cs-text-body text-[13px]">{zone.id}</p>
                </div>

                {/* Record count (Read-only) */}
                <div>
                  <label className="block text-cs-text-body text-[13px] font-bold mb-1">Record count</label>
                  <p className="text-cs-text-body text-[13px]">{zone.record_count}</p>
                </div>

                {/* Type (Read-only) */}
                <div>
                  <label className="block text-cs-text-body text-[13px] font-bold mb-1">Type</label>
                  <p className="text-cs-text-body text-[13px]">{zone.type === 'public' ? 'Public hosted zone' : 'Private hosted zone'}</p>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-cs-text-body text-[13px] font-bold mb-1">
                    Description - <span className="font-normal italic text-gray-400">optional</span>
                    <span 
                      className="text-[#3ea1fc] font-normal cursor-pointer hover:underline"
                      onClick={() => setActiveInfoPanel('description')}
                    >
                      Info
                    </span>
                  </label>
                  <p className="text-cs-text-body text-[13px] mb-2">This value lets you distinguish hosted zones that have the same name.</p>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={256}
                    className="w-full bg-cs-bg-container border border-[#545b64] focus:border-[#3ea1fc] focus:outline-none text-cs-text-body text-[13px] rounded p-3 min-h-[80px]"
                  />
                  <div className="text-cs-text-body text-[12px] mt-1">
                    The description can have up to 256 characters. {description.length}/256
                  </div>
                </div>

              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-cs-bg-container border border-cs-border-divider rounded-lg p-6">
              <h2 className="flex items-center gap-2 text-cs-text-body text-[16px] font-bold mb-1">
                Tags
                <span 
                  className="text-[#3ea1fc] text-[13px] font-bold cursor-pointer hover:underline"
                  onClick={() => setActiveInfoPanel('tags')}
                >
                  Info
                </span>
              </h2>
              <p className="text-cs-text-body text-[13px] mb-4">Apply tags to hosted zones to help organize and identify them.</p>
              
              <p className="text-cs-text-body text-[13px] mb-4">No tags associated with the resource.</p>
              
              <button 
                type="button" 
                className="bg-cs-bg-container border border-[#545b64] hover:bg-[#2c384a] hover:text-white dark:hover:bg-[#2c384a] text-cs-text-body font-bold py-1.5 px-4 rounded-full text-[13px] transition-colors"
                onClick={() => {}}
              >
                Add tag
              </button>
              <p className="text-gray-400 text-[12px] mt-2">You can add up to 50 more tags.</p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-4 border-t border-cs-border-divider pt-6">
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
                Save changes
              </button>
            </div>
          </form>
        </main>
      </div>

      {renderInfoPanel()}
    </div>
  );
}
