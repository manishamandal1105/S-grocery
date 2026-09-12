import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Check, Volume2, ArrowRight } from 'lucide-react';

interface LanguageSelectScreenProps {
  onContinue: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onContinue }) => {
  const { language, setLanguage, t } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();

  // Spoken instructions when entering the language selection screen
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(t('pageAudioLang'));
    }, 450);

    return () => clearTimeout(timer);
  }, [language, speak, t]);

  const languagesList: {
    id: Language;
    label: string;
    nativeDesc: string;
    glyph: string;
    glyphSub: string;
    audioText: string;
    speechLang: string;
  }[] = [
    {
      id: 'bn',
      label: 'বাংলা',
      nativeDesc: 'বাংলায় সহজ ও দ্রুত মুদি দোকান পরিচালনা করুন',
      glyph: 'অ',
      glyphSub: 'বাং',
      audioText: 'বাংলা ভাষা নির্বাচন করা হয়েছে',
      speechLang: 'bn-IN',
    },
    {
      id: 'en',
      label: 'English',
      nativeDesc: 'Manage your smart grocery store in English',
      glyph: 'En',
      glyphSub: 'ENG',
      audioText: 'English language selected',
      speechLang: 'en-IN',
    },
    {
      id: 'hi',
      label: 'हिंदी',
      nativeDesc: 'सरल हिंदी में किराना दुकान और बिलिंग संभालें',
      glyph: 'अ',
      glyphSub: 'हिं',
      audioText: 'हिंदी भाषा चुनी गई है',
      speechLang: 'hi-IN',
    },
  ];

  const handleSelectLanguage = (lang: typeof languagesList[0]) => {
    soundFx.playClick();
    setLanguage(lang.id);
    speak(lang.audioText, lang.speechLang);
  };

  const handleNext = () => {
    soundFx.playClick();
    onContinue();
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Screen Header - Clean, without top icon or breadcrumb */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('selectLanguageTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-sm mx-auto">
          {t('selectLanguageSubtitle')}
        </p>

        <p className="text-[11px] text-amber-300/90 font-medium mt-3 bg-amber-500/10 py-1 px-3.5 rounded-full inline-block border border-amber-500/20">
          {t('audioOnTouchNote')}
        </p>
      </div>

      {/* Language Cards */}
      <div className="space-y-3.5 mb-8">
        {languagesList.map((item) => {
          const isSelected = language === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleSelectLanguage(item)}
              role="button"
              tabIndex={0}
              className={`p-4 sm:p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 relative flex items-center justify-between group ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900/90 border-emerald-400 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-400/30 scale-[1.02]'
                  : 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/80 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Specific Language Icon Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-transform group-hover:scale-110 shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/30'
                      : 'bg-slate-700/80 border border-slate-600 text-emerald-400'
                  }`}
                >
                  <span className="text-xl font-black leading-none">{item.glyph}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-80 mt-0.5">
                    {item.glyphSub}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {item.label}
                    </h3>
                    {isSelected && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                        {t('activeBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {item.nativeDesc}
                  </p>
                </div>
              </div>

              {/* Selection Check & Speaker Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLanguage(item);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 transition-colors"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/40'
                      : 'border-2 border-slate-600 group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleNext}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <span>{t('btnContinue')}</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
