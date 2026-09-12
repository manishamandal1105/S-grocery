import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Store, Users, ArrowRight, ShieldCheck, Zap, Sparkles, Volume2 } from 'lucide-react';

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
    }, 450);

    return () => clearTimeout(timer);
  }, [language, speak, t]);

  const handleRoleClick = (role: UserRole) => {
    soundFx.playClick();
    if (role === 'owner') {
      const msg =
        language === 'bn'
          ? 'দোকানের মালিক নির্বাচন করা হয়েছে'
          : language === 'hi'
          ? 'दुकान का मालिक चुना गया'
          : 'Shop Owner selected';
      speak(msg);
    } else {
      const msg =
        language === 'bn'
          ? 'দোকানের কর্মচারী বা হেল্পার নির্বাচন করা হয়েছে'
          : language === 'hi'
          ? 'दुकान का कर्मचारी या हेल्पर चुना गया'
          : 'Employee and staff selected';
      speak(msg);
    }
    onSelectRole(role);
  };

  const handleSpeakRole = (e: React.MouseEvent, role: UserRole) => {
    e.stopPropagation();
    if (role === 'owner') {
      speak(t('roleOwnerTitle') + ' - ' + t('roleOwnerSubtitle'));
    } else {
      speak(t('roleStaffTitle') + ' - ' + t('roleStaffSubtitle'));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Title Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('selectRoleTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md mx-auto">
          {t('selectRoleSubtitle')}
        </p>
      </div>

      {/* Persona Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Role: Shop Owner */}
        <div
          onClick={() => handleRoleClick('owner')}
          role="button"
          tabIndex={0}
          className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-800/90 via-slate-800/60 to-emerald-950/40 border-2 border-slate-700/80 hover:border-emerald-400/90 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Top Badge & Voice Button */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {t('roleOwnerBadge')}
            </span>

            <button
              onClick={(e) => handleSpeakRole(e, 'owner')}
              className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-colors"
              title="Listen description"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Icon & Title */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Store className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
              {t('roleOwnerTitle')}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('roleOwnerSubtitle')}
            </p>
          </div>

          {/* Action Link */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-emerald-400 font-bold text-xs">
            <span>{t('roleOwnerAction')}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-slate-950 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Role: Employee / Staff */}
        <div
          onClick={() => handleRoleClick('helper')}
          role="button"
          tabIndex={0}
          className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-800/90 via-slate-800/60 to-amber-950/30 border-2 border-slate-700/80 hover:border-amber-400/90 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          {/* Top Badge & Voice Button */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {t('roleStaffBadge')}
            </span>

            <button
              onClick={(e) => handleSpeakRole(e, 'helper')}
              className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-700/60 transition-colors"
              title="Listen description"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Icon & Title */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
              {t('roleStaffTitle')}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('roleStaffSubtitle')}
            </p>
          </div>

          {/* Action Link */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-amber-400 font-bold text-xs">
            <span>{t('roleStaffAction')}</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/80 transition-colors"
        >
          ← {t('backBtn')}
        </button>
      </div>
    </div>
  );
};
