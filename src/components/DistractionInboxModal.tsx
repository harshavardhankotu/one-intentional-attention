import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { Inbox, X, Trash2, ArrowDownCircle } from 'lucide-react';

export const DistractionInboxModal: React.FC = () => {
  const {
    isDistractionInboxOpen,
    closeDistractionInbox,
    saveDistractionNote,
    distractionInboxItems,
    deleteDistractionItem
  } = useFocus();

  const [thought, setThought] = useState('');

  if (!isDistractionInboxOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) return;
    await saveDistractionNote(thought);
    setThought('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-lg w-full glass-panel rounded-3xl p-6 border border-obsidian-700/80 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">
                Distraction Inbox
              </h3>
              <p className="text-[11px] text-slate-400">
                Cognitive Offloading (Zeigarnik buffer). Dump thoughts now, review after your session.
              </p>
            </div>
          </div>
          <button
            onClick={closeDistractionInbox}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="e.g. Research headphones, call mom, order groceries..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-2xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!thought.trim()}
              className="absolute right-2 top-2 p-1.5 rounded-xl bg-amber-400 text-obsidian-950 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Save to inbox"
            >
              <ArrowDownCircle className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
            Press Enter to offload and return to focus instantly.
          </span>
        </form>

        {/* List of saved items */}
        <div className="mt-6 max-h-56 overflow-y-auto space-y-2 pr-1">
          {distractionInboxItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 italic">
              Your inbox is clear. Offload any intrusive thoughts here anytime.
            </p>
          ) : (
            distractionInboxItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900 border border-obsidian-800/80 text-xs text-slate-200"
              >
                <span className="truncate pr-2">{item.content}</span>
                <button
                  onClick={() => deleteDistractionItem(item.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-3 border-t border-obsidian-800 flex justify-end">
          <button
            onClick={closeDistractionInbox}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-obsidian-950 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Back to Focus
          </button>
        </div>
      </div>
    </div>
  );
};
