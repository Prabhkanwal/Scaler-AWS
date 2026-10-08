import React from 'react';
import { ChevronRight, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';

interface InfoPanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  learnMoreLinks?: { label: string; href: string }[];
  isOverlay?: boolean;
}

export default function InfoPanel({ title, onClose, children, learnMoreLinks, isOverlay = false }: InfoPanelProps) {
  const panelClasses = `w-[320px] flex-shrink-0 border-l border-[#2c384a] bg-[#161d27] flex flex-col overflow-y-auto ${isOverlay ? 'fixed top-0 right-0 h-full z-[100] shadow-2xl transition-transform transform translate-x-0' : 'h-full'}`;

  return (
    <>
      {isOverlay && (
        <div className="fixed inset-0 z-[90] bg-transparent" onClick={onClose} />
      )}
      <div className={panelClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <h2 className="text-white text-[18px] font-bold">{title}</h2>
        <button onClick={onClose} className="text-white hover:bg-[#2c384a] p-1 rounded transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 text-[13px] text-[#d5dbdb] leading-relaxed flex-1">
        {children}
      </div>

      {/* Feedback Section */}
      <div className="px-5 mt-8 mb-6">
        <h3 className="text-white font-bold mb-3 text-[16px]">Was this content helpful?</h3>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-1.5 border-[1.5px] border-[#3ea1fc] hover:bg-[#3ea1fc]/10 rounded-full text-white font-bold text-[13px] transition-colors">
            <ThumbsUp size={14} className="text-[#3ea1fc]" /> Yes
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 border-[1.5px] border-[#3ea1fc] hover:bg-[#3ea1fc]/10 rounded-full text-white font-bold text-[13px] transition-colors">
            <ThumbsDown size={14} className="text-[#3ea1fc]" /> No
          </button>
        </div>
      </div>

      {/* Learn More Section */}
      {learnMoreLinks && learnMoreLinks.length > 0 && (
        <div className="px-5 pb-8">
          <h3 className="text-white font-bold mb-3 flex items-center gap-1.5 text-[16px]">
            Learn more <ExternalLink size={14} className="opacity-80" />
          </h3>
          <ul className="flex flex-col gap-2">
            {learnMoreLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="text-[#3ea1fc] hover:underline text-[13px]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </>
  );
}
