import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Calendar,
  BookOpen,
  Plus,
  Heart,
  Sparkles,
  CheckCircle2,
  Smile,
  Shield,
  Eye,
  EyeOff,
  Save,
  Clock
} from 'lucide-react';
import { RecoveryJournalEntry } from '../../types/recovery';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../services/audio';

interface MemoryVerse {
  reference: string;
  text: string;
  theme: string;
}

const MEMORY_VERSES: MemoryVerse[] = [
  {
    reference: '1 Corinthians 10:13',
    text: 'There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.',
    theme: 'Way of Escape in Temptation'
  },
  {
    reference: 'Romans 8:1',
    text: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.',
    theme: 'Freedom from Condemnation'
  },
  {
    reference: 'Galatians 5:16',
    text: 'This I say then, Walk in the Spirit, and ye shall not fulfil the lust of the flesh.',
    theme: 'Walking in the Holy Spirit'
  },
  {
    reference: 'James 5:16',
    text: 'Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much.',
    theme: 'Healing in Transparency'
  },
  {
    reference: 'Psalm 119:9-11',
    text: 'Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word. Thy word have I hid in mine heart, that I might not sin against thee.',
    theme: 'Hiding God\'s Word'
  }
];

const MILESTONES = [
  { days: 1, label: '24 Hours', icon: '🌱' },
  { days: 3, label: '3 Days', icon: '🔥' },
  { days: 7, label: '1 Week', icon: '🛡️' },
  { days: 14, label: '2 Weeks', icon: '⚔️' },
  { days: 30, label: '30 Days', icon: '🏆' },
  { days: 60, label: '60 Days', icon: '👑' },
  { days: 90, label: '90 Days', icon: '🦅' },
  { days: 365, label: '1 Year', icon: '✨' }
];

