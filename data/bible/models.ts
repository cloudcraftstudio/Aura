/**
 * Database Models for Bible Study Feature
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface Course {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  category?: string;
  level?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  scriptureRef?: string;
  quizJson?: string;
  mediaType?: 'youtube' | 'upload' | 'none';
  mediaUrl?: string;
  notes?: string;
  order_index?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  completedLessons: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerseCommentaryCache {
  id: string;
  verseRef: string;
  commentaryJson?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker?: string;
  series?: string;
  scriptureRef?: string;
  description?: string;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
  duration?: number;
  dateRecorded?: string;
  courseLessonId?: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

export class BibleStudyDB {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  // Course operations
  createCourse(title: string, description?: string, coverImage?: string, category?: string, level?: string): Course {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT INTO courses (id, title, description, coverImage, category, level, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, title, description || null, coverImage || null, category || null, level || null, now, now);
    
    return { id, title, description, coverImage, category, level, createdAt: now, updatedAt: now };
  }

  getCourse(id: string): Course | null {
    const stmt = this.db.prepare('SELECT * FROM courses WHERE id = ?');
    return stmt.get(id) as Course | null;
  }

  getAllCourses(): Course[] {
    const stmt = this.db.prepare('SELECT * FROM courses ORDER BY createdAt DESC');
    return stmt.all() as Course[];
  }

  // Lesson operations
  createLesson(courseId: string, title: string, content?: string, scriptureRef?: string, quizJson?: string, mediaType?: string, mediaUrl?: string, notes?: string): Lesson {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT INTO lessons (id, courseId, title, content, scriptureRef, quizJson, mediaType, mediaUrl, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, courseId, title, content || null, scriptureRef || null, quizJson || null, mediaType || null, mediaUrl || null, notes || null, now, now);
    
    return { id, courseId, title, content, scriptureRef, quizJson, mediaType: mediaType as any, mediaUrl, notes, createdAt: now, updatedAt: now };
  }

  getLessonsByCourse(courseId: string): Lesson[] {
    const stmt = this.db.prepare('SELECT * FROM lessons WHERE courseId = ? ORDER BY order_index ASC');
    return stmt.all(courseId) as Lesson[];
  }

  getLesson(id: string): Lesson | null {
    const stmt = this.db.prepare('SELECT * FROM lessons WHERE id = ?');
    return stmt.get(id) as Lesson | null;
  }

  deleteLesson(id: string): boolean {
    const result = this.db.prepare('DELETE FROM lessons WHERE id = ?').run(id);
    return result.changes > 0;
  }

  updateCourse(id: string, updates: { title?: string; description?: string; coverImage?: string; category?: string; level?: string }): Course | null {
    const course = this.getCourse(id);
    if (!course) return null;

    const title = updates.title !== undefined ? updates.title : course.title;
    const description = updates.description !== undefined ? updates.description : course.description;
    const coverImage = updates.coverImage !== undefined ? updates.coverImage : course.coverImage;
    const category = updates.category !== undefined ? updates.category : course.category;
    const level = updates.level !== undefined ? updates.level : course.level;
    const updatedAt = new Date().toISOString();

    this.db.prepare(`
      UPDATE courses
      SET title = ?, description = ?, coverImage = ?, category = ?, level = ?, updatedAt = ?
      WHERE id = ?
    `).run(title, description, coverImage, category, level, updatedAt, id);

    return this.getCourse(id);
  }

  deleteCourse(id: string): boolean {
    this.db.prepare('DELETE FROM lessons WHERE courseId = ?').run(id);
    const result = this.db.prepare('DELETE FROM courses WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // User Progress operations
  createUserProgress(userId: string, completedLessons: string = '[]', notes?: string): UserProgress {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT INTO user_progress (id, userId, completedLessons, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, userId, completedLessons, notes || null, now, now);
    
    return { id, userId, completedLessons, notes, createdAt: now, updatedAt: now };
  }

  getUserProgress(userId: string): UserProgress | null {
    const stmt = this.db.prepare('SELECT * FROM user_progress WHERE userId = ?');
    return stmt.get(userId) as UserProgress | null;
  }

  updateUserProgress(userId: string, completedLessons: string, notes?: string): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(
      'UPDATE user_progress SET completedLessons = ?, notes = ?, updatedAt = ? WHERE userId = ?'
    );
    stmt.run(completedLessons, notes || null, now, userId);
  }

  // Verse Commentary Cache operations
  cacheCommentary(verseRef: string, commentaryJson: string, expiresAt?: string): VerseCommentaryCache {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO verse_commentary_cache (id, verseRef, commentaryJson, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, verseRef, commentaryJson, now, expiresAt || null);
    
    return { id, verseRef, commentaryJson, createdAt: now, expiresAt };
  }

  getCommentary(verseRef: string): VerseCommentaryCache | null {
    const stmt = this.db.prepare('SELECT * FROM verse_commentary_cache WHERE verseRef = ?');
    const result = stmt.get(verseRef) as VerseCommentaryCache | null;
    
    if (result && result.expiresAt && new Date(result.expiresAt) < new Date()) {
      this.db.prepare('DELETE FROM verse_commentary_cache WHERE verseRef = ?').run(verseRef);
      return null;
    }
    
    return result;
  }

  close(): void {
    this.db.close();
  }

  // Sermon operations
  createSermon(title: string, speaker?: string, series?: string, scriptureRef?: string, description?: string, mediaType?: string, mediaUrl?: string, duration?: number, dateRecorded?: string, thumbnailUrl?: string): Sermon {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT INTO sermons_podcasts (id, title, speaker, series, scriptureRef, description, mediaType, mediaUrl, duration, dateRecorded, thumbnailUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, title, speaker || null, series || null, scriptureRef || null, description || null, mediaType || null, mediaUrl || null, duration || null, dateRecorded || null, thumbnailUrl || null, now, now);
    
    return { id, title, speaker, series, scriptureRef, description, mediaType: mediaType as any, mediaUrl, duration, dateRecorded, thumbnailUrl, createdAt: now, updatedAt: now };
  }

  getAllSermons(): Sermon[] {
    const stmt = this.db.prepare('SELECT * FROM sermons_podcasts ORDER BY dateRecorded DESC, createdAt DESC');
    return stmt.all() as Sermon[];
  }

  getSermonsByScripture(scriptureRef: string): Sermon[] {
    const stmt = this.db.prepare('SELECT * FROM sermons_podcasts WHERE scriptureRef LIKE ? ORDER BY dateRecorded DESC');
    return stmt.all(`%${scriptureRef}%`) as Sermon[];
  }

  getSermonsBySpeaker(speaker: string): Sermon[] {
    const stmt = this.db.prepare('SELECT * FROM sermons_podcasts WHERE speaker LIKE ? ORDER BY dateRecorded DESC');
    return stmt.all(`%${speaker}%`) as Sermon[];
  }

  getSermonsBySeries(series: string): Sermon[] {
    const stmt = this.db.prepare('SELECT * FROM sermons_podcasts WHERE series LIKE ? ORDER BY dateRecorded DESC');
    return stmt.all(`%${series}%`) as Sermon[];
  }

  getSermonById(id: string): Sermon | null {
    const stmt = this.db.prepare('SELECT * FROM sermons_podcasts WHERE id = ?');
    return stmt.get(id) as Sermon | null;
  }

  updateSermon(id: string, updates: Partial<Sermon>): Sermon | null {
    const existing = this.getSermonById(id);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title : existing.title;
    const speaker = updates.speaker !== undefined ? updates.speaker : existing.speaker;
    const series = updates.series !== undefined ? updates.series : existing.series;
    const scriptureRef = updates.scriptureRef !== undefined ? updates.scriptureRef : existing.scriptureRef;
    const description = updates.description !== undefined ? updates.description : existing.description;
    const mediaType = updates.mediaType !== undefined ? updates.mediaType : existing.mediaType;
    const mediaUrl = updates.mediaUrl !== undefined ? updates.mediaUrl : existing.mediaUrl;
    const duration = updates.duration !== undefined ? updates.duration : existing.duration;
    const dateRecorded = updates.dateRecorded !== undefined ? updates.dateRecorded : existing.dateRecorded;
    const courseLessonId = updates.courseLessonId !== undefined ? updates.courseLessonId : existing.courseLessonId;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(
      'UPDATE sermons_podcasts SET title = ?, speaker = ?, series = ?, scriptureRef = ?, description = ?, mediaType = ?, mediaUrl = ?, duration = ?, dateRecorded = ?, courseLessonId = ?, updatedAt = ? WHERE id = ?'
    );
    stmt.run(title, speaker || null, series || null, scriptureRef || null, description || null, mediaType || null, mediaUrl || null, duration || null, dateRecorded || null, courseLessonId || null, now, id);

    return this.getSermonById(id);
  }

  deleteSermon(id: string): boolean {
    const result = this.db.prepare('DELETE FROM sermons_podcasts WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
