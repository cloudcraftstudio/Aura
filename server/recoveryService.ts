import fs from 'fs';
import path from 'path';
import {
  RecoveryMeeting,
  MeetingParticipant,
  MeetingChatMessage,
  WebRTCSignalPayload,
  UserPrincipleProgress,
  RecoveryJournalEntry,
  RecoveryAccountabilityCircle
} from '../src/types/recovery';

const RECOVERY_DATA_FILE = path.join(process.cwd(), 'data', 'recovery_data.json');

interface RecoveryState {
  meetings: RecoveryMeeting[];
  meetingChats: Record<string, MeetingChatMessage[]>;
  userPrinciples: Record<string, Record<number, UserPrincipleProgress>>;
  userJournals: Record<string, { streakStartDate: string; streakDays: number; entries: RecoveryJournalEntry[] }>;
  circles: RecoveryAccountabilityCircle[];
}

// In-memory active live meeting state (signaling and online participants)
const liveParticipants: Map<string, Map<string, MeetingParticipant>> = new Map();
const liveSignals: Map<string, WebRTCSignalPayload[]> = new Map();

function getInitialMeetings(): RecoveryMeeting[] {
  // Compute upcoming scheduled time: 2 hours from now for a crisp countdown, or tonight
  const now = new Date();
  const nextMeetingDate = new Date(now.getTime() + 1000 * 60 * 60 * 2.5); // 2.5 hours from now
  const liveMeetingDate = new Date(now.getTime() - 1000 * 60 * 15); // started 15 min ago

  return [
    {
      id: 'meeting_live_freedom',
      title: 'Path to Freedom — Open Recovery Gathering',
      description: 'A welcoming Christ-centered open fellowship for all overcoming addiction, habitual strongholds, and compulsive struggles. Real testimonies, Scripture truth, and small group fellowship.',
      scheduledAt: nextMeetingDate.toISOString(),
      durationMinutes: 60,
      recurringInfo: 'Every Thursday & Sunday at 7:00 PM EST',
      hostId: 'user_tex',
      hostName: 'Tex',
      hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lightsouttattootex@gmail.com',
      topic: 'Step 4: Truth, Humility & Moral Inventory in Christ',
      scriptureFocus: 'James 5:16 & Romans 12:2',
      format: 'open_discussion',
      status: 'scheduled',
      attendeeCount: 14,
      isFeatured: true,
      tags: ['Open Discussion', 'Step 4', 'Fellowship', 'Prayer'],
      meetingRoomId: 'room_freedom_main',
      guidelines: [
        'Anonymity & Confidentiality: What is said in the room stays in the room.',
        'Christ-Centered: We look to Jesus as our supreme Higher Power & Healer.',
        'No Crosstalk or Judgment: Give each brother and sister uninterrupted time to share.',
        'Camera is optional: Audio-only and anonymous display name are fully supported.'
      ]
    },
    {
      id: 'meeting_daily_dawn',
      title: 'Daily Sunrise Victory Check-In',
      description: 'Morning prayer, Scripture armor of God, and daily sobriety pledges before starting the workday.',
      scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 18).toISOString(),
      durationMinutes: 30,
      recurringInfo: 'Monday - Saturday at 7:00 AM EST',
      hostId: 'user_kimberly',
      hostName: 'Kimberly Coffman',
      hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=savdbygrace360@gmail.com',
      topic: 'Putting on the Full Armor of God (Ephesians 6)',
      scriptureFocus: 'Ephesians 6:10-18',
      format: 'speaker_testimony',
      status: 'scheduled',
      attendeeCount: 22,
      isFeatured: false,
      tags: ['Morning Armor', 'Prayer', 'Sobriety Pledge'],
      meetingRoomId: 'room_daily_dawn',
      guidelines: [
        'Short 2-minute shares to allow everyone time.',
        'Focus on today’s surrender to Christ.'
      ]
    },
    {
      id: 'meeting_mens_iron',
      title: 'Men of Valor: Purity & Integrity Circle',
      description: 'Strictly confidential men’s discipleship for breaking free from pornography, sexual brokenness, and digital triggers.',
      scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 42).toISOString(),
      durationMinutes: 60,
      recurringInfo: 'Tuesday Evenings at 8:30 PM EST',
      hostId: 'user_skylor',
      hostName: 'Skylor Bright',
      hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=skylor@aura.social',
      topic: 'Covenant Eyes, Heart Purity, and Overcoming the Flesh',
      scriptureFocus: 'Job 31:1 & Psalm 119:9',
      format: 'step_study',
      status: 'scheduled',
      attendeeCount: 18,
      isFeatured: false,
      tags: ['Men Only', 'Purity', 'Accountability'],
      meetingRoomId: 'room_mens_iron',
      guidelines: [
        'Radical honesty without graphic details.',
        'Focus on Gospel grace and practical boundaries.'
      ]
    }
  ];
}

