import React from 'react';

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans relative overflow-hidden flex flex-col">
      {/* Background isometric cubes pattern - absolute positioned at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[400px] pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='104' viewBox='0 0 120 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0L120 34.64v69.28L60 138.56 0 103.92V34.64z' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3Cpath d='M0 34.64l60 34.64 60-34.64M60 69.28v69.28' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 104px',
          backgroundPosition: 'bottom center',
        }}
      />
      {/* Overlay gradient to fade out the top of the pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-b from-white via-transparent to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
