import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Intention,
  FocusSession,
  DriftEvent,
  DistractionItem,
  CompletedOutcome,
  DailyAttentionStats,
  FocusProfile,
  SessionStatus,
  ProtectionLevel,
  FocusRating,
  ExceptionPass,
  PersistedSessionState
} from '../types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { transitionFocusState } from '../services/focusStateMachine';
import { extensionBridge } from '../services/extensionBridge';

interface FocusContextType {
  status: SessionStatus;
  activeIntention: Intention | null;
  activeSession: FocusSession | null;
  elapsedSeconds: number;
  targetDurationSeconds: number;
  breakRemainingSeconds: number;
  exceptionPass: ExceptionPass | null;
  activeDriftEvent: DriftEvent | null;
  recoveredSessionState: PersistedSessionState | null;

  isDistractionInboxOpen: boolean;
  isRescueModalOpen: boolean;
  isAudioMuted: boolean;
  isAmbientSoundActive: boolean;
  distractionInboxItems: DistractionItem[];
  dailyStats: DailyAttentionStats | null;
  focusProfile: FocusProfile | null;
  completedOutcomes: CompletedOutcome[];
  
  // Actions
  startSession: (title: string, durationMinutes: number, protectionLevel?: ProtectionLevel, category?: Intention['category']) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  triggerIntentFirewall: () => void;
  resolveDistraction: () => Promise<void>;
  grantIntentionalException: (reason: string, durationMinutes: number) => Promise<void>;
  emergencyExit: () => Promise<void>;
  startBreak: (minutes: number) => void;
  endBreak: () => void;
  finishSessionPrompt: () => void;
  submitCompletedOutcome: (outcomeText: string, rating: FocusRating) => Promise<void>;
  openRescueModal: () => void;
  closeRescueModal: () => void;
  applyFocusRescue: (minutes: number, newGoal?: string) => Promise<void>;
  saveDistractionNote: (content: string) => Promise<void>;
  archiveDistractionItem: (id: string) => Promise<void>;
  restoreDistractionItem: (id: string) => Promise<void>;
  editDistractionItem: (id: string, content: string) => Promise<void>;
  deleteDistractionItem: (id: string) => Promise<void>;
  openDistractionInbox: () => void;
  closeDistractionInbox: () => void;
  toggleMute: () => void;
  toggleAmbientSound: () => void;
  refreshData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<{ importedCount: number }>;
  wipeData: () => Promise<void>;
  resumeRecoveredSession: () => void;
  finishRecoveredSession: () => void;
  discardRecoveredSession: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [activeIntention, setActiveIntention] = useState<Intention | null>(null);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);

  // Absolute Timestamp Timer Anchors
  const startedAtRef = useRef<number>(0);
  const totalPausedMsRef = useRef<number>(0);
  const lastPausedAtRef = useRef<number | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [targetDurationSeconds, setTargetDurationSeconds] = useState<number>(0);
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState<number>(0);
  const [exceptionPass, setExceptionPass] = useState<ExceptionPass | null>(null);
  const [activeDriftEvent, setActiveDriftEvent] = useState<DriftEvent | null>(null);

  // Session recovery state
  const [recoveredSessionState, setRecoveredSessionState] = useState<PersistedSessionState | null>(null);

  const [isDistractionInboxOpen, setIsDistractionInboxOpen] = useState(false);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAmbientSoundActive, setIsAmbientSoundActive] = useState(false);

  const [distractionInboxItems, setDistractionInboxItems] = useState<DistractionItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyAttentionStats | null>(null);
  const [focusProfile, setFocusProfile] = useState<FocusProfile | null>(null);
  const [completedOutcomes, setCompletedOutcomes] = useState<CompletedOutcome[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exceptionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(async () => {
    const stats = await storageService.getDailyStats();
    const profile = await storageService.getFocusProfile();
    const inbox = await storageService.getDistractionItems();
    const outcomes = await storageService.getCompletedOutcomes();

    setDailyStats(stats);
    setFocusProfile(profile);
    setDistractionInboxItems(inbox);
    setCompletedOutcomes(outcomes);
  }, []);

  // Check for crash/refresh recovery on mount
  useEffect(() => {
    refreshData();
    const persisted = storageService.loadActiveSessionState();
    if (persisted && (persisted.status === 'focusing' || persisted.status === 'paused' || persisted.status === 'interrupted' || persisted.status === 'exception')) {
      setRecoveredSessionState(persisted);
    }
  }, [refreshData]);

  // Persist session state periodically & on important changes
  const syncActiveSessionState = useCallback(() => {
    if (!activeSession || !activeIntention || status === 'idle' || status === 'completed' || status === 'cancelled') {
      storageService.clearActiveSessionState();
      extensionBridge.syncSession(null, null, null);
      return;
    }

    const state: PersistedSessionState = {
      version: 1,
      session: {
        ...activeSession,
        elapsedSeconds,
        totalPausedMs: totalPausedMsRef.current,
      },
      intention: activeIntention,
      status,
      startedAt: startedAtRef.current,
      totalPausedMs: totalPausedMsRef.current,
      lastPausedAt: lastPausedAtRef.current,
      targetDurationSeconds,
      exceptionPass,
      activeDriftEvent,
      lastSavedAt: Date.now()
    };

    storageService.saveActiveSessionState(state);
    extensionBridge.syncSession(activeSession, activeIntention, exceptionPass);
  }, [activeSession, activeIntention, status, elapsedSeconds, targetDurationSeconds, exceptionPass, activeDriftEvent]);

  // Absolute Timestamp Timer Tick
  useEffect(() => {
    if (status === 'focusing' || status === 'exception' || status === 'interrupted') {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const currentPauseDelta = lastPausedAtRef.current ? (now - lastPausedAtRef.current) : 0;
        const totalNonFocusMs = totalPausedMsRef.current + currentPauseDelta;
        const actualElapsed = Math.max(0, Math.floor((now - startedAtRef.current - totalNonFocusMs) / 1000));

        setElapsedSeconds(actualElapsed);

        // Target reached
        if (targetDurationSeconds > 0 && actualElapsed >= targetDurationSeconds) {
          audioService.playSessionComplete();
          setStatus(prev => {
            try {
              return transitionFocusState(prev, { type: 'PROMPT_COMPLETION' });
            } catch {
              return 'completing';
            }
          });
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, targetDurationSeconds]);

  // Background state sync interval
  useEffect(() => {
    if (status === 'focusing' || status === 'exception' || status === 'paused' || status === 'interrupted') {
      syncActiveSessionState();
    }
  }, [status, elapsedSeconds, syncActiveSessionState]);

  // Break countdown timer
  useEffect(() => {
    if (status === 'break') {
      breakTimerRef.current = setInterval(() => {
        setBreakRemainingSeconds(prev => {
          if (prev <= 1) {
            audioService.playDriftNudge();
            setStatus(current => transitionFocusState(current, { type: 'END_BREAK' }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current);
        breakTimerRef.current = null;
      }
    }

    return () => {
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current);
        breakTimerRef.current = null;
      }
    };
  }, [status]);

  // Exception Pass Countdown
  useEffect(() => {
    if (status === 'exception' && exceptionPass) {
      exceptionTimerRef.current = setInterval(() => {
        const remainingMs = exceptionPass.expiresAt - Date.now();
        if (remainingMs <= 0) {
          audioService.playDriftNudge();
          setExceptionPass(null);
          setStatus(current => {
            try {
              return transitionFocusState(current, { type: 'EXPIRE_EXCEPTION' });
            } catch {
              return 'focusing';
            }
          });
        }
      }, 500);
    } else {
      if (exceptionTimerRef.current) {
        clearInterval(exceptionTimerRef.current);
        exceptionTimerRef.current = null;
      }
    }

    return () => {
      if (exceptionTimerRef.current) {
        clearInterval(exceptionTimerRef.current);
        exceptionTimerRef.current = null;
      }
    };
  }, [status, exceptionPass]);

  const startSession = async (
    title: string,
    durationMinutes: number,
    protectionLevel: ProtectionLevel = 3,
    category: Intention['category'] = 'work'
  ) => {
    const intentionId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const targetSeconds = durationMinutes * 60;
    const now = Date.now();

    const newIntention: Intention = {
      id: intentionId,
      title: title.trim(),
      category,
      targetDurationMinutes: durationMinutes,
      protectionLevel,
      createdAt: now
    };

    const newSession: FocusSession = {
      id: sessionId,
      intentionId,
      intentionTitle: title.trim(),
      targetDurationSeconds: targetSeconds,
      elapsedSeconds: 0,
      status: 'focusing',
      protectionLevel,
      startedAt: now,
      endedAt: 0,
      totalPausedMs: 0,
      driftCount: 0,
      totalRecoverySeconds: 0,
      intentionalExceptionsCount: 0
    };

    await storageService.saveIntention(newIntention);
    await storageService.saveSession(newSession);

    setActiveIntention(newIntention);
    setActiveSession(newSession);
    startedAtRef.current = now;
    totalPausedMsRef.current = 0;
    lastPausedAtRef.current = null;
    setElapsedSeconds(0);
    setTargetDurationSeconds(targetSeconds);
    setExceptionPass(null);
    setRecoveredSessionState(null);

    setStatus(current => transitionFocusState(current, { type: 'START_SESSION' }));
    audioService.playSessionStart();
  };

  const pauseSession = () => {
    if (status !== 'focusing') return;
    lastPausedAtRef.current = Date.now();
    setStatus(current => transitionFocusState(current, { type: 'PAUSE' }));
  };

  const resumeSession = () => {
    if (status !== 'paused') return;
    if (lastPausedAtRef.current) {
      totalPausedMsRef.current += (Date.now() - lastPausedAtRef.current);
      lastPausedAtRef.current = null;
    }
    setStatus(current => transitionFocusState(current, { type: 'RESUME' }));
  };

  const triggerIntentFirewall = () => {
    if (status !== 'focusing' && status !== 'exception' && status !== 'break') return;
    if (!activeSession) return;

    audioService.playDriftNudge();
    const driftId = crypto.randomUUID();
    const newDrift: DriftEvent = {
      id: driftId,
      sessionId: activeSession.id,
      timestamp: Date.now(),
      reasonCategory: 'habitual_click',
      resolution: 'recovered'
    };

    setActiveDriftEvent(newDrift);
    setStatus(current => transitionFocusState(current, { type: 'TRIGGER_INTERRUPT' }));
  };

  const resolveDistraction = async () => {
    if (!activeDriftEvent || !activeSession) return;

    const resolvedTime = Date.now();
    const recoveryLatencySeconds = Math.max(1, Math.round((resolvedTime - activeDriftEvent.timestamp) / 1000));

    const updatedDrift: DriftEvent = {
      ...activeDriftEvent,
      resolvedTimestamp: resolvedTime,
      recoveryLatencySeconds,
      resolution: 'recovered'
    };

    await storageService.recordDrift(updatedDrift);

    const updatedSession: FocusSession = {
      ...activeSession,
      driftCount: activeSession.driftCount + 1,
      totalRecoverySeconds: activeSession.totalRecoverySeconds + recoveryLatencySeconds
    };
    setActiveSession(updatedSession);
    await storageService.saveSession(updatedSession);

    setActiveDriftEvent(null);
    setStatus(current => transitionFocusState(current, { type: 'RESOLVE_RECOVERY' }));
    // Immediately resume flow
    setStatus(current => transitionFocusState(current, { type: 'RESUME' }));
    audioService.playCaptureTick();
    await refreshData();
  };

  const grantIntentionalException = async (reason: string, durationMinutes: number) => {
    if (!activeSession) return;

    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    setExceptionPass({
      active: true,
      expiresAt,
      durationMinutes,
      reason
    });

    if (activeDriftEvent) {
      const updatedDrift: DriftEvent = {
        ...activeDriftEvent,
        resolvedTimestamp: Date.now(),
        resolution: 'intentional_exception',
        exceptionReason: reason,
        exceptionDurationMinutes: durationMinutes
      };
      await storageService.recordDrift(updatedDrift);
    }

    const updatedSession: FocusSession = {
      ...activeSession,
      intentionalExceptionsCount: activeSession.intentionalExceptionsCount + 1
    };
    setActiveSession(updatedSession);
    await storageService.saveSession(updatedSession);

    setActiveDriftEvent(null);
    setStatus(current => transitionFocusState(current, { type: 'GRANT_EXCEPTION' }));
    await refreshData();
  };

  const emergencyExit = async () => {
    if (!activeSession) {
      setStatus('idle');
      storageService.clearActiveSessionState();
      return;
    }

    const endedAt = Date.now();
    const finalSession: FocusSession = {
      ...activeSession,
      elapsedSeconds,
      endedAt,
      status: 'cancelled'
    };

    await storageService.saveSession(finalSession);
    storageService.clearActiveSessionState();

    setActiveSession(null);
    setActiveIntention(null);
    setActiveDriftEvent(null);
    setExceptionPass(null);
    setStatus('idle');
    await refreshData();
  };

  const startBreak = (minutes: number) => {
    setBreakRemainingSeconds(minutes * 60);
    setStatus(current => transitionFocusState(current, { type: 'START_BREAK' }));
  };

  const endBreak = () => {
    setBreakRemainingSeconds(0);
    setStatus(current => transitionFocusState(current, { type: 'END_BREAK' }));
  };

  const finishSessionPrompt = () => {
    audioService.playSessionComplete();
    setStatus(current => transitionFocusState(current, { type: 'PROMPT_COMPLETION' }));
  };

  const submitCompletedOutcome = async (outcomeText: string, rating: FocusRating) => {
    if (!activeSession || !activeIntention) {
      setStatus('idle');
      storageService.clearActiveSessionState();
      return;
    }

    const endedAt = Date.now();
    const finalSession: FocusSession = {
      ...activeSession,
      elapsedSeconds,
      endedAt,
      status: 'completed',
      accomplishedOutcome: outcomeText.trim(),
      focusRating: rating
    };

    await storageService.saveSession(finalSession);

    if (outcomeText.trim()) {
      const outcomeRecord: CompletedOutcome = {
        id: crypto.randomUUID(),
        sessionId: finalSession.id,
        goalTitle: activeIntention.title,
        outcomeText: outcomeText.trim(),
        completedAt: endedAt,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        focusRating: rating
      };
      await storageService.saveCompletedOutcome(outcomeRecord);
    }

    storageService.clearActiveSessionState();
    setActiveSession(null);
    setActiveIntention(null);
    setExceptionPass(null);
    setStatus('idle');
    await refreshData();
  };

  const openRescueModal = () => setIsRescueModalOpen(true);
  const closeRescueModal = () => setIsRescueModalOpen(false);

  const applyFocusRescue = async (minutes: number, newGoal?: string) => {
    setIsRescueModalOpen(false);
    const goalTitle = newGoal && newGoal.trim() ? newGoal.trim() : (activeIntention?.title || 'Recovered Focus Block');
    await startSession(goalTitle, minutes, 3, 'work');
  };

  const saveDistractionNote = async (content: string) => {
    if (!content.trim()) return;
    const newItem: DistractionItem = {
      id: crypto.randomUUID(),
      sessionId: activeSession?.id,
      content: content.trim(),
      createdAt: Date.now(),
      status: 'inbox'
    };

    await storageService.addDistractionItem(newItem);
    audioService.playCaptureTick();
    await refreshData();
  };

  const archiveDistractionItem = async (id: string) => {
    await storageService.updateDistractionItemStatus(id, 'archived');
    await refreshData();
  };

  const restoreDistractionItem = async (id: string) => {
    await storageService.updateDistractionItemStatus(id, 'inbox');
    await refreshData();
  };

  const editDistractionItem = async (id: string, content: string) => {
    await storageService.editDistractionItem(id, content);
    await refreshData();
  };

  const deleteDistractionItem = async (id: string) => {
    await storageService.deleteDistractionItem(id);
    await refreshData();
  };

  const openDistractionInbox = () => setIsDistractionInboxOpen(true);
  const closeDistractionInbox = () => setIsDistractionInboxOpen(false);

  const toggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    audioService.setMuted(next);
  };

  const toggleAmbientSound = () => {
    const next = !isAmbientSoundActive;
    setIsAmbientSoundActive(next);
    audioService.toggleAmbientFocus(next);
  };

  const exportData = async () => {
    return await storageService.exportFullData();
  };

  const importData = async (jsonString: string) => {
    const result = await storageService.importFullData(jsonString);
    await refreshData();
    return result;
  };

  const wipeData = async () => {
    await storageService.wipeAllData();
    setActiveSession(null);
    setActiveIntention(null);
    setStatus('idle');
    setRecoveredSessionState(null);
    await refreshData();
  };

  // Recovery actions
  const resumeRecoveredSession = () => {
    if (!recoveredSessionState) return;
    setActiveIntention(recoveredSessionState.intention);
    setActiveSession(recoveredSessionState.session);
    startedAtRef.current = recoveredSessionState.startedAt;
    totalPausedMsRef.current = recoveredSessionState.totalPausedMs;
    lastPausedAtRef.current = null;
    setTargetDurationSeconds(recoveredSessionState.targetDurationSeconds);
    setElapsedSeconds(recoveredSessionState.session.elapsedSeconds);
    setStatus('focusing');
    setRecoveredSessionState(null);
  };

  const finishRecoveredSession = () => {
    if (!recoveredSessionState) return;
    setActiveIntention(recoveredSessionState.intention);
    setActiveSession(recoveredSessionState.session);
    setElapsedSeconds(recoveredSessionState.session.elapsedSeconds);
    setRecoveredSessionState(null);
    setStatus('completing');
  };

  const discardRecoveredSession = () => {
    storageService.clearActiveSessionState();
    setRecoveredSessionState(null);
    setStatus('idle');
  };

  return (
    <FocusContext.Provider
      value={{
        status,
        activeIntention,
        activeSession,
        elapsedSeconds,
        targetDurationSeconds,
        breakRemainingSeconds,
        exceptionPass,
        activeDriftEvent,
        recoveredSessionState,
        isDistractionInboxOpen,
        isRescueModalOpen,
        isAudioMuted,
        isAmbientSoundActive,
        distractionInboxItems,
        dailyStats,
        focusProfile,
        completedOutcomes,

        startSession,
        pauseSession,
        resumeSession,
        triggerIntentFirewall,
        resolveDistraction,
        grantIntentionalException,
        emergencyExit,
        startBreak,
        endBreak,
        finishSessionPrompt,
        submitCompletedOutcome,
        openRescueModal,
        closeRescueModal,
        applyFocusRescue,
        saveDistractionNote,
        archiveDistractionItem,
        restoreDistractionItem,
        editDistractionItem,
        deleteDistractionItem,
        openDistractionInbox,
        closeDistractionInbox,
        toggleMute,
        toggleAmbientSound,
        refreshData,
        exportData,
        importData,
        wipeData,
        resumeRecoveredSession,
        finishRecoveredSession,
        discardRecoveredSession
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const ctx = useContext(FocusContext);
  if (!ctx) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return ctx;
};
