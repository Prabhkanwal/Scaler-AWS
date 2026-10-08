import React from 'react';

interface SidebarCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
}

export default function SidebarCard({ title, titleIcon, children }: SidebarCardProps) {
  return (
    <div className="bg-cs-bg-container border border-cs-border-divider rounded-lg p-5 flex flex-col gap-3">
      <h3 className="text-white font-bold text-[15px] flex items-center">{title}{titleIcon}</h3>
      <div className="text-[13px] text-cs-text-body">
        {children}
      </div>
    </div>
  );
}
