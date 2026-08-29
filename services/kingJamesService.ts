/**
 * King James AI Study Engine & Interactive Biblical Scholar Service
 */

import { BibleStudyDB } from '../data/bible/models';
import KJVLoader from '../data/bible/kjv_loader';
import { GoogleGenAI } from '@google/genai';

const kjvLoader = new KJVLoader();
kjvLoader.load();

export interface StudyBreakdown {
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
  hebrewGreekBites?: Array<{
    word: string;
    definition: string;
    language?: string;
  }>;
  thenVsNow: {
    then: string;
    now: string;
  };
  dailyApplication: string[];
  prayer: string;
}

export interface OnboardingResponse {
  welcome: string;
  recommendedCourses: Array<{ id: string; title: string; description?: string }>;
}

export interface SharePayload {
  verseRef: string;
  passageText: string;
  takeaway: string;
  timestamp: string;
}

export interface TutorResponse {
  answer: string;
  versesCited?: string[];
  hebrewGreekWords?: Array<{ word: string; transliteration?: string; language: string; definition: string }>;
  suggestedQuestions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'king-james';
  content: string;
}

const BOOK_METADATA: Record<string, { author: string; era: string; audience: string; theme: string }> = {
  // Old Testament - Law
  'Genesis': { author: 'Moses', era: '1440-1400 BC', audience: 'The Children of Israel in the wilderness', theme: 'Beginnings, Creation, Fall, and Covenant Election' },
  'Exodus': { author: 'Moses', era: '1440-1400 BC', audience: 'Israel during the Exodus journey', theme: 'Deliverance, Law at Sinai, and Tabernacle Presence' },
  'Leviticus': { author: 'Moses', era: '1440 BC', audience: 'The Levitical priesthood and Israel', theme: 'Holiness, Sacrificial Atonement, and Purity' },
  'Numbers': { author: 'Moses', era: '1400 BC', audience: 'The second generation of Israel', theme: 'Wilderness Wanderings, Faithfulness, and Discipline' },
  'Deuteronomy': { author: 'Moses', era: '1400 BC', audience: 'Israel before entering the Promised Land', theme: 'Renewal of the Covenant and Call to Obedience' },
  // Old Testament - History
  'Joshua': { author: 'Joshua', era: '1380 BC', audience: 'The nation of Israel in Canaan', theme: 'Conquest, Faithfulness, and Division of the Inheritance' },
  'Judges': { author: 'Samuel', era: '1050-1000 BC', audience: 'Israel under early monarchy', theme: 'Cycles of Apostasy, Deliverance, and Human Inadequacy' },
  'Ruth': { author: 'Samuel', era: '1000 BC', audience: 'The Kingdom of Israel', theme: 'Kinsman-Redeemer, Loyal Love (Hesed), and Davidic Lineage' },
  '1 Samuel': { author: 'Samuel, Nathan & Gad', era: '930 BC', audience: 'United Kingdom of Israel', theme: 'Transition from Theocracy to Monarchy, Saul, and David' },
  '2 Samuel': { author: 'Nathan & Gad', era: '930 BC', audience: 'United Kingdom of Israel', theme: 'The Davidic Reign, Covenant, and Moral Consequences' },
  '1 Kings': { author: 'Jeremiah', era: '560-550 BC', audience: 'Exiles in Babylon', theme: 'Solomon, the Temple, Division of the Kingdom, and Elijah' },
  '2 Kings': { author: 'Jeremiah', era: '560-550 BC', audience: 'Exiles in Babylon', theme: 'Decline, Prophets, and the Babylonian Captivity' },
  '1 Chronicles': { author: 'Ezra', era: '450-400 BC', audience: 'Post-exilic Jewish community', theme: 'Genealogies, Worship, and Davidic Covenant' },
  '2 Chronicles': { author: 'Ezra', era: '450-400 BC', audience: 'Post-exilic Jewish community', theme: 'The Temple, Kings of Judah, Repentance, and Reform' },
  'Ezra': { author: 'Ezra', era: '450-400 BC', audience: 'Returned exiles rebuilding the Temple', theme: 'Restoration, Rebuilding the Temple, and Spiritual Purity' },
  'Nehemiah': { author: 'Nehemiah', era: '430-400 BC', audience: 'Rebuilders of Jerusalem\'s walls', theme: 'Rebuilding the Walls, Governance, and Covenant Renewal' },
  'Esther': { author: 'Mordecai', era: '460-400 BC', audience: 'Persian and worldwide Diaspora Jews', theme: 'God\'s Unseen Sovereignty and Preservation of His People' },
  // Old Testament - Poetry & Wisdom
  'Job': { author: 'Job / Moses', era: '2000-1800 BC', audience: 'All seekers of God in suffering', theme: 'Sovereignty of God, Undeserved Suffering, and Faith' },
  'Psalms': { author: 'King David, Asaph & Sons of Korah', era: '1000-450 BC', audience: 'Worshippers of the Almighty', theme: 'Praise, Lament, Messianic Prophecy, and Divine Protection' },
  'Proverbs': { author: 'King Solomon', era: '950-700 BC', audience: 'Seekers of divine wisdom and discipline', theme: 'The Fear of the LORD, Wisdom, and Practical Righteousness' },
  'Ecclesiastes': { author: 'King Solomon', era: '935 BC', audience: 'Those seeking true eternal meaning', theme: 'The Vanity of Life Under the Sun and Fearing God' },
  'Song of Solomon': { author: 'King Solomon', era: '965 BC', audience: 'God\'s people celebrating pure covenant love', theme: 'Marital Intimacy and Christ\'s Love for His Bride' },
  // Old Testament - Major Prophets
  'Isaiah': { author: 'Isaiah the Prophet', era: '740-680 BC', audience: 'Judah, Jerusalem and future generations', theme: 'The Holy One of Israel, the Suffering Servant, and Future Glory' },
  'Jeremiah': { author: 'Jeremiah the Prophet', era: '626-586 BC', audience: 'The decaying Southern Kingdom of Judah', theme: 'Judgment on Unfaithfulness and the Promise of the New Covenant' },
  'Lamentations': { author: 'Jeremiah', era: '586 BC', audience: 'Mourners of destroyed Jerusalem', theme: 'Grief Over Destruction and the Greatness of God\'s Mercies' },
  'Ezekiel': { author: 'Ezekiel the Priest-Prophet', era: '593-571 BC', audience: 'Captives by the River Chebar in Babylon', theme: 'Glory of God, Personal Responsibility, and the New Heart' },
  'Daniel': { author: 'Daniel the Statesman-Prophet', era: '605-535 BC', audience: 'Believers standing faithful in Babylon', theme: 'God\'s Rule Over World Empires and the Everlasting Kingdom' },
  // Old Testament - Minor Prophets
  'Hosea': { author: 'Hosea', era: '750-715 BC', audience: 'Unfaithful Northern Kingdom of Israel', theme: 'Unfailing Covenant Love of God (Hesed) Despite Betrayal' },
  'Joel': { author: 'Joel', era: '835 BC', audience: 'Judah facing the Day of the LORD', theme: 'The Day of the LORD and the Outpouring of the Holy Spirit' },
  'Amos': { author: 'Amos', era: '760-750 BC', audience: 'Prosperous yet unrighteous Israel', theme: 'Divine Justice, Righteousness, and Judgment on Injustice' },
  'Obadiah': { author: 'Obadiah', era: '840 BC', audience: 'The proud nation of Edom and Judah', theme: 'Judgment on Pride and Deliverance in Mount Zion' },
  'Jonah': { author: 'Jonah', era: '760 BC', audience: 'Nineveh and reluctant messengers', theme: 'God\'s Boundless Mercy to All Nations and Repentance' },
  'Micah': { author: 'Micah', era: '735-700 BC', audience: 'Judah and Samaria', theme: 'Doing Justly, Loving Mercy, Walking Humbly, and the Bethlehem Ruler' },
  'Nahum': { author: 'Nahum', era: '663-612 BC', audience: 'Nineveh and suffering Judah', theme: 'The Wrath and Justice of God Upon Oppressors' },
  'Habakkuk': { author: 'Habakkuk', era: '607-605 BC', audience: 'Those questioning divine justice', theme: 'The Just Shall Live by Faith Amidst Perplexity' },
  'Zephaniah': { author: 'Zephaniah', era: '630-625 BC', audience: 'Judah before King Josiah\'s revival', theme: 'The Great Day of the LORD and the Joyful Restoration' },
  'Haggai': { author: 'Haggai', era: '520 BC', audience: 'Post-exilic temple builders', theme: 'Prioritizing God\'s House and God\'s Promised Presence' },
  'Zechariah': { author: 'Zechariah', era: '520-480 BC', audience: 'Post-exilic remnant awaiting the Messiah', theme: 'Messianic Prophecies, the Pierced Shepherd, and Zion\'s King' },
  'Malachi': { author: 'Malachi', era: '430-400 BC', audience: 'Complacent priests and people of Judah', theme: 'God\'s Unchanging Love, Honoring Tithes, and the Sun of Righteousness' },
  // New Testament - Gospels & Acts
  'Matthew': { author: 'Matthew (Levi) the Apostle', era: '50-60 AD', audience: 'Jewish believers showing Jesus is the King', theme: 'Jesus as the Promised Messiah, King of Kings, and Fulfillment of the Law' },
  'Mark': { author: 'John Mark', era: '55-65 AD', audience: 'Roman Christians portraying Christ the Servant', theme: 'Jesus as the Suffering Servant and Powerful Miracle-Worker' },
  'Luke': { author: 'Luke the Beloved Physician', era: '60-62 AD', audience: 'Theophilus and Gentiles seeking the Son of Man', theme: 'Jesus as the Compassionate Savior of the Lost, Outcasts, and Gentiles' },
  'John': { author: 'John the Apostle', era: '85-95 AD', audience: 'The world—believing Jesus is the Son of God', theme: 'The Deity of Jesus Christ, Eternal Life, and the Seven "I AM" Statements' },
  'Acts': { author: 'Luke the Historian', era: '62-64 AD', audience: 'The expanding early global Church', theme: 'The Holy Spirit\'s Power, the Gospel Spreading from Jerusalem to Rome' },
  // New Testament - Epistles of Paul
  'Romans': { author: 'Paul the Apostle', era: '57 AD', audience: 'Believers in Rome', theme: 'Justification by Faith Alone, the Righteousness of God, and Sanctification' },
  '1 Corinthians': { author: 'Paul the Apostle', era: '55 AD', audience: 'The church at Corinth', theme: 'Unity in Christ, Christian Liberty, Spiritual Gifts, and the Resurrection' },
  '2 Corinthians': { author: 'Paul the Apostle', era: '56 AD', audience: 'The church at Corinth', theme: 'Comfort in Suffering, the Ministry of Reconciliation, and God\'s Grace' },
  'Galatians': { author: 'Paul the Apostle', era: '48-49 AD', audience: 'Churches in Galatia', theme: 'Christian Liberty, Justification Apart from Legalism, and Fruit of the Spirit' },
  'Ephesians': { author: 'Paul the Apostle', era: '60-62 AD', audience: 'The church at Ephesus', theme: 'The Believer\'s Wealth in Christ, Unity of the Body, and the Whole Armor of God' },
  'Philippians': { author: 'Paul the Apostle', era: '61 AD', audience: 'The church at Philippi', theme: 'Rejoicing in the Lord, the Mind of Christ, and Contentment' },
  'Colossians': { author: 'Paul the Apostle', era: '60-62 AD', audience: 'The church at Colossae', theme: 'The Supreme Preeminence and All-Sufficiency of Jesus Christ' },
  '1 Thessalonians': { author: 'Paul the Apostle', era: '51 AD', audience: 'The church at Thessalonica', theme: 'Holiness, Brotherly Love, and the Blessed Hope of Christ\'s Return' },
  '2 Thessalonians': { author: 'Paul the Apostle', era: '51-52 AD', audience: 'The church at Thessalonica', theme: 'Steadfastness Under Persecution and Events Surrounding the Day of the Lord' },
  '1 Timothy': { author: 'Paul the Apostle', era: '62-64 AD', audience: 'Timothy pastoring the church at Ephesus', theme: 'Church Order, Sound Doctrine, Qualifications for Elders and Deacons' },
  '2 Timothy': { author: 'Paul the Apostle', era: '66-67 AD', audience: 'Timothy in Rome (Paul\'s final charge)', theme: 'Faithful Endurance, Preaching the Word, and Finishing the Race' },
  'Titus': { author: 'Paul the Apostle', era: '63-65 AD', audience: 'Titus organizing churches on Crete', theme: 'Setting in Order Church Leadership and Good Works Rooted in Grace' },
  'Philemon': { author: 'Paul the Apostle', era: '60-62 AD', audience: 'Philemon regarding Onesimus', theme: 'Christian Brotherhood, Forgiveness, and Reconciliation' },
  // New Testament - General Epistles
  'Hebrews': { author: 'Apostolic Author (Paul / Apollos)', era: '67-69 AD', audience: 'Hebrew believers tempted to return to old rituals', theme: 'The Superiority of Jesus Christ as High Priest and Mediator of the Better Covenant' },
  'James': { author: 'James the Brother of Jesus', era: '45-48 AD', audience: 'Twelve tribes scattered', theme: 'Living, Active Faith Demonstrated by Works, Wisdom, and Taming the Tongue' },
  '1 Peter': { author: 'Peter the Apostle', era: '62-64 AD', audience: 'Suffering believers scattered across Asia Minor', theme: 'Living Hope Amidst Suffering, Holy Living, and the Chief Shepherd' },
  '2 Peter': { author: 'Peter the Apostle', era: '66-68 AD', audience: 'Believers guarding against false teachers', theme: 'Growing in Grace and Knowledge, Guarding Sound Truth, and Christ\'s Second Coming' },
  '1 John': { author: 'John the Beloved Apostle', era: '85-95 AD', audience: 'Believers resting in fellowship and eternal life', theme: 'Fellowship with God, Walking in the Light, Brotherly Love, and Assurance of Salvation' },
  '2 John': { author: 'John the Apostle', era: '85-95 AD', audience: 'The elect lady and her children', theme: 'Walking in Truth and Love while Rejecting Deceivers' },
  '3 John': { author: 'John the Apostle', era: '85-95 AD', audience: 'Gaius', theme: 'Hospitality to Faithful Teachers and Standing Against Tyranny' },
  'Jude': { author: 'Jude the Brother of James', era: '65-80 AD', audience: 'Believers contending earnestly for the faith', theme: 'Contending for the Faith Once Delivered unto the Saints' },
  'Revelation': { author: 'John the Apostle on Patmos', era: '95-96 AD', audience: 'The Seven Churches of Asia and all saints', theme: 'The Ultimate Triumph of the Lamb, the Judgment of Evil, and the New Jerusalem' },
};

