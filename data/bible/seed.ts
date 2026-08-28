/**
 * Seed sample LMS courses and lessons
 */

import { BibleStudyDB } from './models';

export function seedBibleCourses(db: BibleStudyDB): void {
  // Check if courses already exist
  const existingCourses = db.getAllCourses();
  if (existingCourses.length > 0) {
    return;
  }

  // Course 1: Foundations of Faith
  const course1 = db.createCourse(
    'Foundations of Faith',
    'Explore the core truths of Christian faith through Scripture'
  );
  db.createLesson(
    course1.id,
    'The Word Became Flesh',
    'Understanding the incarnation and divinity of Christ',
    'John 1:1',
    JSON.stringify({ questions: ['What does it mean that the Word was God?', 'How does this shape your faith?'] })
  );
  db.createLesson(
    course1.id,
    'Faith Defined',
    'What is faith and why does it matter?',
    'Hebrews 11:1',
    JSON.stringify({ questions: ['How do you define faith?', 'What role does faith play in your life?'] })
  );

  // Course 2: Walking in Wisdom
  const course2 = db.createCourse(
    'Walking in Wisdom',
    'Practical wisdom for daily living from Scripture'
  );
  db.createLesson(
    course2.id,
    'Trust and Lean Not',
    'Trusting God with your whole heart',
    'Proverbs 3:5-6',
    JSON.stringify({ questions: ['What does it mean to trust with your whole heart?', 'How can you apply this today?'] })
  );
  db.createLesson(
    course2.id,
    'Asking for Wisdom',
    'How to seek and receive wisdom from God',
    'James 1:5',
    JSON.stringify({ questions: ['When have you needed wisdom?', 'How do you ask God for guidance?'] })
  );

  // Course 3: Grace & Community
  const course3 = db.createCourse(
    'Grace & Community',
    'Living out grace and building authentic Christian community'
  );
  db.createLesson(
    course3.id,
    'No Favoritism',
    'Treating all people with equal dignity and respect',
    'James 2:1-4',
    JSON.stringify({ questions: ['How do you show favoritism?', 'What would it look like to treat everyone equally?'] })
  );
  db.createLesson(
    course3.id,
    'Love Without Hypocrisy',
    'Genuine love and community in action',
    'Romans 12:9-13',
    JSON.stringify({ questions: ['What does genuine love look like?', 'How can you build community?'] })
  );
}
