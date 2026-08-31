import React, { useState, useEffect } from 'react';
import { Heart, Send, Sparkles, CheckCircle2, User, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../services/audio';

interface PrayerItem {
  id: string;
  authorName: string;
  authorHandle: string;
  isAnonymous: boolean;
  content: string;
  category: 'Healing' | 'Family' | 'Guidance' | 'Salvation' | 'Praise' | 'General';
  prayedCount: number;
  prayedUsers: string[];
  isAnswered: boolean;
  praiseUpdate?: string;
  createdAt: string;
}

const STORAGE_KEY = 'aura_church_prayer_wall';

export const PrayerWall: React.FC = () => {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<PrayerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'p-1',
        authorName: 'Church Family',
        authorHandle: 'church',
        isAnonymous: false,
        category: 'Praise',
        content: 'Praising God for His abundant grace and for our Wednesday and Sunday gatherings in the Word!',
        prayedCount: 14,
        prayedUsers: [],
        isAnswered: true,
        praiseUpdate: 'Thank you for continuing to lift up the leadership and congregation in prayer.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'p-2',
        authorName: 'Anonymous Member',
        authorHandle: 'anonymous',
        isAnonymous: true,
        category: 'Healing',
        content: 'Please pray for physical healing and strength for a family member recovering this week.',
        prayedCount: 8,
        prayedUsers: [],
        isAnswered: false,
        createdAt: new Date().toISOString(),
      }
    ];
  });

  const [filter, setFilter] = useState<string>('all');
  const [newRequest, setNewRequest] = useState('');
  const [category, setCategory] = useState<PrayerItem['category']>('General');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showPraiseModal, setShowPraiseModal] = useState<string | null>(null);
  const [praiseText, setPraiseText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
    } catch {}
  }, [prayers]);

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim()) return;

    soundEffects.playTap();
    const item: PrayerItem = {
      id: `prayer-${Date.now()}`,
      authorName: isAnonymous ? 'Anonymous Member' : (user?.name || 'Fellow Believer'),
      authorHandle: isAnonymous ? 'anonymous' : (user?.handle || 'member'),
      isAnonymous,
      category,
      content: newRequest.trim(),
      prayedCount: 1,
      prayedUsers: user ? [user.id] : [],
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };

    setPrayers([item, ...prayers]);
    setNewRequest('');
  };

  const handlePrayFor = (prayerId: string) => {
    soundEffects.playTap();
    setPrayers(prev => prev.map(p => {
      if (p.id !== prayerId) return p;
      const userId = user?.id || 'anon';
      const hasPrayed = p.prayedUsers.includes(userId);
      return {
        ...p,
        prayedCount: hasPrayed ? Math.max(1, p.prayedCount - 1) : p.prayedCount + 1,
        prayedUsers: hasPrayed
          ? p.prayedUsers.filter(id => id !== userId)
          : [...p.prayedUsers, userId]
      };
    }));
  };

  const handleMarkAnswered = (prayerId: string) => {
    if (!praiseText.trim()) return;
    setPrayers(prev => prev.map(p => {
      if (p.id !== prayerId) return p;
      return {
        ...p,
        isAnswered: true,
        praiseUpdate: praiseText.trim()
      };
    }));
    setShowPraiseModal(null);
    setPraiseText('');
  };

  const filteredPrayers = prayers.filter(p => {
    if (filter === 'praise') return p.isAnswered || p.category === 'Praise';
    if (filter === 'requests') return !p.isAnswered;
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                Church Fellowship
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Prayer Wall
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Prayer & Praise Community</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              "Bear ye one another's burdens, and so fulfil the law of Christ." — Galatians 6:2
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('requests')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'requests' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs
            </button>
            <button
              onClick={() => setFilter('praise')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'praise' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Praises & Answered
            </button>
          </div>
        </div>
      </div>

      {/* Submit Prayer Box */}
      <form onSubmit={handleAddPrayer} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          Share a Prayer Need or Praise Report
        </h3>

        <textarea
          rows={3}
          required
          value={newRequest}
          onChange={e => setNewRequest(e.target.value)}
          placeholder="How can your church family stand with you in prayer today?"
          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-blue-500 outline-none resize-none leading-relaxed placeholder:text-slate-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none"
            >
              <option value="General">General Prayer</option>
              <option value="Healing">Healing & Health</option>
              <option value="Family">Family & Home</option>
              <option value="Guidance">Guidance & Wisdom</option>
              <option value="Salvation">Salvation</option>
              <option value="Praise">Praise & Thanksgiving</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              Share Anonymously
            </label>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post to Wall</span>
          </button>
        </div>
      </form>

      {/* Prayers List */}
      <div className="space-y-3.5">
        {filteredPrayers.map((prayer) => {
          const userHasPrayed = user ? prayer.prayedUsers.includes(user.id) : false;
          const isOwner = user && (user.handle === prayer.authorHandle || user.handle === 'tex');

          return (
            <div
              key={prayer.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                prayer.isAnswered
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900/50 border-white/10 hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {prayer.isAnonymous ? <User className="w-4 h-4 text-slate-400" /> : prayer.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{prayer.authorName}</span>
                      {prayer.category && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                          {prayer.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(prayer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {prayer.isAnswered && (
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Answered Praise
                  </span>
                )}
              </div>

              {/* Prayer Content */}
              <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed">
                {prayer.content}
              </p>

              {/* Answered Praise Report Box */}
              {prayer.praiseUpdate && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5" /> Praise Report / Testimony:
                  </p>
                  <p className="leading-relaxed italic">{prayer.praiseUpdate}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handlePrayFor(prayer.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userHasPrayed
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                  title="Lift this request up in prayer"
                >
                  <span className="text-sm">🙏</span>
                  <span>{userHasPrayed ? 'Praying with you' : 'I Prayed For This'}</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] text-white font-mono">
                    {prayer.prayedCount}
                  </span>
                </button>

                {isOwner && !prayer.isAnswered && (
                  <button
                    onClick={() => setShowPraiseModal(prayer.id)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Share Praise Report
                  </button>
                )}
              </div>

              {/* Modal for Answered Praise */}
              {showPraiseModal === prayer.id && (
                <div className="mt-3 p-3 bg-black/50 border border-emerald-500/40 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-emerald-300 block">
                    Praise Report / Answered Prayer Testimony:
                  </label>
                  <textarea
                    rows={2}
                    value={praiseText}
                    onChange={e => setPraiseText(e.target.value)}
                    placeholder="Share how God answered this prayer to encourage the church..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowPraiseModal(null)}
                      className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMarkAnswered(prayer.id)}
                      className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                    >
                      Publish Praise
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
