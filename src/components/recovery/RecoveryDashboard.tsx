import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Heart, BookOpen, Music, Users, ArrowLeft } from 'lucide-react';
import { BiblicalPrinciples } from './BiblicalPrinciples';
import { RecoveryAudioFeed } from './RecoveryAudioFeed';
import { RecoveryJournal } from './RecoveryJournal';
import { MeetingCountdownTimer } from './MeetingCountdownTimer';
import { RecoveryMeetingRoom } from './RecoveryMeetingRoom';
import { RecoveryMeeting } from '../../types/recovery';

export const RecoveryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'principles' | 'audio' | 'journal' | 'meetings'>(() => {
    try {
      const saved = localStorage.getItem('aura_recovery_tab');
      return (saved as any) || 'principles';
    } catch {
      return 'principles';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aura_recovery_tab', activeTab);
    } catch {}
  }, [activeTab]);

  const [meetings, setMeetings] = useState<RecoveryMeeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<RecoveryMeeting | null>(null);

  useEffect(() => {
    // Fetch upcoming and live meetings
    fetch('/api/recovery/meetings')
      .then(res => res.json())
      .then(data => {
        if (data.meetings) {
          setMeetings(data.meetings);
        }
      })
      .catch(console.error);
  }, []);

  const handleJoinMeeting = (meeting: RecoveryMeeting) => {
    setActiveMeeting(meeting);
  };

  const handleLeaveMeeting = () => {
    setActiveMeeting(null);
  };

  const handleMeetingStatusChange = (status: 'scheduled' | 'live' | 'completed') => {
    if (activeMeeting) {
      setMeetings(prev => prev.map(m => m.id === activeMeeting.id ? { ...m, status } : m));
    }
  };

  const toggleMeetingStatus = (meetingId: string, status: 'scheduled' | 'live' | 'completed') => {
    fetch(`/api/recovery/meetings/${meetingId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(() => {
      setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status } : m));
    }).catch(console.error);
  };

  // If inside a live meeting room, render it in full screen mode
  if (activeMeeting) {
    return (
      <RecoveryMeetingRoom
        meeting={activeMeeting}
        onLeave={handleLeaveMeeting}
        onMeetingStatusChange={handleMeetingStatusChange}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Shield className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Path to Freedom
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Christ-centered deliverance and recovery. Journey through biblical principles, fellowship in live rooms, listen to teachings, and track your victorious walk in the Spirit.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveTab('principles')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${
            activeTab === 'principles'
              ? 'bg-blue-600 text-white shadow-blue-500/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Biblical Principles
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${
            activeTab === 'journal'
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          <Heart className="w-4 h-4" />
          Victory Journal
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${
            activeTab === 'audio'
              ? 'bg-indigo-600 text-white shadow-indigo-500/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          <Music className="w-4 h-4" />
          Audio Teachings
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm ${
            activeTab === 'meetings'
              ? 'bg-amber-600 text-white shadow-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Live Meetings
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'principles' && <BiblicalPrinciples />}
        {activeTab === 'journal' && <RecoveryJournal />}
        {activeTab === 'audio' && <RecoveryAudioFeed />}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div className="mb-6 p-6 rounded-3xl bg-blue-950/20 border border-blue-500/30">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Live Fellowship Rooms
              </h2>
              <p className="text-sm text-slate-400">
                Join scheduled and live recovery meetings. Share anonymously, pray together, and find support in a Christ-centered community.
              </p>
            </div>
            
            {meetings.length === 0 ? (
              <div className="text-center p-12 rounded-3xl bg-white/5 border border-white/10">
                <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">No Scheduled Meetings</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Check back later for upcoming fellowship rooms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {meetings.filter(m => m.status !== 'completed').map(meeting => (
                  <MeetingCountdownTimer
                    key={meeting.id}
                    meeting={meeting}
                    onJoinMeeting={handleJoinMeeting}
                    onToggleStatus={toggleMeetingStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
