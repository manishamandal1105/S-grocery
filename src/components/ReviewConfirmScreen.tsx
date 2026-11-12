import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import {
  Store,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  KeyRound,
  Volume2,
  VolumeX,
  ArrowRight,
  Edit3,
  CheckCircle2
} from 'lucide-react';

interface ReviewConfirmScreenProps {
  data: OwnerSetupData;
  onConfirm: () => void;
  onEdit: () => void;
}

export const ReviewConfirmScreen: React.FC<ReviewConfirmScreenProps> = ({
  data,
  onConfirm,
  onEdit,
}) => {
  const { t, language } = useLanguage();
  const { isSpeaking, speak, stopSpeaking } = useVoiceAssistant();
  const soundFx = useSoundEffects();

  const businessTypeLabels: Record<string, string> = {
    small: t('shopTypeSmallTitle'),
    medium: t('shopTypeMediumTitle'),
    large: t('shopTypeLargeTitle'),
  };

  const currentTypeLabel = businessTypeLabels[data.businessType] || data.businessType;

  // Build spoken review script
  const getSpeechScript = () => {
    if (language === 'bn') {
      return `দোকানের নাম: ${data.shopName}। মালিকের নাম: ${data.ownerName}। ব্যবসার ধরন: ${currentTypeLabel}। কুইক পিন সেট করা হয়েছে। দোকান চালু করতে নিশ্চিত করুন।`;
    } else if (language === 'hi') {
      return `दुकान का नाम: ${data.shopName}। मालिक का नाम: ${data.ownerName}। व्यापार का प्रकार: ${currentTypeLabel}। त्वरित पिन सेट है। दुकान शुरू करने के लिए पुष्टि करें।`;
    } else {
      return `Shop Name: ${data.shopName}. Owner Name: ${data.ownerName}. Business Type: ${currentTypeLabel}. Quick PIN is set. Tap launch to activate your store.`;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(getSpeechScript());
    }, 450);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [language, data]);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(getSpeechScript());
    }
  };

  const handleConfirmAction = () => {
    soundFx.playSuccessCelebration();
    onConfirm();
  };

  return (
    <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in text-slate-800">
      {/* Title Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183626] tracking-tight">
          {t('reviewTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#5e7768] mt-1 max-w-md mx-auto">
          {t('reviewSubtitle')}
        </p>
      </div>

      {/* Voice Assistant Reading Bar */}
      <div className="mb-6 p-4 rounded-3xl bg-[#e8f5ec] border border-[#d2e8d9] shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSpeaking ? 'bg-[#235338] text-white animate-bounce' : 'bg-white text-[#235338] border border-[#d2e8d9]'}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#183626]">
              {isSpeaking ? t('reviewAudioReading') : t('reviewVoiceReady')}
            </p>
            <p className="text-[11px] text-[#235338] font-semibold">
              {isSpeaking ? t('reviewListenActive') : t('reviewListenAgain')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSpeaking && (
            <div className="flex items-center gap-1 h-6">
              <span className="w-1 bg-[#235338] rounded-full animate-wave-1"></span>
              <span className="w-1 bg-[#235338] rounded-full animate-wave-2"></span>
              <span className="w-1 bg-[#235338] rounded-full animate-wave-3"></span>
              <span className="w-1 bg-[#235338] rounded-full animate-wave-4"></span>
              <span className="w-1 bg-[#235338] rounded-full animate-wave-5"></span>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleVoice}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#edf4ee] text-[#235338] text-xs font-bold border border-[#d2e8d9] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? t('stopAudio') : t('listenAudio')}</span>
          </button>
        </div>
      </div>

      {/* Summary Card Details */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#e2ede5] shadow-sm space-y-5 mb-8 relative overflow-hidden">
        {/* Decorative Store Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[#edf4ee]">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5ec] text-[#235338] flex items-center justify-center shadow-xs border border-[#d2e8d9]">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#235338] tracking-wider uppercase">
                {t('reviewShopName')}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#183626]">
                {data.shopName}
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#e8f5ec] text-[#235338] border border-[#d2e8d9] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#235338]" />
            {t('activeBadge')}
          </span>
        </div>

        {/* Detailed Grid: 1-col on mobile, 2-col on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Owner Name */}
          <div className="p-4 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <div className="flex items-center gap-2 text-[#5e7768] text-xs mb-1">
              <User className="w-4 h-4 text-[#235338]" />
              <span>{t('reviewOwnerName')}</span>
            </div>
            <p className="text-base font-bold text-[#183626]">{data.ownerName}</p>
          </div>

          {/* Business Type */}
          <div className="p-4 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <div className="flex items-center gap-2 text-[#5e7768] text-xs mb-1">
              <Building2 className="w-4 h-4 text-[#235338]" />
              <span>{t('reviewBusinessType')}</span>
            </div>
            <p className="text-base font-bold text-[#235338]">{currentTypeLabel}</p>
          </div>

          {/* Email / Phone Contact */}
          <div className="p-4 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <div className="flex items-center gap-2 text-[#5e7768] text-xs mb-1">
              {data.loginMethod === 'phone' ? (
                <Phone className="w-4 h-4 text-[#235338]" />
              ) : (
                <Mail className="w-4 h-4 text-[#235338]" />
              )}
              <span>{data.loginMethod === 'phone' ? t('reviewPhone') : t('reviewEmail')}</span>
            </div>
            <p className="text-sm font-semibold text-[#183626] truncate">
              {data.loginMethod === 'phone' ? data.phone : data.email}
            </p>
          </div>

          {/* Quick PIN */}
          <div className="p-4 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5]">
            <div className="flex items-center gap-2 text-[#5e7768] text-xs mb-1">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>{t('reviewPin')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-widest text-[#183626]">
                {data.quickPin ? '••••' : '1234'}
              </span>
              <span className="text-[10px] text-[#5e7768]">({data.quickPin})</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#fbfcf9] border border-[#e2ede5] text-xs text-[#5e7768] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#235338] shrink-0" />
          <span>{t('reviewEncryptedNote')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleConfirmAction}
          className="w-full py-4 px-6 rounded-2xl bg-[#235338] hover:bg-[#1a442c] text-white font-bold text-lg shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>{t('btnReviewConfirm')}</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onEdit();
          }}
          className="w-full py-3 px-6 rounded-2xl bg-[#edf4ee] hover:bg-[#e2ede4] text-[#235338] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Edit3 className="w-4 h-4" />
          <span>{t('btnReviewEdit')}</span>
        </button>
      </div>
    </div>
  );
};