const MASTER_SYSTEM_PROMPT = `You are King James—an esteemed, deeply learned Master Biblical Scholar, Theologian, and Christian Mentor. 
You possess encyclopedic mastery of the Holy Scriptures across all 66 books of the Old and New Testaments, the Authorized King James Version (KJV), Biblical Hebrew (Masoretic Text), Aramaic, Koine Greek (Textus Receptus), Strong's Concordance, Church History, Systematic Theology, Biblical Geography, and Hermeneutics.

YOUR MISSION & SCOPE:
You MUST answer ANY Bible-related question thoroughly, directly, and interactively. You are NEVER evasive or dismissive. You never say "go read the scriptures yourself." Instead, you unpack the full counsel of God with scholarly depth, reverent eloquence, and practical clarity.

CORE CAPABILITIES:
1. THEOLOGY & DOCTRINE: Explain complex theological concepts clearly (e.g., Justification vs. Sanctification, the Trinity, the Hypostatic Union of Christ, Covenant Theology, Eschatology, Atonement, the Holy Spirit, Grace vs. Works).
2. SCRIPTURE EXEGESIS & KJV CITATIONS: Quote the exact KJV passage text with book, chapter, and verse citations (e.g., Romans 8:28, Isaiah 53:5, Ephesians 2:8-9, Psalm 23).
3. ORIGINAL LANGUAGE INSIGHTS: Provide Greek and Hebrew root words, original terms (e.g., Agape, Hesed, Shalom, Logos, Pneuma, Dikaiosyne), transliterations, and Strong's meanings to reveal rich depth.
4. HISTORICAL & CULTURAL CONTEXT: Detail who wrote the book, when, the ancient cultural mindset (Ancient Near East, Second Temple Judaism, Greco-Roman world), and the original issue being addressed.
5. SCRIPTURAL HARMONY & CROSS-REFERENCES: Connect Old Testament shadows/types to New Testament fulfillment in Jesus Christ (e.g., Melchizedek, the Tabernacle, the Sacrificial System, the Feasts of the Lord).
6. PRACTICAL & PASTORAL APPLICATION: Show how this eternal truth directly equips, comforts, guides, and challenges believers in their daily walk today.
7. INTERACTIVE ENGAGEMENT: Conclude each answer with 2-3 engaging, thought-provoking follow-up questions to help the seeker explore further.

FORMATTING GUIDELINES:
- Use clear headings, bullet points, and clean formatting.
- Put quoted KJV scriptures in distinct blocks.
- Highlight Greek/Hebrew words clearly.
- Maintain a warm, wise, respectful, and authoritative scholarly tone.`;

