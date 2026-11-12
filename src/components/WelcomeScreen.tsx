import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { ArrowRight, TrendingUp, Package, Volume2, Home } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkip?: () => void;
  onOpenSales?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSkip, onOpenSales }) => {
  const { t, language } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();
  const hasSpokenRef = useRef(false);

  // Spoken welcome greeting once on landing
  useEffect(() => {
    if (!hasSpokenRef.current) {
      hasSpokenRef.current = true;
      const timer = setTimeout(() => {
        speak(t('pageAudioIntro'));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [speak, t]);

  const handleAction = () => {
    soundFx.playClick();
    onGetStarted();
  };

  const handleSkip = () => {
    soundFx.playClick();
    if (onSkip) {
      onSkip();
    } else {
      onGetStarted();
    }
  };

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    speak(t('pageAudioIntro'));
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] text-slate-800 animate-fade-in relative min-h-screen">
      {/* Top Bar with Sound and Skip Buttons (Home & Sales hidden until login) */}
      <div className="w-full px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between z-20 gap-2">
        <button
          type="button"
          onClick={handleReplayVoice}
          className="p-2 rounded-xl text-[#5e7768] hover:text-[#183626] hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Listen intro"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="text-xs sm:text-sm font-bold text-[#5e7768] hover:text-[#183626] transition-colors px-2.5 py-1.5 rounded-xl cursor-pointer"
        >
          {t('welcomeSkip')}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col justify-between">
        {/* Top Header Branding matching user image */}
        <div className="text-center px-4 pt-1 pb-3 max-w-md mx-auto">
          {/* Custom Shopping Cart with Leaves Sprouting Logo */}
          <div className="flex justify-center mb-2">
            <div className="relative inline-flex items-center justify-center">
              <svg
                viewBox="0 0 100 80"
                className="w-16 h-14 sm:w-20 sm:h-16 text-[#235338]"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Wheels */}
                <circle cx="36" cy="70" r="6" fill="#235338" />
                <circle cx="78" cy="70" r="6" fill="#235338" />

                {/* Cart Body Grid */}
                <path d="M10 12 L24 12 L38 56 L86 56 L96 24 L28 24" />
                <path d="M42 24 L42 56" />
                <path d="M56 24 L56 56" />
                <path d="M70 24 L70 56" />
                <path d="M30 40 L90 40" />

                {/* Organic Leaf Sprout on top handle */}
                <path
                  d="M78 18 C80 6 96 6 98 14 C98 22 84 24 78 18 Z"
                  fill="#40916c"
                  stroke="#2d6a4f"
                  strokeWidth="2"
                />
                <path
                  d="M84 14 C86 4 100 6 102 12 C102 18 90 20 84 14 Z"
                  fill="#74c69d"
                  stroke="#40916c"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* App Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#183626] tracking-tight">
            {t('welcomeBrand')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-bold text-[#183626] mt-0.5">
            {t('welcomeTagline')}
          </p>

          {/* Subheading */}
          <p className="text-lg sm:text-xl font-extrabold text-[#235338] mt-2">
            {t('welcomeHeader')}
          </p>
        </div>

        {/* Hero Image Section: Shopping basket overflowing with groceries in aisle */}
        <div className="w-full relative max-w-md sm:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 my-2">
          <div className="w-full h-56 sm:h-64 md:h-72 lg:h-80 rounded-3xl overflow-hidden shadow-md border border-emerald-100/80 relative bg-[#e8f3ec]">
            <img
              src="/assets/welcome_basket.jpg"
              alt="Grocery shopping basket full of groceries in store aisle"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Bottom Feature List Section with organic soft curve */}
        <div className="w-full relative mt-auto">
          {/* Soft Wave Transition */}
          <svg
            viewBox="0 0 1200 60"
            className="w-full h-8 sm:h-10 text-white fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,35 C380,70 820,0 1200,30 L1200,60 L0,60 Z" />
          </svg>

          <div className="bg-white w-full pb-8 sm:pb-10 pt-2 px-5 sm:px-6">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto space-y-4">
              {/* Feature 1: Manage Sales */}
              <div
                onClick={() => {
                  soundFx.playClick();
                  if (onOpenSales) onOpenSales();
                }}
                className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-emerald-50/50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#52795d] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-[17px] font-extrabold text-[#183626]">
                      {t('welcomeFeatureSalesTitle')}
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">View Dashboard →</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5e7768] font-medium leading-snug">
                    {t('welcomeFeatureSalesDesc')}
                  </p>
                </div>
              </div>

              {/* Feature 2: Control Stock */}
              <div className="flex items-center gap-3.5 p-2">
                <div className="w-12 h-12 rounded-2xl bg-[#52795d] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Package className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-[17px] font-extrabold text-[#183626]">
                    {t('welcomeFeatureStockTitle')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5e7768] font-medium leading-snug">
                    {t('welcomeFeatureStockDesc')}
                  </p>
                </div>
              </div>

              {/* Feature 3: Know Your Profit */}
              <div className="flex items-center gap-3.5 p-2">
                <div className="w-12 h-12 rounded-2xl bg-[#52795d] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <div className="flex items-center justify-center font-extrabold text-xl leading-none">
                    ₹
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-[17px] font-extrabold text-[#183626]">
                    {t('welcomeFeatureProfitTitle')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5e7768] font-medium leading-snug">
                    {t('welcomeFeatureProfitDesc')}
                  </p>
                </div>
              </div>

              {/* Primary Call To Action Button matching image */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleAction}
                  className="w-full py-4 px-6 rounded-2xl bg-[#235338] hover:bg-[#1a442c] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{t('btnGetStarted')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
