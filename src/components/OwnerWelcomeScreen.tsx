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
    <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in relative text-slate-800">
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
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-3xl bg-[#e8f5ec] border border-[#d2e8d9] flex items-center justify-center text-[#235338] shadow-md animate-bounce">
          <Store className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e8f5ec] text-[#235338] text-xs font-bold border border-[#d2e8d9] mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t('welcomeStoreReady')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#183626] tracking-tight">
          {language === 'bn'
            ? `${data.shopName}-এ স্বাগতম!`
            : language === 'hi'
            ? `${data.shopName} में आपका स्वागत है!`
            : `Welcome to ${data.shopName}!`}
        </h1>

        <p className="text-sm text-[#5e7768] mt-1.5 max-w-md mx-auto">
          {t('welcomeSubtitle')}
        </p>
      </div>

      {/* Store Information Badge */}
      <div className="p-6 rounded-3xl bg-white border border-[#e2ede5] shadow-sm space-y-4 mb-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <span className="text-[10px] uppercase font-bold text-[#5e7768]">{t('welcomeOwnerLabel')}</span>
            <p className="text-sm font-bold text-[#183626] mt-0.5 truncate">{data.ownerName}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <span className="text-[10px] uppercase font-bold text-[#5e7768]">{t('welcomeStoreCodeLabel')}</span>
            <p className="text-sm font-black text-[#235338] mt-0.5">GROC-8821</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <span className="text-[10px] uppercase font-bold text-[#5e7768]">{t('welcomeTypeLabel')}</span>
            <p className="text-sm font-bold text-[#235338] mt-0.5 uppercase">{data.businessType}</p>
          </div>
        </div>
      </div>

      {/* Daily Quick PIN Unlock Demo Box */}
      <div className="p-6 rounded-3xl bg-white border border-[#e2ede5] shadow-sm mb-6 relative z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#edf4ee]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-[#183626]">
              {t('welcomeFastUnlockTitle')}
            </h3>
          </div>
          <span className="text-[10px] bg-[#e8f5ec] text-[#235338] font-bold px-2 py-0.5 rounded-full border border-[#d2e8d9]">
            PIN: {data.quickPin}
          </span>
        </div>

        {/* Unlock Status Alert */}
        {unlockStatus === 'success' && (
          <div className="p-3 rounded-2xl bg-[#e8f5ec] border border-[#cbe5cf] text-[#235338] text-xs font-bold flex items-center gap-2 animate-bounce">
            <Unlock className="w-4 h-4 text-[#235338]" />
            <span>{t('welcomeUnlockSuccess')}</span>
          </div>
        )}

        {unlockStatus === 'failed' && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-shake">
            <Lock className="w-4 h-4 text-red-500" />
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
                    ? 'border-[#235338] bg-[#e8f5ec] text-[#235338] shadow-sm'
                    : digit
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-[#dce8e0] bg-[#fbfcf9] text-slate-300'
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
                  className="h-10 rounded-xl bg-[#edf4ee] hover:bg-[#e2ede4] text-[#1b3a2b] font-bold text-xs cursor-pointer"
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
                  className="h-10 rounded-xl bg-[#edf4ee] hover:bg-[#e2ede4] text-[#1b3a2b] font-bold text-xs cursor-pointer"
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
                className="h-10 rounded-xl bg-white hover:bg-[#235338] hover:text-white border border-[#dce8e0] text-[#183626] font-bold text-base transition-all cursor-pointer shadow-2xs"
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
          className="w-full py-4 px-6 rounded-2xl bg-[#235338] hover:bg-[#1a442c] text-white font-bold text-lg shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
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
            className="text-xs font-semibold text-[#5e7768] hover:text-[#183626] px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetFlow')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
