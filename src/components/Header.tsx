import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language, OnboardingStep } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { ShoppingBag, Volume2, VolumeX, ArrowLeft, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentStep: OnboardingStep;
  onBack?: () => void;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, onBack, onReset }) => {
  const { language, setLanguage, t } = useLanguage();
  const soundFx = useSoundEffects();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const languages: { id: Language; label: string }[] = [
    { id: 'bn', label: 'বাংলা' },
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी' },
  ];

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundFx.enabled = newState;
    if (newState) soundFx.playClick();
  };

  const handleLanguageChange = (lang: Language) => {
    soundFx.playClick();
    setLanguage(lang);
  };

  return (
    <header className="w-full max-w-4xl mx-auto pt-4 pb-2 px-4 flex items-center justify-between gap-3 relative z-30">
      {/* Brand & Step Back */}
      <div className="flex items-center gap-3">
        {onBack && currentStep !== 'splash' && currentStep !== 'language' && (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all shadow-sm"
            title={t('backBtn')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={onReset}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black text-white tracking-tight">
                {t('appName')}
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {t('proBadge')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {t('appTagline')}
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Sound Toggle + Language Switcher + Reset */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className={`p-2 rounded-2xl border transition-all ${
            soundEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
          title={soundEnabled ? t('soundOn') : t('soundOff')}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Compact Language Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 backdrop-blur-md">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                language === lang.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Reset / Home */}
        {onReset && currentStep !== 'splash' && (
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-2xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
            title={t('resetFlow')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
