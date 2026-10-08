'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarContext';
import InfoPanel from '@/components/InfoPanel';
import FlashMessage from '@/components/FlashMessage';
import { Menu, ChevronRight, X } from 'lucide-react';

export default function CreateHostedZone() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  // Form State
  const [domainName, setDomainName] = useState('');
  const [description, setDescription] = useState('');
  const [zoneType, setZoneType] = useState<'public' | 'private'>('public');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeInfoPanel, setActiveInfoPanel] = useState<string | null>(null);

  // Auth State
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
    return <div className="min-h-screen bg-[#161d27] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!domainName.trim()) {
      setError('Domain name is required.');
      return;
    }

    if (description.length > 256) {
      setError('Description cannot exceed 256 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: domainName.trim(),
          type: zoneType,
          comment: description.trim() || null
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Hosted zone created successfully.');
        setTimeout(() => {
          router.push('/hosted-zones');
        }, 1500);
      } else if (response.status === 400) {
        const data = await response.json();
        setError(data.detail || 'A hosted zone with this name already exists.');
      } else if (response.status === 401) {
        router.push('/signin');
      } else if (response.status === 422) {
        setError('Invalid input data provided.');
      } else {
        setError('An unexpected server error occurred.');
      }
    } catch (err) {
      setError('Network failure: Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInfoPanel = () => {
    switch (activeInfoPanel) {
      case 'create-hosted-zone':
        return (
          <InfoPanel 
            title="Create hosted zone" 
            onClose={() => setActiveInfoPanel(null)}
            learnMoreLinks={[{ label: 'Working with hosted zones', href: '#' }]}
          >
            <p className="mb-3">A hosted zone is a container that holds information about how you want to route traffic on the internet for a specific domain, such as example.com, and its subdomains (acme.example.com, zenith.example.com).</p>
            <p>You create a hosted zone for a domain and then you create records to tell the Domain Name System (DNS) how you want traffic to be routed for that domain.</p>
          </InfoPanel>
        );
      case 'domain-name':
        return (
          <InfoPanel 
            title="Domain name" 
            onClose={() => setActiveInfoPanel(null)}
            learnMoreLinks={[
              { label: 'Working with public hosted zones', href: '#' },
              { label: 'Working with private hosted zones', href: '#' }
            ]}
          >
            <p className="mb-3">Enter the name of the domain that you want to route traffic for. Note the following:</p>
            <ul className="list-disc pl-5 mt-3 space-y-3">
              <li>You can't change the name of a hosted zone after you create it.</li>
              <li>The name is not case-sensitive, so example.com is the same as EXAMPLE.COM.</li>
              <li>Except in rare cases, you don't specify the name of a subdomain, such as www.example.com.</li>
              <li>If the domain name contains characters other than a-z, 0-9, and - (hyphen), see DNS domain name format.</li>
            </ul>
          </InfoPanel>
        );
      case 'description':
        return (
          <InfoPanel title="Description - optional" onClose={() => setActiveInfoPanel(null)}>
            <p>A description of the hosted zone.</p>
          </InfoPanel>
        );
      case 'type':
        return (
          <InfoPanel title="Type" onClose={() => setActiveInfoPanel(null)}>
             <p className="mb-3">The type of hosted zone determines where the traffic is routed.</p>
             <ul className="list-disc pl-5 mt-3 space-y-3">
              <li><strong>Public hosted zone:</strong> routes traffic on the internet.</li>
              <li><strong>Private hosted zone:</strong> routes traffic within Amazon VPCs.</li>
            </ul>
          </InfoPanel>
        );
      case 'tags':
        return (
          <InfoPanel title="Tags" onClose={() => setActiveInfoPanel(null)}>
             <p>A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value, both of which you define.</p>
             <p className="mt-3">You can use tags to search and filter your resources or track your AWS costs.</p>
          </InfoPanel>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#161d27] flex flex-col font-sans">
      <TopNav />

      {/* Breadcrumb Bar */}
      <div className="h-10 border-b border-[#2c384a] flex items-center px-4 w-full bg-[#161d27] text-[13px]">
        <button onClick={toggleSidebar} className="text-[#3ea1fc] bg-[#3ea1fc]/10 p-1 rounded hover:bg-[#3ea1fc]/20 mr-4 transition-colors">
          <Menu size={18} />
        </button>
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/')}>Route 53</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/hosted-zones')}>Hosted zones</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-gray-400">Create hosted zone</span>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-[1000px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-end gap-3 mb-6">
          <h1 className="text-white text-3xl font-bold tracking-tight">Create hosted zone</h1>
          <span className="text-[#3ea1fc] text-sm font-bold cursor-pointer hover:underline pb-1" onClick={() => setActiveInfoPanel('create-hosted-zone')}>Info</span>
        </div>

        {/* Global Error / Success Toast */}
        {error && (
          <FlashMessage type="error" message={error} onDismiss={() => setError('')} />
        )}
        {success && (
          <FlashMessage type="success" message={success} onDismiss={() => setSuccess('')} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">

          {/* Main Card */}
          <div className="bg-[#161d27] border border-[#2c384a] rounded-lg p-6">
            <h2 className="text-white text-[18px] font-bold mb-2">Hosted zone configuration</h2>
            <p className="text-white text-[13px] mb-6">
              A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
            </p>

            {/* Domain Name */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-white text-[14px] font-bold">Domain name</label>
                <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('domain-name')}>Info</span>
              </div>
              <p className="text-white text-[12px] mb-2">This is the name of the domain that you want to route traffic for.</p>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="example.com"
                required
                className="w-full lg:w-[60%] px-3 py-1.5 bg-[#0f1b2a] border border-[#545b64] rounded text-[14px] text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors shadow-inner"
              />
              <p className="text-white text-[11px] mt-1.5">
                {'Valid characters: a-z, 0-9, ! " # $ % & \' ( ) * + , - / : ; < = > ? @ [ \\ ] ^ _ ` { | } . ~'}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <label className="text-white text-[14px] font-bold">Description - optional</label>
                <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('description')}>Info</span>
              </div>
              <p className="text-white text-[12px] mb-2">This value lets you distinguish hosted zones that have the same name.</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The hosted zone is used for..."
                maxLength={256}
                rows={3}
                className="w-full px-3 py-2 bg-[#0f1b2a] border border-[#545b64] rounded text-[14px] text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors shadow-inner resize-y"
              />
              <p className="text-white text-[11px] mt-1.5">
                The description can have up to 256 characters. {description.length}/256
              </p>
            </div>

            {/* Type */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-white text-[14px] font-bold">Type</label>
                <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('type')}>Info</span>
              </div>
              <p className="text-white text-[12px] mb-3">The type indicates whether you want to route traffic on the internet or in an Amazon VPC.</p>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Public Radio */}
                <label className={`flex-1 relative p-4 rounded-lg cursor-pointer border-[1.5px] transition-colors ${zoneType === 'public' ? 'border-[#3ea1fc] bg-[#0f1b2a]/60' : 'border-[#545b64] hover:border-gray-400'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center ${zoneType === 'public' ? 'border-[#3ea1fc]' : 'border-[#545b64]'}`}>
                        {zoneType === 'public' && <div className="w-2 h-2 rounded-full bg-[#3ea1fc]" />}
                      </div>
                      <input
                        type="radio"
                        name="zoneType"
                        value="public"
                        checked={zoneType === 'public'}
                        onChange={() => setZoneType('public')}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[14px] mb-1">Public hosted zone</h3>
                      <p className="text-white text-[12px] leading-relaxed pr-4">A public hosted zone determines how traffic is routed on the internet.</p>
                    </div>
                  </div>
                </label>

                {/* Private Radio */}
                <label className={`flex-1 relative p-4 rounded-lg cursor-pointer border-[1.5px] transition-colors ${zoneType === 'private' ? 'border-[#3ea1fc] bg-[#0f1b2a]/60' : 'border-[#545b64] hover:border-gray-400'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center ${zoneType === 'private' ? 'border-[#3ea1fc]' : 'border-[#545b64]'}`}>
                        {zoneType === 'private' && <div className="w-2 h-2 rounded-full bg-[#3ea1fc]" />}
                      </div>
                      <input
                        type="radio"
                        name="zoneType"
                        value="private"
                        checked={zoneType === 'private'}
                        onChange={() => setZoneType('private')}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-[14px] mb-1">Private hosted zone</h3>
                      <p className="text-white text-[12px] leading-relaxed pr-4">A private hosted zone determines how traffic is routed within an Amazon VPC.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-[#161d27] border border-[#2c384a] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-white text-[18px] font-bold">Tags</h2>
              <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('tags')}>Info</span>
            </div>
            <p className="text-white text-[13px] mb-6">Apply tags to hosted zones to help organize and identify them.</p>

            <p className="text-white text-[13px] font-bold mb-4">No tags associated with the resource.</p>

            <button type="button" className="bg-transparent border-[1.5px] border-[#3ea1fc] text-white hover:bg-[#3ea1fc]/10 font-bold py-1.5 px-4 rounded-full text-[13px] transition-colors mb-3">
              Add tag
            </button>
            <p className="text-white text-[11px]">You can add up to 50 more tags.</p>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => router.push('/hosted-zones')}
              className="text-[#3ea1fc] hover:underline font-bold text-[14px] px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 px-6 rounded-full text-[14px] transition-colors border border-transparent disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create hosted zone'}
            </button>
          </div>
        </form>
        </main>
        
        {/* Right Info Panel */}
        {renderInfoPanel()}
      </div>
    </div>
  );
}
