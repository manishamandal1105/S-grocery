import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HelperLoginData } from '../types';
import { ShieldAlert, Store, ArrowRight, Sparkles, Mic, Lock } from 'lucide-react';

interface HelperLoginFormProps {
  onListeningField: (fieldName: string, onResult: (text: string) => void) => void;
  activeMicField: string | null;
  onSuccess: (message: string, role: string) => void;
}

export const HelperLoginForm: React.FC<HelperLoginFormProps> = ({
  onListeningField,
  activeMicField,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<HelperLoginData>({
    storeCode: '',
    helperEmail: '',
    passcode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: keyof HelperLoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleFillDemoHelper = () => {
    setFormData({
      storeCode: 'GROC-7749',
      helperEmail: 'helper.rohit@sgrocery.com',
      passcode: '8822',
    });
  };

  const handleVoiceInput = (fieldName: keyof HelperLoginData) => {
    onListeningField(fieldName, (spokenText) => {
      let cleaned = spokenText.trim();
      if (fieldName === 'storeCode') {
        cleaned = cleaned.toUpperCase().replace(/\s+/g, '-');
      }
      setFormData((prev) => ({ ...prev, [fieldName]: cleaned }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.storeCode || !formData.passcode) {
      setErrorMessage(t('errorRequired'));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess(t('successLoginMsg'), 'helper');
    }, 800);
  };

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">
          {t('helperLoginTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t('helperLoginSubtitle')}
        </p>
      </div>

      <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('helperRestrictedNote')}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>{t('helperStoreCodeLabel')} *</span>
            <span className="text-[10px] text-slate-400">🎤 বলুন বা লিখুন</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Store className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={formData.storeCode}
              onChange={(e) => handleChange('storeCode', e.target.value.toUpperCase())}
              placeholder={t('helperStoreCodePlaceholder')}
              className="grocery-input pl-11 pr-12 text-sm uppercase tracking-wider font-bold"
              required
            />
            <button
              type="button"
              onClick={() => handleVoiceInput('storeCode')}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                activeMicField === 'storeCode' ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
              }`}
              title="দোকান কোড বলুন"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>{t('helperPasscodeLabel')} *</span>
            <span className="text-[10px] text-slate-400">৪ বা ৬ ডিজিট</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={formData.passcode}
              onChange={(e) => handleChange('passcode', e.target.value)}
              placeholder={t('helperPasscodePlaceholder')}
              className="grocery-input pl-11 pr-12 text-sm tracking-widest font-bold"
              required
            />
            <button
              type="button"
              onClick={() => handleVoiceInput('passcode')}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${
                activeMicField === 'passcode' ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
              }`}
              title="পাসকোড বলুন"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base shadow-lg shadow-amber-600/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{t('btnSignIn')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={handleFillDemoHelper}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {t('demoHelperBtn')}
          </button>
          <span className="text-[11px] text-slate-400">Helper Mode</span>
        </div>
      </form>
    </div>
  );
};
