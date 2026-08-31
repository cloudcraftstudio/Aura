import React, { useState, useEffect } from 'react';
import { Sun, SunDim, Moon, Heart, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { getCurrentDevotional, DailyDevotional } from '../../data/devotionals';

export const DailyDevotionalTab = () => {
  const [devotional, setDevotional] = useState<DailyDevotional | null>(null);
  const [activeSlot, setActiveSlot] = useState<'morning' | 'midday' | 'evening'>('morning');

  useEffect(() => {
    setDevotional(getCurrentDevotional());
    
    // Auto-select based on time of day
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      setActiveSlot('morning');
    } else if (hour >= 12 && hour < 17) {
      setActiveSlot('midday');
    } else {
      setActiveSlot('evening');
    }
  }, []);

  if (!devotional) return null;

  const currentEntry = devotional[activeSlot];

  return (
    <div className="max-w-2xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-blue-900/40 to-transparent p-6 sm:p-8 border-b border-white/5 rounded-b-[2.5rem]">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Daily Scripture Plan</h1>
        <p className="text-blue-200/70 text-sm">Spiritual nourishment around the clock.</p>
        
        {/* Slot Selectors */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mt-6">
          <button
            onClick={() => setActiveSlot('morning')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
              activeSlot === 'morning' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Morning</span>
          </button>
          <button
            onClick={() => setActiveSlot('midday')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
              activeSlot === 'midday' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SunDim className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Midday</span>
          </button>
          <button
            onClick={() => setActiveSlot('evening')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
              activeSlot === 'evening' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Evening</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Scripture Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${
              activeSlot === 'morning' ? 'bg-blue-500/20 text-blue-400' :
              activeSlot === 'midday' ? 'bg-amber-500/20 text-amber-400' :
              'bg-indigo-500/20 text-indigo-400'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{currentEntry.title}</h2>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate_tab', { detail: { tab: 'bible' } }));
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('switch_study_tab', { detail: { tab: 'study' } }));
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('navigate_bible_study', { detail: { reference: currentEntry.reference } }));
                    }, 50);
                  }, 50);
                }}
                className="text-sm font-serif text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group"
              >
                {currentEntry.reference}
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <blockquote className="text-xl sm:text-2xl font-serif text-slate-200 leading-relaxed italic border-l-4 border-white/10 pl-4 py-1">
            "{currentEntry.text}"
          </blockquote>
        </div>

        {/* Study Details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#0b0f24] rounded-3xl p-5 border border-white/5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Topic</h3>
            <p className="text-white font-bold text-lg mb-4">{currentEntry.topic}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {currentEntry.values.map((v, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-slate-300">
                  {v}
                </span>
              ))}
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Points</h3>
            <ul className="space-y-3">
              {currentEntry.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl p-5 border border-indigo-500/20 shadow-lg">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" />
                Reminder
              </h3>
              <p className="text-indigo-100 font-medium leading-relaxed">
                {currentEntry.reminder}
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 shadow-lg flex-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prayer Focus</h3>
              <p className="text-slate-300 text-sm leading-relaxed italic font-serif">
                {currentEntry.prayer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
