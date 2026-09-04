import { Router } from 'express';
import { recoveryService } from '../server/recoveryService';
import { CORE_BIBLICAL_RECOVERY_PRINCIPLES } from '../src/data/recoveryPrinciples';
import { RECOVERY_TEACHINGS_DATA } from '../src/data/recoveryTeachings';

export function createRecoveryRoutes(): Router {
  const router = Router();

  // --- MEETINGS & SCHEDULE ---
  router.get('/meetings', (_req, res) => {
    try {
      const meetings = recoveryService.getMeetings();
      res.json({ meetings });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get meetings' });
    }
  });

  router.post('/meetings', (req, res) => {
    try {
      const meeting = recoveryService.createMeeting(req.body);
      res.status(201).json({ meeting });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create meeting' });
    }
  });

  router.get('/meetings/:id', (req, res) => {
    try {
      const meeting = recoveryService.getMeetingById(req.params.id);
      if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
      const participants = recoveryService.getParticipants(req.params.id);
      res.json({ meeting, participants });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get meeting' });
    }
  });

  router.post('/meetings/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['scheduled', 'live', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Valid status required' });
      }
      const updated = recoveryService.updateMeetingStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: 'Meeting not found' });
      res.json({ meeting: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update meeting status' });
    }
  });

  // --- PARTICIPANTS & SIGNALING ---
  router.post('/meetings/:id/join', (req, res) => {
    try {
      const { participant } = req.body;
      if (!participant || !participant.userId) {
        return res.status(400).json({ error: 'Participant data required' });
      }
      const participants = recoveryService.joinMeeting(req.params.id, participant);
      res.json({ success: true, participants });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to join meeting' });
    }
  });

  router.post('/meetings/:id/leave', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const participants = recoveryService.leaveMeeting(req.params.id, userId);
      res.json({ success: true, participants });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to leave meeting' });
    }
  });

  router.get('/meetings/:id/participants', (req, res) => {
    try {
      const participants = recoveryService.getParticipants(req.params.id);
      res.json({ participants });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get participants' });
    }
  });

  router.post('/meetings/:id/participant-state', (req, res) => {
    try {
      const { userId, updates } = req.body;
      if (!userId || !updates) return res.status(400).json({ error: 'userId and updates required' });
      const updated = recoveryService.updateParticipantState(req.params.id, userId, updates);
      res.json({ success: true, participant: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update participant state' });
    }
  });

  // Multi-peer WebRTC signaling
  router.post('/meetings/:id/signal', (req, res) => {
    try {
      const { signal } = req.body;
      if (!signal || !signal.fromUserId || !signal.type) {
        return res.status(400).json({ error: 'Valid signal payload required' });
      }
      recoveryService.addSignal(req.params.id, signal);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add signal' });
    }
  });

  router.get('/meetings/:id/signals', (req, res) => {
    try {
      const forUserId = req.query.forUserId as string;
      const since = parseInt(req.query.since as string || '0', 10);
      if (!forUserId) return res.status(400).json({ error: 'forUserId required' });
      const signals = recoveryService.getSignals(req.params.id, forUserId, since);
      res.json({ signals });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get signals' });
    }
  });

  // --- SYNCHRONIZED MEETING CHAT ---
  router.get('/meetings/:id/chat', (req, res) => {
    try {
      const chat = recoveryService.getMeetingChat(req.params.id);
      res.json({ messages: chat });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get chat' });
    }
  });

  router.post('/meetings/:id/chat', (req, res) => {
    try {
      const { senderId, senderName, senderAvatar, type, content } = req.body;
      if (!senderId || !content) {
        return res.status(400).json({ error: 'senderId and content are required' });
      }
      const message = recoveryService.addMeetingChatMessage(req.params.id, {
        meetingId: req.params.id,
        senderId,
        senderName: senderName || 'Fellow Believer',
        senderAvatar: senderAvatar || '/icons/icon-192.svg',
        type: type || 'chat',
        content
      });
      res.status(201).json({ message });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to send message' });
    }
  });

  router.post('/meetings/:id/chat/:messageId/pray', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      const updated = recoveryService.togglePrayerPledge(req.params.id, req.params.messageId, userId);
      if (!updated) return res.status(404).json({ error: 'Message not found' });
      res.json({ message: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update prayer pledge' });
    }
  });

  // --- HOST CONTROLS ---
  router.post('/meetings/:id/host-action', (req, res) => {
    try {
      const result = recoveryService.performHostAction(req.params.id, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to execute host action' });
    }
  });

  // --- TEACHINGS & PRINCIPLES ---
  router.get('/teachings', (_req, res) => {
    res.json({ teachings: RECOVERY_TEACHINGS_DATA });
  });

  router.get('/principles', (_req, res) => {
    res.json({ principles: CORE_BIBLICAL_RECOVERY_PRINCIPLES });
  });

  router.get('/user-principles/:userId', (req, res) => {
    try {
      const progress = recoveryService.getUserPrinciples(req.params.userId);
      res.json({ progress });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get principles progress' });
    }
  });

  router.post('/user-principles/:userId', (req, res) => {
    try {
      const updated = recoveryService.saveUserPrinciple(req.params.userId, req.body);
      res.json({ progress: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save principle progress' });
    }
  });

  // --- JOURNAL & STREAK ---
  router.get('/journal/:userId', (req, res) => {
    try {
      const journal = recoveryService.getUserJournal(req.params.userId);
      res.json(journal);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get journal' });
    }
  });

  router.post('/journal/:userId/entry', (req, res) => {
    try {
      const entry = recoveryService.addJournalEntry(req.params.userId, req.body);
      res.status(201).json({ entry });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add journal entry' });
    }
  });

  router.post('/journal/:userId/streak', (req, res) => {
    try {
      const { streakDays, startDate } = req.body;
      const updated = recoveryService.updateJournalStreak(req.params.userId, Number(streakDays) || 1, startDate);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update streak' });
    }
  });

  // --- ACCOUNTABILITY CIRCLES & SOS ---
  router.get('/circles', (_req, res) => {
    try {
      const circles = recoveryService.getCircles();
      res.json({ circles });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get circles' });
    }
  });

  router.post('/circles/:id/checkin', (req, res) => {
    try {
      const checkin = recoveryService.addCircleCheckin(req.params.id, req.body);
      if (!checkin) return res.status(404).json({ error: 'Circle not found' });
      res.status(201).json({ checkin });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add checkin' });
    }
  });

  router.post('/circles/:id/checkin/:checkinId/encourage', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      const updated = recoveryService.toggleCheckinEncouragement(req.params.id, req.params.checkinId, userId);
      if (!updated) return res.status(404).json({ error: 'Checkin not found' });
      res.json({ checkin: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle encouragement' });
    }
  });

  router.post('/sos', (req, res) => {
    try {
      const { userId, userName, circleId, message } = req.body;
      // Post emergency prayer checkin to the circle
      const targetCircleId = circleId || 'circle_overcomers';
      const sosCheckin = recoveryService.addCircleCheckin(targetCircleId, {
        userId: userId || 'anonymous',
        userName: userName || 'Brother / Sister in Christ',
        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (userName || 'SOS'),
        streakDays: 1,
        message: `🚨 URGENT SOS PRAYER: ${message || 'I am facing an intense temptation and urge right now. Please pray for me immediately and text/call if possible!'}`,
        prayerNeed: 'Spiritual warfare & immediate deliverance'
      });

      res.status(201).json({
        success: true,
        message: 'Urgent SOS prayer request dispatched to your accountability circle!',
        checkin: sosCheckin
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to dispatch SOS' });
    }
  });

  return router;
}
