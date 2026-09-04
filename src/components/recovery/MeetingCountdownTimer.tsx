import React, { useState, useEffect } from 'react';
import { Clock, Radio, Users, Calendar, ArrowRight, Play, Sparkles } from 'lucide-react';
import { RecoveryMeeting } from '../../types/recovery';

interface MeetingCountdownTimerProps {
  meeting: RecoveryMeeting;
  onJoinMeeting: (meeting: RecoveryMeeting) => void;
  onToggleStatus?: (meetingId: string, newStatus: 'scheduled' | 'live' | 'completed') => void;
  isHost?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(scheduledAt: string): TimeRemaining {
  const target = new Date(scheduledAt).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isPast: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds, isPast: false };
}

export const MeetingCountdownTimer: React.FC<MeetingCountdownTimerProps> = ({
  meeting,
  onJoinMeeting,
  onToggleStatus,
  isHost = false
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateTimeRemaining(meeting.scheduledAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(meeting.scheduledAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [meeting.scheduledAt]);

  const isLive = meeting.status === 'live' || timeLeft.isPast;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition-all duration-500 shadow-2xl ${
        isLive
          ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-blue-950/70 border-emerald-500/40 shadow-emerald-900/20'
          : 'bg-gradient-to-br from-blue-950/50 via-slate-900/80 to-indigo-950/50 border-white/10'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      {isLive && (
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      <div className="relative p-5 sm:p-7">
        {/* Top Badges Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Live Room Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Scheduled Gathering
              </span>
            )}

            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium capitalize">
              {meeting.format.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{meeting.attendeeCount} participants</span>
          </div>
        </div>

        {/* Meeting Title & Scripture Topic */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mb-2">
            {meeting.title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mb-3">
            {meeting.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300 font-medium">
            <span className="text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <strong className="text-white">Topic:</strong> {meeting.topic}
            </span>
            <span className="text-blue-300 flex items-center gap-1.5">
              <span>📖</span>
              <strong className="text-white">Focus:</strong> {meeting.scriptureFocus}
            </span>
            {meeting.recurringInfo && (
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {meeting.recurringInfo}
              </span>
            )}
          </div>
        </div>

        {/* Main Countdown or Live Action Banner */}
        {!isLive ? (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Time Until Gathering
              </span>
              <span className="text-xs text-blue-300 font-medium">
                {new Date(meeting.scheduledAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Glowing Digit Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg">
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-wider">
                  {pad(timeLeft.days)}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold mt-1">Days</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-wider">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold mt-1">Hours</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-wider">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold mt-1">Mins</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-black/40 border border-blue-500/30 backdrop-blur-md shadow-inner">
                <span className="text-2xl sm:text-4xl font-black text-blue-400 font-mono tracking-wider animate-pulse">
                  {pad(timeLeft.seconds)}
                </span>
                <span className="text-[10px] sm:text-xs text-blue-300 uppercase font-semibold mt-1">Secs</span>
              </div>
            </div>

            {/* Waiting Room & Host Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onJoinMeeting(meeting)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                <span>Enter Waiting Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Host Quick Start Toggle (allows user or admin to go live immediately for testing or early start) */}
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(meeting.id, 'live')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 transition-all"
                  title="Start meeting right now"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Start Live Now</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Live Transitioned State: Big Prominent Glowing Join Button */
          <div className="p-4 sm:p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-sm font-bold text-emerald-200">
                  Meeting is in session right now! Fellowship, prayer, and step study are active.
                </span>
              </div>
              <span className="text-xs text-emerald-300/80 font-medium">
                Host: {meeting.hostName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                id="btn-join-live-recovery-meeting"
                onClick={() => onJoinMeeting(meeting)}
                className="flex-1 sm:flex-none px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Join Live Meeting Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(meeting.id, 'scheduled')}
                  className="px-4 py-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 text-xs font-semibold transition-all"
                >
                  End / Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
