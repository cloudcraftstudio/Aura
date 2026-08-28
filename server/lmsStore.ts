/**
 * lmsStore.ts
 * Bootstraps the in-memory LMS data (Courses + Lessons) on server start.
 * All data lives in the JSONDatabase instance; this module just seeds it.
 */

import { db } from './db.js';

// ── Study tracks ────────────────────────────────────────────────────────────
// Each track is a named curriculum path King James can recommend to new users.

const SEED_COURSES = [
  {
    title: 'Foundations of Faith',
    description: 'Core doctrines every believer should know — creation, sin, salvation, and the resurrection.',
    track: 'foundations',
  },
  {
    title: 'Wisdom Literature',
    description: 'Deep dives into Psalms, Proverbs, and Ecclesiastes for practical, Spirit-led living.',
    track: 'wisdom',
  },
  {
    title: 'Prophets & Promises',
    description: 'Isaiah through Malachi — understanding prophecy, covenant, and Messianic hope.',
    track: 'prophecy',
  },
  {
    title: 'The Gospels',
    description: 'Walk through the life, teachings, death, and resurrection of Jesus Christ.',
    track: 'new-testament',
  },
  {
    title: 'Epistles: Letters to the Church',
    description: 'Romans through Revelation — doctrine, ethics, and the hope of glory.',
    track: 'new-testament',
  },
] as const;

// ── Lesson seed data ─────────────────────────────────────────────────────────

type LessonSeed = {
  title: string;
  scriptureRef: string;
  content: string;
  order: number;
  quizJson: { question: string; options: string[]; answerIndex: number }[] | null;
};

