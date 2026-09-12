import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { ShoppingBag, Sparkles, ArrowRight, Volume2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t, language } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Play splash chime
    soundFx.playSplashChime();

    // Speak audio greeting based on language
    const speechTimer = setTimeout(() => {
      speak(t('splashGreeting'));
    }, 400);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(speechTimer);
      clearInterval(interval);
    };
  }, [language, onComplete, speak, soundFx, t]);

  const handleManualNext = () => {
    soundFx.playClick();
    onComplete();
  };

  const handleReplayAudio = () => {
    speak(t('splashGreeting'));
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden animate-fade-in">
      {/* Background Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Main Logo Container */}
      <div className="relative mb-8 group">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 transform group-hover:scale-105 transition-all duration-500 border border-white/20">
          <ShoppingBag className="w-14 h-14 sm:w-18 sm:h-18 text-white drop-shadow-md animate-float" />
        </div>

        {/* Floating Sparkle Badges */}
        <div className="absolute -top-2 -right-2 w-9 h-9 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-400/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-900" />
        </div>
      </div>

      {/* Brand & Greetings */}
      <div className="max-w-md space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('appName')} • {t('appTagline')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
          "{t('splashGreeting')}"
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium">
          {t('splashSubtitle')}
        </p>

        {/* Voice Audio Pronunciation Badge */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            onClick={handleReplayAudio}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 text-xs font-medium border border-emerald-500/20 shadow-sm transition-all"
            title="Play Audio"
          >
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{t('listenAudio')}: "{t('splashGreeting')}"</span>
          </button>
        </div>
      </div>

      {/* Progress & Skip Actions */}
      <div className="mt-12 flex flex-col items-center gap-4 relative z-10 w-full max-w-xs">
        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000 ease-linear shadow-sm shadow-emerald-400/50"
            style={{ width: `${((4 - countdown) / 3) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs text-slate-400 px-1">
          <span>{t('splashSettingUp')}</span>
          <span className="font-bold text-emerald-400">{countdown}s</span>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleManualNext}
          className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 shadow-lg transition-all duration-200 group"
        >
          <span>{t('splashSkip')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
