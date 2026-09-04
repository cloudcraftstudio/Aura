export type RecoveryMeetingFormat = 'open_discussion' | 'step_study' | 'speaker_testimony';
export type RecoveryMeetingStatus = 'scheduled' | 'live' | 'completed';

export interface RecoveryMeeting {
  id: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  recurringInfo?: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  topic: string;
  scriptureFocus: string;
  format: RecoveryMeetingFormat;
  status: RecoveryMeetingStatus;
  attendeeCount: number;
  passcode?: string;
  isFeatured?: boolean;
  tags: string[];
  meetingRoomId: string;
  guidelines?: string[];
}

export interface MeetingParticipant {
  userId: string;
  userName: string;
  avatarUrl: string;
  isAudioOnly: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  role: 'host' | 'co-host' | 'member';
  joinedAt: number;
  isAnonymous?: boolean;
}

export type MeetingChatMessageType = 'chat' | 'prayer_request' | 'scripture' | 'amen' | 'system';

export interface MeetingChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MeetingChatMessageType;
  content: string;
  timestamp: number;
  prayingCount: number;
  prayedByUserIds: string[];
}

export interface WebRTCSignalPayload {
  fromUserId: string;
  toUserId?: string; // empty means broadcast
  type: 'offer' | 'answer' | 'candidate' | 'participant_update' | 'host_command';
  payload: any;
  timestamp: number;
}

export interface RecoveryTeaching {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  category: 'substance' | 'anxiety' | 'purity' | 'deliverance' | 'grace' | 'general';
  audioUrl: string;
  thumbnailUrl: string;
  scriptureRef: string;
  description: string;
  likesCount: number;
  tags: string[];
  keyQuote?: string;
}

export interface RecoveryPrinciple {
  step: number; // 1 to 10
  title: string;
  subtitle: string;
  biblicalTheme: string;
  scripture: {
    reference: string;
    text: string;
  };
  summary: string;
  biblicalTruth: string;
  reflectionQuestions: string[];
  actionSteps: string[];
  prayer: string;
  affirmation: string;
}

export interface UserPrincipleProgress {
  step: number;
  isCompleted: boolean;
  completedAt?: string;
  userNotes: string;
  actionCommitted: boolean;
}

export interface RecoveryJournalEntry {
  id: string;
  date: string;
  streakDay: number;
  mood: 'triumphant' | 'peaceful' | 'struggling' | 'tempted' | 'grateful';
  gratitudeNotes: string;
  prayerNotes: string;
  memoryVerseRef: string;
  memoryVerseText: string;
  reflection: string;
  cravingsManaged: boolean;
  createdAt: number;
}

export interface RecoveryCircleCheckin {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  streakDays: number;
  message: string;
  prayerNeed?: string;
  timestamp: number;
  encouragementCount: number;
  encouragedByUserIds: string[];
}

export interface RecoveryAccountabilityCircle {
  id: string;
  name: string;
  focus: string;
  description: string;
  membersCount: number;
  bannerUrl: string;
  isJoined?: boolean;
  recentCheckins: RecoveryCircleCheckin[];
}
