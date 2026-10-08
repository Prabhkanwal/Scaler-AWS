'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarContext';
import InfoPanel from '@/components/InfoPanel';
import FlashMessage from '@/components/FlashMessage';
import {
  Menu, ChevronRight, ChevronDown, Search, RefreshCw, X, AlertTriangle, Info, Play
} from 'lucide-react';

// --- Interfaces ---
interface HostedZone {
  id: number;
  name: string;
  type: 'public' | 'private';
  comment: string | null;
  created_at: string;
  updated_at: string | null;
}

interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: string;
  ttl: number;
  value: string;
  created_at: string;
  updated_at: string | null;
}

// --- Main Component ---
export default function HostedZoneDetails() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const zoneId = params.id as string;

  // State: Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State: Data
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);

  // State: Pagination & Filters
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // State: UI
  const [isLoadingZone, setIsLoadingZone] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('records');
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [activeInfoPanel, setActiveInfoPanel] = useState<string | null>(null);
  const [comingSoonModal, setComingSoonModal] = useState('');

  // State: Modals

  const [isDeleteZoneOpen, setIsDeleteZoneOpen] = useState(false);

  const [recordToEdit, setRecordToEdit] = useState<DNSRecord | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<DNSRecord[]>([]);
  const [recordsToDelete, setRecordsToDelete] = useState<DNSRecord[]>([]);

  // --- Effects ---

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/signin');
        }
      } catch {
        router.push('/signin');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch Zone
  const fetchZone = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingZone(true);
    setGlobalError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${zoneId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setZone(data);
      } else if (res.status === 404) {
        setGlobalError('Hosted zone not found.');
      } else if (res.status === 401) {
        router.push('/signin');
      } else {
        setGlobalError('Failed to load hosted zone details.');
      }
    } catch {
      setGlobalError('Network error while loading zone details.');
    } finally {
      setIsLoadingZone(false);
    }
  }, [zoneId, isAuthenticated, router]);

  useEffect(() => {
    fetchZone();
  }, [fetchZone]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Records
  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated || !zone) return;
    setIsLoadingRecords(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${zoneId}/records/`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', pageSize.toString());
      if (debouncedSearch) url.searchParams.append('search', debouncedSearch);
      if (typeFilter) url.searchParams.append('type', typeFilter);

      const res = await fetch(url.toString(), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.items);
        setTotalRecords(data.total);
        setTotalPages(data.total_pages);
      } else if (res.status === 401) {
        router.push('/signin');
      }
    } catch {
      setGlobalError('Network error while loading records.');
    } finally {
      setIsLoadingRecords(false);
    }
  }, [zoneId, isAuthenticated, zone, page, pageSize, debouncedSearch, typeFilter, router]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // --- Handlers ---

  const showSuccess = (msg: string) => {
    setGlobalSuccess(msg);
    setTimeout(() => setGlobalSuccess(''), 4000);
  };

  const handleRefreshRecords = () => {
    fetchRecords();
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-[#161d27] text-white flex items-center justify-center">Loading...</div>;
  }

  // --- Render Modals ---

  const renderComingSoonModal = () => {
    if (!comingSoonModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-cs-bg-container border border-[#2c384a] rounded shadow-xl p-6 max-w-sm w-full mx-4">
          <h2 className="text-white text-[16px] font-bold mb-2">Feature Unavailable</h2>
          <p className="text-white text-[13px] mb-6">
            The "{comingSoonModal}" feature is outside the scope of this assignment and has not been implemented.
          </p>
          <div className="flex justify-end">
            <button onClick={() => setComingSoonModal('')} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-1.5 px-4 rounded text-[13px]">
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    );
  };



  const renderDeleteZoneModal = () => {
    if (!isDeleteZoneOpen || !zone) return null;
    return <DeleteZoneModal zone={zone} onClose={() => setIsDeleteZoneOpen(false)} />;
  };



  const renderEditRecordModal = () => {
    if (!recordToEdit || !zone) return null;
    return <EditRecordModal record={recordToEdit} zoneId={zone.id} onClose={() => setRecordToEdit(null)} onSuccess={() => { setRecordToEdit(null); fetchRecords(); showSuccess('Record updated successfully.'); }} />;
  };

  const renderDeleteRecordModal = () => {
    if (recordsToDelete.length === 0 || !zone) return null;
    return <DeleteRecordModal records={recordsToDelete} zoneId={zone.id} onClose={() => setRecordsToDelete([])} onSuccess={() => { setRecordsToDelete([]); setSelectedRecords([]); fetchRecords(); showSuccess('Records deleted successfully.'); }} />;
  };

  return (
    <div className="min-h-screen bg-[#161d27] flex flex-col font-sans">
      <TopNav />

      {/* Breadcrumb */}
      <div className="h-10 flex items-center px-4 w-full bg-[#161d27] text-[13px] border-b border-[#2c384a]">
        <button onClick={toggleSidebar} className="text-[#3ea1fc] bg-[#3ea1fc]/10 p-1 rounded hover:bg-[#3ea1fc]/20 mr-4 transition-colors">
          <Menu size={18} />
        </button>
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/')}>Route 53</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/hosted-zones')}>Hosted zones</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-gray-400">{zone ? zone.name : 'Loading...'}</span>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto px-6 py-6 pb-20">

          {globalError && (
            <FlashMessage type="error" message={globalError} onDismiss={() => setGlobalError('')} />
          )}
          {globalSuccess && (
            <FlashMessage type="success" message={globalSuccess} onDismiss={() => setGlobalSuccess('')} />
          )}

          {isLoadingZone ? (
            <div className="text-white text-[14px]">Loading zone details...</div>
          ) : !zone ? (
            <div className="text-white text-[14px]">Zone not found.</div>
          ) : (
            <>
              {/* Header Area */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-0.5 rounded-full text-[12px] font-bold ${zone.type === 'public' ? 'bg-[#0073bb] text-white' : 'bg-[#e5e7eb]/20 text-gray-300'}`}>
                    {zone.type === 'public' ? 'Public' : 'Private'}
                  </span>
                  <h1 className="text-white text-[24px] font-bold tracking-tight">{zone.name}</h1>
                  <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline" onClick={() => setActiveInfoPanel('hosted-zone')}>Info</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsDeleteZoneOpen(true)} className="bg-transparent border border-[#3ea1fc] text-[#3ea1fc] hover:bg-[#3ea1fc]/10 font-bold py-1 px-4 rounded-full text-[13px] transition-colors">
                    Delete zone
                  </button>
                  <button onClick={() => setComingSoonModal('Test record')} className="bg-transparent border border-[#3ea1fc] text-[#3ea1fc] hover:bg-[#3ea1fc]/10 font-bold py-1 px-4 rounded-full text-[13px] transition-colors">
                    Test record
                  </button>
                  <button onClick={() => setComingSoonModal('Configure query logging')} className="bg-transparent border border-[#3ea1fc] text-[#3ea1fc] hover:bg-[#3ea1fc]/10 font-bold py-1 px-4 rounded-full text-[13px] transition-colors">
                    Configure query logging
                  </button>
                </div>
              </div>

              {/* Hosted Zone Details Card */}
              <div className="bg-cs-bg-container border border-[#2c384a] rounded-lg mb-6 overflow-hidden">
                <div className="flex justify-between items-center pr-4">
                  <button
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                    className="flex-1 flex items-center p-4 hover:bg-cs-border-divider/30 transition-colors focus:outline-none"
                  >
                    <div className={`mr-2 transition-transform ${detailsExpanded ? 'rotate-90' : ''}`}>
                      <Play fill="white" size={10} className="text-white" />
                    </div>
                    <h2 className="text-white text-[16px] font-bold">Hosted zone details</h2>
                  </button>
                  <button onClick={() => router.push(`/hosted-zones/${zone?.id}/edit`)} className="bg-transparent border border-[#3ea1fc] text-[#3ea1fc] hover:bg-[#3ea1fc]/10 font-bold py-1 px-4 rounded-full text-[13px] transition-colors whitespace-nowrap">
                    Edit hosted zone
                  </button>
                </div>

                {detailsExpanded && (
                  <div className="p-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-8 text-[13px]">
                      <div>
                        <p className="text-gray-400 mb-1">Hosted zone name</p>
                        <p className="text-white">{zone.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Description</p>
                        <p className="text-white">{zone.comment || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Hosted zone ID</p>
                        <p className="text-white">Z0{String(zone.id).padStart(13, 'A')}BCDEF</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Type</p>
                        <p className="text-white">{zone.type === 'public' ? 'Public' : 'Private'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Created by</p>
                        <p className="text-white">Route 53</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Record count</p>
                        <p className="text-white">{totalRecords}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#2c384a] mb-6 gap-6">
                <button
                  className={`pb-3 text-[14px] font-bold border-b-[3px] transition-colors ${activeTab === 'records' ? 'border-[#3ea1fc] text-cs-text-link' : 'border-transparent text-white hover:text-cs-text-link'}`}
                  onClick={() => setActiveTab('records')}
                >
                  Records ({totalRecords})
                </button>
                <button
                  className="pb-3 text-[14px] font-bold text-white hover:text-cs-text-link border-b-[3px] border-transparent"
                  onClick={() => setComingSoonModal('Accelerated recovery')}
                >
                  Accelerated recovery
                </button>
                <button
                  className="pb-3 text-[14px] font-bold text-white hover:text-cs-text-link border-b-[3px] border-transparent"
                  onClick={() => setComingSoonModal('DNSSEC signing')}
                >
                  DNSSEC signing
                </button>
                <button
                  className="pb-3 text-[14px] font-bold text-white hover:text-cs-text-link border-b-[3px] border-transparent"
                  onClick={() => setComingSoonModal('Hosted zone tags')}
                >
                  Hosted zone tags (0)
                </button>
              </div>

              {/* Records Section */}
              {activeTab === 'records' && (
                <div className="bg-cs-bg-container border border-[#2c384a] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-white text-[18px] font-bold">Records</h2>
                        <span className="text-white text-[18px]">({records.length})</span>
                        <span className="text-[#3ea1fc] text-[12px] font-bold cursor-pointer hover:underline mt-0.5" onClick={() => setActiveInfoPanel('records')}>Info</span>
                      </div>
                      <p className="text-white text-[13px]">
                        Automatic mode is the current search behavior optimized for best filter results. <span className="text-[#3ea1fc] hover:underline cursor-pointer">To change modes go to settings.</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleRefreshRecords} className="text-cs-text-link hover:text-white transition-colors" title="Refresh">
                        <RefreshCw size={20} className={isLoadingRecords ? 'animate-spin' : ''} />
                      </button>
                      <button 
                        disabled={selectedRecords.length === 0} 
                        onClick={() => setRecordsToDelete(selectedRecords)} 
                        className={`bg-transparent border ${selectedRecords.length > 0 ? 'border-[#3ea1fc] text-[#3ea1fc] hover:bg-[#3ea1fc]/10' : 'border-[#2c384a] text-white cursor-not-allowed opacity-50'} font-bold py-1 px-4 rounded-full text-[13px] transition-colors`}
                      >
                        Delete record
                      </button>
                      <button onClick={() => setComingSoonModal('Import zone file')} className="bg-transparent border border-[#3ea1fc] text-[#3ea1fc] hover:bg-[#3ea1fc]/10 font-bold py-1 px-4 rounded-full text-[13px] transition-colors">
                        Import zone file
                      </button>
                      <button onClick={() => router.push(`/hosted-zones/${zone?.id}/create-record`)} className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1 px-4 rounded-full text-[13px] transition-colors border border-transparent">
                        Create record
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center justify-between mt-4 mb-4">
                    <div className="flex gap-2 w-full max-w-3xl">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1.5 text-white" size={16} />
                        <input
                          type="text"
                          placeholder="Filter records by property or value"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-1 bg-[#161d27] border border-[#2c384a] rounded-full text-[13px] text-white focus:outline-none focus:border-[#3ea1fc] transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <select
                          value={typeFilter}
                          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                          className="bg-[#161d27] border border-[#2c384a] text-white text-[13px] rounded-full pl-4 pr-8 py-1 appearance-none focus:outline-none focus:border-[#3ea1fc] h-full"
                        >
                          <option value="">Type</option>
                          <option value="A">A</option>
                          <option value="AAAA">AAAA</option>
                          <option value="CNAME">CNAME</option>
                          <option value="TXT">TXT</option>
                          <option value="MX">MX</option>
                          <option value="NS">NS</option>
                          <option value="PTR">PTR</option>
                          <option value="SRV">SRV</option>
                          <option value="CAA">CAA</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2 text-white pointer-events-none" />
                      </div>
                      <div className="relative opacity-50 cursor-not-allowed hidden md:block">
                        <select disabled className="bg-[#161d27] border border-[#2c384a] text-white text-[13px] rounded-full pl-4 pr-8 py-1 appearance-none">
                          <option>Routing p...</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2 text-white" />
                      </div>
                      <div className="relative opacity-50 cursor-not-allowed hidden md:block">
                        <select disabled className="bg-[#161d27] border border-[#2c384a] text-white text-[13px] rounded-full pl-4 pr-8 py-1 appearance-none">
                          <option>Alias</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2 text-white" />
                      </div>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center gap-4 text-[13px]">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="text-white hover:text-white disabled:opacity-50"
                      >
                        &lt;
                      </button>
                      <span className="text-white font-bold">{page}</span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="text-white hover:text-white disabled:opacity-50"
                      >
                        &gt;
                      </button>
                      <button className="text-white hover:text-white ml-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="border-t border-b border-[#2c384a] text-white">
                        <tr>
                          <th className="px-3 py-2 w-8 border-l border-[#2c384a] first:border-0 text-center">
                            <input type="checkbox" className="accent-[#3ea1fc] cursor-pointer" checked={records.length > 0 && selectedRecords.length === records.length} onChange={(e) => setSelectedRecords(e.target.checked ? [...records] : [])} />
                          </th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Record name <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Type <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Routing policy <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Differentiator <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Alias <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal border-l border-[#2c384a]">Value/Route traffic to <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">TTL (seconds) <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Health check ID <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Evaluate target health <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal whitespace-nowrap border-l border-[#2c384a]">Record ID <span className="text-[10px] ml-1">▼</span></th>
                          <th className="px-3 py-2 font-normal text-right border-l border-[#2c384a]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c384a]">
                        {isLoadingRecords ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-white">Loading records...</td></tr>
                        ) : records.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-white">No records found.</td></tr>
                        ) : (
                          records.map((r) => (
                            <tr key={r.id} className="hover:bg-cs-border-divider/30 transition-colors">
                              <td className="px-3 py-3 border-l border-[#2c384a] first:border-0 text-center">
                                <input type="checkbox" className="accent-[#3ea1fc] cursor-pointer" checked={selectedRecords.some(sr => sr.id === r.id)} onChange={(e) => { e.stopPropagation(); setSelectedRecords(prev => prev.some(sr => sr.id === r.id) ? prev.filter(sr => sr.id !== r.id) : [...prev, r]); }} />
                              </td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">{r.name}</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">{r.type}</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">Simple</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">-</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">No</td>
                              <td className="px-3 py-3 text-white break-all max-w-sm whitespace-pre-line border-l border-[#2c384a]">{r.value}</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">{r.ttl}</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">-</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">-</td>
                              <td className="px-3 py-3 text-white border-l border-[#2c384a]">-</td>
                              <td className="px-3 py-3 text-right border-l border-[#2c384a]">
                                <button onClick={() => setRecordToEdit(r)} className="text-[#3ea1fc] hover:underline font-bold mr-4">Edit</button>
                                <button onClick={() => setRecordsToDelete([r])} className="text-[#3ea1fc] hover:underline font-bold">Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Info Panel */}
        {activeInfoPanel === 'hosted-zone' && (
          <InfoPanel title="Hosted zone details" onClose={() => setActiveInfoPanel(null)}>
            <p>A hosted zone is a container that holds information about how you want to route traffic for a domain.</p>
          </InfoPanel>
        )}
        {activeInfoPanel === 'records' && (
          <InfoPanel title="Records" onClose={() => setActiveInfoPanel(null)}>
            <p>Records define how you want to route traffic for a domain and its subdomains.</p>
          </InfoPanel>
        )}
      </div>

      {renderComingSoonModal()}

      {renderDeleteZoneModal()}

      {renderEditRecordModal()}
      {renderDeleteRecordModal()}
    </div>
  );
}


// --- Modal Components ---

function DeleteZoneModal({ zone, onClose }: { zone: HostedZone; onClose: () => void; }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${zone.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) router.push('/hosted-zones');
      else setError('Failed to delete zone.');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#161d27] border border-[#2c384a] rounded shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-white text-[20px] font-bold">Delete hosted zone {zone.name}?</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="px-6 pb-6 pt-2">
          <p className="text-white text-[14px] mb-6">
            Delete the hosted zone permanently? This action cannot be undone. Your domain might become unavailable on the internet.
          </p>

          <div className="border-t border-[#2c384a] my-6"></div>

          <p className="text-white text-[14px] font-bold mb-2">
            To confirm that you want to delete the hosted zone, enter <span className="italic font-bold">delete</span> in the field.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className="w-full bg-[#161d27] border border-[#545b64] focus:border-[#3ea1fc] focus:outline-none rounded p-2 text-white text-[14px] mb-2 font-italic"
          />
          {error && <p className="text-[#d91515] text-[13px] mb-4">{error}</p>}
        </div>
        <div className="flex justify-end gap-4 p-4 bg-[#161d27] border-t border-[#2c384a] rounded-b">
          <button onClick={onClose} className="text-[#3ea1fc] hover:underline font-bold text-[14px] px-4">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText.toLowerCase() !== 'delete'}
            className="bg-[#2c384a] text-white hover:bg-[#3e4d62] font-bold py-1.5 px-4 rounded-full text-[14px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EditRecordModal({ record, zoneId, onClose, onSuccess }: { record: DNSRecord; zoneId: number; onClose: () => void; onSuccess: () => void; }) {
  const [name, setName] = useState(record.name);
  const [type, setType] = useState(record.type);
  const [ttl, setTtl] = useState(record.ttl);
  const [value, setValue] = useState(record.value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim() || ttl < 1) { setError('Please fill all required fields correctly.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${zoneId}/records/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type, ttl, value: value.trim() }),
        credentials: 'include'
      });
      if (res.ok) onSuccess();
      else {
        const data = await res.json();
        setError(data.detail || 'Failed to update record.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-cs-bg-container border border-[#2c384a] rounded shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-[#2c384a]">
          <h2 className="text-white text-[16px] font-bold">Edit record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-[#d91515] text-[13px]">{error}</div>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white text-[13px] font-bold mb-1">Record name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#161d27] border border-[#2c384a] rounded p-2 text-white text-[13px]" />
            </div>
            <div>
              <label className="block text-white text-[13px] font-bold mb-1">Record type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#161d27] border border-[#2c384a] rounded p-2 text-white text-[13px]">
                {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'PTR', 'SRV', 'CAA'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white text-[13px] font-bold mb-1">Value</label>
            <textarea value={value} onChange={e => setValue(e.target.value)} required className="w-full bg-[#161d27] border border-[#2c384a] rounded p-2 text-white text-[13px] min-h-[80px]" />
          </div>
          <div className="mb-6">
            <label className="block text-white text-[13px] font-bold mb-1">TTL (Seconds)</label>
            <input type="number" min="1" value={ttl} onChange={e => setTtl(Number(e.target.value))} required className="w-full bg-[#161d27] border border-[#2c384a] rounded p-2 text-white text-[13px]" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="text-[#3ea1fc] hover:underline text-[13px] font-bold px-4">Cancel</button>
            <button type="submit" disabled={loading} className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 px-4 rounded-full text-[13px] disabled:opacity-50">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteRecordModal({ records, zoneId, onClose, onSuccess }: { records: DNSRecord[]; zoneId: number; onClose: () => void; onSuccess: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') return;
    setLoading(true);
    try {
      await Promise.all(records.map(r =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hosted-zones/${zoneId}/records/${r.id}`, { method: 'DELETE', credentials: 'include' })
      ));
      onSuccess();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#161d27] border border-[#2c384a] rounded shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-white text-[20px] font-bold">Delete {records.length > 1 ? `${records.length} records` : `record ${records[0].name}`}?</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="px-6 pb-6 pt-2">
          <p className="text-white text-[14px] mb-6">
            Delete the record permanently? This action cannot be undone. Your traffic routing might be affected.
          </p>

          <div className="border-t border-[#2c384a] my-6"></div>

          <p className="text-white text-[14px] font-bold mb-2">
            To confirm that you want to delete the selected records, enter <span className="italic font-bold">delete</span> in the field.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className="w-full bg-[#161d27] border border-[#545b64] focus:border-[#3ea1fc] focus:outline-none rounded p-2 text-white text-[14px] mb-2 font-italic"
          />
          {error && <p className="text-[#d91515] text-[13px] mb-4">{error}</p>}
        </div>
        <div className="flex justify-end gap-4 p-4 bg-[#161d27] border-t border-[#2c384a] rounded-b">
          <button onClick={onClose} className="text-[#3ea1fc] hover:underline font-bold text-[14px] px-4">Cancel</button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText.toLowerCase() !== 'delete'}
            className="bg-[#2c384a] text-white hover:bg-[#3e4d62] font-bold py-1.5 px-4 rounded-full text-[14px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
