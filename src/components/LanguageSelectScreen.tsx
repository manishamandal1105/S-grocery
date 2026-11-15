import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { ArrowRight } from 'lucide-react';

interface LanguageSelectScreenProps {
  onContinue: () => void;
  onBack?: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onContinue, onBack }) => {
  const { language, setLanguage } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'en');

  const languageOptions: {
    id: Language;
    badge: string;
    label: string;
    audioVoiceText: string;
    speechLocale: string;
  }[] = [
    {
      id: 'en',
      badge: 'Aa',
      label: 'English',
      audioVoiceText: 'You selected English language.',
      speechLocale: 'en-US',
    },
    {
      id: 'bn',
      badge: 'অ',
      label: 'বাংলা',
      audioVoiceText: 'আপনি বাংলা ভাষা নির্বাচন করেছেন।',
      speechLocale: 'bn-IN',
    },
    {
      id: 'hi',
      badge: 'अ',
      label: 'हिन्दी',
      audioVoiceText: 'आपने हिंदी भाषा चुनी है।',
      speechLocale: 'hi-IN',
    },
  ];

  // Immediately speaks without any delay when clicked
  const handleSelectLanguage = (item: typeof languageOptions[0]) => {
    soundFx.playClick();
    setSelectedLang(item.id);
    setLanguage(item.id);

    // Instant speech output in the chosen language (including Bengali)
    speak(item.audioVoiceText, item.speechLocale);
  };

  const handleContinue = () => {
    soundFx.playClick();
    onContinue();
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f9f5] flex flex-col justify-between items-center px-4 sm:px-8 py-8 sm:py-12 relative animate-fadeIn">
      
      {/* 
        Requirement 2: Top-right corner circled area and image inside it are completely removed.
        Requirement 8: Full-screen responsive layout - occupies entire laptop and mobile screen.
      */}

      {/* Main Container - Full-width responsive with comfortable maximum bounds for large displays */}
      <div className="w-full max-w-xl sm:max-w-2xl my-auto flex flex-col justify-center items-center">
        
        {/* Header Section */}
        <div className="text-center pb-8 sm:pb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f4728] tracking-tight">
            Choose Language
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 font-medium mt-2">
            Select your preferred language
          </p>
        </div>

        {/* Language Options List */}
        <div className="w-full space-y-4 sm:space-y-5">
          {languageOptions.map((item) => {
            const isSelected = selectedLang === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectLanguage(item)}
                className={`w-full py-4 sm:py-5 px-5 sm:px-6 rounded-2xl flex items-center transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#008744] bg-[#eaf7ee] shadow-sm'
                    : 'border border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                }`}
              >
                {/* Left Badge: Light mint pill with script letter */}
                <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-2xl bg-[#dcf2e5] flex items-center justify-center font-bold text-base sm:text-lg text-[#115e34] shrink-0">
                  {item.badge}
                </div>

                {/* Divider Line */}
                <div className="h-7 w-px bg-slate-200 mx-5 sm:mx-6" />

                {/* Language Name */}
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="w-full pt-8 sm:pt-10">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-4 sm:py-5 rounded-2xl bg-[#008744] hover:bg-[#07743d] active:scale-98 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        </div>

      </div>

    </div>
  );
};
