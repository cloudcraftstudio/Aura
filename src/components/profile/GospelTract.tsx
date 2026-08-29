import React, { useState, useEffect } from 'react';
import {
  Heart,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flame,
  ArrowRight,
  Bookmark,
  Users,
  Compass,
  Check,
  Volume2
} from 'lucide-react';
import { soundEffects } from '../../services/audio';

interface GospelTractProps {
  onStudyPassage?: (ref: string) => void;
}

export const GospelTract: React.FC<GospelTractProps> = ({ onStudyPassage }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hasPrayed, setHasPrayed] = useState<boolean>(() => {
    return localStorage.getItem('gospel_tract_decision') === 'true';
  });
  const [decisionDate, setDecisionDate] = useState<string>(() => {
    return localStorage.getItem('gospel_tract_decision_date') || '';
  });
  const [copied, setCopied] = useState(false);
  const [tractExpanded, setTractExpanded] = useState<number[]>([]);

  useEffect(() => {
    if (hasPrayed && !decisionDate) {
      const now = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      setDecisionDate(now);
      localStorage.setItem('gospel_tract_decision_date', now);
    }
  }, [hasPrayed, decisionDate]);

  const toggleStep = (index: number) => {
    soundEffects.playTap();
    setTractExpanded(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleDecision = () => {
    soundEffects.playSuccessTone();
    const now = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setHasPrayed(true);
    setDecisionDate(now);
    localStorage.setItem('gospel_tract_decision', 'true');
    localStorage.setItem('gospel_tract_decision_date', now);
  };

  const handleShareTract = async () => {
    soundEffects.playTap();
    const tractText = `✝️ THE GOSPEL OF SALVATION IN JESUS CHRIST ✝️

1. God Loves You: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." — John 3:16

2. All Have Sinned: "For all have sinned, and come short of the glory of God." — Romans 3:23

3. The Penalty of Sin: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord." — Romans 6:23

4. Christ Died for You: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." — Romans 5:8

5. Salvation by Grace: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast." — Ephesians 2:8-9

6. Receive Him Today: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." — Romans 10:9

The Sinner's Prayer:
"Dear Lord Jesus, I know that I am a sinner and in need of Your forgiveness. I believe that You died on the cross for my sins and rose again from the grave. Today, I turn from my sins and receive You as my Lord and personal Savior. Thank You for forgiving me and giving me the free gift of eternal life. In Jesus' name, Amen."`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Gospel of Salvation',
          text: tractText,
          url: window.location.origin
        });
      } catch (e) {
        // Fallback to copy
        await navigator.clipboard.writeText(tractText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } else {
      await navigator.clipboard.writeText(tractText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const TRACT_STEPS = [
    {
      num: '1',
      title: "God Loves You and Has a Purpose for Your Life",
      subtitle: "The Creator of the Universe desires a personal relationship with you.",
      verse: "John 3:16",
      verseText: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      explanation: "God created you with intentionality, love, and eternal dignity. He does not desire that anyone should perish, but that all should come to repentance and enjoy everlasting fellowship with Him.",
      keyTruth: "You are deeply known and loved by God."
    },
    {
      num: '2',
      title: "The Reality of Sin: We Are Separated from God",
      subtitle: "Every person has missed God's standard of perfect righteousness.",
      verse: "Romans 3:23",
      verseText: "For all have sinned, and come short of the glory of God.",
      explanation: "Sin is doing what God forbids or failing to do what God commands. Because God is holy, pure, and just, our sin creates an impassable gulf between mankind and God that no human effort can bridge.",
      keyTruth: "None of us is righteous on our own merits."
    },
    {
      num: '3',
      title: "The Penalty of Sin: Spiritual Death & Judgment",
      subtitle: "The consequence of sin is eternal separation from God.",
      verse: "Romans 6:23a",
      verseText: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.",
      explanation: "Wages are what we earn for our labor. Because of our rebellion against God, our earned wages are spiritual death and judgment. But in His mercy, God offers an unearned free gift.",
      keyTruth: "We cannot save ourselves from this penalty."
    },
    {
      num: '4',
      title: "The Solution: Jesus Christ Died in Your Place",
      subtitle: "Jesus took your punishment on the Cross and conquered death.",
      verse: "Romans 5:8 & 1 Peter 3:18",
      verseText: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us. For Christ also hath once suffered for sins, the just for the unjust, that he might bring us to God.",
      explanation: "Jesus Christ, being fully God and sinless man, took the wrath and penalty for all our sins upon Himself on the Cross of Calvary. On the third day, He rose bodily from the grave, triumphant over sin, death, and Hell!",
      keyTruth: "The debt has been paid in full by Christ's blood."
    },
    {
      num: '5',
      title: "Salvation is a Free Gift of Grace, Not Good Works",
      subtitle: "You cannot earn, buy, or work your way to Heaven.",
      verse: "Ephesians 2:8-9",
      verseText: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
      explanation: "Religion teaches 'Do good things and try to reach God.' The Gospel proclaims 'Done! Christ has finished the work.' Salvation is received solely by faith in Jesus Christ, not by rituals, church attendance, or moral deeds.",
      keyTruth: "Salvation is 100% Grace through Faith."
    },
    {
      num: '6',
      title: "How to Receive Christ: Repentance and Faith",
      subtitle: "Surrender your heart to Jesus as Lord and Savior.",
      verse: "Romans 10:9-10, 13",
      verseText: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved... For whosoever shall call upon the name of the Lord shall be saved.",
      explanation: "Repentance is a sincere change of heart and mind—turning away from sin and self-reliance to trust in Jesus alone. When you believe in Him and confess Him as Lord, God forgives all your sins and grants you eternal life.",
      keyTruth: "Call upon the Name of the Lord and be saved today."
    }
  ];

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-[#0d1338] to-blue-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Good News • Eternal Life</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            The Roman Road & Biblical Plan of Salvation
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Do you know for certain that if you took your last breath today you would be with God in Heaven? 
            Discover God's eternal love, why Jesus died on the cross for you, and how you can receive the free gift of eternal life right now.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={handleShareTract}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Tract Copied to Clipboard!' : 'Share This Gospel Tract'}</span>
            </button>

            {hasPrayed && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Decision Recorded ({decisionDate})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>The 6 Truths of Salvation</span>
        </h3>

        <div className="space-y-3">
          {TRACT_STEPS.map((step, idx) => {
            const isExpanded = tractExpanded.includes(idx);
            return (
              <div
                key={step.num}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0d143d] border-blue-400 shadow-xl shadow-blue-500/10'
                    : 'bg-[#0a0e27]/80 border-white/10 hover:border-blue-500/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleStep(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-300 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate sm:text-wrap">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-semibold text-indigo-300 hidden sm:inline">
                      {step.verse}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 space-y-3.5 border-t border-white/5 pt-3">
                    {/* Scripture Quote Box */}
                    <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{step.verse} (KJV)</span>
                        </span>
                        {onStudyPassage && (
                          <button
                            type="button"
                            onClick={() => onStudyPassage(step.verse)}
                            className="text-[10px] text-blue-400 hover:text-blue-200 underline font-medium"
                          >
                            Study in Bible Guide →
                          </button>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm italic font-serif leading-relaxed text-slate-100">
                        "{step.verseText}"
                      </p>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {step.explanation}
                    </p>

                    {/* Key Truth Badge */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{step.keyTruth}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sinner's Prayer & Commitment Section */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0f1742] to-[#0a0e2c] border-2 border-indigo-500/40 p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Heart className="w-40 h-40 text-rose-500" />
        </div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Pray & Accept Christ</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white">
            Will You Accept Jesus Christ Right Now?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            If you are ready to turn from your sins and place your faith in Jesus Christ as your Savior, 
            you can pray this prayer right now from the depths of your heart:
          </p>
        </div>

        {/* The Prayer Card */}
        <div className="relative rounded-2xl bg-black/50 border border-blue-500/30 p-5 sm:p-6 space-y-3 font-serif text-slate-100 text-xs sm:text-sm sm:leading-relaxed shadow-inner">
          <p className="italic">
            "Dear Heavenly Father, I know that I am a sinner and that I have broken Your laws. 
            I cannot save myself. I believe with all my heart that Your Son Jesus Christ died on the cross 
            to pay for my sins and rose from the grave on the third day.
          </p>
          <p className="italic">
            Right now, I repent of my sins and open the door of my heart to You. 
            I receive Jesus Christ as my personal Lord and Savior. 
            Cleanse me with Your blood, forgive me, and grant me Your free gift of eternal life. 
            Help me to follow You all the days of my life. In the Name of Jesus Christ, Amen."
          </p>
        </div>

        {/* Decision Button */}
        <div className="relative z-10 pt-2 space-y-3">
          {!hasPrayed ? (
            <button
              type="button"
              onClick={handleDecision}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 border border-emerald-400/40 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>I Have Prayed This Prayer & Accept Jesus Today!</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Praise God! You Are a New Creation in Christ!</span>
              </div>
              <p className="text-xs text-slate-300">
                Decision confirmed on <strong>{decisionDate}</strong>. According to 2 Corinthians 5:17: 
                <em> "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new."</em>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Discipleship / Next Steps */}
      <div className="rounded-2xl bg-[#090d24]/90 border border-white/10 p-5 sm:p-6 space-y-4">
        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Next Steps for Your New Christian Walk</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <p className="font-bold text-blue-300 flex items-center gap-1.5">
              <span>1. Read the Bible Daily</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Start with the Gospel of John to learn about Christ's life and love. Use the Scriptures tab in this app.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <p className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span>2. Talk with God in Prayer</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Prayer is simply talking honestly with your Heavenly Father. Share your worries, joys, and requests.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <p className="font-bold text-purple-300 flex items-center gap-1.5">
              <span>3. Fellowship with Believers</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Find a solid, Bible-teaching church community. Connect with brothers and sisters in the faith.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>4. Share Your Faith</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tell your family and friends what Jesus has done for you! Use the 'Share This Tract' button above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
