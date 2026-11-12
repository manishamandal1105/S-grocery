import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { ShoppingBag, Volume2, Sparkles, LogOut, Store } from 'lucide-react';

interface HeaderProps {
  onSpeakWelcome?: () => void;
  isLoggedIn?: boolean;
  storeName?: string;
  onLogout?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSpeakWelcome,
  isLoggedIn = false,
  storeName = '',
  onLogout,
  onGoHome,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'bn', label: 'বাংলা', flag: '🇧🇩/🇮🇳' },
    { id: 'en', label: 'English', flag: '🌐' },
    { id: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto pt-4 pb-3 px-3 sm:px-6 flex items-center justify-between gap-3">
      {/* Brand Logo & Name */}
      <div
        onClick={() => {
          if (isLoggedIn && onGoHome) onGoHome();
        }}
        className={`flex items-center gap-3 group ${isLoggedIn ? 'cursor-pointer' : ''}`}
        title={isLoggedIn ? 'Go to Home' : 'S-Grocery'}
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
              {t('appName')}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Free
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium line-clamp-1">
            {t('appTagline')}
          </p>
        </div>
      </div>

      {/* Center: Store Name & Logout (only when logged in) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isLoggedIn && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {storeName && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold shadow-2xs">
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[140px] truncate">{storeName}</span>
              </div>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t('btnLogout')}</span>
              </button>
            )}
          </div>
        )}

        {/* Language Switcher + Audio Guide Button */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-white/90 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
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
              className="p-1.5 sm:p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 ml-0.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
