'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarContext';
import { Menu, ChevronRight, Search, RefreshCw, Settings, ChevronLeft, X } from 'lucide-react';

interface HostedZone {
  id: number;
  zone_id: string;
  name: string;
  type: string;
  comment: string | null;
  created_at: string;
  record_count: number;
}

export default function HostedZonesPage() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalZones, setTotalZones] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadError, setLoadError] = useState('');

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/hosted-zones/`, window.location.origin);
      url.searchParams.set('page', String(page));
      url.searchParams.set('page_size', String(pageSize));
      if (search.trim()) url.searchParams.set('search', search.trim());
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) router.push('/signin');
        throw new Error('Failed to fetch hosted zones.');
      }
      const data = await res.json();
      setZones(data.items ?? []);
      setTotalZones(data.total ?? 0);
      setTotalPages(data.total_pages ?? 0);
      setSelectedZone(current => current !== null && !(data.items ?? []).some((zone: HostedZone) => zone.id === current) ? null : current);
    } catch {
      setZones([]);
      setLoadError('Unable to load hosted zones. Refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, router, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchZones();
    }, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [fetchZones, search]);

  const handleCreate = () => router.push('/hosted-zones/create');
  const handleViewDetails = () => {
    if (selectedZone) router.push(`/hosted-zones/${selectedZone}`);
  };
  const handleEdit = () => {
    if (selectedZone) router.push(`/hosted-zones/${selectedZone}/edit`);
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
        <span className="text-gray-400">Hosted zones</span>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto px-6 py-8">

          <div className="bg-[#161d27] border border-[#2c384a] rounded-lg shadow-sm">

            {/* Header Area */}
            <div className="p-5 border-b border-[#2c384a]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-white text-[20px] font-bold tracking-tight">Hosted zones <span className="font-normal">({totalZones})</span></h1>
                  <p className="text-gray-400 text-[13px] mt-1">
                    Automatic mode is the current search behavior optimized for best filter results. <span className="text-[#3ea1fc] hover:underline cursor-pointer">To change modes go to settings.</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={fetchZones} className="p-1.5 border border-[#545b64] text-white hover:bg-[#545b64]/20 rounded transition-colors" title="Refresh">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
                  <button
                    disabled={!selectedZone}
                    onClick={handleViewDetails}
                    className="px-4 py-1.5 border border-[#545b64] hover:border-gray-300 text-white font-bold rounded-full text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View details
                  </button>
                  <button disabled={!selectedZone} onClick={handleEdit} className="px-4 py-1.5 border border-[#545b64] text-white font-bold rounded-full text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Edit
                  </button>
                  <button
                    disabled={!selectedZone}
                    onClick={() => setIsDeleteModalOpen(true)}
                    className={`px-4 py-1.5 border border-[#545b64] font-bold rounded-full text-[13px] transition-colors ${selectedZone ? 'text-white hover:border-gray-300' : 'text-white opacity-50 cursor-not-allowed'}`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-6 py-1.5 bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold rounded-full text-[13px] transition-colors"
                  >
                    Create hosted zone
                  </button>
                </div>
              </div>

              {/* Search and Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="relative w-[500px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter records by property or value"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full bg-[#161d27] border border-[#545b64] focus:border-[#3ea1fc] focus:outline-none text-white text-[13px] rounded py-1.5 pl-9 pr-4"
                  />
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-[13px]">
                  <label className="flex items-center gap-2">
                    Rows
                    <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="bg-[#161d27] border border-[#545b64] rounded px-2 py-1 text-white">
                      {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage(current => current - 1)} className="disabled:opacity-40"><ChevronLeft size={16} /></button>
                    <span className="text-white font-bold">{totalPages ? `${page} / ${totalPages}` : '0 / 0'}</span>
                    <button type="button" aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage(current => current + 1)} className="disabled:opacity-40"><ChevronRight size={16} /></button>
                  </div>
                  <Settings size={16} className="cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead className="bg-[#161d27] text-gray-400 border-b border-[#2c384a]">
                  <tr>
                    <th className="w-12 px-4 py-3 font-bold text-center"></th>
                    <th className="px-4 py-3 font-bold border-l border-[#2c384a] cursor-pointer hover:text-white">Hosted zone name <span className="text-[10px] ml-1">▼</span></th>
                    <th className="px-4 py-3 font-bold border-l border-[#2c384a] cursor-pointer hover:text-white">Type <span className="text-[10px] ml-1">▼</span></th>
                    <th className="px-4 py-3 font-bold border-l border-[#2c384a] cursor-pointer hover:text-white">Created by <span className="text-[10px] ml-1">▼</span></th>
                    <th className="px-4 py-3 font-bold border-l border-[#2c384a] cursor-pointer hover:text-white">Record count <span className="text-[10px] ml-1">▼</span></th>
                    <th className="px-4 py-3 font-bold border-l border-[#2c384a] cursor-pointer hover:text-white">Description <span className="text-[10px] ml-1">▼</span></th>
                    <th className="px-4 py-3 font-bold border-l border-[#2c384a] cursor-pointer hover:text-white">Hosted zone ID <span className="text-[10px] ml-1">▼</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2c384a] text-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading hosted zones...</td>
                    </tr>
                  ) : loadError ? (
                    <tr><td colSpan={7} role="alert" className="px-4 py-8 text-center text-red-400">{loadError}</td></tr>
                  ) : zones.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No hosted zones found.</td>
                    </tr>
                  ) : (
                    zones.map(zone => (
                      <tr
                        key={zone.id}
                        className={`hover:bg-[#2c384a]/30 transition-colors cursor-pointer ${selectedZone === zone.id ? 'bg-[#3ea1fc]/10' : ''}`}
                        onClick={() => setSelectedZone(zone.id)}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name="selectedZone"
                            checked={selectedZone === zone.id}
                            onChange={() => setSelectedZone(zone.id)}
                            className="cursor-pointer accent-[#3ea1fc]"
                          />
                        </td>
                        <td className="px-4 py-3 border-l border-[#2c384a]">
                          <span
                            className="text-[#3ea1fc] font-bold hover:underline"
                            onClick={(e) => { e.stopPropagation(); router.push(`/hosted-zones/${zone.id}`); }}
                          >
                            {zone.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-l border-[#2c384a] capitalize">{zone.type === 'public' ? 'Public' : zone.type}</td>
                        <td className="px-4 py-3 border-l border-[#2c384a]">Route 53</td>
                        <td className="px-4 py-3 border-l border-[#2c384a]">{zone.record_count !== undefined ? zone.record_count : 0}</td>
                        <td className="px-4 py-3 border-l border-[#2c384a] text-gray-300">{zone.comment || '-'}</td>
                        <td className="px-4 py-3 border-l border-[#2c384a] text-gray-300">
                          {zone.zone_id}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>

      {isDeleteModalOpen && selectedZone && (
        <DeleteZoneModal
          zone={zones.find(z => z.id === selectedZone)!}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            setSelectedZone(null);
            fetchZones();
          }}
        />
      )}
    </div>
  );
}


function DeleteZoneModal({ zone, onClose, onSuccess }: { zone: HostedZone; onClose: () => void; onSuccess: () => void; }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/hosted-zones/${zone.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) onSuccess();
      else {
        const data = await res.json().catch(() => null);
        setError(data?.detail || 'Failed to delete zone.');
      }
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
