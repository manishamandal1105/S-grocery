import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language, OnboardingStep } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { ShoppingBag, Volume2, VolumeX, ArrowLeft, RotateCcw, TrendingUp, Home } from 'lucide-react';

interface HeaderProps {
  currentStep: OnboardingStep;
  onBack?: () => void;
  onReset?: () => void;
  onOpenSales?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, onBack, onReset, onOpenSales }) => {
  const { language, setLanguage, t } = useLanguage();
  const soundFx = useSoundEffects();
  const { speak } = useVoiceAssistant();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const languages: { id: Language; label: string; audioMsg: string; speechLang: string }[] = [
    { id: 'bn', label: 'বাংলা', audioMsg: 'আপনি বাংলা ভাষা নির্বাচন করেছেন', speechLang: 'bn-IN' },
    { id: 'en', label: 'English', audioMsg: 'You selected English language.', speechLang: 'en-US' },
    { id: 'hi', label: 'हिंदी', audioMsg: 'आपने हिंदी भाषा चुनी है', speechLang: 'hi-IN' },
  ];

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundFx.enabled = newState;
    if (newState) soundFx.playClick();
  };

  const handleLanguageChange = (langObj: typeof languages[0]) => {
    soundFx.playClick();
    setLanguage(langObj.id);
    speak(langObj.audioMsg, langObj.speechLang);
  };

  return (
    <header className="w-full bg-[#fbfcf9]/95 backdrop-blur-md border-b border-[#edf4ee] sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Step Back */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            {onBack && currentStep !== 'splash' && currentStep !== 'language' && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-[#edf4ee] text-[#183626] border border-[#dce8e0] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                title={t('backBtn')}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            )}

            <div
              onClick={onReset}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#e8f5ec] border border-[#d2e8d9] flex items-center justify-center text-[#235338] font-bold shadow-xs group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-[#183626] tracking-tight">
                    {t('appName')}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] bg-emerald-100 text-[#235338] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                    {t('proBadge')}
                  </span>
                </div>
                <p className="hidden md:block text-xs text-[#5e7768] font-medium">
                  {t('appTagline')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: Sound Toggle + Language Switcher + Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-[#e8f5ec] text-[#235338] border-[#cce5d5] shadow-xs'
                : 'bg-white text-slate-400 border-[#dce8e0]'
            }`}
            title={soundEnabled ? t('soundOn') : t('soundOff')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Compact Language Selector on All Pages */}
          <div className="flex items-center gap-1 bg-[#edf4ee] p-1 rounded-xl border border-[#dce8e0]">
            {languages.map((langItem) => (
              <button
                key={langItem.id}
                onClick={() => handleLanguageChange(langItem)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  language === langItem.id
                    ? 'bg-[#235338] text-white shadow-xs'
                    : 'text-[#5e7768] hover:text-[#183626]'
                }`}
              >
                {langItem.label}
              </button>
            ))}
          </div>

          {/* Reset / Home */}
          {onReset && currentStep !== 'splash' && (
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-xl bg-white hover:bg-[#edf4ee] text-[#5e7768] hover:text-[#183626] border border-[#dce8e0] text-xs transition-colors shadow-xs cursor-pointer"
              title={t('resetFlow')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
