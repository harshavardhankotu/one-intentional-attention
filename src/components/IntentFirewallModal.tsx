import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Clock,
  AlertTriangle,
  Lock,
  PauseCircle
} from 'lucide-react';

export const IntentFirewallModal: React.FC = () => {
  const {
    status,
    activeIntention,
    elapsedSeconds,
    targetDurationSeconds,
    resolveDistraction,
    grantIntentionalException,
    emergencyExit
  } = useFocus();

  const [step, setStep] = useState<'decision' | 'exception_reason' | 'hard_lock_confirm'>('decision');
  const [selectedReason, setSelectedReason] = useState('Search documentation / API reference');
  const [customReason, setCustomReason] = useState('');
  const [exceptionDuration, setExceptionDuration] = useState<number>(2);

  // Level 2 friction countdown (5 seconds)
  const [frictionRemaining, setFrictionRemaining] = useState<number>(5);

  // Level 5 confirmation input
  const [hardLockInput, setHardLockInput] = useState<string>('');

  const protectionLevel = activeIntention?.protectionLevel || 3;

  // Level 2 timer effect
  useEffect(() => {
    if (status === 'interrupted' && protectionLevel === 2) {
      setFrictionRemaining(5);
      const interval = setInterval(() => {
        setFrictionRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, protectionLevel]);

  // Keyboard shortcut options: 1 for return, 2 for exception, 3 for emergency
  useEffect(() => {
    if (status !== 'interrupted') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'decision') {
        if (e.key === '1') {
          resolveDistraction();
        } else if (e.key === '2' && protectionLevel !== 2 || frictionRemaining === 0) {
          setStep('exception_reason');
        } else if (e.key === '3') {
          if (protectionLevel === 5) {
            setStep('hard_lock_confirm');
          } else {
            emergencyExit();
          }
        }
      } else if (step === 'exception_reason' && e.key === 'Escape') {
        setStep('decision');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, step, resolveDistraction, emergencyExit, protectionLevel, frictionRemaining]);

  if (status !== 'interrupted') return null;

  const remainingSeconds = Math.max(0, targetDurationSeconds - elapsedSeconds);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  const exceptionReasons = [
    'Search documentation / API reference',
    'Watch a specific educational video',
    'Reply to an urgent message / email',
    'Check critical fact / reference material',
    'Other specific purpose'
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="firewall-title"
      className="fixed inset-0 z-50 bg-obsidian-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="max-w-lg w-full glass-panel rounded-3xl p-8 border border-amber-500/40 shadow-2xl relative overflow-hidden">
        {/* Amber spotlight glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {step === 'decision' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono tracking-widest uppercase text-amber-400">
                  INTENT FIREWALL • LEVEL {protectionLevel}
                </span>
              </div>
              {protectionLevel === 4 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Deep Focus (Allow-list)
                </span>
              )}
              {protectionLevel === 5 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Hard Lock
                </span>
              )}
            </div>

            <h2 id="firewall-title" className="text-3xl font-light text-white tracking-tight mb-2">
              {protectionLevel === 1 ? 'Are you sure?' : 'WAIT.'}
            </h2>

            <div className="my-4 p-4 rounded-2xl bg-obsidian-900 border border-obsidian-700/80">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                You committed to:
              </p>
              <p className="text-xl text-white font-medium">
                "{activeIntention?.title}"
              </p>
              <p className="text-xs text-amber-400/90 font-mono mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {remainingMinutes} minutes remain in this session.
              </p>
            </div>

            {/* Level 2 Mindful Friction Pause */}
            {protectionLevel === 2 && frictionRemaining > 0 && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3">
                <PauseCircle className="w-5 h-5 text-amber-400 animate-spin" />
                <div className="text-xs text-amber-200">
                  <span className="font-semibold">Take a breath.</span> Deliberate friction pause ({frictionRemaining}s remaining)...
                </div>
              </div>
            )}

            <p className="text-sm text-slate-300 mb-6">
              {protectionLevel === 1
                ? 'Did you mean to switch tasks, or do you want to protect this focus block?'
                : 'What happened? Did you drift on autopilot, or do you have a specific intentional reason?'}
            </p>

            <div className="space-y-3">
              {/* Option 1: I got distracted / Return */}
              <button
                onClick={resolveDistraction}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-emerald-500/40 text-left transition-all active:scale-[0.99] group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 font-medium text-slate-100 text-sm mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>I got distracted — Return to Focus</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-6">
                    Return to your goal. Quick recovery tracked with zero shame.
                  </p>
                </div>
                <kbd className="px-2 py-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                  1
                </kbd>
              </button>

              {/* Option 2: Specific intentional reason (Level 1-4) */}
              {protectionLevel < 5 && (
                <button
                  disabled={protectionLevel === 2 && frictionRemaining > 0}
                  onClick={() => setStep('exception_reason')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 border border-amber-500/40 text-left transition-all active:scale-[0.99] group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-100 text-sm mb-0.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>I have a specific reason</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-6">
                      Grant a controlled, timed intentional exception pass (2m/5m).
                    </p>
                  </div>
                  <kbd className="px-2 py-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 rounded-md border border-amber-500/20">
                    2
                  </kbd>
                </button>
              )}

              {/* Option 3: Emergency Exit / Stop */}
              <button
                disabled={protectionLevel === 2 && frictionRemaining > 0}
                onClick={() => {
                  if (protectionLevel === 5) {
                    setStep('hard_lock_confirm');
                  } else {
                    emergencyExit();
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 text-left transition-all cursor-pointer disabled:opacity-40"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                  <span>{protectionLevel === 1 ? 'Exit session' : 'Emergency or need to stop'}</span>
                </div>
                <kbd className="text-[11px] text-slate-500 font-mono px-2 py-0.5 rounded bg-obsidian-950 border border-obsidian-800">
                  3
                </kbd>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Intentional Exception Details */}
        {step === 'exception_reason' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('decision')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back (Esc)
              </button>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Intentional Exception
              </span>
            </div>

            <h3 className="text-xl font-light text-white mb-2">
              What do you need right now?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              State your purpose clearly to keep your intention conscious.
            </p>

            <div className="space-y-2 mb-4">
              {exceptionReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all border ${
                    selectedReason === reason
                      ? 'bg-amber-400/15 border-amber-400/60 text-amber-200 font-medium'
                      : 'bg-obsidian-900 border-obsidian-700/60 text-slate-300 hover:bg-obsidian-850'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === 'Other specific purpose' && (
              <div className="mb-4">
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe what you need..."
                  className="w-full bg-obsidian-900 border border-obsidian-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs font-mono uppercase text-slate-400 block mb-2">
                Pass Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[2, 5].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setExceptionDuration(mins)}
                    className={`py-2 rounded-xl text-xs font-mono border transition-all ${
                      exceptionDuration === mins
                        ? 'bg-amber-400 text-obsidian-950 font-bold border-amber-400'
                        : 'bg-obsidian-900 text-slate-300 border-obsidian-700 hover:bg-obsidian-850'
                    }`}
                  >
                    {mins} Minutes Pass
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const finalReason = selectedReason === 'Other specific purpose' && customReason
                  ? customReason
                  : selectedReason;
                grantIntentionalException(finalReason, exceptionDuration);
              }}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-obsidian-950 font-semibold text-sm transition-all active:scale-98 shadow-md cursor-pointer"
            >
              Start {exceptionDuration}-Minute Intentional Pass
            </button>
          </div>
        )}

        {/* Step 3: Hard Lock Confirmation (Level 5) */}
        {step === 'hard_lock_confirm' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep('decision')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Cancel (Esc)
              </button>
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Hard Lock Confirmation
              </span>
            </div>

            <h3 className="text-lg font-medium text-white mb-2">
              Level 5 Hard Lock Active
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              To stop this session, type <span className="text-rose-400 font-mono font-semibold">"I choose to stop"</span> below. This intentional friction breaks automatic surrender.
            </p>

            <input
              type="text"
              autoFocus
              value={hardLockInput}
              onChange={(e) => setHardLockInput(e.target.value)}
              placeholder="I choose to stop"
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-400 mb-4"
            />

            <button
              disabled={hardLockInput.trim().toLowerCase() !== 'i choose to stop'}
              onClick={emergencyExit}
              className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Confirm Exit Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
