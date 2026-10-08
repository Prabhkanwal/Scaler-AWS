import React from 'react';

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#111111] font-sans relative overflow-hidden">
      {/* Pseudo-element for the subtle cube background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0l30 15v30L30 60 0 45V15z' fill='%23000'/%3E%3Cpath d='M30 30L0 15m30 15l30-15m-30 15v30' stroke='%23fff' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
          backgroundPosition: 'center',
        }}
      />
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
