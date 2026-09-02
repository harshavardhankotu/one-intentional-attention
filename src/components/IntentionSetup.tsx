import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { ProtectionLevel } from '../types';
import { Shield, Sparkles, Clock, Compass, LifeBuoy, BarChart2, Wand2 } from 'lucide-react';
import { aiCoachService } from '../services/aiCoachService';

interface IntentionSetupProps {
  onOpenDashboard: () => void;
}

export const IntentionSetup: React.FC<IntentionSetupProps> = ({ onOpenDashboard }) => {
  const { startSession, openRescueModal } = useFocus();

  const [title, setTitle] = useState('');
  const [isSharpening, setIsSharpening] = useState(false);
  const [duration, setDuration] = useState<number>(45);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [protectionLevel, setProtectionLevel] = useState<ProtectionLevel>(3);
  const [category, setCategory] = useState<'work' | 'study' | 'creative' | 'exercise' | 'personal'>('work');

  const presets = [
    { label: 'Study DSA', cat: 'study' as const },
    { label: 'Build my startup', cat: 'work' as const },
    { label: 'Write article', cat: 'creative' as const },
    { label: 'Finish presentation', cat: 'work' as const },
    { label: 'Read a book', cat: 'personal' as const },
  ];

  const durations = [15, 25, 45, 60, 90];

  const protectionDescriptions: Record<ProtectionLevel, { title: string; desc: string }> = {
    1: { title: 'Level 1: Reminder', desc: 'Gentle "Are you sure?" notification.' },
    2: { title: 'Level 2: Friction', desc: '5-second pause & intentionality prompt.' },
    3: { title: 'Level 3: Protected', desc: 'Intent Firewall intercept with timed passes.' },
    4: { title: 'Level 4: Deep Focus', desc: 'Allow-list only; shields non-essential activities.' },
    5: { title: 'Level 5: Hard Lock', desc: 'Strict enforcement for critical deadlines.' },
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalDuration = isCustom && Number(customDuration) > 0 ? Number(customDuration) : duration;
    await startSession(title, finalDuration, protectionLevel, category);
  };

  const handleSharpen = async () => {
    if (!title.trim() || isSharpening) return;
    setIsSharpening(true);
    try {
      const sharpened = await aiCoachService.sharpenGoal(title);
      setTitle(sharpened);
    } finally {
      setIsSharpening(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Subtle top navigation */}
      <div className="w-full max-w-2xl flex items-center justify-between py-6 px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-semibold tracking-wider text-sm text-slate-200">ONE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openRescueModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-300/80 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition-all"
            title="Lost your day? Reset cleanly with zero guilt"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            Rescue Me
          </button>
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-obsidian-850 hover:bg-obsidian-700 border border-obsidian-700 transition-all"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Attention Insights
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-obsidian-700/80 shadow-2xl relative">
        <div className="mb-6 text-center">
          <span className="text-xs font-mono tracking-widest uppercase text-amber-400/90 inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Intention Prompt
          </span>
          <h1 className="text-3xl font-light text-white tracking-tight">
            What matters right now?
          </h1>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          {/* Main Goal Input */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish MVP architecture"
              className="w-full bg-obsidian-900 border border-obsidian-600/80 rounded-2xl pl-5 pr-32 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
            />
            {title.trim().length > 0 && (
              <button
                type="button"
                onClick={handleSharpen}
                disabled={isSharpening}
                className="absolute right-3 top-3 px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-amber-300 border border-amber-400/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Sharpen into concrete implementation intention"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                {isSharpening ? 'Sharpening...' : 'Sharpen'}
              </button>
            )}
          </div>

          {/* Preset Suggestions */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setTitle(preset.label);
                  setCategory(preset.cat);
                }}
                className="px-3 py-1.5 rounded-full text-xs text-slate-400 bg-obsidian-850 hover:bg-obsidian-700 hover:text-slate-200 border border-obsidian-700/70 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Attention Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Attention to protect
              </label>
              <span className="text-xs text-amber-400 font-mono">
                {isCustom ? `${customDuration || 0}m` : `${duration} minutes`}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDuration(d);
                    setIsCustom(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-mono transition-all border ${
                    !isCustom && duration === d
                      ? 'bg-amber-400 text-obsidian-950 font-semibold border-amber-400 shadow-md'
                      : 'bg-obsidian-900 text-slate-300 border-obsidian-700 hover:bg-obsidian-800'
                  }`}
                >
                  {d}m
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`py-2 rounded-xl text-xs font-mono transition-all border ${
                  isCustom
                    ? 'bg-amber-400 text-obsidian-950 font-semibold border-amber-400 shadow-md'
                    : 'bg-obsidian-900 text-slate-300 border-obsidian-700 hover:bg-obsidian-800'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="mt-3">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Minutes (e.g. 50)"
                  className="w-full bg-obsidian-900 border border-obsidian-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Protection Level Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Protection Level
              </label>
              <span className="text-xs text-slate-400">
                {protectionDescriptions[protectionLevel].title}
              </span>
            </div>

            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as ProtectionLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setProtectionLevel(lvl)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    protectionLevel === lvl
                      ? 'bg-obsidian-700 text-amber-300 border-amber-400/60 font-semibold shadow-inner'
                      : 'bg-obsidian-900 text-slate-400 border-obsidian-800 hover:bg-obsidian-850'
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 italic">
              {protectionDescriptions[protectionLevel].desc}
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-obsidian-950 font-semibold text-base transition-all active:scale-[0.98] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Enter ONE THING Mode
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-500 font-mono mt-6 text-center">
        100% on-device • No cloud surveillance • One thing. Right now.
      </p>
    </div>
  );
};
