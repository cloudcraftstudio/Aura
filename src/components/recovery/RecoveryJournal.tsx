import React, { useState, useEffect } from 'react';
import { 
  Calendar, BookOpen, Plus, Heart, Sparkles, 
  Save, X, Eye, EyeOff, RefreshCw, Feather, ShieldCheck
} from 'lucide-react';
import { RecoveryJournalEntry } from '../../types/recovery';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../services/audio';
import { motion, AnimatePresence } from 'motion/react';

interface MemoryVerse {
  reference: string;
  text: string;
  theme: string;
}

const MEMORY_VERSES: MemoryVerse[] = [
  {
    reference: '1 Corinthians 10:13',
    text: 'There hath no temptation taken you but such as is common to man: but God is faithful...',
    theme: 'Way of Escape in Temptation'
  },
  {
    reference: 'Romans 8:1',
    text: 'There is therefore now no condemnation to them which are in Christ Jesus...',
    theme: 'Freedom from Condemnation'
  },
  {
    reference: 'Galatians 5:16',
    text: 'This I say then, Walk in the Spirit, and ye shall not fulfil the lust of the flesh.',
    theme: 'Walking in the Spirit'
  },
  {
    reference: 'James 4:7',
    text: 'Submit yourselves therefore to God. Resist the devil, and he will flee from you.',
    theme: 'Submission and Resistance'
  }
];

const GUIDED_PROMPTS = [
  "What is a trigger I successfully avoided today?",
  "Where did I see God's grace in the middle of today's chaos?",
  "What burden do I need to lay down tonight?",
  "How did I walk in the Spirit today?",
  "What lie from the enemy did I replace with God's truth today?",
  "Who did I serve or encourage today, and how did it affect my own recovery?",
  "What specific scripture anchored my mind today?"
];

