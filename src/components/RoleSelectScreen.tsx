import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';

interface RoleSelectScreenProps {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export const RoleSelectScreen: React.FC<RoleSelectScreenProps> = ({ onSelectRole, onBack }) => {
  const { t, language } = useLanguage();
  const { speak } = useVoiceAssistant();
  const soundFx = useSoundEffects();

  // Automatic spoken guidance when landing on role selection
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(t('pageAudioRole'));
    }, 400);

    return () => clearTimeout(timer);
  }, [speak, t, language]);

  const handleRoleClick = (role: UserRole) => {
    soundFx.playClick();
    if (role === 'owner') {
      speak(t('roleOwnerSelected'));
    } else {
      speak(t('roleStaffSelected'));
    }
    onSelectRole(role);
  };

  const handleSpeakRole = (e: React.MouseEvent, role: UserRole) => {
    e.stopPropagation();
    soundFx.playClick();
    if (role === 'owner') {
      speak(t('roleOwnerTitle') + '. ' + t('roleOwnerSubtitle'));
    } else {
      speak(t('roleStaffTitle') + '. ' + t('roleStaffSubtitle'));
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] text-slate-800 animate-fade-in pb-8 sm:pb-12">
      <div className="w-full">
        {/* Title Header matching Image 2 */}
        <div className="text-center px-4 sm:px-6 pt-6 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#183626] tracking-tight">
            {t('selectRoleTitle')}
          </h1>
          <p className="text-sm sm:text-base text-[#5e7768] font-medium mt-1.5 sm:mt-2">
            {t('selectRoleSubtitle')}
          </p>
        </div>

        {/* Persona Role Cards: 1-col on mobile, 2-col on tablet/desktop */}
        <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Card 1: Shop Owner */}
          <div
            onClick={() => handleRoleClick('owner')}
            role="button"
            tabIndex={0}
            className="group relative p-4 sm:p-5 rounded-3xl bg-[#f4f9f5] border border-[#e2ede5]/90 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Top 3D Storefront Image */}
            <div className="w-full h-44 sm:h-52 md:h-56 lg:h-64 rounded-2xl overflow-hidden relative mb-4 bg-[#e8f3ec]">
              <img
                src="/assets/shop_owner_store.jpg"
                alt="3D Grocery Storefront"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={(e) => handleSpeakRole(e, 'owner')}
                className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/85 text-[#183626] hover:bg-white shadow-sm transition-colors opacity-85 hover:opacity-100"
                title="Listen description"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Title, Description & Action Arrow */}
            <div className="flex items-center justify-between pt-1">
              <div className="pr-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#183626] group-hover:text-emerald-800 transition-colors">
                  {t('roleOwnerTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-[#5e7768] font-medium mt-1 leading-relaxed">
                  {t('roleOwnerSubtitle')}
                </p>
              </div>

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#235338] group-hover:bg-[#1a442c] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Card 2: Employee / Staff */}
          <div
            onClick={() => handleRoleClick('helper')}
            role="button"
            tabIndex={0}
            className="group relative p-4 sm:p-5 rounded-3xl bg-[#fdf8f2] border border-[#f2ece0]/90 hover:border-amber-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Top 3D Staff Cashier Image */}
            <div className="w-full h-44 sm:h-52 md:h-56 lg:h-64 rounded-2xl overflow-hidden relative mb-4 bg-[#f5efe3]">
              <img
                src="/assets/employee_staff.jpg"
                alt="3D Staff Cashier with POS"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={(e) => handleSpeakRole(e, 'helper')}
                className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/85 text-[#183626] hover:bg-white shadow-sm transition-colors opacity-85 hover:opacity-100"
                title="Listen description"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Title, Description & Action Arrow */}
            <div className="flex items-center justify-between pt-1">
              <div className="pr-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#183626] group-hover:text-emerald-800 transition-colors">
                  {t('roleStaffTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-[#5e7768] font-medium mt-1 leading-relaxed">
                  {t('roleStaffSubtitle')}
                </p>
              </div>

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#8fa498] group-hover:bg-[#6c8577] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