function getInitialCircles(): RecoveryAccountabilityCircle[] {
  return [
    {
      id: 'circle_overcomers',
      name: 'Substance Freedom & Overcomers',
      focus: 'Alcohol, Opioids, Chemical Dependency',
      description: 'Brothers and sisters walking in daily sobriety through the blood of the Lamb and mutual accountability.',
      membersCount: 48,
      bannerUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&auto=format&fit=crop&q=80',
      isJoined: true,
      recentCheckins: [
        {
          id: 'chk_1',
          userId: 'user_marcus',
          userName: 'Marcus S.',
          userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
          streakDays: 184,
          message: 'Day 184 clean today! Felt a wave of old anxiety at work, but stepped out, prayed Psalm 23, and called my partner. Jesus gave immediate peace!',
          timestamp: Date.now() - 1000 * 60 * 45,
          encouragementCount: 14,
          encouragedByUserIds: ['user_tex', 'user_kimberly']
        },
        {
          id: 'chk_2',
          userId: 'user_david',
          userName: 'David W.',
          userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DavidW',
          streakDays: 45,
          message: 'Hit 45 days today by the grace of God. Grateful for this fellowship and the meeting yesterday.',
          timestamp: Date.now() - 1000 * 60 * 120,
          encouragementCount: 9,
          encouragedByUserIds: ['user_tex']
        }
      ]
    },
    {
      id: 'circle_purity',
      name: 'Purity, Heart & Thought Life',
      focus: 'Pornography, Lust, Digital Distraction',
      description: 'Taking every thought captive to the obedience of Christ and breaking digital strongholds together.',
      membersCount: 62,
      bannerUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80',
      isJoined: true,
      recentCheckins: [
        {
          id: 'chk_3',
          userId: 'user_john',
          userName: 'John K.',
          userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JohnK',
          streakDays: 30,
          message: 'Reached my 30-day milestone! Deleted social media off my phone and the mental fog has lifted.',
          timestamp: Date.now() - 1000 * 60 * 90,
          encouragementCount: 19,
          encouragedByUserIds: ['user_tex', 'user_skylor']
        }
      ]
    },
    {
      id: 'circle_anxiety_habits',
      name: 'Grace Over Anxiety & Compulsive Habits',
      focus: 'Stress Eating, Anxiety Compulsions, Worry',
      description: 'Replacing anxious rituals with prayer, fasting, and biblical peace that surpasses understanding.',
      membersCount: 39,
      bannerUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
      isJoined: false,
      recentCheckins: [
        {
          id: 'chk_4',
          userId: 'user_rachel',
          userName: 'Rachel M.',
          userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RachelM',
          streakDays: 14,
          message: '2 weeks of taking my worries to the prayer closet instead of compulsive eating late at night. Praise Jesus!',
          timestamp: Date.now() - 1000 * 60 * 180,
          encouragementCount: 8,
          encouragedByUserIds: []
        }
      ]
    }
  ];
}