export const RecoveryJournal: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RecoveryJournalEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  
  // Form State
  const [mood, setMood] = useState<'grateful' | 'struggling' | 'tempted' | 'peaceful' | 'triumphant' | null>(null);
  const [reflection, setReflection] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [prayer, setPrayer] = useState('');
  const [cravingsManaged, setCravingsManaged] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeVerse, setActiveVerse] = useState<MemoryVerse>(MEMORY_VERSES[0]);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    // Pick a random verse daily
    const day = new Date().getDay();
    setActiveVerse(MEMORY_VERSES[day % MEMORY_VERSES.length]);

    // Load local entries (Private Sanctuary)
    try {
      const saved = localStorage.getItem('aura_recovery_journal');
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood || !reflection) {
      soundEffects.error();
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newEntry: RecoveryJournalEntry = {
        id: Math.random().toString(36).substring(7),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: Date.now(),
        mood,
        cravingsManaged,
        reflection,
        gratitudeNotes: gratitude,
        prayerNotes: prayer,
        memoryVerseRef: activeVerse.reference,
        memoryVerseText: activeVerse.text,
        streakDay: (entries.length > 0 ? entries[0].streakDay : 0) + (cravingsManaged ? 1 : 0)
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      try {
        localStorage.setItem('aura_recovery_journal', JSON.stringify(updatedEntries));
      } catch {}

      soundEffects.success();
      setIsFormOpen(false);
      setIsSubmitting(false);
      setReflection('');
      setGratitude('');
      setPrayer('');
      setMood(null);
      setCravingsManaged(true);
    }, 600);
  };

  const cyclePrompt = () => {
    soundEffects.tap();
    setPromptIndex(prev => (prev + 1) % GUIDED_PROMPTS.length);
  };

  const togglePrivacy = () => {
    soundEffects.tap();
    setIsPrivacyMode(prev => !prev);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak & Write Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Private Sanctuary</h3>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">My Sanctuary</h2>
            <p className="text-slate-400 text-sm mb-6">
              This journal is stored entirely on your device. It is 100% private. Be honest with yourself and with God.
            </p>
          </div>
          <button 
            onClick={() => {
              soundEffects.tap();
              setIsFormOpen(true);
            }}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Feather className="w-5 h-5" />
            Write New Entry
          </button>
        </div>

        {/* Memory Verse Card */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Memory Verse
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              {activeVerse.theme}
            </span>
          </div>
          <p className="text-slate-200 font-serif leading-relaxed flex-1">
            "{activeVerse.text}"
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 text-right">
            <span className="text-sm font-bold text-emerald-400">— {activeVerse.reference}</span>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Journal Timeline</span>
          </h3>
          <button
            onClick={togglePrivacy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs font-bold"
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPrivacyMode ? 'Privacy On' : 'Privacy Off'}
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center text-slate-400">
            <Feather className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <p className="font-semibold text-slate-300">Your journal is empty.</p>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Start writing your unfiltered thoughts, prayers, and victories. Everything stays securely on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="p-5 sm:p-6 rounded-3xl bg-white/5 hover:bg-white/[0.07] border border-white/10 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      entry.mood === 'triumphant' ? 'bg-amber-500/20 text-amber-300' :
                      entry.mood === 'peaceful' ? 'bg-blue-500/20 text-blue-300' :
                      entry.mood === 'grateful' ? 'bg-emerald-500/20 text-emerald-300' :
                      entry.mood === 'tempted' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {entry.mood}
                    </span>
                    {!entry.cravingsManaged && (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold">
                        Setback
                      </span>
                    )}
                  </div>
                </div>

                <div className={`space-y-4 ${isPrivacyMode ? 'blur-md opacity-50 select-none transition-all duration-300' : 'transition-all duration-300'}`}>
                  {entry.gratitudeNotes && (
                    <div className="text-sm">
                      <strong className="text-emerald-400 block mb-1 uppercase tracking-wider text-[10px]">Gratitude</strong> 
                      <span className="text-slate-300">{entry.gratitudeNotes}</span>
                    </div>
                  )}
                  {entry.prayerNotes && (
                    <div className="text-sm">
                      <strong className="text-indigo-400 block mb-1 uppercase tracking-wider text-[10px]">Prayer</strong> 
                      <span className="text-slate-300">{entry.prayerNotes}</span>
                    </div>
                  )}
                  {entry.reflection && (
                    <div className="text-sm">
                      <strong className="text-blue-400 block mb-1 uppercase tracking-wider text-[10px]">Reflection</strong> 
                      <p className="text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">
                        {entry.reflection}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Distraction-Free Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-[#05060f] sm:p-4 overflow-y-auto"
          >
            <div className="max-w-3xl mx-auto min-h-full bg-slate-900 sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border-0 sm:border border-white/10 relative">
              {/* Close Button */}
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="max-w-xl mx-auto space-y-10 py-8">
                <div className="text-center space-y-2">
                  <Feather className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Daily Sanctuary</h2>
                  <p className="text-slate-400 text-sm">A private space for absolute honesty with yourself and God.</p>
                </div>

                <form onSubmit={handleSubmitEntry} className="space-y-10">
                  {/* Mood */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center block">
                      How is your spirit right now?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: 'grateful', label: 'Grateful', icon: '🙏' },
                        { id: 'triumphant', label: 'Triumphant', icon: '🔥' },
                        { id: 'peaceful', label: 'Peaceful', icon: '🕊️' },
                        { id: 'tempted', label: 'Tempted', icon: '⚔️' },
                        { id: 'struggling', label: 'Struggling', icon: '💔' }
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMood(item.id as any)}
                          className={`p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                            mood === item.id
                              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-105'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gratitude */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Three Things I'm Grateful For
                    </label>
                    <input
                      type="text"
                      value={gratitude}
                      onChange={e => setGratitude(e.target.value)}
                      placeholder="List three things..."
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all"
                    />
                  </div>

                  {/* Distraction-Free Reflection */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Personal Reflection
                      </label>
                      <button
                        type="button"
                        onClick={cyclePrompt}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5"
                      >
                        <RefreshCw className="w-3 h-3" /> Cycle Prompt
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-t-2xl bg-blue-500/10 border-x border-t border-blue-500/20 text-blue-200 text-sm font-medium italic">
                      "{GUIDED_PROMPTS[promptIndex]}"
                    </div>
                    <textarea
                      rows={8}
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                      placeholder="Start writing..."
                      className="w-full p-5 rounded-b-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all resize-none font-serif text-lg leading-relaxed"
                    />
                  </div>

                  {/* Surrender */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Altar of Surrender
                    </label>
                    <input
                      type="text"
                      value={prayer}
                      onChange={e => setPrayer(e.target.value)}
                      placeholder="Lord, I lay down this specific burden..."
                      className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all"
                    />
                  </div>

                  {/* Sobriety Check */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={cravingsManaged}
                        onChange={e => setCravingsManaged(e.target.checked)}
                        className="mt-1 rounded accent-blue-500 w-5 h-5 cursor-pointer"
                      />
                      <div>
                        <span className="block text-sm font-bold text-white mb-1">I maintained my sobriety today</span>
                        <span className="block text-xs text-slate-400">Checking this will add to your continuous streak. Be honest.</span>
                      </div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !mood || !reflection.trim()}
                      className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isSubmitting ? 'Sealing...' : 'Seal Journal Entry'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