const LESSONS_BY_TRACK: Record<string, LessonSeed[]> = {
  foundations: [
    {
      title: 'In the Beginning: Creation',
      scriptureRef: 'Genesis 1:1',
      content:
        'God spoke the cosmos into existence from nothing (ex nihilo). This first verse establishes that God is eternal, all-powerful, and the source of all that is. Creation is not an accident — it is a deliberate act of love.',
      order: 1,
      quizJson: [
        {
          question: 'What does "ex nihilo" mean?',
          options: ['Out of chaos', 'Out of nothing', 'Out of water', 'Out of light'],
          answerIndex: 1,
        },
      ],
    },
    {
      title: 'The Fall and the Promise',
      scriptureRef: 'Genesis 3:15',
      content:
        'After the fall of Adam and Eve, God immediately announces the proto-evangelium — the first gospel promise. The seed of the woman will crush the serpent\'s head. This verse is the seed from which all of Scripture\'s redemptive story grows.',
      order: 2,
      quizJson: null,
    },
    {
      title: 'God So Loved the World',
      scriptureRef: 'John 3:16',
      content:
        'The most memorised verse in Scripture encapsulates the entire gospel: God\'s love, the gift of His Son, the condition of faith, and the promise of eternal life. It is the lens through which all of Scripture must be read.',
      order: 3,
      quizJson: [
        {
          question: 'According to John 3:16, what is the condition for receiving eternal life?',
          options: ['Good works', 'Baptism', 'Believing in the Son', 'Church attendance'],
          answerIndex: 2,
        },
      ],
    },
    {
      title: 'The Resurrection: Everything Changes',
      scriptureRef: 'John 14:6',
      content:
        'Jesus declares Himself the exclusive way to the Father. This claim is either the most audacious lie in history or the most liberating truth. The resurrection validates it. Without the resurrection, faith is futile (1 Cor 15:17); with it, death itself is defeated.',
      order: 4,
      quizJson: null,
    },
  ],
  wisdom: [
    {
      title: 'The Lord Is My Shepherd',
      scriptureRef: 'Psalms 23:1',
      content:
        'Psalm 23 is perhaps the most beloved poem in human history. David, himself a shepherd, uses the metaphor to describe God\'s intimate, personal care. Every phrase — green pastures, still waters, the valley of the shadow — maps a stage of the believer\'s journey.',
      order: 1,
      quizJson: [
        {
          question: 'Who wrote Psalm 23?',
          options: ['Moses', 'Solomon', 'David', 'Isaiah'],
          answerIndex: 2,
        },
      ],
    },
    {
      title: 'Trust in the Lord',
      scriptureRef: 'Proverbs 3:5',
      content:
        'Solomon\'s instruction cuts against the grain of every age: do not lean on your own understanding. In an era of information overload, this proverb is more radical than ever. Acknowledging God in all our ways is not passivity — it is the highest form of wisdom.',
      order: 2,
      quizJson: null,
    },
    {
      title: 'Renewing Strength',
      scriptureRef: 'Isaiah 40:31',
      content:
        'Isaiah 40 is written to a people in exile, exhausted and despairing. The promise is not that God will remove the difficulty, but that He will renew the strength of those who wait on Him. Waiting is not weakness — it is active, expectant trust.',
      order: 3,
      quizJson: [
        {
          question: 'What does Isaiah 40:31 promise to those who wait on the Lord?',
          options: ['Wealth and prosperity', 'Renewed strength', 'Immediate deliverance', 'Long life'],
          answerIndex: 1,
        },
      ],
    },
  ],
  prophecy: [
    {
      title: 'The Suffering Servant',
      scriptureRef: 'Isaiah 53:5',
      content:
        'Written 700 years before the crucifixion, Isaiah 53 describes the Messiah\'s suffering with startling precision. "By his stripes we are healed" — this is substitutionary atonement in the Old Testament. Every detail finds its fulfilment in Jesus of Nazareth.',
      order: 1,
      quizJson: [
        {
          question: 'Approximately how many years before the crucifixion was Isaiah 53 written?',
          options: ['100 years', '300 years', '700 years', '1000 years'],
          answerIndex: 2,
        },
      ],
    },
  ],
  'new-testament': [
    {
      title: 'The Beatitudes: Kingdom Values',
      scriptureRef: 'Matthew 5:3',
      content:
        'The Sermon on the Mount opens with eight "blessed are" statements that invert the world\'s value system. The poor in spirit, the mourning, the meek — these are the citizens of the Kingdom. Jesus is not describing how to earn blessing; He is describing the character of those who already belong to Him.',
      order: 1,
      quizJson: null,
    },
    {
      title: 'The Word Became Flesh',
      scriptureRef: 'John 1:1',
      content:
        'John\'s prologue echoes Genesis 1 deliberately. The Word (Logos) was not created — He was with God and was God. The incarnation is the hinge of history: the eternal Son of God taking on human flesh, dwelling among us, full of grace and truth.',
      order: 2,
      quizJson: [
        {
          question: 'What Greek word does John use for "Word" in John 1:1?',
          options: ['Pneuma', 'Logos', 'Theos', 'Kyrios'],
          answerIndex: 1,
        },
      ],
    },
    {
      title: 'Nothing Can Separate Us',
      scriptureRef: 'Romans 8:28',
      content:
        'Romans 8 is the mountain peak of Paul\'s letter. Verse 28 is not a promise that everything will feel good — it is a promise that God is working all things toward an ultimate good for those who love Him. The chapter ends with the unbreakable chain of God\'s love in Christ.',
      order: 3,
      quizJson: null,
    },
    {
      title: 'The Greatest of These Is Love',
      scriptureRef: '1 Corinthians 13:4',
      content:
        'The "love chapter" is not primarily a wedding reading — it is a rebuke to a church tearing itself apart over spiritual gifts. Paul argues that without love, every gift is noise. He then defines love not as a feeling but as a series of deliberate actions and restraints.',
      order: 4,
      quizJson: [
        {
          question: 'According to 1 Corinthians 13:13, what is the greatest of faith, hope, and love?',
          options: ['Faith', 'Hope', 'Love (Charity)', 'All are equal'],
          answerIndex: 2,
        },
      ],
    },
    {
      title: 'I Can Do All Things',
      scriptureRef: 'Philippians 4:13',
      content:
        'One of the most quoted verses in Scripture is also one of the most misapplied. Paul is not promising athletic victory or business success. He is saying that in every circumstance — abundance or need, freedom or prison — Christ gives him the strength to be content. Contentment is the "all things."',
      order: 5,
      quizJson: null,
    },
    {
      title: 'Faith Without Works Is Dead',
      scriptureRef: 'James 2:14',
      content:
        'James does not contradict Paul on justification — he addresses a different question. Paul asks: how is a person declared righteous before God? (By faith alone.) James asks: how do we know faith is genuine? (By its fruit.) Dead faith produces nothing; living faith produces works.',
      order: 6,
      quizJson: [
        {
          question: 'James 2:17 says faith without works is…',
          options: ['Weak', 'Dead', 'Incomplete', 'Sufficient'],
          answerIndex: 1,
        },
      ],
    },
  ],
};

// ── Seed function ────────────────────────────────────────────────────────────

export function seedLMSData(): void {
  // Only seed if no courses exist yet (idempotent)
  if (db.getAllCourses().length > 0) return;

  for (const courseSeed of SEED_COURSES) {
    const course = db.createCourse(courseSeed);
    const lessons = LESSONS_BY_TRACK[course.track] ?? [];
    for (const lessonSeed of lessons) {
      db.createLesson({ ...lessonSeed, courseId: course.id });
    }
  }

  console.log(
    `[LMS] Seeded ${db.getAllCourses().length} courses, ` +
    `${db.getAllCourses().flatMap((c) => db.getLessonsByCourse(c.id)).length} lessons.`
  );
}
