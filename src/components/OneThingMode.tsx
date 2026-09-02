import React, { useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import {
  Inbox,
  Coffee,
  Volume2,
  VolumeX,
  Radio,
  AlertCircle,
  LifeBuoy,
  CheckCircle,
  Clock,
  ArrowRight,
  Pause,
  Play
} from 'lucide-react';

export const OneThingMode: React.FC = () => {
  const {
    activeIntention,
    activeSession,
    elapsedSeconds,
    targetDurationSeconds,
    status,
    exceptionPass,
    pauseSession,
    resumeSession,
    triggerIntentFirewall,
    openDistractionInbox,
    startBreak,
    finishSessionPrompt,
    openRescueModal,
    isAudioMuted,
    toggleMute,
    isAmbientSoundActive,
    toggleAmbientSound
  } = useFocus();

  // Keyboard shortcut listener: Cmd/Ctrl+K or 's' opens distraction inbox, Space toggles pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openDistractionInbox();
      } else if (e.key === 's' && document.activeElement?.tagName !== 'INPUT') {
        openDistractionInbox();
      } else if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
        if (status === 'focusing') {
          pauseSession();
        } else if (status === 'paused') {
          resumeSession();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDistractionInbox, status, pauseSession, resumeSession]);

  const remainingSeconds = Math.max(0, targetDurationSeconds - elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = targetDurationSeconds > 0
    ? Math.min(100, (elapsedSeconds / targetDurationSeconds) * 100)
    : 0;

  // SVG Circular progress ring geometry
  const size = 320;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Exception pass remaining time
  const exceptionRemainingSeconds = exceptionPass
    ? Math.max(0, Math.round((exceptionPass.expiresAt - Date.now()) / 1000))
    : 0;
  const exceptionMins = Math.floor(exceptionRemainingSeconds / 60);
  const exceptionSecs = exceptionRemainingSeconds % 60;

  const isPaused = status === 'paused';
  const isException = status === 'exception' || (status as string) === 'exception_pass';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 bg-obsidian-950 select-none overflow-hidden">
      {/* Subtle background ambient pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-1000 ${
          isPaused ? 'bg-slate-500/5' : 'bg-amber-500/5 animate-breathe'
        }`} />
      </div>

      {/* Top Header / Intention Badge */}
      <header className="w-full max-w-2xl flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900 border border-obsidian-700/80">
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-slate-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
            {isPaused ? 'PAUSED' : `ONE THING MODE • Level ${activeIntention?.protectionLevel || 3}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Resume button */}
          <button
            onClick={isPaused ? resumeSession : pauseSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 bg-obsidian-900 border border-obsidian-800 hover:bg-obsidian-800 transition-all cursor-pointer"
            title={isPaused ? "Resume focus" : "Pause timer"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Ambient Noise */}
          <button
            onClick={toggleAmbientSound}
            aria-label="Toggle focus sound"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isAmbientSoundActive
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'text-slate-400 hover:text-white bg-obsidian-900 border border-obsidian-800'
            }`}
            title="Focus Sound (Calm Binaural Tone)"
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Sound Mute */}
          <button
            onClick={toggleMute}
            aria-label={isAudioMuted ? "Unmute Harmonic Chimes" : "Mute Sound"}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-obsidian-900 border border-obsidian-800 transition-all cursor-pointer"
            title={isAudioMuted ? "Unmute Harmonic Chimes" : "Mute Sound"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Active Exception Pass Banner */}
      {isException && exceptionPass && (
        <div className="z-20 w-full max-w-md my-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 backdrop-blur-md flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-amber-300">
                Intentional Exception Pass: {exceptionPass.reason}
              </p>
              <p className="text-[11px] text-amber-200/80 font-mono">
                {exceptionMins}:{String(exceptionSecs).padStart(2, '0')} remaining before return
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerIntentFirewall()}
            className="px-2.5 py-1 text-xs font-medium bg-amber-400 text-obsidian-950 rounded-lg hover:bg-amber-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            Done Early <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Center Focus Ring & Active Intention */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 my-8">
        <div className="relative flex items-center justify-center">
          {/* Circular Progress Ring */}
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#141820"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isPaused ? '#64748B' : '#F59E0B'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time & Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
              {isPaused ? 'SESSION PAUSED' : 'Time Remaining'}
            </span>
            <div className={`text-6xl font-extralight tracking-tighter font-mono mb-2 ${isPaused ? 'text-slate-400' : 'text-white'}`}>
              {timeFormatted}
            </div>
            <span className="text-xs font-mono text-amber-400/80">
              {Math.round(progressPercent)}% protected
            </span>
          </div>
        </div>

        {/* The One Thing (Active Intention Goal) */}
        <div className="mt-8 text-center max-w-lg px-4">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
            Your Chosen Focus
          </p>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-tight">
            {activeIntention?.title}
          </h2>
          {activeSession && activeSession.driftCount > 0 && (
            <p className="text-xs text-emerald-400/90 font-mono mt-3">
              ✓ Recovered from {activeSession.driftCount} {activeSession.driftCount === 1 ? 'drift' : 'drifts'} smoothly
            </p>
          )}
        </div>
      </main>

      {/* Bottom Intent Controls Toolbar */}
      <footer className="w-full max-w-xl z-10 pb-4">
        <div className="glass-panel rounded-2xl p-2.5 flex items-center justify-between gap-2 border border-obsidian-700/80 shadow-2xl">
          {/* Save for Later (Distraction Inbox) */}
          <button
            onClick={openDistractionInbox}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-200 bg-obsidian-850 hover:bg-obsidian-700 border border-obsidian-700/80 transition-all cursor-pointer"
            title="Save stray thoughts for later (Hotkey: S or Cmd+K)"
          >
            <Inbox className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Save for Later</span>
            <span className="sm:hidden">Inbox</span>
            <kbd className="hidden md:inline px-1 py-0.5 text-[10px] bg-obsidian-950 text-slate-400 rounded border border-obsidian-700 font-mono">
              S
            </kbd>
          </button>

          {/* Intentional Break */}
          <button
            onClick={() => startBreak(5)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-300 bg-obsidian-850 hover:bg-obsidian-700 border border-obsidian-700/80 transition-all cursor-pointer"
            title="Take a mindful 5-minute pause"
          >
            <Coffee className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">5m Break</span>
          </button>

          {/* Simulate Distraction / Intent Firewall Test */}
          <button
            onClick={triggerIntentFirewall}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium text-amber-300/90 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-all cursor-pointer"
            title="Simulate or test Intent Firewall intercept"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Drift Check</span>
          </button>

          {/* Rescue Me */}
          <button
            onClick={openRescueModal}
            aria-label="Rescue focus session"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-obsidian-850 hover:bg-obsidian-700 border border-obsidian-700/80 transition-all cursor-pointer"
            title="Reset cleanly if you lost momentum"
          >
            <LifeBuoy className="w-4 h-4" />
          </button>

          {/* Complete / Finish */}
          <button
            onClick={finishSessionPrompt}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-obsidian-950 bg-white hover:bg-slate-200 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Finish
          </button>
        </div>
      </footer>
    </div>
  );
};
