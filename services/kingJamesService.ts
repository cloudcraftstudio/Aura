/**
 * King James AI Study Engine Service
 */

import { BibleStudyDB } from '../data/bible/models';
import KJVLoader from '../data/bible/kjv_loader';

const kjvLoader = new KJVLoader();
kjvLoader.load();

interface StudyBreakdown {
  passageText: string;
  bookSummary: {
    author: string;
    era: string;
    audience: string;
  };
  historicalContext: {
    mindsetThen: string;
    originalIssue: string;
  };
  thenVsNow: {
    then: string;
    now: string;
  };
  dailyApplication: string[];
  prayer: string;
}

interface OnboardingResponse {
  welcome: string;
  recommendedCourses: Array<{ id: string; title: string; description?: string }>;
}

interface SharePayload {
  verseRef: string;
  passageText: string;
  takeaway: string;
  timestamp: string;
}

const BOOK_METADATA: Record<string, any> = {
  'Genesis': { author: 'Moses', era: '1400 BC', audience: 'Hebrew people' },
  'John': { author: 'John the Apostle', era: '90-110 AD', audience: 'Early Christian communities' },
  'Psalms': { author: 'David and others', era: '1000-300 BC', audience: 'Hebrew worshippers' },
};

const SYSTEM_PROMPT = `You are the King James Study Guide—a warm, authoritative biblical scholar with deep historical knowledge. 
Your role is to bridge ancient scripture with modern life. You speak with scholarly precision yet remain accessible and practical.
You understand the cultural, historical, and spiritual context of each passage and help readers apply timeless truths to their daily lives.
Your tone is reverent but never condescending, scholarly but never dry.`;

export class KingJamesService {
  constructor(private db: BibleStudyDB) {}

  async generateStudyBreakdown(book: string, chapter: string, verse: string): Promise<StudyBreakdown | null> {
    const verseRef = `${book} ${chapter}:${verse}`;
    
    // Check cache first
    const cached = this.db.getCommentary(verseRef);
    if (cached && cached.commentaryJson) {
      return JSON.parse(cached.commentaryJson);
    }

    // Fetch passage text
    const verseData = kjvLoader.getVerse(verseRef);
    if (!verseData) {
      return null;
    }

    const bookMeta = BOOK_METADATA[book] || {
      author: 'Unknown',
      era: 'Biblical times',
      audience: 'God\'s people'
    };

    const breakdown: StudyBreakdown = {
      passageText: verseData.text,
      bookSummary: {
        author: bookMeta.author,
        era: bookMeta.era,
        audience: bookMeta.audience,
      },
      historicalContext: {
        mindsetThen: this._generateHistoricalContext(book, chapter),
        originalIssue: this._generateOriginalIssue(book, chapter, verse),
      },
      thenVsNow: {
        then: this._generateThenPerspective(book, chapter),
        now: this._generateNowPerspective(book, chapter),
      },
      dailyApplication: this._generateDailyApplications(book, chapter, verse),
      prayer: this._generatePrayer(book, chapter, verse),
    };

    // Cache the result (24 hour expiry)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.db.cacheCommentary(verseRef, JSON.stringify(breakdown), expiresAt);

    return breakdown;
  }

