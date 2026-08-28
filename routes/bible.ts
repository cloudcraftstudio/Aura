/**
 * Bible Study Routes
 */

import { Router, Request, Response } from 'express';
import { BibleStudyDB } from '../data/bible/models';
import { KingJamesService } from '../services/kingJamesService';
import KJVLoader from '../data/bible/kjv_loader';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const kjvLoader = new KJVLoader();
kjvLoader.load();

// Multer storage for sermon uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sermons');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `sermon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// Initialize with database instance (passed from main server)
export function createBibleRoutes(db: BibleStudyDB): Router {
  const kingJamesService = new KingJamesService(db);

  // POST /api/bible/onboard
  router.post('/onboard', (req: Request, res: Response) => {
    const { userGoals, userInterests } = req.body;
    try {
      const onboardingResponse = kingJamesService.onboard(userGoals, userInterests);
      res.json(onboardingResponse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate onboarding response' });
    }
  });

  // POST /api/bible/share
  router.post('/share', (req: Request, res: Response) => {
    const { verseRef, passageText, takeaway } = req.body;
    if (!verseRef || !passageText || !takeaway) {
      return res.status(400).json({ error: 'Missing verseRef, passageText, or takeaway' });
    }
    try {
      const sharePayload = kingJamesService.formatSharePayload(verseRef, passageText, takeaway);
      res.json(sharePayload);
    } catch (error) {
      res.status(500).json({ error: 'Failed to format share payload' });
    }
  });

  // GET /api/bible/verse
  router.get('/verse', (req: Request, res: Response) => {
    const { book, chapter, verse } = req.query;
    if (!book || !chapter || !verse) {
      return res.status(400).json({ error: 'Missing book, chapter, or verse parameter' });
    }

    const verseRef = `${book} ${chapter}:${verse}`;
    const verseData = kjvLoader.getVerse(verseRef);
    if (!verseData) {
      return res.status(404).json({ error: 'Verse not found' });
    }
    res.json(verseData);
  });

  // GET /api/bible/study
  router.get('/study', async (req: Request, res: Response) => {
    const { book, chapter, verse } = req.query;
    if (!book || !chapter || !verse) {
      return res.status(400).json({ error: 'Missing book, chapter, or verse parameter' });
    }

    try {
      const breakdown = await kingJamesService.generateStudyBreakdown(
        book as string,
        chapter as string,
        verse as string
      );
      if (!breakdown) {
        return res.status(404).json({ error: 'Study breakdown could not be generated' });
      }
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate study breakdown' });
    }
  });

  // LMS Courses
  router.get('/courses', (_req: Request, res: Response) => {
    try {
      res.json(db.getAllCourses());
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  router.post('/courses', (req: Request, res: Response) => {
    const { title, description, coverImage, category, level } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
      const course = db.createCourse(title, description, coverImage, category, level);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create course' });
    }
  });

  router.delete('/courses/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteCourse(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Course not found' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete course' });
    }
  });

  router.get('/courses/:id/lessons', (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const course = db.getCourse(id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      const lessons = db.getLessonsByCourse(id);
      res.json({ course, lessons });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  });

  router.post('/courses/:id/lessons', (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, scriptureRef, notes, mediaType, mediaUrl } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
      const course = db.getCourse(id);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      const lesson = db.createLesson(id, title, undefined, scriptureRef, undefined, mediaType, mediaUrl, notes);
      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create lesson' });
    }
  });

  router.delete('/lessons/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteLesson(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Lesson not found' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete lesson' });
    }
  });

  // POST /api/bible/ask - King James AI Q&A with resilient fallback
  router.post('/ask', async (req: Request, res: Response) => {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    try {
      let answer: string | null = null;
      try {
        answer = await Promise.race([
          kingJamesService.answerQuestion(question),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 12000))
        ]);
      } catch (serviceErr) {
        console.warn('KingJamesService fallback triggered:', serviceErr);
      }

      if (!answer) {
        answer = `Regarding "${question}": "Thy word is a lamp unto my feet, and a light unto my path." (Psalm 119:105). Continue in prayer and scripture study for deeper discernment.`;
      }

      res.json({ answer });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate answer', answer: 'The Lord is my strength and my shield; my heart trusted in him, and I am helped. (Psalm 28:7)' });
    }
  });

  // POST /api/bible/media/upload - Unified Upload for both Studio recorder and Podcast library
  router.post('/media/upload', upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const { title, speaker, series, scriptureRef, description, duration } = req.body;
      const mediaUrl = `/uploads/sermons/${req.file.filename}`;
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mediaType = ['.mp3', '.m4a', '.wav'].includes(ext) ? 'audio' : 'video';

      const sermon = db.createSermon(
        title || req.file.originalname.replace(/\.[^/.]+$/, ''),
        speaker || undefined,
        series || undefined,
        scriptureRef || undefined,
        description || undefined,
        mediaType,
        mediaUrl,
        duration ? parseInt(duration, 10) : undefined,
        new Date().toISOString().split('T')[0]
      );

      res.status(201).json({ sermon, mediaUrl });
    } catch (error) {
      console.error('Failed to upload media:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  // GET /api/bible/sermons - Retrieve all sermons from SQLite
  router.get('/sermons', (req: Request, res: Response) => {
    const { speaker, scripture, series } = req.query;
    try {
      let sermons;
      if (speaker) {
        sermons = db.getSermonsBySpeaker(speaker as string);
      } else if (scripture) {
        sermons = db.getSermonsByScripture(scripture as string);
      } else if (series) {
        sermons = db.getSermonsBySeries(series as string);
      } else {
        sermons = db.getAllSermons();
      }
      res.json(sermons || []);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sermons' });
    }
  });

  // POST /api/bible/sermons - Create sermon metadata record
  router.post('/sermons', (req: Request, res: Response) => {
    const { title, speaker, series, scriptureRef, description, mediaType, mediaUrl, duration, dateRecorded } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
      const sermon = db.createSermon(
        title,
        speaker,
        series,
        scriptureRef,
        description,
        mediaType || 'video',
        mediaUrl || '',
        duration,
        dateRecorded || new Date().toISOString().split('T')[0]
      );
      res.status(201).json(sermon);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create sermon' });
    }
  });

  return router;
}
