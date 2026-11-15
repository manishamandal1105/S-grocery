import React, { useEffect, useState } from 'react';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const soundFx = useSoundEffects();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    soundFx.playSplashChime();

    // 5-second countdown with smooth 50ms progress update
    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete, soundFx]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between items-center px-4 sm:px-8 py-8 sm:py-12 animate-fadeIn relative">
      
      {/* 1. Top Section: Replaced outline with exact requested text: "Grocer: It's My Place" */}
      <div className="w-full text-center pt-2 sm:pt-6">
        <h1 className="text-2xl sm:text-4xl font-black text-[#008744] tracking-tight">
          Grocer: It's My Place
        </h1>
      </div>

      {/* 2. Center Section: Authentic Indian Grocery Basket & Heading */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-4">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
          <div className="absolute bottom-6 w-52 sm:w-64 h-8 bg-slate-900/10 rounded-full blur-lg" />

          <svg
            viewBox="0 0 360 360"
            className="w-full h-full drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="162" y="58" width="36" height="20" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <rect x="170" y="44" width="20" height="14" rx="3" fill="#f59e0b" />
            <path d="M152 78 C152 74 162 70 180 70 C198 70 208 74 208 78 L218 115 L218 190 L142 190 L142 115 Z" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <path d="M150 115 L210 115 L210 170 L150 170 Z" fill="#fef08a" />
            <text x="180" y="145" textAnchor="middle" fill="#b45309" fontSize="12" fontWeight="bold" fontFamily="sans-serif">OIL</text>

            <g transform="rotate(-8 120 120)">
              <rect x="75" y="80" width="85" height="110" rx="8" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <rect x="85" y="92" width="65" height="30" rx="4" fill="#ef4444" />
              <text x="117" y="108" textAnchor="middle" fill="#fef2f2" fontSize="9" fontWeight="900" fontFamily="sans-serif">AASHIRVAAD</text>
              <text x="117" y="118" textAnchor="middle" fill="#fef2f2" fontSize="8" fontWeight="bold" fontFamily="sans-serif">ATTA</text>
              <circle cx="117" cy="145" r="16" fill="#fef08a" />
              <path d="M110 145 L124 145 M117 138 L117 152" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
            </g>

            <g transform="rotate(8 240 120)">
              <rect x="195" y="80" width="80" height="105" rx="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
              <rect x="205" y="95" width="60" height="42" rx="6" fill="#ffffff" />
              <text x="235" y="114" textAnchor="middle" fill="#1e40af" fontSize="11" fontWeight="900" fontFamily="sans-serif">Amul</text>
              <text x="235" y="126" textAnchor="middle" fill="#2563eb" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Taaza</text>
            </g>

            <g transform="rotate(-4 130 160)">
              <rect x="80" y="130" width="82" height="75" rx="6" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
              <rect x="94" y="142" width="54" height="24" rx="12" fill="#dc2626" />
              <text x="121" y="158" textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="900" fontFamily="sans-serif">Maggi</text>
              <text x="121" y="185" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="bold" fontFamily="sans-serif">2-Minute</text>
            </g>

            <rect x="145" y="125" width="70" height="82" rx="6" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
            <circle cx="180" cy="162" r="22" fill="#0f172a" />
            <text x="180" y="158" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">TATA</text>
            <text x="180" y="172" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Salt</text>

            <g transform="rotate(6 230 160)">
              <rect x="195" y="130" width="80" height="75" rx="6" fill="#15803d" stroke="#14532d" strokeWidth="2" />
              <rect x="202" y="140" width="22" height="55" rx="3" fill="#ffffff" />
              <text x="213" y="175" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="900" fontFamily="sans-serif" transform="rotate(-90 213 175)">fortune</text>
              <circle cx="248" cy="165" r="16" fill="#fef08a" />
            </g>

            <path
              d="M75 185 L285 185 L270 270 C268 280 260 286 250 286 L110 286 C100 286 92 280 90 270 Z"
              fill="#df9d6b"
              stroke="#b2713f"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <rect x="70" y="178" width="220" height="15" rx="6" fill="#ce8a57" stroke="#b2713f" strokeWidth="3" />

            <rect x="100" y="202" width="16" height="24" rx="4" fill="#22c55e" />
            <rect x="126" y="202" width="16" height="24" rx="4" fill="#ef4444" />
            <rect x="152" y="202" width="16" height="24" rx="4" fill="#eab308" />
            <rect x="192" y="202" width="16" height="24" rx="4" fill="#10b981" />
            <rect x="218" y="202" width="16" height="24" rx="4" fill="#f97316" />
            <rect x="244" y="202" width="16" height="24" rx="4" fill="#facc15" />

            <rect x="104" y="235" width="16" height="24" rx="4" fill="#3b82f6" />
            <rect x="130" y="235" width="16" height="24" rx="4" fill="#f59e0b" />
            <rect x="156" y="235" width="16" height="24" rx="4" fill="#ec4899" />
            <rect x="188" y="235" width="16" height="24" rx="4" fill="#06b6d4" />
            <rect x="214" y="235" width="16" height="24" rx="4" fill="#dc2626" />
            <rect x="240" y="235" width="16" height="24" rx="4" fill="#84cc16" />
          </svg>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4f5574] text-center tracking-tight mt-6">
          Let's set up your shop
        </h2>
      </div>

      {/* 3. Bottom Progress Bar */}
      <div className="w-full max-w-xs sm:max-w-sm mb-4 sm:mb-8">
        <div className="w-full h-3 bg-[#cbe8d6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#008744] rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
};