  onboard(userGoals?: string, userInterests?: string): OnboardingResponse {
    const courses = this.db.getAllCourses();
    const recommended = courses.slice(0, 2);

    const welcome = `Welcome to your Bible study journey! I'm here to guide you through Scripture with warmth and scholarly insight. 
Whether you're seeking spiritual foundation, practical wisdom, or deeper community connection, we'll explore God's Word together. 
Let's begin with these courses tailored to your journey.`;

    return {
      welcome,
      recommendedCourses: recommended.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
      })),
    };
  }

  formatSharePayload(verseRef: string, passageText: string, takeaway: string): SharePayload {
    return {
      verseRef,
      passageText,
      takeaway,
      timestamp: new Date().toISOString(),
    };
  }

  private _generateHistoricalContext(book: string, chapter: string): string {
    const contexts: Record<string, string> = {
      'Genesis': 'The ancient Hebrews understood creation as God\'s sovereign act, establishing His authority over all things.',
      'John': 'First-century believers faced persecution and needed assurance of Christ\'s divinity and love.',
      'Psalms': 'The psalmists expressed raw emotion—grief, joy, confusion—before God, modeling authentic worship.',
    };
    return contexts[book] || 'The original audience lived in a world where God\'s presence was central to daily life.';
  }

  private _generateOriginalIssue(book: string, chapter: string, verse: string): string {
    return `In ${book} ${chapter}:${verse}, the original issue addressed the spiritual and practical needs of believers seeking God's guidance and comfort.`;
  }

  private _generateThenPerspective(book: string, chapter: string): string {
    return `In biblical times, people relied on God\'s Word for wisdom, comfort, and direction in a world of uncertainty and hardship.`;
  }

  private _generateNowPerspective(book: string, chapter: string): string {
    return `Today, we face different circumstances but the same human struggles: fear, doubt, purpose, and the need for meaning and connection.`;
  }

  private _generateDailyApplications(book: string, chapter: string, verse: string): string[] {
    return [
      `Reflect on how this passage speaks to a current challenge you're facing.`,
      `Share this verse with someone who needs encouragement today.`,
      `Meditate on one phrase from this passage throughout your day.`,
      `Pray specifically about how this truth applies to your circumstances.`,
    ];
  }

  private _generatePrayer(book: string, chapter: string, verse: string): string {
    return `Lord, help me understand and live out the truth of ${book} ${chapter}:${verse}. Give me wisdom to apply Your Word to my life today. Amen.`;
  }

  async answerQuestion(question: string): Promise<string> {
    // Dynamic Q&A based on keywords
    const lowerQuestion = question.toLowerCase();

    const responses: Record<string, string> = {
      'faith': 'Now faith is the substance of things hoped for, the evidence of things not seen. (Hebrews 11:1) Faith is the foundation upon which all believers must build their relationship with the Almighty. It is not mere belief, but a steadfast trust in God\'s promises and character.',
      'love': 'Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God. (1 John 4:7) Love is the greatest commandment and the fulfillment of all the law. It is the evidence of a transformed heart.',
      'prayer': 'Pray without ceasing. (1 Thessalonians 5:17) Prayer is the means by which we commune with our Father in heaven, bringing our petitions and thanksgivings before His throne. Through prayer, we align our will with God\'s.',
      'forgiveness': 'And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ\'s sake hath forgiven you. (Ephesians 4:32) Forgiveness is the pathway to healing and reconciliation. As we have been forgiven, so must we forgive others.',
      'hope': 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost. (Romans 15:13) Hope in God\'s promises sustains us through all trials and tribulations.',
      'salvation': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. (John 3:16) Salvation is the gift of God through faith in Christ Jesus.',
      'grace': 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God. (Ephesians 2:8) Grace is God\'s unmerited favor toward us, freely given through Christ.',
      'sin': 'For all have sinned, and come short of the glory of God. (Romans 3:23) Yet through Christ\'s sacrifice, we are redeemed and made righteous before God.',
      'jesus': 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me. (John 14:6) Jesus Christ is the Son of God and the Savior of all who believe.',
      'god': 'In the beginning God created the heaven and the earth. (Genesis 1:1) God is eternal, all-powerful, all-knowing, and perfectly holy. He is the source of all truth and goodness.',
      'scripture': 'All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness. (2 Timothy 3:16) The Bible is God\'s revealed Word to mankind.',
      'obedience': 'If ye love me, keep my commandments. (John 14:15) Obedience to God\'s Word is the evidence of our love for Him and our faith in His wisdom.',
      'temptation': 'There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able. (1 Corinthians 10:13) God provides a way of escape from every temptation.',
      'peace': 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. (John 14:27) The peace of God transcends all understanding and guards our hearts and minds.',
    };

    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }

    // Default response for general questions
    return 'Thy question is profound and worthy of deep contemplation. I encourage thee to seek the answer in the scriptures, for therein lies all wisdom and understanding. Consider reading the Gospels, the Epistles of Paul, or the Psalms for guidance on thy spiritual journey. What specific passage or truth dost thou wish to explore further?';
  }
}