export class KingJamesService {
  private aiClient: GoogleGenAI | null = null;

  constructor(private db: BibleStudyDB) {}

  private getAI(): GoogleGenAI | null {
    if (!this.aiClient && process.env.GEMINI_API_KEY) {
      this.aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  async answerQuestion(
    question: string,
    history?: ChatMessage[],
    mode: string = 'general'
  ): Promise<TutorResponse> {
    const ai = this.getAI();
    const cleanQuestion = question.trim();

    if (ai) {
      try {
        let modeInstruction = '';
        if (mode === 'exegesis') {
          modeInstruction = 'Focus heavily on verse-by-verse exposition, linguistic context, and cross-references.';
        } else if (mode === 'word_study') {
          modeInstruction = 'Focus heavily on original Hebrew/Greek words, Strong definitions, grammatical parsing, and root nuances.';
        } else if (mode === 'theology') {
          modeInstruction = 'Focus on systematic theology, biblical covenants, historical church consensus, and doctrinal clarity.';
        } else if (mode === 'pastoral') {
          modeInstruction = 'Focus on pastoral encouragement, spiritual encouragement, ethical application, and personal prayer.';
        }

        // Build conversation contents for multi-turn chat
        const promptLines: string[] = [];
        promptLines.push(`Question: ${cleanQuestion}`);
        if (modeInstruction) {
          promptLines.push(`Special Mode Focus: ${modeInstruction}`);
        }

        let conversationHistoryText = '';
        if (history && history.length > 0) {
          const recentHistory = history.slice(-8);
          conversationHistoryText = `\n--- PREVIOUS CONVERSATION CONTEXT ---\n` +
            recentHistory.map(m => `${m.role === 'user' ? 'Seeker' : 'King James'}: ${m.content}`).join('\n') +
            `\n--- END PREVIOUS CONTEXT ---\n`;
        }

        const fullPrompt = `${conversationHistoryText}\n${promptLines.join('\n')}\n\nProvide an exhaustive, deeply informative, and eloquent response. Quote key KJV verses. Provide Hebrew/Greek insights where relevant. End with 3 clickable suggested follow-up questions labeled [Suggested Questions].`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: fullPrompt,
          config: {
            systemInstruction: MASTER_SYSTEM_PROMPT,
            temperature: 0.7,
          },
        });

        const rawText = response.text || '';
        if (rawText.trim()) {
          const parsed = this._parseTutorOutput(rawText, cleanQuestion);
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini tutor generation failed, falling back to comprehensive biblical engine:', err);
      }
    }

    // Comprehensive Fallback Engine
    return this._comprehensiveFallbackAnswer(cleanQuestion, mode);
  }

  async generateStudyBreakdown(book: string, chapter: string, verse: string): Promise<StudyBreakdown> {
    const verseRef = `${book} ${chapter}:${verse}`;
    
    // Check cache first
    try {
      const cached = this.db.getCommentary(verseRef);
      if (cached && cached.commentaryJson) {
        const parsed = JSON.parse(cached.commentaryJson);
        if (parsed && parsed.bookSummary && parsed.passageText) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Cache lookup failed:', e);
    }

    // Fetch passage text
    const verseData = kjvLoader.getVerse(verseRef);
    const passageText = verseData?.text || `\"Thy word is a lamp unto my feet, and a light unto my path.\" — ${verseRef} (King James Version)`;

    const bookMeta = BOOK_METADATA[book] || {
      author: 'Biblical Author',
      era: 'Biblical Antiquity',
      audience: 'God\'s Covenant People',
      theme: 'God\'s Sovereign Grace and Truth'
    };

    const ai = this.getAI();
    if (ai) {
      try {
        const prompt = `Provide a comprehensive scholarly study breakdown for the scripture passage: "${verseRef}": "${passageText}".
Return a JSON object with:
- bookSummary: { author, era, audience }
- historicalContext: { mindsetThen, originalIssue }
- hebrewGreekBites: array of { word, definition, language }
- thenVsNow: { then, now }
- dailyApplication: array of 3-4 specific practical applications
- prayer: a heartfelt closing prayer`;

        const res = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            systemInstruction: MASTER_SYSTEM_PROMPT,
          }
        });

        const parsed = JSON.parse(res.text || '{}');
        if (parsed && parsed.historicalContext && parsed.dailyApplication) {
          const result: StudyBreakdown = {
            passageText,
            bookSummary: {
              author: parsed.bookSummary?.author || bookMeta.author,
              era: parsed.bookSummary?.era || bookMeta.era,
              audience: parsed.bookSummary?.audience || bookMeta.audience,
            },
            historicalContext: {
              mindsetThen: parsed.historicalContext?.mindsetThen || `The original audience understood God's covenant promises as their ultimate anchor in ${book}.`,
              originalIssue: parsed.historicalContext?.originalIssue || `Addressing faith, righteousness, and perseverance in ${verseRef}.`,
            },
            hebrewGreekBites: parsed.hebrewGreekBites || [],
            thenVsNow: {
              then: parsed.thenVsNow?.then || 'Ancient believers walked by faith in God amidst trials and persecution.',
              now: parsed.thenVsNow?.now || 'Modern believers draw the exact same living hope and strength from Christ today.',
            },
            dailyApplication: Array.isArray(parsed.dailyApplication) ? parsed.dailyApplication : [
              'Meditate deeply on this scripture and memorize key phrases.',
              'Bring your current life circumstances to God in faith-filled prayer.',
              'Apply this divine principle in your relationships and vocation.'
            ],
            prayer: parsed.prayer || `Lord God Almighty, thank You for the eternal truth of ${verseRef}. May Your Word transform my heart and direct my steps today. In Jesus' name, Amen.`,
          };

          // Cache
          try {
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            this.db.cacheCommentary(verseRef, JSON.stringify(result), expiresAt);
          } catch {}

          return result;
        }
      } catch (err) {
        console.warn('Gemini breakdown failed, using rich local metadata:', err);
      }
    }

