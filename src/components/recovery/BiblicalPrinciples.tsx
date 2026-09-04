import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
  Award,
  Save,
  Check
} from 'lucide-react';
import { CORE_BIBLICAL_RECOVERY_PRINCIPLES } from '../../data/recoveryPrinciples';
import { RecoveryPrinciple, UserPrincipleProgress } from '../../types/recovery';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../services/audio';

export const BiblicalPrinciples: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_local';

  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [progressMap, setProgressMap] = useState<Record<number, UserPrincipleProgress>>({});
  const [activeNotes, setActiveNotes] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null);
  const [playingStep, setPlayingStep] = useState<number | null>(null);

  // Load user progress
  useEffect(() => {
    fetch(`/api/recovery/user-principles/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.progress) {
          setProgressMap(data.progress);
          const initialNotes: Record<number, string> = {};
          Object.entries(data.progress).forEach(([step, prog]: [string, any]) => {
            initialNotes[Number(step)] = prog.userNotes || '';
          });
          setActiveNotes(initialNotes);
        }
      })
      .catch(console.error);
  }, [userId]);

  const toggleExpand = (step: number) => {
    soundEffects.playTap();
    setExpandedStep(expandedStep === step ? null : step);
  };

  const handleToggleCompleted = (step: number) => {
    soundEffects.playSuccess();
    const current = progressMap[step] || {
      step,
      isCompleted: false,
      userNotes: activeNotes[step] || '',
      actionCommitted: false
    };

    const updated: UserPrincipleProgress = {
      ...current,
      isCompleted: !current.isCompleted,
      completedAt: !current.isCompleted ? new Date().toISOString() : undefined,
      userNotes: activeNotes[step] || current.userNotes || ''
    };

    saveProgressToBackend(step, updated);
  };

  const handleToggleActionCommitted = (step: number) => {
    soundEffects.playTap();
    const current = progressMap[step] || {
      step,
      isCompleted: false,
      userNotes: activeNotes[step] || '',
      actionCommitted: false
    };

    const updated: UserPrincipleProgress = {
      ...current,
      actionCommitted: !current.actionCommitted
    };

    saveProgressToBackend(step, updated);
  };

  const handleSaveNotes = (step: number) => {
    soundEffects.playTap();
    setIsSaving(step);
    const current = progressMap[step] || {
      step,
      isCompleted: false,
      userNotes: '',
      actionCommitted: false
    };

    const updated: UserPrincipleProgress = {
      ...current,
      userNotes: activeNotes[step] || ''
    };

    saveProgressToBackend(step, updated).then(() => {
      setIsSaving(null);
      setSaveSuccess(step);
      setTimeout(() => setSaveSuccess(null), 2500);
    });
  };

  const saveProgressToBackend = async (step: number, progress: UserPrincipleProgress) => {
    setProgressMap(prev => ({ ...prev, [step]: progress }));
    try {
      await fetch(`/api/recovery/user-principles/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      });
    } catch (err) {
      console.error('Failed to save principle progress:', err);
    }
  };

  // Audio synthesis: Read principle aloud
  const handleReadAloud = (principle: RecoveryPrinciple) => {
    soundEffects.playTap();
    if (playingStep === principle.step) {
      window.speechSynthesis.cancel();
      setPlayingStep(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `Principle ${principle.step}: ${principle.title}. Scripture from ${principle.scripture.reference}: ${principle.scripture.text}. Biblical Truth: ${principle.biblicalTruth}. Prayer: ${principle.prayer}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingStep(null);
    utterance.onerror = () => setPlayingStep(null);

    setPlayingStep(principle.step);
    window.speechSynthesis.speak(utterance);
  };

  // Compute completed count
  const completedCount = Object.values(progressMap).filter(p => p.isCompleted).length;
  const percentage = Math.round((completedCount / 10) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Progress Bar */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-indigo-950/40 border border-white/10 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                10 Biblical Steps
              </span>
              <span className="text-xs text-slate-400">Christ-Centered Deliverance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Core Biblical Recovery Principles
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Unlike secular models that rely on generic higher powers, the Path to Freedom is anchored in the Gospel of Jesus Christ, repentance, renewing the mind, and walking in the Holy Spirit.
            </p>
          </div>

          {/* Progress Badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Your Progress</div>
              <div className="text-lg font-black text-white">{completedCount} of 10 Steps</div>
            </div>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Sanctification & Growth Journey</span>
            <span className="text-blue-400">{percentage}% Mastered</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 transition-all duration-700 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 10 Interactive Cards */}
      <div className="space-y-4">
        {CORE_BIBLICAL_RECOVERY_PRINCIPLES.map(principle => {
          const isExpanded = expandedStep === principle.step;
          const prog = progressMap[principle.step];
          const isDone = !!prog?.isCompleted;
          const isActionDone = !!prog?.actionCommitted;

          return (
            <div
              key={principle.step}
              id={`principle-card-${principle.step}`}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isExpanded
                  ? 'bg-slate-900/90 border-blue-500/40 shadow-blue-900/10'
                  : 'bg-white/5 hover:bg-white/[0.07] border-white/10'
              }`}
            >
              {/* Card Summary Header */}
              <div
                onClick={() => toggleExpand(principle.step)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Step Number or Completed Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCompleted(principle.step);
                    }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                        : 'bg-white/10 hover:bg-blue-600/30 text-white border border-white/15'
                    }`}
                    title={isDone ? 'Mark as In Progress' : 'Mark Step as Completed'}
                  >
                    {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : principle.step}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                        Step {principle.step} • {principle.biblicalTheme}
                      </span>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                      {principle.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {principle.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Read Aloud Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadAloud(principle);
                    }}
                    className={`p-2 rounded-xl border transition-all ${
                      playingStep === principle.step
                        ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
                    }`}
                    title="Listen to principle"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Card Content */}
              {isExpanded && (
                <div className="p-5 sm:p-7 pt-2 border-t border-white/10 space-y-6">
                  {/* Scripture Foundation Quote Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span>Scripture Foundation (King James Version)</span>
                      <span className="ml-auto text-amber-300 font-semibold">{principle.scripture.reference}</span>
                    </div>
                    <p className="text-sm sm:text-base font-serif italic text-slate-100 leading-relaxed">
                      "{principle.scripture.text}"
                    </p>
                  </div>

                  {/* Summary & Biblical Truth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Principle Insight
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {principle.summary}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                        The Transforming Truth
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
                        {principle.biblicalTruth}
                      </p>
                    </div>
                  </div>

                  {/* Personal Reflection Questions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Personal Reflection Prompts</span>
                    </h4>
                    <div className="space-y-2">
                      {principle.reflectionQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Practical Action Steps for Freedom</span>
                    </h4>
                    <div className="space-y-2">
                      {principle.actionSteps.map((stepText, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5"
                        >
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prayer & Biblical Affirmation */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Prayer of Surrender & Deliverance
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-serif">
                      "{principle.prayer}"
                    </p>
                    <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2 text-xs font-bold text-amber-400">
                      <span>✝️ Scripture Anchor:</span>
                      <span className="text-slate-300 font-normal">{principle.affirmation}</span>
                    </div>
                  </div>

                  {/* Confidential Study Journal Notes Area */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        My Confidential Study Notes & Prayer
                      </label>
                      {saveSuccess === principle.step && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Notes Saved
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={activeNotes[principle.step] || ''}
                      onChange={e =>
                        setActiveNotes(prev => ({ ...prev, [principle.step]: e.target.value }))
                      }
                      placeholder="Write your personal reflections, what God is speaking to you, and any commitments..."
                      className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActionCommitted(principle.step)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                          isActionDone
                            ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {isActionDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
                        <span>I commit to this action step today</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveNotes(principle.step)}
                        disabled={isSaving === principle.step}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving === principle.step ? 'Saving...' : 'Save Notes'}</span>
                      </button>
                    </div>
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
