'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useSidebar();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Global Resolver': true,
    'VPC Resolver': true,
    'Domains': true,
    'IP-based routing': true,
    'Traffic flow': true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isHostedZonesActive = pathname?.includes('/hosted-zones');

  if (!isSidebarOpen) return null;

  return (
    <div className="w-[240px] flex-shrink-0 bg-[#0f1b2a] flex flex-col min-h-[calc(100vh-84px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pl-5">
        <h2 className="text-white text-[18px] font-bold tracking-tight">Route 53</h2>
      </div>

      {/* Main Links */}
      <div className="flex flex-col text-[14px] font-medium">
        <a href="/" className="py-2 pl-5 text-gray-300 hover:text-white hover:bg-[#161d27]">Dashboard</a>
        <a href="/hosted-zones" className={`py-2 pl-5 font-bold border-l-[3px] ${isHostedZonesActive ? 'text-[#3ea1fc] border-[#3ea1fc] bg-[#161d27]' : 'text-gray-300 border-transparent hover:text-white hover:bg-[#161d27]'}`}>Hosted zones</a>
        <a href="#" className="py-2 pl-5 text-gray-300 hover:text-white hover:bg-[#161d27]">Health checks</a>
        <a href="#" className="py-2 pl-5 text-gray-300 hover:text-white hover:bg-[#161d27]">Profiles</a>
      </div>

      {/* Sections */}
      <div className="flex flex-col mt-2">
        <SidebarSection 
          title="Global Resolver" 
          isOpen={expandedSections['Global Resolver']} 
          onToggle={() => toggleSection('Global Resolver')}
        >
          <SidebarItem label="Global resolvers" isNew={true} />
          <SidebarItem label="Shared DNS views" isNew={true} />
        </SidebarSection>

        <SidebarSection 
          title="VPC Resolver" 
          isOpen={expandedSections['VPC Resolver']} 
          onToggle={() => toggleSection('VPC Resolver')}
        >
          <SidebarItem label="VPCs" />
          <SidebarItem label="Inbound endpoints" />
          <SidebarItem label="Outbound endpoints" />
          <SidebarItem label="Rules" />
          <SidebarItem label="Query logging" />
          <SidebarItem label="Outposts" />
        </SidebarSection>

        <SidebarSection 
          title="Domains" 
          isOpen={expandedSections['Domains']} 
          onToggle={() => toggleSection('Domains')}
        >
          <SidebarItem label="Registered domains" />
          <SidebarItem label="Requests" />
        </SidebarSection>

        <SidebarSection 
          title="IP-based routing" 
          isOpen={expandedSections['IP-based routing']} 
          onToggle={() => toggleSection('IP-based routing')}
        >
          <SidebarItem label="CIDR collections" />
        </SidebarSection>

        <SidebarSection 
          title="Traffic flow" 
          isOpen={expandedSections['Traffic flow']} 
          onToggle={() => toggleSection('Traffic flow')}
        >
          <SidebarItem label="Traffic policies" />
          <SidebarItem label="Policy records" />
        </SidebarSection>
      </div>

      {/* Divider */}
      <div className="mx-5 my-2 border-t border-[#2c384a]"></div>

      {/* External Links */}
      <div className="flex flex-col text-[14px] font-medium pb-6">
        <a href="#" className="py-2 pl-5 text-gray-300 hover:text-white hover:bg-[#161d27] flex items-center gap-1.5">
          DNS Firewall <ExternalLink size={14} className="opacity-80" />
        </a>
        <a href="#" className="py-2 pl-5 text-gray-300 hover:text-white hover:bg-[#161d27] flex items-center gap-1.5">
          Application Recovery Controller <ExternalLink size={14} className="opacity-80" />
        </a>
      </div>
    </div>
  );
}

function SidebarSection({ title, isOpen, onToggle, children }: any) {
  return (
    <div className="flex flex-col">
      <div 
        onClick={onToggle}
        className="flex items-center gap-1 py-1.5 pl-2 pr-4 cursor-pointer hover:bg-[#161d27] text-white font-bold text-[14px]"
      >
        <div className="w-4 flex items-center justify-center opacity-80">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {title}
      </div>
      {isOpen && (
        <div className="flex flex-col pb-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarItem({ label, isNew = false }: any) {
  return (
    <a href="#" className="py-1.5 pl-[30px] pr-4 text-[13px] text-gray-300 hover:text-white hover:bg-[#161d27] flex items-center gap-2">
      {label}
      {isNew && <span className="text-[#3ea1fc] font-bold text-[11px] tracking-wide">New</span>}
    </a>
  );
}
