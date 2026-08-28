-- Bible Study Feature Database Schema

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coverImage TEXT,
  category TEXT,
  level TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  scriptureRef TEXT,
  quizJson TEXT,
  mediaType TEXT,
  mediaUrl TEXT,
  notes TEXT,
  order_index INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  completedLessons TEXT,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId)
);

-- Verse Commentary Cache table
CREATE TABLE IF NOT EXISTS verse_commentary_cache (
  id TEXT PRIMARY KEY,
  verseRef TEXT NOT NULL UNIQUE,
  commentaryJson TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME
);

-- Sermons & Podcasts table
CREATE TABLE IF NOT EXISTS sermons_podcasts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT,
  series TEXT,
  scriptureRef TEXT,
  description TEXT,
  mediaType TEXT,
  mediaUrl TEXT,
  duration INTEGER,
  dateRecorded DATETIME,
  courseLessonId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_courseId ON lessons(courseId);
CREATE INDEX IF NOT EXISTS idx_user_progress_userId ON user_progress(userId);
CREATE INDEX IF NOT EXISTS idx_verse_commentary_verseRef ON verse_commentary_cache(verseRef);
