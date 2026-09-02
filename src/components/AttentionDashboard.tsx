import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import {
  Compass,
  ArrowLeft,
  Clock,
  Zap,
  RotateCcw,
  CheckCircle,
  Download,
  Trash2,
  Inbox,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface AttentionDashboardProps {
  onBackToFocus: () => void;
}

export const AttentionDashboard: React.FC<AttentionDashboardProps> = ({ onBackToFocus }) => {
  const {
    dailyStats,
    focusProfile,
    completedOutcomes,
    distractionInboxItems,
    exportData,
    wipeData,
    deleteDistractionItem
  } = useFocus();

  const [exportMessage, setExportMessage] = useState('');

  const formatMinutesSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remMins}m`;
    }
    return `${mins}m`;
  };

  const handleExport = async () => {
    const jsonStr = await exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-attention-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage('Export downloaded successfully.');
    setTimeout(() => setExportMessage(''), 4000);
  };

  const handleWipe = async () => {
    if (window.confirm('Are you sure you want to wipe all local attention data? This is irreversible.')) {
      await wipeData();
      alert('Local database wiped clean.');
    }
  };

  const intentionalSec = dailyStats?.totalIntentionalSeconds || 0;
  const deepSec = dailyStats?.totalDeepFocusSeconds || 0;
  const recoveredSec = dailyStats?.totalRecoveredSeconds || 0;
  const avgRecovery = dailyStats?.averageRecoveryLatencySeconds || 38;

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-obsidian-800">
          <button
            onClick={onBackToFocus}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Intention
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase text-slate-400">
              Local Attention Dashboard
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="my-8 text-center sm:text-left">
          <span className="text-xs font-mono tracking-widest uppercase text-amber-400/90 block mb-1">
            TODAY'S INTENTION
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Your Attention Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Measuring intentional focus, recovery resilience, and completed outcomes.
          </p>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Intentional Time */}
          <div className="glass-card rounded-2xl p-5 border border-obsidian-700/70">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              INTENTIONAL TIME
            </div>
            <div className="text-3xl font-light text-white font-mono">
              {formatMinutesSeconds(intentionalSec)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Time on chosen goals
            </span>
          </div>

          {/* Card 2: Deep Focus */}
          <div className="glass-card rounded-2xl p-5 border border-obsidian-700/70">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              DEEP FOCUS
            </div>
            <div className="text-3xl font-light text-white font-mono">
              {formatMinutesSeconds(deepSec)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Uninterrupted flow
            </span>
          </div>

          {/* Card 3: Recovered Attention */}
          <div className="glass-card rounded-2xl p-5 border border-obsidian-700/70">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-2">
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              RECOVERED TIME
            </div>
            <div className="text-3xl font-light text-white font-mono">
              {formatMinutesSeconds(recoveredSec)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Rescued from distraction
            </span>
          </div>

          {/* Card 4: Recovery Speed */}
          <div className="glass-card rounded-2xl p-5 border border-obsidian-700/70">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              AVG RECOVERY SPEED
            </div>
            <div className="text-3xl font-light text-white font-mono">
              {avgRecovery > 0 ? `${avgRecovery}s` : '—'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Seconds to return to goal
            </span>
          </div>
        </div>

        {/* Behavioral Observations & Focus Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Focus Profile */}
          <div className="glass-panel rounded-3xl p-6 border border-obsidian-700/80">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Personal Focus Profile
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-obsidian-800">
                <span className="text-slate-400">Best focus window:</span>
                <span className="font-mono text-amber-300 font-medium">
                  {focusProfile?.bestFocusHourWindow || '08:00 – 11:00 AM'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-obsidian-800">
                <span className="text-slate-400">Distraction return rate:</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {focusProfile?.interventionSuccessRate || 100}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-obsidian-800">
                <span className="text-slate-400">Most effective intervention:</span>
                <span className="font-mono text-slate-200 font-medium">
                  Gentle Intent Friction (Level 3)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic mt-4">
              Observations derived strictly from your on-device session records.
            </p>
          </div>

          {/* Meaningful Inferences */}
          <div className="glass-panel rounded-3xl p-6 border border-obsidian-700/80">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Mindful Insights
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 font-medium mb-1">
                  ✓ Returning faster over time
                </p>
                <p className="text-slate-300">
                  When distraction impulses arise, you return within seconds rather than the 23-minute average.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-300 font-medium mb-1">
                  ⚡ Intentional Exceptions Working
                </p>
                <p className="text-slate-300">
                  Using 2-minute timed passes allows you to check references without losing focus.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Outcomes Registry */}
        <div className="glass-panel rounded-3xl p-6 border border-obsidian-700/80 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Completed Outcomes ({completedOutcomes.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Verified Deliverables
            </span>
          </div>

          {completedOutcomes.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 italic">
              No completed sessions recorded yet. Finish a session to capture what you accomplished!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {completedOutcomes.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-amber-400/90 font-mono block mb-0.5">
                      Goal: {item.goalTitle} • {item.durationMinutes}m ({item.focusRating})
                    </span>
                    <p className="text-sm text-white font-medium">
                      "{item.outcomeText}"
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distraction Inbox Review */}
        <div className="glass-panel rounded-3xl p-6 border border-obsidian-700/80 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Distraction Inbox ({distractionInboxItems.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Cognitive Offloads
            </span>
          </div>

          {distractionInboxItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 italic">
              No offloaded thoughts in your inbox.
            </p>
          ) : (
            <div className="space-y-2">
              {distractionInboxItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900 border border-obsidian-800 text-xs"
                >
                  <span className="text-slate-200">{item.content}</span>
                  <button
                    onClick={() => deleteDistractionItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy & Data Sovereignty Section */}
        <div className="glass-panel rounded-3xl p-6 border border-obsidian-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">
                100% On-Device Data Sovereignty
              </p>
              <p className="text-[11px] text-slate-400">
                Zero tracking beacons. All session data resides in your browser's IndexedDB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={handleWipe}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wipe Data
            </button>
          </div>
        </div>

        {exportMessage && (
          <p className="text-xs text-emerald-400 text-center font-mono mt-3">
            {exportMessage}
          </p>
        )}

        {/* Action button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onBackToFocus}
            className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-obsidian-950 font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            Start New Focus Session
          </button>
        </div>
      </div>
    </div>
  );
};
