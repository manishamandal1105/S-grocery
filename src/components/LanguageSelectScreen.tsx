import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Volume2, ArrowRight, ArrowLeft } from 'lucide-react';

interface LanguageSelectScreenProps {
  onContinue: () => void;
  onBack?: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onContinue, onBack }) => {
  const { language, setLanguage, t } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();
  const hasAnnouncedRef = useRef(false);

  // Spoken instructions when entering the language selection screen:
  // Speaks "Select your preferred language" in English only once per page session / refresh
  useEffect(() => {
    if (!hasAnnouncedRef.current) {
      hasAnnouncedRef.current = true;
      const timer = setTimeout(() => {
        speak('Select your preferred language', 'en-US');
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [speak]);

  const languagesList: {
    id: Language;
    label: string;
    flag: React.ReactNode;
    audioText: string;
    speechLang: string;
  }[] = [
    {
      id: 'bn',
      label: 'বাংলা',
      flag: (
        <div className="w-11 h-7 rounded-xl overflow-hidden shadow-sm border border-slate-200/80 shrink-0 relative flex items-center justify-center bg-[#006a4e]">
          <div className="w-4 h-4 rounded-full bg-[#f42a41] -ml-1 shadow-sm" />
        </div>
      ),
      audioText: 'আপনি বাংলা ভাষা নির্বাচন করেছেন',
      speechLang: 'bn-IN',
    },
    {
      id: 'en',
      label: 'English',
      flag: (
        <div className="w-11 h-7 rounded-xl overflow-hidden shadow-sm border border-slate-200/80 shrink-0 relative flex flex-col justify-between bg-white">
          <div className="h-[2.5px] bg-[#b22234]" />
          <div className="h-[2.5px] bg-[#b22234]" />
          <div className="h-[2.5px] bg-[#b22234]" />
          <div className="h-[2.5px] bg-[#b22234]" />
          <div className="h-[2.5px] bg-[#b22234]" />
          <div className="absolute top-0 left-0 w-5 h-4 bg-[#3c3b6e] flex items-center justify-center text-[8px] text-white leading-none font-bold">
            ★
          </div>
        </div>
      ),
      audioText: 'You selected English language.',
      speechLang: 'en-US',
    },
    {
      id: 'hi',
      label: 'हिन्दी',
      flag: (
        <div className="w-11 h-7 rounded-xl overflow-hidden shadow-sm border border-slate-200/80 shrink-0 relative flex flex-col justify-between bg-white">
          <div className="h-[7.5px] bg-[#ff9933]" />
          <div className="h-[8px] bg-white flex items-center justify-center relative">
            <div className="w-3 h-3 rounded-full border border-[#000080] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#000080]" />
            </div>
          </div>
          <div className="h-[7.5px] bg-[#138808]" />
        </div>
      ),
      audioText: 'आपने हिंदी भाषा चुनी है',
      speechLang: 'hi-IN',
    },
  ];

  const handleSelectLanguage = (lang: typeof languagesList[0]) => {
    soundFx.playClick();
    setLanguage(lang.id);
    speak(lang.audioText, lang.speechLang);
  };

  const handleSpeakPronounce = (e: React.MouseEvent, lang: typeof languagesList[0]) => {
    e.stopPropagation();
    soundFx.playClick();
    speak(lang.audioText, lang.speechLang);
  };

  const handleNext = () => {
    soundFx.playClick();
    onContinue();
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] text-slate-800 animate-fade-in relative">
      {/* Screen Title & Subtitle matching Image 1 */}
      <div className="text-center px-4 sm:px-6 pt-6 sm:pt-10 lg:pt-12 pb-4 sm:pb-6 max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#183626] tracking-tight">
          {t('selectLanguageTitle')}
        </h1>
        <p className="text-sm sm:text-base text-[#5e7768] font-medium mt-1.5 sm:mt-2">
          {t('selectLanguageSubtitle')}
        </p>
      </div>

      {/* Language Option Cards */}
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 space-y-3.5 sm:space-y-4 z-10">
        {languagesList.map((item) => {
          const isSelected = language === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleSelectLanguage(item)}
              role="button"
              tabIndex={0}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between border ${
                isSelected
                  ? 'bg-white border-emerald-400 shadow-md shadow-emerald-950/5 ring-2 ring-emerald-500/20'
                  : 'bg-white/95 hover:bg-white border-[#e2ede5] hover:border-emerald-300 shadow-xs'
              }`}
            >
              {/* Flag + Language Label */}
              <div className="flex items-center gap-3.5">
                {item.flag}
                <span className="text-base sm:text-[17px] font-bold text-[#1b3a2b] tracking-wide">
                  {item.label}
                </span>
              </div>

              {/* Right Side: Speaker + Radio Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSpeakPronounce(e, item)}
                  className="p-1.5 rounded-lg text-[#5e7768] hover:text-[#235338] hover:bg-emerald-50 transition-colors"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                {/* Radio Circle Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-2 border-[#235338] bg-white'
                      : 'border-2 border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#235338] animate-scale-in" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Organic Wave Graphic & Supermarket Paper Bag Photo */}
      <div className="relative mt-6 sm:mt-8 flex flex-col justify-end overflow-hidden w-full">
        {/* Soft Mint Wave Background */}
        <div className="w-full relative">
          <svg
            viewBox="0 0 1200 60"
            className="w-full h-10 sm:h-14 lg:h-16 text-[#e8f5ec] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,35 C360,65 840,0 1200,30 L1200,60 L0,60 Z" />
          </svg>
          <div className="bg-[#e8f5ec] w-full pb-6 sm:pb-8 pt-0">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6">
              {/* Supermarket Paper Bag Image */}
              <div className="w-full h-44 sm:h-52 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-sm border border-emerald-200/60 relative mb-4 bg-white/40">
                <img
                  src="/assets/grocery_bag.jpg"
                  alt="Grocery items in shopping bag"
                  className="w-full h-full object-cover object-bottom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Continue Button matching mockup */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#235338] hover:bg-[#1a442c] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{t('btnContinue')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

