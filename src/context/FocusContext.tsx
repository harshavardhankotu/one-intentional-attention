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
  ExceptionPass
} from '../types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

interface FocusContextType {
  status: SessionStatus;
  activeIntention: Intention | null;
  activeSession: FocusSession | null;
  elapsedSeconds: number;
  targetDurationSeconds: number;
  breakRemainingSeconds: number;
  exceptionPass: ExceptionPass | null;
  activeDriftEvent: DriftEvent | null;
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
  openDistractionInbox: () => void;
  closeDistractionInbox: () => void;
  deleteDistractionItem: (id: string) => Promise<void>;
  toggleMute: () => void;
  toggleAmbientSound: () => void;
  refreshData: () => Promise<void>;
  exportData: () => Promise<string>;
  wipeData: () => Promise<void>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [activeIntention, setActiveIntention] = useState<Intention | null>(null);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [targetDurationSeconds, setTargetDurationSeconds] = useState<number>(0);
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState<number>(0);
  const [exceptionPass, setExceptionPass] = useState<ExceptionPass | null>(null);
  const [activeDriftEvent, setActiveDriftEvent] = useState<DriftEvent | null>(null);

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

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Main session timer tick
  useEffect(() => {
    if (status === 'focusing' || status === 'exception_pass') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          if (targetDurationSeconds > 0 && next >= targetDurationSeconds) {
            // Target reached!
            audioService.playSessionComplete();
            setStatus('completing');
            return next;
          }
          return next;
        });
      }, 1000);
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

  // Break countdown timer
  useEffect(() => {
    if (status === 'break') {
      breakTimerRef.current = setInterval(() => {
        setBreakRemainingSeconds(prev => {
          if (prev <= 1) {
            audioService.playDriftNudge();
            setStatus('focusing');
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

  // Exception Pass Countdown timer
  useEffect(() => {
    if (status === 'exception_pass' && exceptionPass) {
      exceptionTimerRef.current = setInterval(() => {
        const remainingMs = exceptionPass.expiresAt - Date.now();
        if (remainingMs <= 0) {
          audioService.playDriftNudge();
          setExceptionPass(null);
          setStatus('focusing');
        }
      }, 1000);
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

    const newIntention: Intention = {
      id: intentionId,
      title: title.trim(),
      category,
      targetDurationMinutes: durationMinutes,
      protectionLevel,
      createdAt: Date.now()
    };

    const newSession: FocusSession = {
      id: sessionId,
      intentionId,
      intentionTitle: title.trim(),
      targetDurationSeconds: targetSeconds,
      elapsedSeconds: 0,
      status: 'completed', // provisional
      protectionLevel,
      startedAt: Date.now(),
      endedAt: 0,
      driftCount: 0,
      totalRecoverySeconds: 0,
      intentionalExceptionsCount: 0
    };

    await storageService.saveIntention(newIntention);
    setActiveIntention(newIntention);
    setActiveSession(newSession);
    setElapsedSeconds(0);
    setTargetDurationSeconds(targetSeconds);
    setStatus('focusing');
    setExceptionPass(null);

    audioService.playSessionStart();
  };

  const triggerIntentFirewall = () => {
    if (status !== 'focusing' && status !== 'exception_pass') return;
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
    setStatus('intercepted');
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

    // Update active session counters
    const updatedSession: FocusSession = {
      ...activeSession,
      driftCount: activeSession.driftCount + 1,
      totalRecoverySeconds: activeSession.totalRecoverySeconds + recoveryLatencySeconds
    };
    setActiveSession(updatedSession);

    setActiveDriftEvent(null);
    setStatus('focusing');
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

    setActiveDriftEvent(null);
    setStatus('exception_pass');
    await refreshData();
  };

  const emergencyExit = async () => {
    if (!activeSession) {
      setStatus('idle');
      return;
    }

    const endedAt = Date.now();
    const finalSession: FocusSession = {
      ...activeSession,
      elapsedSeconds,
      endedAt,
      status: 'abandoned'
    };

    await storageService.saveSession(finalSession);
    setActiveSession(null);
    setActiveIntention(null);
    setActiveDriftEvent(null);
    setExceptionPass(null);
    setStatus('idle');
    await refreshData();
  };

  const startBreak = (minutes: number) => {
    setBreakRemainingSeconds(minutes * 60);
    setStatus('break');
  };

  const endBreak = () => {
    setBreakRemainingSeconds(0);
    setStatus('focusing');
  };

  const finishSessionPrompt = () => {
    audioService.playSessionComplete();
    setStatus('completing');
  };

  const submitCompletedOutcome = async (outcomeText: string, rating: FocusRating) => {
    if (!activeSession || !activeIntention) {
      setStatus('idle');
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

  const openDistractionInbox = () => setIsDistractionInboxOpen(true);
  const closeDistractionInbox = () => setIsDistractionInboxOpen(false);

  const deleteDistractionItem = async (id: string) => {
    await storageService.deleteDistractionItem(id);
    await refreshData();
  };

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

  const wipeData = async () => {
    await storageService.wipeAllData();
    setActiveSession(null);
    setActiveIntention(null);
    setStatus('idle');
    await refreshData();
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
        isDistractionInboxOpen,
        isRescueModalOpen,
        isAudioMuted,
        isAmbientSoundActive,
        distractionInboxItems,
        dailyStats,
        focusProfile,
        completedOutcomes,

        startSession,
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
        openDistractionInbox,
        closeDistractionInbox,
        deleteDistractionItem,
        toggleMute,
        toggleAmbientSound,
        refreshData,
        exportData,
        wipeData
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
