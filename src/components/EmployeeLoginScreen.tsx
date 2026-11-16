import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Grid
} from 'lucide-react';

interface EmployeeLoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (data: {
    employeeName: string;
    email: string;
    passcode: string;
  }) => void;
}

export const EmployeeLoginScreen: React.FC<EmployeeLoginScreenProps> = ({ onBack, onLoginSuccess }) => {
  const { language } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Translations dynamically adapting to the selected language (Requirement 4)
  const texts = {
    en: {
      title: "Employee Login",
      subtitle: "Login to access your work",
      nameLabel: "Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password (min 6 characters)",
      passcodeLabel: "Passcode",
      passcodePlaceholder: "Enter 4-digit passcode",
      forgotPassword: "Forgot Password?",
      loginBtn: "Login",
      errPasswordLength: "Password must contain at least 6 characters.",
      errPasscode: "Passcode must contain exactly 4 digits.",
      errRequired: "Please enter your email and password.",
      locale: "en-US",
    },
    bn: {
      title: "কর্মচারী লগইন",
      subtitle: "আপনার কাজের জন্য লগইন করুন",
      nameLabel: "নাম",
      namePlaceholder: "আপনার নাম লিখুন",
      emailLabel: "ইমেল ঠিকানা",
      emailPlaceholder: "আপনার ইমেল লিখুন",
      passwordLabel: "পাসওয়ার্ড",
      passwordPlaceholder: "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন",
      passcodeLabel: "পাসকোড",
      passcodePlaceholder: "ঠিক ৪ সংখ্যার পাসকোড দিন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      loginBtn: "লগইন করুন",
      errPasswordLength: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
      errPasscode: "পাসকোডটি অবশ্যই ঠিক ৪ সংখ্যার হতে হবে।",
      errRequired: "অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।",
      locale: "bn-IN",
    },
    hi: {
      title: "कर्मचारी लॉगिन",
      subtitle: "अपने काम के लिए लॉगिन करें",
      nameLabel: "नाम",
      namePlaceholder: "अपना नाम दर्ज करें",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "कम से कम 6 अक्षरों का पासवर्ड",
      passcodeLabel: "पासकोड",
      passcodePlaceholder: "ठीक 4 अंकों का पासकोड दर्ज करें",
      forgotPassword: "पासवर्ड भूल गए?",
      loginBtn: "लॉगिन करें",
      errPasswordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      errPasscode: "पासकोड ठीक 4 अंकों का होना चाहिए।",
      errRequired: "कृपया ईमेल और पासवर्ड दर्ज करें।",
      locale: "hi-IN",
    },
  };

  const currentT = texts[language] || texts.en;

  // Immediate voice assistance on input field focus/click without delay (Requirement 7)
  const handleFieldFocus = (fieldKey: 'name' | 'email' | 'password' | 'passcode') => {
    let spokenText = '';
    if (fieldKey === 'name') spokenText = currentT.nameLabel;
    else if (fieldKey === 'email') spokenText = currentT.emailLabel;
    else if (fieldKey === 'password') spokenText = currentT.passwordLabel;
    else if (fieldKey === 'passcode') spokenText = currentT.passcodeLabel;

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

    // Passcode validation: exactly 4 digits (Requirement 6)
    if (passcode.length !== 4 || !/^\d{4}$/.test(passcode)) {
      setErrorMessage(currentT.errPasscode);
      return;
    }

    soundFx.playSuccess();
    const finalName = name.trim() || 'Staff Member';

    localStorage.setItem('sgrocery_is_logged_in', 'true');
    localStorage.setItem('sgrocery_user_role', 'employee');
    localStorage.setItem('sgrocery_staff_name', finalName);
    localStorage.setItem('sgrocery_user_email', email.trim());
    localStorage.setItem('sgrocery_password', password.trim());
    localStorage.setItem('sgrocery_password_employee', password.trim());
    localStorage.setItem('sgrocery_employee_passcode', passcode.trim());

    if (!localStorage.getItem('sgrocery_joined_date_employee')) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      localStorage.setItem('sgrocery_joined_date_employee', formattedDate);
      localStorage.setItem('sgrocery_joined_date', formattedDate);
    }

    onLoginSuccess({
      employeeName: finalName,
      email: email.trim(),
      passcode: passcode.trim(),
    });
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col justify-between animate-fadeIn relative">
      
      {/* Top Banner spanning full width with Circular Back Button */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-slate-900">
        <img
          src="/assets/employee_staff.jpg"
          alt="Grocery Staff Member"
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

      {/* Floating Employee Avatar Badge */}
      <div className="relative -mt-12 sm:-mt-14 flex justify-center z-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 shadow-xl border-4 border-emerald-400 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#e8f7ee] flex items-center justify-center text-[#008744]">
            <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
              <path d="M9 13.5v7.5" />
              <path d="M15 13.5v7.5" />
            </svg>
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

          {/* 2. Email Address Field */}
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

          {/* 3. Password Field (Min 6 Characters Validation - Requirement 5) */}
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

          {/* 4. Passcode Field (Exactly 4 Digits Validation - Requirement 6) */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              <Grid className="w-4 h-4 text-slate-600" />
              <span>{currentT.passcodeLabel}</span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => handleFieldFocus('passcode')}
              placeholder={currentT.passcodePlaceholder}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#008744] focus:ring-2 focus:ring-[#008744]/20 outline-none text-base font-semibold text-slate-900 bg-white transition-all placeholder:text-slate-400 tracking-widest shadow-2xs"
            />
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
          alt="Green grocery basket"
          className="w-full h-full object-cover object-bottom opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
      </div>

    </div>
  );
};
