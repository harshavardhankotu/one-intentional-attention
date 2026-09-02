import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import { Inbox, X, Trash2, ArrowDownCircle, Archive, Check, Edit2 } from 'lucide-react';

export const DistractionInboxModal: React.FC = () => {
  const {
    isDistractionInboxOpen,
    closeDistractionInbox,
    saveDistractionNote,
    distractionInboxItems,
    deleteDistractionItem,
    archiveDistractionItem,
    editDistractionItem
  } = useFocus();

  const [thought, setThought] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDistractionInboxOpen) {
        closeDistractionInbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDistractionInboxOpen, closeDistractionInbox]);

  if (!isDistractionInboxOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) return;
    await saveDistractionNote(thought);
    setThought('');
  };

  const startEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditingText(currentContent);
  };

  const saveEdit = async (id: string) => {
    if (editingText.trim()) {
      await editDistractionItem(id, editingText);
    }
    setEditingId(null);
  };

  const activeItems = distractionInboxItems.filter(i => i.status === 'inbox');
  const archivedItems = distractionInboxItems.filter(i => i.status === 'archived');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inbox-title"
      className="fixed inset-0 z-50 bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="max-w-lg w-full glass-panel rounded-3xl p-6 border border-obsidian-700/80 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 id="inbox-title" className="text-base font-medium text-white">
                Distraction Inbox
              </h3>
              <p className="text-[11px] text-slate-400">
                Cognitive Offloading buffer. Dump thoughts now, review after your session.
              </p>
            </div>
          </div>
          <button
            onClick={closeDistractionInbox}
            aria-label="Close Inbox"
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
              placeholder="e.g. Research headphones, check stock price, order groceries..."
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-2xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!thought.trim()}
              aria-label="Add to inbox"
              className="absolute right-2 top-2 p-1.5 rounded-xl bg-amber-400 text-obsidian-950 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Save to inbox"
            >
              <ArrowDownCircle className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
            Press Enter to offload and return to focus instantly. (Esc to close)
          </span>
        </form>

        {/* List of saved items */}
        <div className="mt-6 max-h-56 overflow-y-auto space-y-2 pr-1">
          {activeItems.length === 0 && archivedItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 italic">
              Your inbox is clear. Offload any intrusive thoughts here anytime.
            </p>
          ) : (
            <>
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900 border border-obsidian-800/80 text-xs text-slate-200"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 flex items-center gap-2 mr-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full bg-obsidian-950 border border-amber-400 rounded px-2 py-1 text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate pr-2 flex-1">{item.content}</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(item.id, item.content)}
                      aria-label="Edit item"
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => archiveDistractionItem(item.id)}
                      aria-label="Archive item"
                      className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteDistractionItem(item.id)}
                      aria-label="Delete item"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {archivedItems.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase text-slate-600 tracking-wider block mb-1">
                    Archived ({archivedItems.length})
                  </span>
                  {archivedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-obsidian-950/60 text-xs text-slate-500"
                    >
                      <span className="truncate line-through pr-2">{item.content}</span>
                      <button
                        onClick={() => deleteDistractionItem(item.id)}
                        className="p-1 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
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
