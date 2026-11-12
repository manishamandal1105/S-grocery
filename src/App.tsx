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
import { SalesDashboard } from './components/SalesDashboard';
import { Home, TrendingUp } from 'lucide-react';

export const App: React.FC = () => {
  const { language } = useLanguage();
  const soundFx = useSoundEffects();

  // Primary Step Machine - starts at the Welcome / Getting Started page (Very first page)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  // Form State for Owner Setup - starts with completely empty shopName so user enters own store name
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
    else if (currentStep === 'sales-dashboard') setCurrentStep('owner-dashboard');
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

  // Sales Dashboard view (accessible after login/dashboard, with fixed bottom navigation)
  if (currentStep === 'sales-dashboard') {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between pb-24">
        <Header
          currentStep="sales-dashboard"
          onBack={() => setCurrentStep('owner-dashboard')}
          onReset={handleResetAll}
        />
        <main className="w-full flex-1 max-w-7xl mx-auto px-2 sm:px-4 py-4 animate-fadeIn">
          <SalesDashboard
            storeName={ownerData.shopName || localStorage.getItem('sgrocery_store_name') || ''}
            onBackToHome={() => setCurrentStep('owner-dashboard')}
          />
        </main>
        {/* Fixed bottom navigation bar */}
        <nav
          aria-label="Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl shadow-slate-900/15 py-2.5 px-4 sm:px-8"
        >
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep('owner-dashboard')}
              className="py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Home Page</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('sales-dashboard')}
              className="py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#008744] text-white shadow-lg shadow-emerald-700/30 scale-102"
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Sales</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

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
