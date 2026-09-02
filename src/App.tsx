import React, { useState } from 'react';
import { FocusProvider, useFocus } from './context/FocusContext';
import { Onboarding } from './components/Onboarding';
import { IntentionSetup } from './components/IntentionSetup';
import { OneThingMode } from './components/OneThingMode';
import { IntentFirewallModal } from './components/IntentFirewallModal';
import { DistractionInboxModal } from './components/DistractionInboxModal';
import { FocusRescueModal } from './components/FocusRescueModal';
import { SessionCompleteModal } from './components/SessionCompleteModal';
import { SessionRecoveryModal } from './components/SessionRecoveryModal';
import { AttentionDashboard } from './components/AttentionDashboard';

const MainContent: React.FC = () => {
  const {
    status,
    recoveredSessionState,
    resumeRecoveredSession,
    finishRecoveredSession,
    discardRecoveredSession
  } = useFocus();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('one_onboarding_completed') === 'true';
  });

  const [currentView, setCurrentView] = useState<'main' | 'dashboard'>('main');

  const handleFinishOnboarding = () => {
    localStorage.setItem('one_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleFinishOnboarding} />;
  }

  if (currentView === 'dashboard') {
    return <AttentionDashboard onBackToFocus={() => setCurrentView('main')} />;
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between">
      {/* Active Screen State */}
      {status === 'idle' ? (
        <IntentionSetup onOpenDashboard={() => setCurrentView('dashboard')} />
      ) : (
        <OneThingMode />
      )}

      {/* Crash / Refresh Recovery Dialog */}
      {recoveredSessionState && (
        <SessionRecoveryModal
          recoveredState={recoveredSessionState}
          onResume={resumeRecoveredSession}
          onEndAndRecord={finishRecoveredSession}
          onDiscard={discardRecoveredSession}
        />
      )}

      {/* Dynamic Overlays & Modals */}
      <IntentFirewallModal />
      <DistractionInboxModal />
      <FocusRescueModal />
      <SessionCompleteModal onShowDashboard={() => setCurrentView('dashboard')} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FocusProvider>
      <MainContent />
    </FocusProvider>
  );
};

export default App;
