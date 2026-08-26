import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { ShoppingBag, Globe, Volume2, Sparkles } from 'lucide-react';

interface HeaderProps {
  onSpeakWelcome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSpeakWelcome }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'bn', label: 'বাংলা', flag: '🇧🇩/🇮🇳' },
    { id: 'en', label: 'English', flag: '🌐' },
    { id: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <header className="w-full max-w-4xl mx-auto pt-6 pb-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {t('appName')}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Free
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t('appTagline')}
          </p>
        </div>
      </div>

      {/* Language Switcher + Audio Guide Button */}
      <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-1">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                language === lang.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {onSpeakWelcome && (
          <button
            onClick={onSpeakWelcome}
            title={t('speakPrompt')}
            className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 ml-1"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