export const RecoveryJournal: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_local';

  // Streak state
  const [streakDays, setStreakDays] = useState(1);
  const [streakStartDate, setStreakStartDate] = useState(new Date().toISOString());
  const [entries, setEntries] = useState<RecoveryJournalEntry[]>([]);

  // Scripture Memory Practice state
  const [selectedVerseIdx, setSelectedVerseIdx] = useState(0);
  const [isWordsHidden, setIsWordsHidden] = useState(false);
  const [hiddenWordIndices, setHiddenWordIndices] = useState<number[]>([]);

  // New Entry Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mood, setMood] = useState<'triumphant' | 'peaceful' | 'struggling' | 'tempted' | 'grateful'>('grateful');
  const [gratitude, setGratitude] = useState('');
  const [prayer, setPrayer] = useState('');
  const [reflection, setReflection] = useState('');
  const [cravingsManaged, setCravingsManaged] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Journal Data
  useEffect(() => {
    fetch(`/api/recovery/journal/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.streakDays) setStreakDays(data.streakDays);
          if (data.streakStartDate) setStreakStartDate(data.streakStartDate);
          if (data.entries) setEntries(data.entries);
        }
      })
      .catch(console.error);
  }, [userId]);

  const activeVerse = MEMORY_VERSES[selectedVerseIdx];

  // Toggle words hidden for memorization exercise
  const toggleHideWords = () => {
    soundEffects.playTap();
    if (isWordsHidden) {
      setIsWordsHidden(false);
      setHiddenWordIndices([]);
    } else {
      setIsWordsHidden(true);
      const words = activeVerse.text.split(' ');
      // Hide roughly every 2nd or 3rd word
      const hidden: number[] = [];
      words.forEach((_, idx) => {
        if (idx % 2 === 1) hidden.push(idx);
      });
      setHiddenWordIndices(hidden);
    }
  };

  // Streak update (+1 day or reset)
  const handleUpdateStreak = (increment: boolean) => {
    soundEffects.playSuccess();
    const newStreak = increment ? streakDays + 1 : Math.max(1, streakDays - 1);
    setStreakDays(newStreak);

    fetch(`/api/recovery/journal/${userId}/streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streakDays: newStreak, startDate: streakStartDate })
    }).catch(console.error);
  };

  // Submit Journal Entry
  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim() && !gratitude.trim()) return;

    soundEffects.playSuccess();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/recovery/journal/${userId}/entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          streakDay: streakDays,
          mood,
          gratitudeNotes: gratitude.trim(),
          prayerNotes: prayer.trim(),
          memoryVerseRef: activeVerse.reference,
          memoryVerseText: activeVerse.text,
          reflection: reflection.trim(),
          cravingsManaged
        })
      });
      const data = await res.json();
      if (data.entry) {
        setEntries(prev => [data.entry, ...prev]);
        setGratitude('');
        setPrayer('');
        setReflection('');
        setIsFormOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Sobriety & Habit Victory Streak */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170e28] via-[#101b44] to-[#0d1f3d] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Victory Streak Tracker
              </span>
              <span className="text-xs text-slate-400">Walking in Daily Grace</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {streakDays}
              </h1>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-bold text-slate-200">
                  {streakDays === 1 ? 'Day of Freedom' : 'Days Victorious in Christ'}
                </span>
                <p className="text-xs text-slate-400">
                  Every 24 hours is a triumph over the enemy through the cross.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Streak Controls & Check-In */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => handleUpdateStreak(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>+1 Day Victorious</span>
            </button>

            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Daily Check-In & Journal</span>
            </button>
          </div>
        </div>

        {/* Milestone Badges Strip */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
            Milestones of Faith & Perseverance
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {MILESTONES.map(m => {
              const isAchieved = streakDays >= m.days;
              return (
                <div
                  key={m.days}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    isAchieved
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 shadow-md shadow-amber-500/10'
                      : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <span className="text-xl block mb-1">{m.icon}</span>
                  <div className="text-[11px] font-bold truncate">{m.label}</div>
                  <div className="text-[9px] text-slate-400">
                    {isAchieved ? 'Unlocked' : `${m.days}d`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scripture Memory Box (Interactive Flashcard Exercise) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Daily Scripture Memory Vault</h3>
              <p className="text-xs text-slate-400">Weapon of Truth: Memorize God's Word to silence fleshly urges</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleHideWords}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isWordsHidden
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
              }`}
            >
              {isWordsHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isWordsHidden ? 'Show All Words' : 'Hide Words to Practice'}</span>
            </button>

            <select
              value={selectedVerseIdx}
              onChange={e => {
                setSelectedVerseIdx(Number(e.target.value));
                setIsWordsHidden(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none"
            >
              {MEMORY_VERSES.map((v, idx) => (
                <option key={idx} value={idx} className="bg-slate-900">
                  {v.reference}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verse Card Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>{activeVerse.theme}</span>
            <span className="text-blue-300 font-mono">{activeVerse.reference} (KJV)</span>
          </div>

          <div className="text-base sm:text-lg font-serif italic text-slate-100 leading-relaxed">
            {isWordsHidden ? (
              activeVerse.text.split(' ').map((word, idx) => {
                const isHidden = hiddenWordIndices.includes(idx);
                return (
                  <span key={idx} className="inline-block mr-1.5">
                    {isHidden ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-dashed border-indigo-400/50">
                        _____
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                );
              })
            ) : (
              `"${activeVerse.text}"`
            )}
          </div>
        </div>
      </div>

      {/* New Journal Entry Modal / Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSubmitEntry} className="p-6 rounded-3xl bg-slate-900 border border-blue-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Daily Growth & Sobriety Journal</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Spiritual Temperature Mood Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Spiritual State Today
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'grateful', label: 'Grateful', icon: '🙏' },
                { id: 'triumphant', label: 'Triumphant', icon: '🔥' },
                { id: 'peaceful', label: 'Peaceful', icon: '🕊️' },
                { id: 'tempted', label: 'Tempted / Urges', icon: '⚔️' },
                { id: 'struggling', label: 'Struggling', icon: '💔' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMood(item.id as any)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mood === item.id
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gratitude Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              3 Things I Am Thanking God For Today
            </label>
            <input
              type="text"
              value={gratitude}
              onChange={e => setGratitude(e.target.value)}
              placeholder="e.g. 1. Clean mind this morning, 2. A call with my sponsor, 3. God's mercy..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Prayer Request / Urge Surrender */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Prayer of Surrender at the Altar
            </label>
            <input
              type="text"
              value={prayer}
              onChange={e => setPrayer(e.target.value)}
              placeholder="Lord Jesus, take this specific fear / craving and replace it with Your peace..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Personal Reflection & Memory Verse Application */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Personal Growth Reflection
            </label>
            <textarea
              rows={3}
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="How did you walk in the Spirit today? What triggers did you manage? How did Scripture help you?"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Cravings Managed Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={cravingsManaged}
                onChange={e => setCravingsManaged(e.target.checked)}
                className="rounded accent-blue-500 w-4 h-4"
              />
              <span>I successfully managed all urges & walked in sobriety today</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Journal Entry'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Past Journal Entries Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>My Journal Timeline</span>
        </h3>

        {entries.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center text-slate-400">
            <p className="font-semibold text-slate-300">No Journal Entries Yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Start your journey by making your first daily victory check-in above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="p-5 rounded-3xl bg-white/5 hover:bg-white/[0.07] border border-white/10 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold">
                      Day {entry.streakDay}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold capitalize">
                    Mood: {entry.mood}
                  </span>
                </div>

                {/* Gratitude & Prayer */}
                {entry.gratitudeNotes && (
                  <div className="text-xs text-slate-300">
                    <strong className="text-emerald-400">Gratitude:</strong> {entry.gratitudeNotes}
                  </div>
                )}

                {entry.prayerNotes && (
                  <div className="text-xs text-slate-300">
                    <strong className="text-amber-400">Prayer:</strong> {entry.prayerNotes}
                  </div>
                )}

                {entry.reflection && (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {entry.reflection}
                  </p>
                )}

                {/* Memory Verse Tag */}
                {entry.memoryVerseRef && (
                  <div className="pt-2 border-t border-white/5 text-[11px] text-indigo-300 flex items-center gap-1.5 font-mono">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Memory Verse: {entry.memoryVerseRef}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
