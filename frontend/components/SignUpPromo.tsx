import React from 'react';
import { Rocket } from 'lucide-react';

export default function SignUpPromo() {
  return (
    <div className="flex-1 flex flex-col pt-10 px-8">
      <h2 className="text-[#111111] text-[20px] font-bold mb-4 leading-snug">
        Try AWS at no cost for up to 6<br />months
      </h2>
      <p className="text-[14px] text-[#111111] leading-relaxed mb-12">
        Start with USD $100 in AWS credits, plus earn<br />
        up to USD $100 by completing various<br />
        activities.
      </p>
      <div className="ml-8 mt-4 text-[#111111]">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Simple Rocket SVG matching the screenshot style */}
          <path d="M40,90 L40,75 M50,90 L50,80 M60,90 L60,85" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <path d="M30,55 L45,65 L55,55" stroke="#111111" strokeWidth="2" fill="none" />
          <path d="M45,65 L45,85 L55,75 L65,65" stroke="#111111" strokeWidth="2" fill="none" />
          <path d="M65,65 C70,65 90,40 90,20 C70,20 45,40 45,45" stroke="#111111" strokeWidth="2" fill="white" />
          <path d="M45,45 L25,55 L35,65" stroke="#111111" strokeWidth="2" fill="none" />
          <circle cx="70" cy="40" r="8" stroke="#111111" strokeWidth="2" fill="white" />
        </svg>
      </div>
    </div>
  );
}
