import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AuthMode, ShopType, SellerRegistrationData } from '../types';
import { 
  Mail, 
  Lock, 
  User, 
  Store, 
  Eye, 
  EyeOff, 
  Mic, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Users, 
  Building2,
  CheckCircle2
} from 'lucide-react';

interface OwnerLoginFormProps {
  onListeningField: (fieldName: string, onResult: (text: string) => void) => void;
  activeMicField: string | null;
  onSuccess: (message: string, role: string) => void;
}

export const OwnerLoginForm: React.FC<OwnerLoginFormProps> = ({
  onListeningField,
  activeMicField,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<SellerRegistrationData>({
    fullName: '',
    shopName: '',
    shopType: 'small',
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: keyof SellerRegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleFillDemo = () => {
    if (authMode === 'login') {
      setFormData((prev) => ({
        ...prev,
        email: 'owner@sgrocery.com',
        password: 'password123',
      }));
    } else {
      setFormData({
        fullName: 'Rajesh Kumar / রহিম মিয়া',
        shopName: 'Rajesh Kirana Store / সততা মুদি ভান্ডার',
        shopType: 'small',
        email: 'rajesh.kirana@gmail.com',
        password: 'password123',
      });
    }
  };

  const handleVoiceInput = (fieldName: keyof SellerRegistrationData) => {
    onListeningField(fieldName, (spokenText) => {
      let cleaned = spokenText.trim();
      if (fieldName === 'email') {
        cleaned = cleaned.toLowerCase().replace(/\s+at\s+/g, '@').replace(/\s+/g, '');
      }
      setFormData((prev) => ({ ...prev, [fieldName]: cleaned }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'login') {
      if (!formData.email || !formData.password) {
        setErrorMessage(t('errorRequired'));
        return;
      }
    } else {
      if (!formData.fullName || !formData.shopName || !formData.email || !formData.password) {
        setErrorMessage(t('errorRequired'));
        return;
      }
    }

    if (!formData.email.includes('@')) {
      setErrorMessage(t('errorInvalidEmail'));
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage(t('errorPasswordLength'));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (authMode === 'login') {
        onSuccess(t('successLoginMsg'), 'owner');
      } else {
        onSuccess(t('successRegisterMsg'), 'owner');
      }
    }, 800);
  };

  const shopTypes: { id: ShopType; title: string; desc: string; badge: string; icon: any }[] = [
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

  return (
    <div className="w-full">
      {/* Tab Switcher: Login vs Register */}
      <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-6 border border-slate-200/80">
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setErrorMessage('');
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            authMode === 'login'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('ownerLoginTitle')}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setErrorMessage('');
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            authMode === 'register'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('ownerRegisterTitle')}
        </button>
      </div>

      {/* Subtitle */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {authMode === 'login' ? t('ownerLoginTitle') : t('ownerRegisterTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {authMode === 'login' ? t('ownerLoginSubtitle') : t('ownerRegisterSubtitle')}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{t('sellerNameLabel')} *</span>
                <span className="text-[10px] text-slate-400">🎤 বলুন বা লিখুন</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder={t('sellerNamePlaceholder')}
                  className="grocery-input pl-11 pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('fullName')}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                    activeMicField === 'fullName' ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
                  }`}
                  title="কথা বলে নাম লিখুন"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{t('shopNameLabel')} *</span>
                <span className="text-[10px] text-slate-400">🎤 দোকানের নাম বলুন</span>
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
                  className="grocery-input pl-11 pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleVoiceInput('shopName')}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                    activeMicField === 'shopName' ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
                  }`}
                  title="কথা বলে দোকানের নাম লিখুন"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('shopTypeLabel')} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {shopTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.shopType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setFormData((prev) => ({ ...prev, shopType: type.id }))}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{type.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                        {type.desc}
                      </p>
                      <span className="mt-2 inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800">
                        {type.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>{t('emailLabel')} *</span>
            <span className="text-[10px] text-slate-400">100% Free</span>
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
              className="grocery-input pl-11 pr-12 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => handleVoiceInput('email')}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                activeMicField === 'email' ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
              }`}
              title="কথা বলে ইমেইল বলুন"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {t('passwordLabel')} *
            </label>
            {authMode === 'login' && (
              <a href="#forgot" className="text-[11px] font-semibold text-emerald-700 hover:underline">
                {t('forgotPassword')}
              </a>
            )}
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
              className="grocery-input pl-11 pr-12 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{authMode === 'login' ? t('btnSignIn') : t('btnCreateShop')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t('demoOwnerBtn')}
          </button>

          <div className="text-[11px] text-slate-500">
            {authMode === 'login' ? (
              <span>
                {t('needAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {t('clickToRegister')}
                </button>
              </span>
            ) : (
              <span>
                {t('haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {t('clickToLogin')}
                </button>
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
