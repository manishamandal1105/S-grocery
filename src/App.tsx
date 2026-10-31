import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { OnboardingStep, OwnerSetupData, UserRole } from './types';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SplashScreen } from './components/SplashScreen';
import { LanguageSelectScreen } from './components/LanguageSelectScreen';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { OwnerSetupWizard } from './components/OwnerSetupWizard';
import { ReviewConfirmScreen } from './components/ReviewConfirmScreen';
import { OwnerWelcomeScreen } from './components/OwnerWelcomeScreen';
import { StaffFlow } from './components/StaffFlow';
import { OwnerDashboard } from './components/OwnerDashboard';

export const App: React.FC = () => {
  const { language } = useLanguage();
  const soundFx = useSoundEffects();

  // Primary Step Machine - starts at the Welcome / Getting Started page (Very first page)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

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
    if (currentStep === 'language') setCurrentStep('welcome');
    else if (currentStep === 'role') setCurrentStep('language');
    else if (currentStep === 'owner-setup') setCurrentStep('role');
    else if (currentStep === 'owner-review') setCurrentStep('owner-setup');
    else if (currentStep === 'staff-flow') setCurrentStep('role');
  };

  const handleResetAll = () => {
    soundFx.playClick();
    setCurrentStep('welcome');
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

  // Dashboard is full-screen — render it outside the onboarding shell
  if (currentStep === 'owner-dashboard') {
    return <OwnerDashboard data={ownerData} onReset={handleResetAll} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbfcf9] text-slate-800 relative selection:bg-emerald-600 selection:text-white">
      {/* Top Header Controls (Hidden on Welcome screen to match the exact mockup) */}
      {currentStep !== 'splash' && currentStep !== 'welcome' && (
        <Header
          currentStep={currentStep}
          onBack={
            currentStep !== 'owner-welcome'
              ? handleStepBack
              : undefined
          }
          onReset={handleResetAll}
        />
      )}

      {/* Main Viewport matching full-screen responsive across all devices */}
      <main className="w-full flex-1 flex flex-col justify-between bg-[#fbfcf9] relative">
        {currentStep === 'welcome' && (
          <WelcomeScreen
            onGetStarted={() => setCurrentStep('language')}
            onSkip={() => setCurrentStep('language')}
          />
        )}

        {currentStep === 'splash' && (
          <SplashScreen onComplete={() => setCurrentStep('language')} />
        )}

        {currentStep === 'language' && (
          <LanguageSelectScreen
            onContinue={() => setCurrentStep('role')}
            onBack={() => setCurrentStep('welcome')}
          />
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
          <OwnerWelcomeScreen
            data={ownerData}
            onReset={handleResetAll}
            onGoToDashboard={() => setCurrentStep('owner-dashboard')}
          />
        )}

        {currentStep === 'staff-flow' && (
          <StaffFlow
            onBackToRole={() => setCurrentStep('role')}
            onReset={handleResetAll}
          />
        )}
      </main>
    </div>
  );
};
