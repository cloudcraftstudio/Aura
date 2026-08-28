/**
 * Initialize Bible Study Database
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { BibleStudyDB } from './models';
import { seedBibleCourses } from './seed';

export function initializeBibleDB(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  
  // Resolve schema relative to this file's directory using process.cwd()
  const schemaPath = path.join(process.cwd(), 'data', 'bible', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  db.exec(schema);
  
  const bibleDB = new BibleStudyDB(dbPath);
  seedBibleCourses(bibleDB);
  
  return db;
}
