import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OwnerSetupData, OwnerSetupSubStep, ShopType, LoginMethod } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import {
  Mail,
  Phone,
  Lock,
  User,
  Store,
  Eye,
  EyeOff,
  Mic,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Users,
  Building2,
  KeyRound,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  HelpCircle,
  X,
  Send
} from 'lucide-react';

interface OwnerSetupWizardProps {
  initialData: OwnerSetupData;
  onSubmitForReview: (data: OwnerSetupData) => void;
  onBack: () => void;
}

export const OwnerSetupWizard: React.FC<OwnerSetupWizardProps> = ({
  initialData,
  onSubmitForReview,
  onBack,
}) => {
  const { t, language } = useLanguage();
  const { isListening, startListening, stopListening, speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();

  // Internal 4-step progression
  const [currentSubStep, setCurrentSubStep] = useState<OwnerSetupSubStep>('credentials');
  const [formData, setFormData] = useState<OwnerSetupData>({
    loginMethod: initialData.loginMethod || 'email',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: initialData.password || '',
    ownerName: initialData.ownerName || '',
    shopName: initialData.shopName || '',
    businessType: initialData.businessType || 'small',
    quickPin: initialData.quickPin || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [activeMicField, setActiveMicField] = useState<'ownerName' | 'shopName' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotContact, setForgotContact] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Auto-speak instructions when entering a sub-step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSubStep === 'credentials') {
        speak(t('pageAudioCreds'));
      } else if (currentSubStep === 'shop-details') {
        speak(t('pageAudioDetails'));
      } else if (currentSubStep === 'business-type') {
        speak(t('pageAudioType'));
      } else if (currentSubStep === 'quick-pin') {
        speak(t('pageAudioPin'));
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [currentSubStep, language, speak, t]);

  const handleChange = (field: keyof OwnerSetupData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleVoiceInput = (field: 'ownerName' | 'shopName') => {
    if (isListening && activeMicField === field) {
      stopListening();
      setActiveMicField(null);
      return;
    }

    soundFx.playClick();
    setActiveMicField(field);

    const promptText =
      field === 'ownerName'
        ? t('ownerNameVoicePrompt')
        : t('shopNameVoicePrompt');

    speak(promptText, undefined, () => {
      startListening((text) => {
        if (text) {
          const formatted = text.trim();
          handleChange(field, formatted);
        }
        setActiveMicField(null);
      });
    });
  };

  const handleSelectBusinessType = (type: ShopType) => {
    soundFx.playClick();
    handleChange('businessType', type);

    // Voice reads out the selected type
    if (type === 'small') {
      speak(t('shopTypeSmallAudio'));
    } else if (type === 'medium') {
      speak(t('shopTypeMediumAudio'));
    } else {
      speak(t('shopTypeLargeAudio'));
    }
  };

  const handlePinDigitPress = (digit: string) => {
    if (formData.quickPin.length < 4) {
      soundFx.playPinTap(formData.quickPin.length);
      const newPin = formData.quickPin + digit;
      handleChange('quickPin', newPin);
    }
  };

  const handlePinBackspace = () => {
    soundFx.playClick();
    handleChange('quickPin', formData.quickPin.slice(0, -1));
  };

  const handleFillDemo = () => {
    soundFx.playClick();
    setFormData({
      loginMethod: 'email',
      email: 'owner.rajesh@sgrocery.com',
      phone: '01712345678',
      password: 'password123',
      ownerName: language === 'bn' ? 'রহিম মিয়া' : language === 'hi' ? 'राजेश कुमार' : 'Rajesh Kumar',
      shopName:
        language === 'bn'
          ? 'সততা মুদি ভান্ডার'
          : language === 'hi'
          ? 'लक्ष्मी किराना स्टोर'
          : 'Fresh Daily Kirana Mart',
      businessType: 'medium',
      quickPin: '8822',
    });
    setErrorMessage('');
  };

  // Step 1 -> Step 2 validation & transition with voice error alerts
  const handleNextFromCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setErrorMessage('');

    if (formData.loginMethod === 'email') {
      if (!formData.email.trim()) {
        const error = t('errorEmptyEmail');
        setErrorMessage(error);
        speak(error);
        return;
      }
      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        const error = t('errorInvalidEmail');
        setErrorMessage(error);
        speak(error);
        return;
      }
    } else {
      if (!formData.phone.trim()) {
        const error = t('errorEmptyPhone');
        setErrorMessage(error);
        speak(error);
        return;
      }
      if (formData.phone.trim().length < 6) {
        const error = t('errorInvalidPhone');
        setErrorMessage(error);
        speak(error);
        return;
      }
    }

    if (!formData.password) {
      const error = t('errorEmptyPassword');
      setErrorMessage(error);
      speak(error);
      return;
    }

    if (formData.password.length < 6) {
      const error = t('errorPasswordLength');
      setErrorMessage(error);
      speak(error);
      return;
    }

    setCurrentSubStep('shop-details');
  };

  // Step 2 -> Step 3 validation & transition with voice error alerts
  const handleNextFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setErrorMessage('');

    if (!formData.ownerName.trim()) {
      const error = t('errorEmptyOwnerName');
      setErrorMessage(error);
      speak(error);
      return;
    }

    if (!formData.shopName.trim()) {
      const error = t('errorEmptyShopName');
      setErrorMessage(error);
      speak(error);
      return;
    }

    setCurrentSubStep('business-type');
  };

  // Step 3 -> Step 4 validation & transition
  const handleNextFromBusinessType = () => {
    soundFx.playClick();
    setErrorMessage('');
    setCurrentSubStep('quick-pin');
  };

  // Step 4 -> Review Screen with voice error alert
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setErrorMessage('');

    if (formData.quickPin.length !== 4) {
      const error = t('errorPinLength');
      setErrorMessage(error);
      speak(error);
      return;
    }

    onSubmitForReview(formData);
  };

  // Forgot Password modal actions
  const handleOpenForgotModal = () => {
    soundFx.playClick();
    setForgotContact(formData.loginMethod === 'email' ? formData.email : formData.phone);
    setForgotSuccess(false);
    setShowForgotModal(true);
    speak(t('pageAudioForgotPassword'));
  };

  const handleCloseForgotModal = () => {
    soundFx.playClick();
    setShowForgotModal(false);
    setForgotSuccess(false);
  };

  const handleSubmitForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotContact.trim()) {
      const error = t('errorRequired');
      speak(error);
      return;
    }
    soundFx.playSuccessCelebration();
    setForgotSuccess(true);
    speak(t('forgotPasswordSuccess'));
  };

  const businessTypesList: {
    id: ShopType;
    title: string;
    desc: string;
    badge: string;
    icon: any;
  }[] = [
    {
      id: 'small',
      title: t('shopTypeSmallTitle'),
      desc: t('shopTypeSmallDesc'),
      badge: t('shopTypeSmallBadge'),
      icon: UserCheck,
    },
    {
      id: 'medium',
      title: t('shopTypeMediumTitle'),
      desc: t('shopTypeMediumDesc'),
      badge: t('shopTypeMediumBadge'),
      icon: Users,
    },
    {
      id: 'large',
      title: t('shopTypeLargeTitle'),
      desc: t('shopTypeLargeDesc'),
      badge: t('shopTypeLargeBadge'),
      icon: Building2,
    },
  ];

  const subStepsInfo = [
    { id: 'credentials', number: 1, title: t('stepCreds') },
    { id: 'shop-details', number: 2, title: t('stepDetails') },
    { id: 'business-type', number: 3, title: t('stepType') },
    { id: 'quick-pin', number: 4, title: t('stepPin') },
  ];

  const getCurrentStepIndex = () => {
    switch (currentSubStep) {
      case 'credentials':
        return 1;
      case 'shop-details':
        return 2;
      case 'business-type':
        return 3;
      case 'quick-pin':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('roleOwnerTitle')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('ownerSetupTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('ownerSetupSubtitle')}
          </p>
        </div>

        {/* Demo Fill Button */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t('demoAutoFillOwner')}</span>
        </button>
      </div>

      {/* 4-Step Progress Bar Navigator */}
      <div className="mb-6 p-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
        <div className="grid grid-cols-4 gap-1.5">
          {subStepsInfo.map((st) => {
            const currentIdx = getCurrentStepIndex();
            const isCurrent = st.number === currentIdx;
            const isCompleted = st.number < currentIdx;

            return (
              <div
                key={st.id}
                className={`py-2 px-1.5 rounded-xl text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'bg-slate-900/40 text-slate-500 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">
                  {t('stepBadge')} {st.number}
                </div>
                <div className="text-[11px] truncate">{st.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-2 animate-shake">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* Voice Assistant Live Waveform Status */}
      {isListening && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 shadow-lg shadow-emerald-500/20 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">
                {activeMicField === 'ownerName' ? t('ownerNameVoicePrompt') : t('shopNameVoicePrompt')}
              </p>
              <p className="text-[11px] text-slate-300">{t('speakClearlyHint')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 h-6">
            <span className="w-1 bg-emerald-400 rounded-full animate-wave-1"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-wave-2"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-wave-3"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-wave-4"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-wave-5"></span>
          </div>
        </div>
      )}

      {/* -------------------- SCREEN 1 OF 4: CREDENTIALS (EMAIL / PHONE & PASSWORD) -------------------- */}
      {currentSubStep === 'credentials' && (
        <form onSubmit={handleNextFromCredentials} className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-800/80 border-2 border-slate-700 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t('stepCreds')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('ownerSetupSubtitle')}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t('freeBadge')}
              </span>
            </div>

            {/* Login Method Segmented Toggle: Email vs Phone */}
            <div>
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    handleChange('loginMethod', 'email');
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    formData.loginMethod === 'email'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>{t('loginEmailTab')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    handleChange('loginMethod', 'phone');
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    formData.loginMethod === 'phone'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('loginPhoneTab')}</span>
                </button>
              </div>
            </div>

            {/* Email Field */}
            {formData.loginMethod === 'email' ? (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('emailLabel')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="grocery-input pl-11 pr-4 text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              /* Phone Number Field */
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('phoneLabel')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t('phonePlaceholder')}
                    className="grocery-input pl-11 pr-4 text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Password with Show/Hide */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {t('passwordLabel')} *
                </label>

                {/* Forgot Password Button */}
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t('forgotPasswordBtn')}</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="grocery-input pl-11 pr-12 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  title={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 text-emerald-400" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('encryptedSecurityNote')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t('stepNextShopInfo')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onBack();
                }}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors"
              >
                ← {t('backBtn')}
              </button>

              <button
                type="button"
                onClick={handleFillDemo}
                className="sm:hidden text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20"
              >
                {t('demoAutoFillOwner')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* -------------------- SCREEN 2 OF 4: OWNER & SHOP DETAILS (VOICE ENABLED) -------------------- */}
      {currentSubStep === 'shop-details' && (
        <form onSubmit={handleNextFromDetails} className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-800/80 border-2 border-slate-700 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t('stepDetails')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('speakOrTypeHint')}
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {t('voiceInputBadge')}
              </span>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>{t('ownerNameLabel')} *</span>
                <span className="text-[10px] text-slate-400">{t('speakOrTypeHint')}</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  placeholder={t('ownerNamePlaceholder')}
                  className="grocery-input pl-11 pr-14 text-sm font-medium"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('ownerName')}
                  className={`absolute inset-y-1.5 right-1.5 px-3 rounded-xl flex items-center justify-center transition-all ${
                    activeMicField === 'ownerName'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                  }`}
                  title={t('ownerNameVoicePrompt')}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>{t('shopNameLabel')} *</span>
                <span className="text-[10px] text-slate-400">{t('speakOrTypeHint')}</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => handleChange('shopName', e.target.value)}
                  placeholder={t('shopNamePlaceholder')}
                  className="grocery-input pl-11 pr-14 text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('shopName')}
                  className={`absolute inset-y-1.5 right-1.5 px-3 rounded-xl flex items-center justify-center transition-all ${
                    activeMicField === 'shopName'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                  }`}
                  title={t('shopNameVoicePrompt')}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t('stepNextBusinessType')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setCurrentSubStep('credentials');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {t('backBtn')}</span>
            </button>
          </div>
        </form>
      )}

      {/* -------------------- SCREEN 3 OF 4: BUSINESS TYPE SELECTION -------------------- */}
      {currentSubStep === 'business-type' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-800/80 border-2 border-slate-700 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t('businessTypeLabel')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('businessTypeDesc')}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                🔊 {t('audioGuide')}
              </span>
            </div>

            {/* 3 Business Type Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {businessTypesList.map((item) => {
                const Icon = item.icon;
                const isSelected = formData.businessType === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectBusinessType(item.id)}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/70 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30 scale-[1.03]'
                        : 'border-slate-700/80 bg-slate-900/70 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-snug">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-700/50">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleNextFromBusinessType}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t('stepNextQuickPin')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setCurrentSubStep('shop-details');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {t('backBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------- SCREEN 4 OF 4: 4-DIGIT QUICK PIN -------------------- */}
      {currentSubStep === 'quick-pin' && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-800/80 border-2 border-slate-700 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
                  4
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t('quickPinTitle')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('quickPinSubtitle')}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ⚡ {t('quickPinPlaceholder')}
              </span>
            </div>

            {/* 4 PIN Display Boxes */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const digit = formData.quickPin[idx];
                return (
                  <div
                    key={idx}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-extrabold transition-all duration-200 ${
                      digit
                        ? 'border-emerald-400 bg-emerald-950/70 text-emerald-300 shadow-md shadow-emerald-500/20 scale-105'
                        : 'border-slate-700 bg-slate-900/80 text-slate-500'
                    }`}
                  >
                    {digit ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {/* Interactive PIN Numpad */}
            <div className="max-w-xs mx-auto grid grid-cols-3 gap-2.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => {
                if (btn === 'C') {
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleChange('quickPin', '');
                      }}
                      className="h-12 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
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
                      onClick={handlePinBackspace}
                      className="h-12 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handlePinDigitPress(btn)}
                    className="h-12 rounded-2xl bg-slate-700/80 hover:bg-emerald-600 hover:text-slate-950 text-white font-extrabold text-lg transition-all active:scale-95 shadow-sm"
                  >
                    {btn}
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('quickPinNotice')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t('stepReviewSubmit')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setCurrentSubStep('business-type');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {t('backBtn')}</span>
            </button>
          </div>
        </form>
      )}

      {/* -------------------- FORGOT PASSWORD MODAL -------------------- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={handleCloseForgotModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t('forgotPasswordTitle')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('forgotPasswordDesc')}
                </p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{t('forgotPasswordSuccess')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseForgotModal}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-md"
                >
                  {t('btnClose')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {formData.loginMethod === 'email' ? t('emailLabel') : t('phoneLabel')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {formData.loginMethod === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      type={formData.loginMethod === 'email' ? 'email' : 'tel'}
                      value={forgotContact}
                      onChange={(e) => setForgotContact(e.target.value)}
                      placeholder={formData.loginMethod === 'email' ? t('emailPlaceholder') : t('phonePlaceholder')}
                      className="grocery-input pl-10 pr-4 text-sm font-medium"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t('btnSendResetLink')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseForgotModal}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {t('btnClose')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
