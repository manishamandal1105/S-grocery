import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { BusinessTypeOption } from '../types';
import {
  ArrowLeft,
  User,
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Check
} from 'lucide-react';

interface OwnerLoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (data: {
    ownerName: string;
    shopName: string;
    email: string;
    businessType: BusinessTypeOption;
  }) => void;
}

export const OwnerLoginScreen: React.FC<OwnerLoginScreenProps> = ({ onBack, onLoginSuccess }) => {
  const { language } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();

  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessTypeOption | ''>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Translations dynamically adapting to the selected language (Requirement 4)
  const texts = {
    en: {
      title: "Owner Login",
      subtitle: "Login to manage your shop",
      nameLabel: "Name",
      namePlaceholder: "Enter your name",
      storeNameLabel: "Store Name",
      storeNamePlaceholder: "Enter your store name",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password (min 6 characters)",
      forgotPassword: "Forgot Password?",
      businessTypeLabel: "Business Type",
      selectBusinessType: "Select business type",
      loginBtn: "Login",
      errPasswordLength: "Password must contain at least 6 characters.",
      errRequired: "Please enter your email and password.",
      locale: "en-US",
      opts: ["Retail Shop", "Shop & Supply", "Wholesale"] as BusinessTypeOption[],
    },
    bn: {
      title: "দোকান মালিকের লগইন",
      subtitle: "দোকান পরিচালনা করতে লগইন করুন",
      nameLabel: "নাম",
      namePlaceholder: "আপনার নাম লিখুন",
      storeNameLabel: "দোকানের নাম",
      storeNamePlaceholder: "আপনার দোকানের নাম লিখুন",
      emailLabel: "ইমেল ঠিকানা",
      emailPlaceholder: "আপনার ইমেল লিখুন",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      businessTypeLabel: "ব্যবসার ধরন",
      selectBusinessType: "ব্যবসার ধরন নির্বাচন করুন",
      loginBtn: "লগইন করুন",
      errPasswordLength: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
      errRequired: "অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।",
      locale: "bn-IN",
      opts: ["Retail Shop", "Shop & Supply", "Wholesale"] as BusinessTypeOption[],
    },
    hi: {
      title: "दुकान मालिक लॉगिन",
      subtitle: "दुकान प्रबंधन के लिए लॉगिन करें",
      nameLabel: "नाम",
      namePlaceholder: "अपना नाम दर्ज करें",
      storeNameLabel: "दुकान का नाम",
      storeNamePlaceholder: "अपनी दुकान का नाम दर्ज करें",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "कम से कम 6 अक्षरों का पासवर्ड",
      forgotPassword: "पासवर्ड भूल गए?",
      businessTypeLabel: "व्यापार का प्रकार",
      selectBusinessType: "व्यापार का प्रकार चुनें",
      loginBtn: "लॉगिन करें",
      errPasswordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      errRequired: "कृपया ईमेल और पासवर्ड दर्ज करें।",
      locale: "hi-IN",
      opts: ["Retail Shop", "Shop & Supply", "Wholesale"] as BusinessTypeOption[],
    },
  };

  const currentT = texts[language] || texts.en;

  // Immediate voice assistance on input field focus/click without delay (Requirement 7)
  const handleFieldFocus = (fieldKey: 'name' | 'storeName' | 'email' | 'password' | 'businessType') => {
    let spokenText = '';
    if (fieldKey === 'name') spokenText = currentT.nameLabel;
    else if (fieldKey === 'storeName') spokenText = currentT.storeNameLabel;
    else if (fieldKey === 'email') spokenText = currentT.emailLabel;
    else if (fieldKey === 'password') spokenText = currentT.passwordLabel;
    else if (fieldKey === 'businessType') spokenText = currentT.businessTypeLabel;

    speak(spokenText, currentT.locale);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage(currentT.errRequired);
      return;
    }

    // Password validation: minimum 6 characters (Requirement 5)
    if (password.length < 6) {
      setErrorMessage(currentT.errPasswordLength);
      return;
    }

    soundFx.playSuccess();
    const finalStoreName = storeName.trim() || 'My Store';
    const finalOwnerName = name.trim() || 'Shop Owner';
    const finalBusinessType = businessType || 'Retail Shop';

    localStorage.setItem('sgrocery_is_logged_in', 'true');
    localStorage.setItem('sgrocery_store_name', finalStoreName);
    localStorage.setItem('sgrocery_owner_name', finalOwnerName);
    localStorage.setItem('sgrocery_user_role', 'owner');
    localStorage.setItem('sgrocery_business_type', finalBusinessType);
    localStorage.setItem('sgrocery_user_email', email.trim());

    onLoginSuccess({
      ownerName: finalOwnerName,
      shopName: finalStoreName,
      email: email.trim(),
      businessType: finalBusinessType,
    });
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between animate-fadeIn relative">
      
      {/* Top Kirana Storefront Banner spanning full width with Circular Back Button */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-slate-900">
        <img
          src="/assets/shop_owner_store.jpg"
          alt="Kirana Store Front"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />

        {/* Circular Back Button in Top-Left */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="absolute top-5 left-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Floating Store Icon Badge overlapping photo and card body */}
      <div className="relative -mt-12 sm:-mt-14 flex justify-center z-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 shadow-xl border-4 border-emerald-400 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#e8f7ee] flex items-center justify-center text-[#008744]">
            <Store className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Main Full-Screen Responsive Form Container */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-8 py-4 flex-1 flex flex-col justify-center">
        
        {/* Header Title & Subtitle in Selected Language */}
        <div className="text-center pb-6">
          <h2 className="text-2xl sm:text-4xl font-black text-[#004c24] tracking-tight">
            {currentT.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            {currentT.subtitle}
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          {/* 1. Name Field */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              <User className="w-4 h-4 text-slate-600" />
              <span>{currentT.nameLabel}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => handleFieldFocus('name')}
              placeholder={currentT.namePlaceholder}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#008744] focus:ring-2 focus:ring-[#008744]/20 outline-none text-base font-semibold text-slate-900 bg-white transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* 2. Store Name Field */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              <Store className="w-4 h-4 text-slate-600" />
              <span>{currentT.storeNameLabel}</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              onFocus={() => handleFieldFocus('storeName')}
              placeholder={currentT.storeNamePlaceholder}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#008744] focus:ring-2 focus:ring-[#008744]/20 outline-none text-base font-semibold text-slate-900 bg-white transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* 3. Email Address Field */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              <Mail className="w-4 h-4 text-slate-600" />
              <span>{currentT.emailLabel}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleFieldFocus('email')}
              placeholder={currentT.emailPlaceholder}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#008744] focus:ring-2 focus:ring-[#008744]/20 outline-none text-base font-semibold text-slate-900 bg-white transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* 4. Password Field (Min 6 Characters Validation - Requirement 5) */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>{currentT.passwordLabel}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFieldFocus('password')}
                placeholder={currentT.passwordPlaceholder}
                className="w-full pl-4 sm:pl-5 pr-12 py-3.5 sm:py-4 rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#008744] focus:ring-2 focus:ring-[#008744]/20 outline-none text-base font-semibold text-slate-900 bg-white transition-all placeholder:text-slate-400 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  alert('Password reset link will be sent to your registered email.');
                }}
                className="text-xs sm:text-sm font-bold text-[#008744] hover:underline cursor-pointer"
              >
                {currentT.forgotPassword}
              </button>
            </div>
          </div>

          {/* 5. Business Type Dropdown */}
          <div className="relative">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              <Store className="w-4 h-4 text-slate-600" />
              <span>{currentT.businessTypeLabel}</span>
            </label>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                handleFieldFocus('businessType');
                setIsDropdownOpen(!isDropdownOpen);
              }}
              onFocus={() => handleFieldFocus('businessType')}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#008744] bg-white flex items-center justify-between text-base font-semibold text-slate-800 cursor-pointer shadow-2xs"
            >
              <span className={businessType ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                {businessType || currentT.selectBusinessType}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100">
                {currentT.opts.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setBusinessType(opt);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-5 py-3.5 text-left text-sm sm:text-base font-bold text-slate-800 hover:bg-[#e8f7ee] hover:text-[#008744] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{opt}</span>
                    {businessType === opt && <Check className="w-5 h-5 text-[#008744]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Green Button */}
          <div className="pt-4 pb-6">
            <button
              type="submit"
              className="w-full py-4 sm:py-5 rounded-2xl bg-[#008744] hover:bg-[#07743d] active:scale-98 text-white font-extrabold text-lg shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
            >
              {currentT.loginBtn}
            </button>
          </div>
        </form>

      </div>

      {/* Bottom Decorative Grocery Graphic */}
      <div className="relative w-full h-24 sm:h-32 overflow-hidden mt-auto bg-slate-50">
        <img
          src="/assets/welcome_basket.jpg"
          alt="Supermarket grocery cart"
          className="w-full h-full object-cover object-bottom opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
      </div>

    </div>
  );
};
