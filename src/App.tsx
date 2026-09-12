import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { OnboardingStep, OwnerSetupData, UserRole } from './types';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { LanguageSelectScreen } from './components/LanguageSelectScreen';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { OwnerSetupWizard } from './components/OwnerSetupWizard';
import { ReviewConfirmScreen } from './components/ReviewConfirmScreen';
import { OwnerWelcomeScreen } from './components/OwnerWelcomeScreen';
import { StaffFlow } from './components/StaffFlow';

export const App: React.FC = () => {
  const { language } = useLanguage();
  const soundFx = useSoundEffects();

  // Primary Step Machine
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');

  // Form State for Owner Setup
  const [ownerData, setOwnerData] = useState<OwnerSetupData>({
    loginMethod: 'email',
    email: '',
    phone: '',
    password: '',
    ownerName: '',
    shopName: '',
    businessType: 'small',
    quickPin: '',
  });

  const handleStepBack = () => {
    soundFx.playClick();
    if (currentStep === 'role') setCurrentStep('language');
    else if (currentStep === 'owner-setup') setCurrentStep('role');
    else if (currentStep === 'owner-review') setCurrentStep('owner-setup');
    else if (currentStep === 'staff-flow') setCurrentStep('role');
  };

  const handleResetAll = () => {
    soundFx.playClick();
    setCurrentStep('language');
    setOwnerData({
      loginMethod: 'email',
      email: '',
      phone: '',
      password: '',
      ownerName: '',
      shopName: '',
      businessType: 'small',
      quickPin: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-2 sm:p-4 md:p-6 relative overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Background Animated Atmosphere Lights */}
      <div className="fixed -top-40 -left-40 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header (Hidden on splash for clean cinematic intro) */}
      {currentStep !== 'splash' && (
        <Header
          currentStep={currentStep}
          onBack={
            currentStep !== 'owner-welcome' && currentStep !== 'language'
              ? handleStepBack
              : undefined
          }
          onReset={handleResetAll}
        />
      )}

      {/* Main Dynamic Viewport */}
      <main className="w-full max-w-4xl mx-auto my-auto py-2 sm:py-4 relative z-10 flex items-center justify-center">
        {currentStep === 'splash' && (
          <SplashScreen onComplete={() => setCurrentStep('language')} />
        )}

        {currentStep === 'language' && (
          <LanguageSelectScreen onContinue={() => setCurrentStep('role')} />
        )}

        {currentStep === 'role' && (
          <RoleSelectScreen
            onSelectRole={(role: UserRole) => {
              if (role === 'owner') setCurrentStep('owner-setup');
              else setCurrentStep('staff-flow');
            }}
            onBack={() => setCurrentStep('language')}
          />
        )}

        {currentStep === 'owner-setup' && (
          <OwnerSetupWizard
            initialData={ownerData}
            onSubmitForReview={(data) => {
              setOwnerData(data);
              setCurrentStep('owner-review');
            }}
            onBack={() => setCurrentStep('role')}
          />
        )}

        {currentStep === 'owner-review' && (
          <ReviewConfirmScreen
            data={ownerData}
            onConfirm={() => setCurrentStep('owner-welcome')}
            onEdit={() => setCurrentStep('owner-setup')}
          />
        )}

        {currentStep === 'owner-welcome' && (
          <OwnerWelcomeScreen data={ownerData} onReset={handleResetAll} />
        )}

        {currentStep === 'staff-flow' && (
          <StaffFlow
            onBackToRole={() => setCurrentStep('role')}
            onReset={handleResetAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-3 relative z-10">
        <p className="text-[11px] text-slate-500 font-medium">
          🌱 S-Grocery Smart Shop Management • Voice Enabled
        </p>
      </footer>
    </div>
  );
};
