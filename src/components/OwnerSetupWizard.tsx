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
    }, 400);

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
      email: 'mygrocer@gmail.com',
      phone: '+12345678900',
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

    setCurrentSubStep('quick-pin');
  };

  // Step 3 -> Step 4 validation & transition (kept for compatibility)
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
      const error = t('errorEmptyPin');
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
    { id: 'credentials', number: 1, title: t('loginPageTitle') },
    { id: 'shop-details', number: 2, title: t('shopInfoPageTitle') },
    { id: 'quick-pin', number: 3, title: t('stepPin') },
  ];

  const getCurrentStepIndex = () => {
    switch (currentSubStep) {
      case 'credentials':
        return 1;
      case 'shop-details':
      case 'business-type':
        return 2;
      case 'quick-pin':
        return 3;
      default:
        return 1;
    }
  };

  const renderForgotModal = () => {
    if (!showForgotModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
        <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white border border-[#dce8e0] shadow-2xl space-y-5 relative text-slate-800">
          <button
            type="button"
            onClick={handleCloseForgotModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#edf4ee] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#e8f5ec] text-[#235338] flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#183626]">
                {t('forgotPasswordTitle')}
              </h3>
              <p className="text-xs text-[#5e7768]">
                {t('forgotPasswordDesc')}
              </p>
            </div>
          </div>

          {forgotSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('forgotPasswordSuccess')}</span>
              </div>
              <button
                type="button"
                onClick={handleCloseForgotModal}
                className="w-full py-2.5 rounded-xl bg-[#235338] text-white font-extrabold text-xs shadow-md hover:bg-[#1a442c]"
              >
                {t('btnClose')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b3a2b] mb-1.5">
                  {formData.loginMethod === 'email' ? t('emailLabel') : t('phoneLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5e7768]">
                    {formData.loginMethod === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type={formData.loginMethod === 'email' ? 'email' : 'tel'}
                    value={forgotContact}
                    onChange={(e) => setForgotContact(e.target.value)}
                    placeholder={formData.loginMethod === 'email' ? t('emailPlaceholder') : t('phonePlaceholder')}
                    className="w-full bg-[#fbfcf9] border border-[#dce8e0] rounded-2xl py-3 px-4 pl-10 text-sm font-medium text-[#1b3a2b] placeholder-[#94a39a] focus:border-[#235338] outline-none"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-2xl bg-[#235338] hover:bg-[#1a442c] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('btnSendResetLink')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseForgotModal}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {t('btnClose')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  // -------------------- SCREEN 1 OF 4: SHOP OWNER LOGIN (MATCHES MOCKUP SCREEN 3 FULL-SCREEN) --------------------
  if (currentSubStep === 'credentials') {
    return (
      <div className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] text-slate-800 animate-fade-in relative pb-8 sm:pb-12">
        <div className="w-full">
          {/* Top Supermarket Grocery Aisle Banner with Curve matching Image 3 (Full-Width Edge-to-Edge) */}
          <div className="w-full h-48 sm:h-60 md:h-72 lg:h-80 relative bg-slate-900 overflow-hidden">
            <img
              src="/assets/grocery_aisle.jpg"
              alt="Grocery store aisle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Back Arrow on top-left */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onBack();
              }}
              className="absolute top-4 left-4 p-2 rounded-full bg-white/85 hover:bg-white text-[#183626] shadow-md transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Organic Curved Wave transition down to the card */}
            <svg
              viewBox="0 0 1200 60"
              className="absolute bottom-0 left-0 w-full h-10 sm:h-14 lg:h-16 text-[#fbfcf9] fill-current"
              preserveAspectRatio="none"
            >
              <path d="M0,35 C380,70 820,0 1200,35 L1200,60 L0,60 Z" />
            </svg>
          </div>

          {/* Overlapping Store Icon Badge matching Image 3 */}
          <div className="flex justify-center -mt-9 sm:-mt-11 md:-mt-12 relative z-10">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#e8f5ec] border-4 border-[#fbfcf9] text-[#183626] shadow-md flex items-center justify-center">
              <Store className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2]" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center px-4 pt-3 pb-4 max-w-md sm:max-w-lg mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183626] tracking-tight">
              {t('loginPageTitle')}
            </h1>
            <p className="text-sm sm:text-base text-[#5e7768] font-medium mt-1">
              {t('loginPageSubtitle')}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="max-w-md sm:max-w-lg mx-auto px-4 sm:px-6 mb-3">
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <span>⚠️ {errorMessage}</span>
              </div>
            </div>
          )}

          {/* Segmented Toggle: Email vs Phone Number */}
          <div className="px-4 sm:px-6 mb-5 max-w-xs sm:max-w-sm mx-auto">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#edf4ee] border border-[#dce8e0]">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  handleChange('loginMethod', 'email');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.loginMethod === 'email'
                    ? 'bg-[#235338] text-white shadow-sm'
                    : 'text-[#486354] hover:text-[#1b3a2b]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t('loginEmailTab')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  handleChange('loginMethod', 'phone');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formData.loginMethod === 'phone'
                    ? 'bg-[#235338] text-white shadow-sm'
                    : 'text-[#486354] hover:text-[#1b3a2b]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('loginPhoneTab')}</span>
              </button>
            </div>
          </div>

          {/* Form Inputs (Comfortable Centered Container on Tablet & Desktop) */}
          <form onSubmit={handleNextFromCredentials} className="w-full max-w-md sm:max-w-lg mx-auto px-4 sm:px-6 space-y-4">
            {formData.loginMethod === 'email' ? (
              <div>
                <label className="block text-xs font-bold text-[#1b3a2b] mb-1.5">
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5e7768]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full bg-white border border-[#dce8e0] rounded-2xl py-3 px-4 pl-10 text-sm font-medium text-[#1b3a2b] placeholder-[#94a39a] focus:border-[#235338] focus:ring-2 focus:ring-[#235338]/15 outline-none shadow-xs transition-all"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#1b3a2b] mb-1.5">
                  {t('phoneLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5e7768]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t('phonePlaceholder')}
                    className="w-full bg-white border border-[#dce8e0] rounded-2xl py-3 px-4 pl-10 text-sm font-medium text-[#1b3a2b] placeholder-[#94a39a] focus:border-[#235338] focus:ring-2 focus:ring-[#235338]/15 outline-none shadow-xs transition-all"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#1b3a2b] mb-1.5">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5e7768]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full bg-white border border-[#dce8e0] rounded-2xl py-3 px-4 pl-10 pr-10 text-sm font-medium text-[#1b3a2b] placeholder-[#94a39a] focus:border-[#235338] focus:ring-2 focus:ring-[#235338]/15 outline-none shadow-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5e7768] hover:text-[#1b3a2b] cursor-pointer"
                  title={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password link */}
              <div className="text-right mt-1.5">
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-xs font-semibold text-[#235338] hover:underline cursor-pointer"
                >
                  {t('forgotPasswordBtn')}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#235338] hover:bg-[#1a442c] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{t('btnLogin')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>

              {/* Divider: or */}
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="h-px bg-[#e2ede5] flex-1" />
                <span className="text-xs text-[#8ca094] font-medium">{t('orDivider')}</span>
                <span className="h-px bg-[#e2ede5] flex-1" />
              </div>

              {/* Secondary Button: Create New Account */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  handleFillDemo();
                  setCurrentSubStep('shop-details');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#edf4ee] hover:bg-[#e2ede4] active:scale-[0.99] text-[#235338] font-bold text-sm transition-all shadow-xs cursor-pointer"
              >
                {t('btnCreateAccount')}
              </button>
            </div>
          </form>
        </div>

        <div className="p-4 text-center mt-4">
          <span className="text-xs text-[#5e7768] font-medium">
            🔒 {t('encryptedSecurityNote')}
          </span>
        </div>

        {renderForgotModal()}
      </div>
    );
  }

  // -------------------- SCREEN 2: SHOP INFO (EXACTLY MATCHING USER'S SCREENSHOT) --------------------
  if (currentSubStep === 'shop-details' || currentSubStep === 'business-type') {
    return (
      <div className="w-full flex-1 flex flex-col justify-start bg-white text-slate-800 animate-fade-in relative selection:bg-emerald-600 selection:text-white pb-8 sm:pb-12">
        {/* Responsive Centered Shell for Laptop, Desktop, Tablet, and Mobile */}
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto bg-white sm:my-6 sm:rounded-3xl sm:shadow-xl sm:border sm:border-[#dce8e0] overflow-hidden flex flex-col">
          {/* Solid Forest Green Curved Header */}
          <div className="w-full bg-[#0b4d2c] pt-5 sm:pt-7 pb-2 px-5 sm:px-7 text-white relative">
            <div className="flex flex-col items-start">
              {/* Back Arrow */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setCurrentSubStep('credentials');
                }}
                className="p-1 -ml-1 text-white hover:text-emerald-200 transition-colors cursor-pointer mb-3"
                title={t('backBtn')}
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                {t('shopInfoPageTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
                {t('shopInfoPageSubtitle')}
              </p>
            </div>
          </div>

          {/* Organic Wave Transition (with layered mint accent on the right) */}
          <div className="relative w-full overflow-hidden leading-none bg-[#0b4d2c]">
            <svg
              viewBox="0 0 1000 80"
              className="w-full h-8 sm:h-12 md:h-14 block"
              preserveAspectRatio="none"
            >
              {/* Mint wave accent swooping on the right */}
              <path
                d="M 450,28 C 650,2 820,10 1000,45 L 1000,80 L 450,80 Z"
                fill="#caeecd"
              />
              {/* White background curve cutting into dark green & mint wave */}
              <path
                d="M 0,25 C 220,55 420,52 620,38 C 760,28 880,40 1000,60 L 1000,80 L 0,80 Z"
                fill="#ffffff"
              />
            </svg>
          </div>

          {/* Main Form Body */}
          <div className="w-full px-5 sm:px-7 pt-2 pb-8 sm:pb-10 space-y-5 sm:space-y-6">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Live Voice Waveform if microphone is recording */}
            {isListening && (
              <div className="p-3.5 rounded-2xl bg-[#e8f5ec] border border-emerald-300 shadow-xs flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0b4d2c] text-white flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#183626]">
                      {activeMicField === 'ownerName' ? t('ownerNameVoicePrompt') : t('shopNameVoicePrompt')}
                    </p>
                    <p className="text-[10px] text-[#5e7768]">{t('speakClearlyHint')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 h-5">
                  <span className="w-1 bg-[#0b4d2c] rounded-full animate-wave-1"></span>
                  <span className="w-1 bg-[#0b4d2c] rounded-full animate-wave-2"></span>
                  <span className="w-1 bg-[#0b4d2c] rounded-full animate-wave-3"></span>
                  <span className="w-1 bg-[#0b4d2c] rounded-full animate-wave-4"></span>
                </div>
              </div>
            )}

            <form onSubmit={handleNextFromDetails} className="space-y-5 sm:space-y-6">
              {/* Field 1: Owner's Full Name */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#183626] mb-1.5 flex items-center">
                  <span>{t('ownerFullNameLabel')}</span>
                  <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <div className="relative flex items-center bg-white border border-[#d6e3db] rounded-2xl shadow-2xs hover:border-[#a8cbba] focus-within:border-[#0b4d2c] focus-within:ring-2 focus-within:ring-[#0b4d2c]/15 transition-all">
                  <div className="pl-3.5 pr-2.5 text-[#183626] flex items-center justify-center pointer-events-none">
                    <User className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    placeholder={t('ownerFullNamePlaceholder')}
                    className="w-full py-3.5 pr-2 bg-transparent text-sm sm:text-base font-medium text-[#183626] placeholder-[#9caea4] outline-none"
                    autoFocus
                  />
                  <div className="pr-2.5 pl-1">
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('ownerName')}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        activeMicField === 'ownerName'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#e8f5ec] hover:bg-[#d6eedc] text-[#0b4d2c]'
                      }`}
                      title={t('ownerNameVoicePrompt')}
                    >
                      <Mic className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Field 2: Shop / Store Name */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#183626] mb-1.5 flex items-center">
                  <span>{t('shopStoreNameLabel')}</span>
                  <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
                <div className="relative flex items-center bg-white border border-[#d6e3db] rounded-2xl shadow-2xs hover:border-[#a8cbba] focus-within:border-[#0b4d2c] focus-within:ring-2 focus-within:ring-[#0b4d2c]/15 transition-all">
                  <div className="pl-3.5 pr-2.5 text-[#183626] flex items-center justify-center pointer-events-none">
                    <Store className="w-5 h-5 stroke-[2]" />
                  </div>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => handleChange('shopName', e.target.value)}
                    placeholder={t('shopStoreNamePlaceholder')}
                    className="w-full py-3.5 pr-2 bg-transparent text-sm sm:text-base font-medium text-[#183626] placeholder-[#9caea4] outline-none"
                  />
                  <div className="pr-2.5 pl-1">
                    <button
                      type="button"
                      onClick={() => handleVoiceInput('shopName')}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        activeMicField === 'shopName'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#e8f5ec] hover:bg-[#d6eedc] text-[#0b4d2c]'
                      }`}
                      title={t('shopNameVoicePrompt')}
                    >
                      <Mic className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Field 3: Select Business Type */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-[#183626] mb-3">
                  {t('selectBusinessTypeLabel')}
                </label>

                <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                  {/* Card 1: Small Shop */}
                  <div
                    onClick={() => handleSelectBusinessType('small')}
                    role="button"
                    tabIndex={0}
                    className={`relative rounded-2xl p-2.5 sm:p-3.5 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer ${
                      formData.businessType === 'small'
                        ? 'bg-[#e9f7ee] border-2 border-[#166534] shadow-xs ring-1 ring-[#166534]/20'
                        : 'bg-white border border-[#dce8e0] hover:border-emerald-300'
                    }`}
                  >
                    {/* Top right speaker audio button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        speak(t('shopTypeSmallAudio'));
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d7eedc] text-[#166534] hover:bg-[#c2e7c9] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title={t('shopTypeSmallAudio')}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Center avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#d7eedc] text-[#166534] flex items-center justify-center mt-3 mb-2 shrink-0">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
                    </div>

                    {/* Title & Description */}
                    <div className="text-center w-full">
                      <h4 className="text-xs sm:text-sm font-bold text-[#183626] leading-tight">
                        {t('shopTypeSmallTitle')}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-[#486653] leading-tight mt-1 whitespace-pre-line">
                        {t('shopTypeSmallDesc')}
                      </p>
                    </div>

                    {/* Bottom Radio Circle */}
                    <div className="mt-3 mb-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.businessType === 'small'
                            ? 'border-[#166534]'
                            : 'border-[#cadad0]'
                        }`}
                      >
                        {formData.businessType === 'small' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Medium Shop */}
                  <div
                    onClick={() => handleSelectBusinessType('medium')}
                    role="button"
                    tabIndex={0}
                    className={`relative rounded-2xl p-2.5 sm:p-3.5 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer ${
                      formData.businessType === 'medium'
                        ? 'bg-[#e9f7ee] border-2 border-[#166534] shadow-xs ring-1 ring-[#166534]/20'
                        : 'bg-white border border-[#dce8e0] hover:border-emerald-300'
                    }`}
                  >
                    {/* Top right speaker audio button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        speak(t('shopTypeMediumAudio'));
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d7eedc] text-[#166534] hover:bg-[#c2e7c9] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title={t('shopTypeMediumAudio')}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Center avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#d7eedc] text-[#166534] flex items-center justify-center mt-3 mb-2 shrink-0">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
                    </div>

                    {/* Title & Description */}
                    <div className="text-center w-full">
                      <h4 className="text-xs sm:text-sm font-bold text-[#183626] leading-tight">
                        {t('shopTypeMediumTitle')}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-[#5e7768] leading-tight mt-1 whitespace-pre-line">
                        {t('shopTypeMediumDesc')}
                      </p>
                    </div>

                    {/* Bottom Radio Circle */}
                    <div className="mt-3 mb-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.businessType === 'medium'
                            ? 'border-[#166534]'
                            : 'border-[#cadad0]'
                        }`}
                      >
                        {formData.businessType === 'medium' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Large Shop */}
                  <div
                    onClick={() => handleSelectBusinessType('large')}
                    role="button"
                    tabIndex={0}
                    className={`relative rounded-2xl p-2.5 sm:p-3.5 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer ${
                      formData.businessType === 'large'
                        ? 'bg-[#e9f7ee] border-2 border-[#166534] shadow-xs ring-1 ring-[#166534]/20'
                        : 'bg-white border border-[#dce8e0] hover:border-emerald-300'
                    }`}
                  >
                    {/* Top right speaker audio button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        speak(t('shopTypeLargeAudio'));
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d7eedc] text-[#166534] hover:bg-[#c2e7c9] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title={t('shopTypeLargeAudio')}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Center avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#d7eedc] text-[#166534] flex items-center justify-center mt-3 mb-2 shrink-0">
                      <Store className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
                    </div>

                    {/* Title & Description */}
                    <div className="text-center w-full">
                      <h4 className="text-xs sm:text-sm font-bold text-[#183626] leading-tight">
                        {t('shopTypeLargeTitle')}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-[#5e7768] leading-tight mt-1 whitespace-pre-line">
                        {t('shopTypeLargeDesc')}
                      </p>
                    </div>

                    {/* Bottom Radio Circle */}
                    <div className="mt-3 mb-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.businessType === 'large'
                            ? 'border-[#166534]'
                            : 'border-[#cadad0]'
                        }`}
                      >
                        {formData.businessType === 'large' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Button: NEXT -> */}
              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#0b4d2c] hover:bg-[#073920] active:scale-[0.99] text-white font-extrabold text-base tracking-wider shadow-lg shadow-emerald-950/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{t('btnNextCaps')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- SCREEN 3: SET 4-DIGIT QUICK PIN (MATCHING USER SCREENSHOT) --------------------
  return (
    <div className="w-full flex-1 flex flex-col justify-start bg-white text-slate-800 animate-fade-in relative selection:bg-emerald-600 selection:text-white pb-8 sm:pb-12">
      {/* Responsive Centered Shell for Desktop, Laptop, Tablet, and Mobile */}
      <div className="w-full max-w-md sm:max-w-lg mx-auto bg-white sm:my-6 sm:rounded-3xl sm:shadow-xl sm:border sm:border-[#dce8e0] px-6 sm:px-8 py-5 sm:py-8 flex flex-col">
        {/* Top Navigation Row: Back Arrow */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setCurrentSubStep('shop-details');
            }}
            className="p-2 -ml-2 rounded-xl text-[#0b4d2c] hover:bg-[#ecf7ef] transition-colors cursor-pointer"
            title={t('backBtn')}
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b4d2c] tracking-tight uppercase">
            {t('quickPinTitleExact')}
          </h1>
          <p className="text-xs sm:text-sm text-[#55695d] font-normal mt-2 leading-relaxed max-w-xs sm:max-w-sm mx-auto whitespace-pre-line">
            {t('quickPinSubtitleExact')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 animate-shake">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* 4 PIN Display Boxes */}
        <div className="flex items-center justify-center gap-3.5 sm:gap-4 my-7 sm:my-8">
          {[0, 1, 2, 3].map((idx) => {
            const digit = formData.quickPin[idx];
            return (
              <div
                key={idx}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[1.5px] border-[#166534] bg-white flex items-center justify-center transition-all duration-200 shadow-2xs"
              >
                {digit ? (
                  <span className="w-4 h-4 rounded-full bg-[#0b4d2c] animate-scale-in" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Keypad Grid (3 x 4) */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto grid grid-cols-3 gap-3 sm:gap-4 mb-7 sm:mb-8">
          {/* Numbers 1-9 */}
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handlePinDigitPress(digit)}
              className="h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-[#ecf7ef] hover:bg-[#ddf2e2] active:scale-95 text-[#0b4d2c] font-black text-2xl sm:text-3xl flex items-center justify-center transition-all cursor-pointer shadow-2xs select-none"
            >
              {digit}
            </button>
          ))}

          {/* Row 4: Clear */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              handleChange('quickPin', '');
            }}
            className="h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-[#ecf7ef] hover:bg-[#ddf2e2] active:scale-95 text-[#0b4d2c] font-bold text-base sm:text-lg flex items-center justify-center transition-all cursor-pointer shadow-2xs select-none"
          >
            {t('btnClearExact')}
          </button>

          {/* Row 4: 0 */}
          <button
            type="button"
            onClick={() => handlePinDigitPress('0')}
            className="h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-[#ecf7ef] hover:bg-[#ddf2e2] active:scale-95 text-[#0b4d2c] font-black text-2xl sm:text-3xl flex items-center justify-center transition-all cursor-pointer shadow-2xs select-none"
          >
            0
          </button>

          {/* Row 4: Backspace Icon */}
          <button
            type="button"
            onClick={handlePinBackspace}
            className="h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-[#ecf7ef] hover:bg-[#ddf2e2] active:scale-95 text-[#0b4d2c] flex items-center justify-center transition-all cursor-pointer shadow-2xs select-none"
            title="Backspace"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>

        {/* Action Button: Review */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto">
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="w-full py-4 px-6 rounded-2xl sm:rounded-3xl bg-[#0b4d2c] hover:bg-[#073920] active:scale-[0.99] text-white font-bold text-lg sm:text-xl text-center shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
          >
            {t('btnReviewExact')}
          </button>
        </div>
      </div>

      {renderForgotModal()}
    </div>
  );
};
