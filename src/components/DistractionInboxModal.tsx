import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import {
  Inbox,
  X,
  Trash2,
  ArrowDownCircle,
  Archive,
  Check,
  Edit2,
  Search,
  RotateCcw
} from 'lucide-react';

export const DistractionInboxModal: React.FC = () => {
  const {
    isDistractionInboxOpen,
    closeDistractionInbox,
    saveDistractionNote,
    distractionInboxItems,
    deleteDistractionItem,
    archiveDistractionItem,
    restoreDistractionItem,
    editDistractionItem
  } = useFocus();

  const [thought, setThought] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox');
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

  const filteredItems = distractionInboxItems.filter((i) => {
    const matchesSearch = !searchQuery || i.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'inbox' ? (i.status === 'inbox' || !i.status) : (i.status === 'archived');
    return matchesSearch && matchesTab;
  });

  const activeCount = distractionInboxItems.filter(i => i.status === 'inbox' || !i.status).length;
  const archivedCount = distractionInboxItems.filter(i => i.status === 'archived').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inbox-title"
      className="fixed inset-0 z-50 bg-obsidian-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="max-w-lg w-full glass-panel rounded-3xl p-6 border border-obsidian-700/80 shadow-2xl relative">
        {/* Header */}
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
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Thought Capture Input */}
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
              className="absolute right-2 top-2 p-1.5 rounded-xl bg-amber-400 text-obsidian-950 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Save to inbox"
            >
              <ArrowDownCircle className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
            Press Enter to offload instantly. (Esc to close)
          </span>
        </form>

        {/* Search & Tabs */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-obsidian-800 pt-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-obsidian-900 p-1 rounded-xl border border-obsidian-800">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'inbox'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'archived'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Archived ({archivedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-40">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter thoughts..."
              className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
          </div>
        </div>

        {/* Items List */}
        <div className="mt-3 max-h-52 overflow-y-auto space-y-2 pr-1">
          {filteredItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 italic">
              {searchQuery ? 'No matching thoughts found.' : activeTab === 'inbox' ? 'Your active inbox is clear.' : 'No archived thoughts.'}
            </p>
          ) : (
            filteredItems.map((item) => (
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
                  <span className={`truncate pr-2 flex-1 ${item.status === 'archived' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.content}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {item.status !== 'archived' && (
                    <button
                      onClick={() => startEdit(item.id, item.content)}
                      aria-label="Edit item"
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}

                  {item.status === 'archived' ? (
                    <button
                      onClick={() => restoreDistractionItem(item.id)}
                      aria-label="Restore to active inbox"
                      className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                      title="Restore"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => archiveDistractionItem(item.id)}
                      aria-label="Archive item"
                      className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => deleteDistractionItem(item.id)}
                    aria-label="Delete item"
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-obsidian-800 flex justify-end">
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