export class RecoveryService {
  private state: RecoveryState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): RecoveryState {
    try {
      if (fs.existsSync(RECOVERY_DATA_FILE)) {
        const raw = fs.readFileSync(RECOVERY_DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.meetings && parsed.meetings.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[RecoveryService] Failed to parse recovery_data.json, using defaults:', e);
    }

    const defaultState: RecoveryState = {
      meetings: getInitialMeetings(),
      meetingChats: {
        meeting_live_freedom: [
          {
            id: 'msg_welcome_1',
            meetingId: 'meeting_live_freedom',
            senderId: 'system',
            senderName: 'Path to Freedom Host',
            senderAvatar: '/icons/icon-192.svg',
            type: 'system',
            content: 'Welcome to the Path to Freedom Recovery Gathering. We are anchored in Jesus Christ. Please keep microphone muted while another shares.',
            timestamp: Date.now() - 1000 * 60 * 10,
            prayingCount: 0,
            prayedByUserIds: []
          },
          {
            id: 'msg_prayer_1',
            meetingId: 'meeting_live_freedom',
            senderId: 'user_marcus',
            senderName: 'Marcus S.',
            senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
            type: 'prayer_request',
            content: 'Please pray for my brother who is facing withdrawal right now. Praying for peace and Christ’s supernatural comfort in his body.',
            timestamp: Date.now() - 1000 * 60 * 7,
            prayingCount: 6,
            prayedByUserIds: ['user_tex', 'user_kimberly']
          },
          {
            id: 'msg_scripture_1',
            meetingId: 'meeting_live_freedom',
            senderId: 'user_kimberly',
            senderName: 'Kimberly Coffman',
            senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=savdbygrace360@gmail.com',
            type: 'scripture',
            content: '“Confess your faults one to another, and pray one for another, that ye may be healed.” — James 5:16',
            timestamp: Date.now() - 1000 * 60 * 4,
            prayingCount: 8,
            prayedByUserIds: ['user_tex']
          }
        ]
      },
      userPrinciples: {},
      userJournals: {},
      circles: getInitialCircles()
    };

    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(stateToSave?: RecoveryState) {
    try {
      const dir = path.dirname(RECOVERY_DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(RECOVERY_DATA_FILE, JSON.stringify(stateToSave || this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[RecoveryService] Failed to save recovery_data.json:', e);
    }
  }

  // --- MEETINGS ---
  getMeetings(): RecoveryMeeting[] {
    return this.state.meetings;
  }

  getMeetingById(id: string): RecoveryMeeting | undefined {
    return this.state.meetings.find(m => m.id === id);
  }

  createMeeting(data: Partial<RecoveryMeeting>): RecoveryMeeting {
    const id = 'meeting_' + Date.now();
    const newMeeting: RecoveryMeeting = {
      id,
      title: data.title || 'Path to Freedom Fellowship',
      description: data.description || 'Christ-centered recovery meeting.',
      scheduledAt: data.scheduledAt || new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      durationMinutes: data.durationMinutes || 60,
      recurringInfo: data.recurringInfo || 'Weekly',
      hostId: data.hostId || 'user_tex',
      hostName: data.hostName || 'Tex',
      hostAvatar: data.hostAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=lightsouttattootex@gmail.com',
      topic: data.topic || 'Biblical Surrender and Recovery',
      scriptureFocus: data.scriptureFocus || 'Romans 8:1-2',
      format: data.format || 'open_discussion',
      status: data.status || 'scheduled',
      attendeeCount: 1,
      isFeatured: data.isFeatured || false,
      tags: data.tags || ['Fellowship', 'Prayer'],
      meetingRoomId: 'room_' + id,
      guidelines: [
        'Confidentiality & Anonymity respected.',
        'Keep shares focused on Christ and personal experience.',
        'Respectful listening without interruptions.'
      ]
    };

    this.state.meetings.unshift(newMeeting);
    this.saveState();
    return newMeeting;
  }

  updateMeetingStatus(id: string, status: 'scheduled' | 'live' | 'completed'): RecoveryMeeting | null {
    const meeting = this.state.meetings.find(m => m.id === id);
    if (!meeting) return null;
    meeting.status = status;
    this.saveState();
    return meeting;
  }

  // --- PARTICIPANTS & SIGNALING ---
  joinMeeting(meetingId: string, participant: MeetingParticipant): MeetingParticipant[] {
    if (!liveParticipants.has(meetingId)) {
      liveParticipants.set(meetingId, new Map());
    }
    const roomMap = liveParticipants.get(meetingId)!;
    roomMap.set(participant.userId, participant);

    // Update attendee count on meeting object
    const meeting = this.getMeetingById(meetingId);
    if (meeting) {
      meeting.attendeeCount = Math.max(roomMap.size, 1);
    }

    return Array.from(roomMap.values());
  }

  leaveMeeting(meetingId: string, userId: string): MeetingParticipant[] {
    const roomMap = liveParticipants.get(meetingId);
    if (roomMap) {
      roomMap.delete(userId);
    }
    const meeting = this.getMeetingById(meetingId);
    if (meeting && roomMap) {
      meeting.attendeeCount = roomMap.size;
    }
    return roomMap ? Array.from(roomMap.values()) : [];
  }

  getParticipants(meetingId: string): MeetingParticipant[] {
    const roomMap = liveParticipants.get(meetingId);
    return roomMap ? Array.from(roomMap.values()) : [];
  }

  updateParticipantState(meetingId: string, userId: string, updates: Partial<MeetingParticipant>): MeetingParticipant | null {
    const roomMap = liveParticipants.get(meetingId);
    if (!roomMap || !roomMap.has(userId)) return null;
    const current = roomMap.get(userId)!;
    const updated = { ...current, ...updates };
    roomMap.set(userId, updated);
    return updated;
  }

  // --- WEBRTC SIGNALING ---
  addSignal(meetingId: string, signal: WebRTCSignalPayload) {
    if (!liveSignals.has(meetingId)) {
      liveSignals.set(meetingId, []);
    }
    const list = liveSignals.get(meetingId)!;
    list.push(signal);
    // Keep max 200 signals per room
    if (list.length > 200) {
      list.splice(0, list.length - 200);
    }
  }

  getSignals(meetingId: string, forUserId: string, sinceTimestamp: number = 0): WebRTCSignalPayload[] {
    const list = liveSignals.get(meetingId) || [];
    return list.filter(s => {
      if (s.timestamp <= sinceTimestamp) return false;
      if (s.fromUserId === forUserId) return false;
      if (!s.toUserId || s.toUserId === forUserId) return true;
      return false;
    });
  }

  // --- MEETING CHAT ---
  getMeetingChat(meetingId: string): MeetingChatMessage[] {
    return this.state.meetingChats[meetingId] || [];
  }

  addMeetingChatMessage(meetingId: string, msg: Omit<MeetingChatMessage, 'id' | 'timestamp' | 'prayingCount' | 'prayedByUserIds'>): MeetingChatMessage {
    if (!this.state.meetingChats[meetingId]) {
      this.state.meetingChats[meetingId] = [];
    }
    const newMsg: MeetingChatMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      prayingCount: 0,
      prayedByUserIds: []
    };
    this.state.meetingChats[meetingId].push(newMsg);
    this.saveState();
    return newMsg;
  }

  togglePrayerPledge(meetingId: string, messageId: string, userId: string): MeetingChatMessage | null {
    const msgs = this.state.meetingChats[meetingId];
    if (!msgs) return null;
    const msg = msgs.find(m => m.id === messageId);
    if (!msg) return null;

    if (!msg.prayedByUserIds) msg.prayedByUserIds = [];
    const index = msg.prayedByUserIds.indexOf(userId);
    if (index === -1) {
      msg.prayedByUserIds.push(userId);
      msg.prayingCount = msg.prayedByUserIds.length;
    } else {
      msg.prayedByUserIds.splice(index, 1);
      msg.prayingCount = msg.prayedByUserIds.length;
    }
    this.saveState();
    return msg;
  }

  // --- HOST ACTIONS ---
  performHostAction(meetingId: string, action: {
    type: 'mute_all' | 'mute_user' | 'kick_user' | 'set_status' | 'broadcast_notice';
    targetUserId?: string;
    status?: 'scheduled' | 'live' | 'completed';
    noticeText?: string;
  }) {
    if (action.type === 'set_status' && action.status) {
      this.updateMeetingStatus(meetingId, action.status);
    }

    if (action.type === 'mute_all') {
      const roomMap = liveParticipants.get(meetingId);
      if (roomMap) {
        roomMap.forEach((p, uid) => {
          if (p.role !== 'host') {
            p.isMuted = true;
            roomMap.set(uid, p);
          }
        });
      }
      // Broadcast signal
      this.addSignal(meetingId, {
        fromUserId: 'host',
        type: 'host_command',
        payload: { command: 'mute_all' },
        timestamp: Date.now()
      });
    }

    if (action.type === 'mute_user' && action.targetUserId) {
      this.updateParticipantState(meetingId, action.targetUserId, { isMuted: true });
      this.addSignal(meetingId, {
        fromUserId: 'host',
        toUserId: action.targetUserId,
        type: 'host_command',
        payload: { command: 'mute' },
        timestamp: Date.now()
      });
    }

    if (action.type === 'kick_user' && action.targetUserId) {
      this.leaveMeeting(meetingId, action.targetUserId);
      this.addSignal(meetingId, {
        fromUserId: 'host',
        toUserId: action.targetUserId,
        type: 'host_command',
        payload: { command: 'kick' },
        timestamp: Date.now()
      });
    }

    if (action.type === 'broadcast_notice' && action.noticeText) {
      this.addMeetingChatMessage(meetingId, {
        meetingId,
        senderId: 'host_broadcast',
        senderName: 'Host Announcement',
        senderAvatar: '/icons/icon-192.svg',
        type: 'system',
        content: action.noticeText
      });
    }

    return { success: true };
  }

  // --- USER PRINCIPLES PROGRESS ---
  getUserPrinciples(userId: string): Record<number, UserPrincipleProgress> {
    return this.state.userPrinciples[userId] || {};
  }

  saveUserPrinciple(userId: string, progress: UserPrincipleProgress) {
    if (!this.state.userPrinciples[userId]) {
      this.state.userPrinciples[userId] = {};
    }
    this.state.userPrinciples[userId][progress.step] = progress;
    this.saveState();
    return this.state.userPrinciples[userId];
  }

  // --- RECOVERY JOURNAL & STREAK ---
  getUserJournal(userId: string) {
    if (!this.state.userJournals[userId]) {
      this.state.userJournals[userId] = {
        streakStartDate: new Date().toISOString(),
        streakDays: 1,
        entries: [
          {
            id: 'entry_seed_1',
            date: new Date().toISOString().split('T')[0],
            streakDay: 1,
            mood: 'grateful',
            gratitudeNotes: 'Grateful for Jesus delivering me from isolation, and for the Path to Freedom fellowship.',
            prayerNotes: 'Lord Jesus, keep my eyes fixed on You today. Give me strength to flee youthful lusts and walk in the Spirit.',
            memoryVerseRef: 'Romans 8:1',
            memoryVerseText: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.',
            reflection: 'Starting this journey with complete surrender. I cannot do it on my own, but Christ in me is the hope of glory.',
            cravingsManaged: true,
            createdAt: Date.now() - 1000 * 60 * 60 * 12
          }
        ]
      };
      this.saveState();
    }
    return this.state.userJournals[userId];
  }

  addJournalEntry(userId: string, entry: Omit<RecoveryJournalEntry, 'id' | 'createdAt'>): RecoveryJournalEntry {
    const journal = this.getUserJournal(userId);
    const newEntry: RecoveryJournalEntry = {
      ...entry,
      id: 'jrn_' + Date.now(),
      createdAt: Date.now()
    };
    journal.entries.unshift(newEntry);
    this.saveState();
    return newEntry;
  }

  updateJournalStreak(userId: string, streakDays: number, startDate?: string) {
    const journal = this.getUserJournal(userId);
    journal.streakDays = streakDays;
    if (startDate) journal.streakStartDate = startDate;
    this.saveState();
    return journal;
  }

  // --- ACCOUNTABILITY CIRCLES & SOS ---
  getCircles(): RecoveryAccountabilityCircle[] {
    return this.state.circles;
  }

  addCircleCheckin(circleId: string, checkin: {
    userId: string;
    userName: string;
    userAvatar: string;
    streakDays: number;
    message: string;
    prayerNeed?: string;
  }) {
    const circle = this.state.circles.find(c => c.id === circleId);
    if (!circle) return null;

    const newCheckin = {
      ...checkin,
      id: 'chk_' + Date.now(),
      timestamp: Date.now(),
      encouragementCount: 0,
      encouragedByUserIds: []
    };

    circle.recentCheckins.unshift(newCheckin);
    this.saveState();
    return newCheckin;
  }

  toggleCheckinEncouragement(circleId: string, checkinId: string, userId: string) {
    const circle = this.state.circles.find(c => c.id === circleId);
    if (!circle) return null;
    const chk = circle.recentCheckins.find(c => c.id === checkinId);
    if (!chk) return null;

    if (!chk.encouragedByUserIds) chk.encouragedByUserIds = [];
    const idx = chk.encouragedByUserIds.indexOf(userId);
    if (idx === -1) {
      chk.encouragedByUserIds.push(userId);
      chk.encouragementCount = chk.encouragedByUserIds.length;
    } else {
      chk.encouragedByUserIds.splice(idx, 1);
      chk.encouragementCount = chk.encouragedByUserIds.length;
    }
    this.saveState();
    return chk;
  }
}

export const recoveryService = new RecoveryService();