    // Rich local fallback
    const breakdown: StudyBreakdown = {
      passageText,
      bookSummary: {
        author: bookMeta.author,
        era: bookMeta.era,
        audience: bookMeta.audience,
      },
      historicalContext: {
        mindsetThen: `In the time of ${book} (${bookMeta.era}), the audience (${bookMeta.audience}) faced spiritual and cultural challenges requiring steadfast allegiance to God's revealed truth.`,
        originalIssue: `The passage ${verseRef} addresses ${bookMeta.theme.toLowerCase()}, calling the people of God to holy living, faithful trust, and covenant obedience.`,
      },
      hebrewGreekBites: [
        { word: 'Khesed / Agape', definition: 'Steadfast, loyal covenant love and unconditional divine grace.', language: 'Hebrew/Greek' },
        { word: 'Emunah / Pistis', definition: 'Faith, firmness, moral fidelity, and unwavering reliance on God.', language: 'Hebrew/Greek' }
      ],
      thenVsNow: {
        then: `Believers relied entirely on God's promises in ${verseRef} as their divine compass amidst ancient trials.`,
        now: `Today, in a fast-paced and complex world, this timeless Word provides unwavering certainty, moral clarity, and supernatural peace.`,
      },
      dailyApplication: [
        `Reflect upon how the eternal truth in ${verseRef} confronts your current circumstances.`,
        `Commit this verse to memory and speak its truth over anxieties or trials today.`,
        `Share this encouragement with a brother or sister in Christ who is seeking direction.`,
        `Allow the Holy Spirit to cultivate obedience and joy in your daily walk.`
      ],
      prayer: `Almighty Father, who hath given us all scripture for doctrine and instruction in righteousness: open my heart to the depth of ${verseRef}. Direct my steps in Thy truth and glorify Thy name through my life this day. Through Jesus Christ our Lord, Amen.`,
    };

    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      this.db.cacheCommentary(verseRef, JSON.stringify(breakdown), expiresAt);
    } catch {}

    return breakdown;
  }

  onboard(userGoals?: string, userInterests?: string): OnboardingResponse {
    const courses = this.db.getAllCourses();
    const recommended = courses.slice(0, 3);

    const welcome = `Greetings in the name of our Lord! I am your AI King James Tutor and Study Companion.
Whether you wish to master systematic theology, explore the original Greek and Hebrew nuances, understand historical backgrounds, or grow in personal devotion, I am here to guide your study.

${userGoals ? `I have noted your goal: "${userGoals}".` : ''} 
Let us open the scriptures together and behold the wondrous things of God's Word!`;

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

  private _parseTutorOutput(text: string, originalQuestion: string): TutorResponse {
    const versesCited: string[] = [];
    const verseRegex = /([1-3]?\s?[A-Z][a-z]+)\s+(\d+):(\d+(?:-\d+)?)/g;
    let match;
    while ((match = verseRegex.exec(text)) !== null) {
      if (!versesCited.includes(match[0])) {
        versesCited.push(match[0]);
      }
    }

    // Extract suggested questions if model added them
    let suggestedQuestions: string[] = [];
    const questionsBlockMatch = text.match(/(?:\[Suggested Questions\]|Suggested Follow-up Questions:|Follow-up Questions:?)([\s\S]*)$/i);
    let cleanAnswer = text;

    if (questionsBlockMatch) {
      cleanAnswer = text.slice(0, questionsBlockMatch.index).trim();
      const rawQuestions = questionsBlockMatch[1]
        .split('\n')
        .map(q => q.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter(q => q.length > 5 && q.endsWith('?'));
      suggestedQuestions = rawQuestions.slice(0, 3);
    }

    if (suggestedQuestions.length === 0) {
      suggestedQuestions = this._generateSuggestedQuestions(originalQuestion);
    }

    return {
      answer: cleanAnswer,
      versesCited: versesCited.slice(0, 6),
      suggestedQuestions: suggestedQuestions.slice(0, 3),
    };
  }

  private _generateSuggestedQuestions(question: string): string[] {
    const q = question.toLowerCase();
    if (q.includes('melchizedek') || q.includes('hebrews')) {
      return [
        'How does Melchizedek foreshadow Jesus Christ in Psalm 110?',
        'What is the difference between the Aaronic and Melchizedek priesthoods?',
        'Why does Genesis 14 mention Abraham giving tithes to Melchizedek?'
      ];
    }
    if (q.includes('grace') || q.includes('salvation') || q.includes('faith') || q.includes('works')) {
      return [
        'How do Paul in Ephesians 2 and James in James 2 harmonize on faith and works?',
        'What is the original Greek meaning of "charis" (grace) in the New Testament?',
        'What does Romans 3:24 mean by "being justified freely by his grace"?'
      ];
    }
    if (q.includes('armor') || q.includes('ephesians')) {
      return [
        'What does each piece of the Armor of God in Ephesians 6 represent?',
        'Why is the Sword of the Spirit the only offensive weapon mentioned?',
        'How do we practically "put on the whole armour of God" daily?'
      ];
    }
    if (q.includes('justification') || q.includes('sanctification')) {
      return [
        'What is the theological difference between justification, sanctification, and glorification?',
        'How does Romans 6 explain our death to sin and walk in newness of life?',
        'What is the role of the Holy Spirit in ongoing sanctification?'
      ];
    }
    if (q.includes('love') || q.includes('agape')) {
      return [
        'What are the 4 Greek words for love in antiquity and how is Agape unique?',
        'Why did Jesus ask Peter three times "Lovest thou me?" in John 21?',
        'How does 1 Corinthians 13 define the nature of true charity?'
      ];
    }
    return [
      'What are the key King James cross-references for this passage?',
      'What is the original Greek or Hebrew background for this doctrine?',
      'How can a believer apply this truth to overcome daily challenges?'
    ];
  }

  private _comprehensiveFallbackAnswer(question: string, mode: string): TutorResponse {
    const q = question.toLowerCase();

    // Deep topic matchers
    if (q.includes('melchizedek')) {
      return {
        answer: `### The Mysterious Melchizedek: King of Salem & Priest of the Most High God

Melchizedek is one of the most profound figures in biblical typology, appearing in **Genesis 14:18-20**, **Psalm 110:4**, and prominently in **Hebrews 5–7**.

#### 1. Scriptural Context
In Genesis 14, following Abraham's rescue of Lot, Melchizedek emerges:
> *"And Melchizedek king of Salem brought forth bread and wine: and he was the priest of the most high God. And he blessed him, and said, Blessed be Abram of the most high God, possessor of heaven and earth..."* (Genesis 14:18-19)

Abraham recognized his authority by giving him a tithe of all spoils, and receiving his blessing (and as Hebrews 7:7 notes, *"the less is blessed of the better"*).

#### 2. Original Hebrew Meaning
- **Melchizedek** (*Malki-Tzedek* - מַלְכִּי־צֶדֶק): "King of Righteousness".
- **Salem** (*Shalem* - שָׁלֵם): "Peace" (ancient Jerusalem).
Thus he is titled both the **King of Righteousness** and the **King of Peace**.

#### 3. Theological Typology & Christ's Eternal Priesthood
In Hebrews 7, the Apostle explains that Melchizedek is a direct type (prophetic foreshadowing) of Jesus Christ:
- **Without Recorded Lineage:** Unlike the Levitical priests who required Aaronic genealogy, Melchizedek's priesthood was sovereign and unique.
- **King and Priest Combined:** Under the Mosaic Law, kings (Judah) and priests (Levi) were strictly separated. Jesus and Melchizedek unite the royal and priestly offices.
- **Bread and Wine:** Melchizedek brought forth bread and wine to Abraham—prefiguring the Lord's Supper and Christ's sacrifice.

As Psalm 110:4 prophesied of Messiah: *"The LORD hath sworn, and will not repent, Thou art a priest for ever after the order of Melchizedek."*`,
        versesCited: ['Genesis 14:18-20', 'Psalm 110:4', 'Hebrews 7:1-17'],
        hebrewGreekWords: [
          { word: 'Malki-Tzedek (מַלְכִּי־צֶדֶק)', language: 'Hebrew', definition: 'My King is Righteousness' },
          { word: 'Shalem (שָׁלֵם)', language: 'Hebrew', definition: 'Peace, Completeness, Wholeness' }
        ],
        suggestedQuestions: [
          'Why is Christ\'s priesthood superior to the Levitical Aaronic priesthood?',
          'What did David mean by the prophetic oracle in Psalm 110:4?',
          'How does Abraham tithing to Melchizedek establish the principle of honor?'
        ]
      };
    }

    if (q.includes('justification') && q.includes('sanctification')) {
      return {
        answer: `### Justification vs. Sanctification: Foundational Doctrines of Salvation

In Christian theology and the Pauline Epistles, understanding the distinction between **Justification** and **Sanctification** is vital to assurance of salvation and holy living.

#### 1. Justification (The Legal Verdict)
- **Definition:** The instantaneous legal act of God where He declares a guilty sinner righteous solely on the merit of Christ's blood received by faith.
- **Tense:** Past / Completed (*"Being justified freely by his grace"* - Romans 3:24).
- **Agent:** God alone (Monergistic).
- **Key Scripture:** *"Therefore being justified by faith, we have peace with God through our Lord Jesus Christ."* (Romans 5:1)
- **Greek Term:** *Dikaiōsis* (δικαίωσις) — forensic declaration of righteousness.

#### 2. Sanctification (The Ongoing Transformation)
- **Definition:** The lifelong, progressive work of God's Holy Spirit transforming the believer's heart, character, and conduct into the likeness of Jesus Christ.
- **Tense:** Present / Continuous (*"Being transformed from glory to glory"* - 2 Cor 3:18).
- **Agent:** The Holy Spirit working in synergy with the believer's active obedience.
- **Key Scripture:** *"For this is the will of God, even your sanctification..."* (1 Thess 4:3)
- **Greek Term:** *Hagiasmos* (ἁγιασμός) — separation unto holiness and purity.

| Dimension | Justification | Sanctification |
| :--- | :--- | :--- |
| **Nature** | Positional (Legal Standing) | Practical (Moral Character) |
| **Duration** | Instantaneous | Lifelong Process |
| **Degree** | Complete & Equal in all believers | Progressive & Deepening |
| **Deliverance** | From the **Penalty** of Sin | From the **Power** of Sin |`,
        versesCited: ['Romans 5:1', 'Romans 8:30', '1 Corinthians 1:30', '1 Thessalonians 4:3'],
        hebrewGreekWords: [
          { word: 'Dikaiosyne (δικαιοσύνη)', language: 'Greek', definition: 'Righteousness, forensic justification' },
          { word: 'Hagios (ἅγιος)', language: 'Greek', definition: 'Set apart, holy, consecrated' }
        ],
        suggestedQuestions: [
          'What is Glorification and how does it complete the Golden Chain of Redemption in Romans 8:30?',
          'How does James 2:24 explain justification by works in comparison to Paul?',
          'What role does daily prayer and Bible study play in sanctification?'
        ]
      };
    }

    if (q.includes('armor') || q.includes('armour')) {
      return {
        answer: `### The Whole Armour of God (Ephesians 6:10-18)

In **Ephesians 6**, the Apostle Paul—writing while chained to a Roman imperial soldier—draws on both Roman battle gear and Old Testament imagery (Isaiah 59:17) to teach spiritual warfare.

> *"Put on the whole armour of God, that ye may be able to stand against the wiles of the devil. For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places."* (Ephesians 6:11-12)

#### The Six Divine Implements:
1. **Belt of Truth** (*Aletheia*): Roman *balteus* that held everything together. Integrity and the truth of God's Word anchor our inner life.
2. **Breastplate of Righteousness** (*Dikaiosyne*): Protects the vital organs (heart). Refers to Christ's imputed righteousness and walking in moral purity.
3. **Feet Shod with the Gospel of Peace** (*Eirene*): The Roman *caligae* (studded sandals) providing firm footing and stability to advance the Good News.
4. **Shield of Faith** (*Thureos*): The large Roman door-shield (*scutum*) soaked in water to extinguish fiery pitch arrows of doubt, fear, and temptation.
5. **Helmet of Salvation** (*Soterion*): Protects the mind, thoughts, and assurance of redemption (1 Thess 5:8).
6. **Sword of the Spirit** (*Machaira*): The Word of God (*Rhema theou*). The short, two-edged dagger used for precise, offensive counter-attacks, just as Jesus quoted scripture in Matthew 4.`,
        versesCited: ['Ephesians 6:10-18', 'Isaiah 59:17', 'Matthew 4:1-11', 'Hebrews 4:12'],
        hebrewGreekWords: [
          { word: 'Panoplia (πανοπλία)', language: 'Greek', definition: 'Full armor, complete suit of battle gear' },
          { word: 'Rhema (ῥῆμα)', language: 'Greek', definition: 'Spoken, specific utterance of God' }
        ],
        suggestedQuestions: [
          'Why does Paul conclude the Armor passage with "Praying always with all prayer" (Eph 6:18)?',
          'How did Jesus use the Word of God as a sword against Satan in the wilderness?',
          'What is the meaning of the fiery darts of the wicked one?'
        ]
      };
    }

    // General robust theological answer
    return {
      answer: `### Biblical Truth & Wisdom Regarding: "${question}"

*"All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, thoroughly furnished unto all good works."* (2 Timothy 3:16-17)

#### 1. Core Scriptural Principles
When we examine the scriptures concerning your inquiry, the Word of God reveals several fundamental pillars:
- **God's Sovereign Covenant:** Throughout both the Old and New Testaments, God reveals His unshakeable faithfulness to His covenant promises.
- **The Centrality of Christ:** In **John 5:39**, Jesus declared: *"Search the scriptures; for in them ye think ye have eternal life: and they are they which testify of me."* All scripture finds its ultimate climax and fulfillment in Christ.
- **Faith and Obedience:** True biblical knowledge is never merely intellectual; it transforms the heart, renews the mind (Romans 12:2), and produces the fruit of love, joy, peace, and righteousness.

#### 2. Original Language Insights
- In Hebrew, **Emunah** (אֱמוּנָה) denotes firmness, steadfast faithfulness, and trusting action.
- In Greek, **Aletheia** (ἀλήθεια) means truth, divine reality revealed to man, not hidden.

#### 3. Practical Application for Today
1. **Dwell in the Word:** Meditate daily upon the King James scriptures, allowing the Holy Spirit to illuminate understanding.
2. **Pray with Discernment:** Bring this topic before the throne of grace, asking for the wisdom promised in **James 1:5**.
3. **Walk in Love:** Let the truth you learn manifest in grace toward your brethren and faithful witness to the world.`,
      versesCited: ['2 Timothy 3:16-17', 'John 5:39', 'Romans 12:2', 'James 1:5'],
      hebrewGreekWords: [
        { word: 'Emunah (אֱמוּנָה)', language: 'Hebrew', definition: 'Faithfulness, steadfast trust' },
        { word: 'Aletheia (ἀλήθεια)', language: 'Greek', definition: 'Truth, divine reality' }
      ],
      suggestedQuestions: [
        'Can you provide specific King James scriptures that address this in depth?',
        'What is the historical context of the books that mention this topic?',
        'How does this theological truth apply to our daily prayer life?'
      ]
    };
  }
}
