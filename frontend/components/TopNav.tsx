'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Settings, Search, Bell, TerminalSquare, HelpCircle, AlertTriangle, LayoutGrid } from 'lucide-react';
import AwsLogo from '@/components/AwsLogo';
import { useRouter } from 'next/navigation';

export default function TopNav() {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/signin');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col w-full z-50">
      {/* Top AWS Bar */}
      <div className="h-11 bg-[#161d27] border-b border-black flex items-center justify-between pl-3 pr-2 w-full text-white">

        {/* Left Section */}
        <div className="flex items-center h-full">
          {/* AWS Logo Placeholder */}
          <div className="flex items-center justify-center mr-3 mt-1 cursor-pointer hover:opacity-80">
            <AwsLogo width={45} color="white" />
          </div>

          <div className="h-6 w-[1px] bg-[#2c384a] mx-2"></div>

          {/* Amazon Q Logo */}
          <div className="w-6 h-6 rounded flex items-center justify-center cursor-pointer hover:opacity-80 ml-2 mr-2" style={{ background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)' }}>
            <span className="text-white font-bold text-[13px]">Q</span>
          </div>

          <div className="h-6 w-[1px] bg-[#2c384a] mx-2"></div>

          {/* App Launcher */}
          <div className="mx-2 cursor-pointer text-gray-300 hover:text-white p-1">
            <LayoutGrid size={18} />
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-[800px] flex items-center justify-center px-4">
          <div className="w-full relative flex items-center bg-[#161d27] border border-[#545b64] rounded-full h-[32px] hover:border-gray-400 transition-colors">
            <Search size={14} className="text-gray-300 ml-3 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-[13px] italic text-gray-300 outline-none w-full pb-0.5"
            />
            <div className="absolute right-1 flex items-center gap-2">
              <span className="text-[11px] text-gray-400">[Alt+S]</span>
              <div className="flex items-center gap-1.5 bg-[#232f3e] hover:bg-[#2c384a] cursor-pointer px-3 py-[3px] rounded-full border border-[#2c384a] transition-colors">
                <span className="text-white font-bold text-[10px]" style={{ textShadow: '0 0 2px #c77dff' }}>Q</span>
                <span className="text-white text-[12px] font-bold">Ask Amazon Q</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center h-full">
          <div className="flex items-center gap-1 mr-2 text-gray-300">
            <div className="p-2 cursor-pointer hover:text-white"><TerminalSquare size={18} /></div>
            <div className="p-2 cursor-pointer hover:text-white"><Bell size={18} /></div>
            <div className="p-2 cursor-pointer hover:text-white"><HelpCircle size={18} /></div>

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>

              <Settings size={18} />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#2c384a] mx-1"></div>

          <div className="flex items-center gap-1 text-[13px] font-bold hover:text-white text-gray-300 cursor-pointer px-3 h-full">
            Global <span className="text-[9px] ml-0.5">▼</span>
          </div>

          <div className="flex flex-col justify-center items-end leading-tight px-3 h-full bg-[#1c2533] border-l border-r border-[#2c384a] cursor-pointer hover:bg-[#232f3e]">
            <div className="text-[11px] text-gray-400">{user ? user.username : 'Loading...'} (577211136174) <span className="text-[8px] ml-0.5">▼</span></div>
            <div className="text-[13px] text-white font-bold">{user ? user.username : ''}</div>
          </div>

          <div className="px-3 cursor-pointer">
            <AlertTriangle size={18} className="text-red-400 hover:text-red-300" />
          </div>

          <button onClick={handleLogout} className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-white transition-colors pl-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header >
  );
}
