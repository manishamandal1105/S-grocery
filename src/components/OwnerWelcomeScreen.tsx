import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData } from '../types';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import {
  Sparkles,
  Store,
  KeyRound,
  ArrowRight,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';

interface OwnerWelcomeScreenProps {
  data: OwnerSetupData;
  onReset: () => void;
  onGoToDashboard: () => void;
}

export const OwnerWelcomeScreen: React.FC<OwnerWelcomeScreenProps> = ({ data, onReset, onGoToDashboard }) => {
  const { t, language } = useLanguage();
  const soundFx = useSoundEffects();
  const { speak } = useVoiceAssistant();

  const [testPin, setTestPin] = useState('');
  const [unlockStatus, setUnlockStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  useEffect(() => {
    soundFx.playSuccessCelebration();
    const welcomeSpeech =
      language === 'bn'
        ? `${data.shopName}-এ আপনাকে স্বাগতম। আপনার দোকান সম্পূর্ণ প্রস্তুত।`
        : language === 'hi'
        ? `${data.shopName} में आपका स्वागत है। आपकी दुकान पूरी तरह तैयार है।`
        : `Welcome to ${data.shopName}. Your store is ready.`;
    speak(welcomeSpeech);
  }, [data.shopName, language, speak, soundFx]);

  const handleTestPinDigit = (digit: string) => {
    if (testPin.length < 4) {
      soundFx.playPinTap(testPin.length);
      const updated = testPin + digit;
      setTestPin(updated);

      if (updated.length === 4) {
        if (updated === data.quickPin) {
          soundFx.playSuccessCelebration();
          setUnlockStatus('success');
          const msg =
            language === 'bn'
              ? 'কুইক পিন সঠিক! ক্যাশ কাউন্টার আনলক হয়েছে।'
              : language === 'hi'
              ? 'पिन सही है! कैश काउंटर अनलॉक हो गया।'
              : 'PIN Verified! Store unlocked.';
          speak(msg);
        } else {
          soundFx.playClick();
          setUnlockStatus('failed');
          const failMsg =
            language === 'bn'
              ? 'ভুল পিন! পুনরায় চেষ্টা করুন।'
              : language === 'hi'
              ? 'गलत पिन! कृपया पुनः प्रयास करें।'
              : 'Incorrect PIN! Please try again.';
          speak(failMsg);
          setTimeout(() => {
            setTestPin('');
            setUnlockStatus('idle');
          }, 1500);
        }
      }
    }
  };

  const handleClearPin = () => {
    soundFx.playClick();
    setTestPin('');
    setUnlockStatus('idle');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in relative">
      {/* Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 30}%`,
              backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
              animationDelay: `${(i * 0.15).toFixed(1)}s`,
              animationDuration: `${2 + (i % 3) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Welcome Hero Card */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40 animate-bounce">
          <Store className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t('welcomeStoreReady')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {language === 'bn'
            ? `${data.shopName}-এ স্বাগতম!`
            : language === 'hi'
            ? `${data.shopName} में आपका स्वागत है!`
            : `Welcome to ${data.shopName}!`}
        </h1>

        <p className="text-sm text-slate-300 mt-1.5 max-w-md mx-auto">
          {t('welcomeSubtitle')}
        </p>
      </div>

      {/* Store Information Badge */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-2xl space-y-4 mb-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('welcomeOwnerLabel')}</span>
            <p className="text-sm font-bold text-white mt-0.5 truncate">{data.ownerName}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('welcomeStoreCodeLabel')}</span>
            <p className="text-sm font-black text-emerald-400 mt-0.5">GROC-8821</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('welcomeTypeLabel')}</span>
            <p className="text-sm font-bold text-teal-300 mt-0.5 uppercase">{data.businessType}</p>
          </div>
        </div>
      </div>

      {/* Daily Quick PIN Unlock Demo Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-800/90 to-emerald-950/40 border-2 border-emerald-500/30 shadow-xl mb-6 relative z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {t('welcomeFastUnlockTitle')}
            </h3>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
            PIN: {data.quickPin}
          </span>
        </div>

        {/* Unlock Status Alert */}
        {unlockStatus === 'success' && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Unlock className="w-4 h-4 text-emerald-400" />
            <span>{t('welcomeUnlockSuccess')}</span>
          </div>
        )}

        {unlockStatus === 'failed' && (
          <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 animate-shake">
            <Lock className="w-4 h-4 text-red-400" />
            <span>{t('welcomeUnlockFailed')}</span>
          </div>
        )}

        {/* PIN Boxes */}
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => {
            const digit = testPin[idx];
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                  unlockStatus === 'success'
                    ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-md'
                    : digit
                    ? 'border-amber-400 bg-amber-950/60 text-amber-300'
                    : 'border-slate-700 bg-slate-900/80 text-slate-500'
                }`}
              >
                {digit ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Interactive Mini Numpad */}
        <div className="max-w-xs mx-auto grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => {
            if (btn === 'C') {
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={handleClearPin}
                  className="h-10 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  {t('clearBtn')}
                </button>
              );
            }
            if (btn === '⌫') {
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setTestPin((prev) => prev.slice(0, -1));
                  }}
                  className="h-10 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={btn}
                type="button"
                onClick={() => handleTestPinDigit(btn)}
                className="h-10 rounded-xl bg-slate-700/80 hover:bg-emerald-600 hover:text-slate-950 text-white font-bold text-base transition-all"
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Action to Dashboard */}
      <div className="space-y-3 relative z-10">
        <button
          type="button"
          onClick={() => {
            soundFx.playSuccessCelebration();
            onGoToDashboard();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
        >
          <span>{t('btnLaunchDashboard')}</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
        </button>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onReset();
            }}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetFlow')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
