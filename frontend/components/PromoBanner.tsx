import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <div className="hidden md:flex flex-1 relative overflow-hidden rounded-r-lg" style={{ minHeight: '500px' }}>
      {/* Background Gradient simulating the image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #031238 0%, #031238 40%, #D44211 100%)',
        }}
      >
        {/* Simulating the light flares / lines */}
        <div className="absolute top-1/4 left-1/2 w-full h-[1px] bg-white opacity-40 transform -rotate-6 translate-x-[-20%]"></div>
        <div className="absolute top-1/3 left-1/3 w-[80%] h-[2px] bg-cs-bg-primary opacity-50 transform -rotate-6 shadow-[0_0_10px_2px_#ff9900]"></div>
        <div className="absolute top-[45%] left-1/4 w-[120%] h-[1px] bg-white opacity-30 transform -rotate-6"></div>
        <div className="absolute bottom-1/4 left-1/2 w-[60%] h-[1px] bg-white opacity-20 transform -rotate-6"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-10 flex flex-col justify-center h-full w-full bg-gradient-to-t from-[#031238]/80 to-transparent">
        <h2 className="text-white text-3xl font-bold mb-4 mt-auto">Grow faster with AI</h2>
        <p className="text-white text-[17px] mb-8 leading-relaxed max-w-md font-light">
          AI solutions built for small businesses — ready to deploy with trusted AWS Partners
        </p>
      </div>
    </div>
  );
}
