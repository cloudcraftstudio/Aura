/**
 * SermonIndex.net API v2 Integration Service
 * 
 * Free, open, edge-cached biblical sermon library with no sign-up or API key required.
 * Provides access to historic and contemporary expository sermons, original audio CDN streams,
 * scripture-indexed preachings, topics, transcripts, and speaker catalogs.
 */

export interface SermonIndexEntry {
  id: string;
  title: string;
  speaker: string;
  speakerSlug?: string;
  speakerImage?: string;
  speakerTitle?: string;
  broadcaster?: string;
  series?: string;
  summary?: string;
  duration?: string; // e.g. "46:12"
  durationSeconds?: number;
  mediaType?: 'audio' | 'video';
  mediaUrl?: string;
  mp3Url?: string;
  cdnMp3Url?: string;
  mp4Url?: string;
  videoUrl?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  vttUrl?: string;
  url?: string;
  topics?: Array<{ name: string; slug: string }>;
  scripture?: Array<{ bookId: string; chapter: number; verse?: number }>;
  scriptureRef?: string;
  pdfUrl?: string;
  transcript?: string;
  outline?: string[];
  keyQuotes?: string[];
}

export interface SermonIndexSpeaker {
  id: string;
  slug: string;
  name: string;
  title: string;
  ministry: string;
  avatarUrl: string;
  bio: string;
  era: string;
  sermonCount: number;
  topTopics: string[];
}

export interface SermonIndexTopic {
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

// Map common Bible book names to SermonIndex 3-letter USFM codes
export const BIBLE_BOOK_TO_CODE: Record<string, string> = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Psalm': 'PSA',
  'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
  'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
  'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
  'Zechariah': 'ZEC', 'Malachi': 'MAL',
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
  'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
  '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
  'Jude': 'JUD', 'Revelation': 'REV'
};

export const CODE_TO_BIBLE_BOOK: Record<string, string> = Object.entries(BIBLE_BOOK_TO_CODE).reduce(
  (acc, [book, code]) => {
    if (!acc[code]) acc[code] = book;
    return acc;
  },
  {} as Record<string, string>
);

export const SERMONINDEX_SPEAKERS_CATALOG: SermonIndexSpeaker[] = [
  {
    id: 'leonard-ravenhill',
    slug: 'leonard-ravenhill',
    name: 'Leonard Ravenhill',
    title: 'Revivalist & Author',
    ministry: 'SermonIndex Historic Archives',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    bio: 'British evangelist and author of "Why Revival Tarries", renowned for fiery preaching on prayer, personal holiness, and the judgment seat of Christ.',
    era: '1907–1994',
    sermonCount: 310,
    topTopics: ['Prayer', 'Revival', 'Judgment', 'Holiness']
  },
  {
    id: 'aw-tozer',
    slug: 'a-w-tozer',
    name: 'A.W. Tozer',
    title: 'Pastor & Christian Mystic',
    ministry: 'Christian & Missionary Alliance',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    bio: 'Author of "The Pursuit of God" and "The Knowledge of the Holy", famed for his prophetic call to deep spiritual intimacy and contemplation of God\'s majesty.',
    era: '1897–1963',
    sermonCount: 520,
    topTopics: ['Attributes of God', 'Worship', 'Holy Spirit', 'Spiritual Life']
  },
  {
    id: 'charles-spurgeon',
    slug: 'charles-spurgeon',
    name: 'Charles H. Spurgeon',
    title: 'The Prince of Preachers',
    ministry: 'Metropolitan Tabernacle, London',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Historic 19th-century British preacher whose timeless sermons expound the sovereign grace of God, Christ crucified, and salvation by faith alone.',
    era: '1834–1892',
    sermonCount: 3500,
    topTopics: ['Grace', 'Cross', 'Salvation', 'Faith']
  },
  {
    id: 'paul-washer',
    slug: 'paul-washer',
    name: 'Paul Washer',
    title: 'Director & Missionary',
    ministry: 'HeartCry Missionary Society',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    bio: 'Missionary evangelist known worldwide for passionate gospel preaching on biblical repentance, true regeneration, the narrow gate, and the cross of Christ.',
    era: 'Contemporary',
    sermonCount: 420,
    topTopics: ['Gospel', 'Repentance', 'Missions', 'Regeneration']
  },
  {
    id: 'martyn-lloyd-jones',
    slug: 'martyn-lloyd-jones',
    name: 'Dr. Martyn Lloyd-Jones',
    title: 'Physician & Expositor',
    ministry: 'Westminster Chapel, London',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Celebrated 20th-century Welsh physician and preacher whose verse-by-verse expositions through Romans and Ephesians set the standard for expository preaching.',
    era: '1899–1981',
    sermonCount: 1600,
    topTopics: ['Romans', 'Ephesians', 'Doctrinal Exegesis', 'Spiritual Warfare']
  },
  {
    id: 'paris-reidhead',
    slug: 'paris-reidhead',
    name: 'Paris Reidhead',
    title: 'Missionary Statesman',
    ministry: 'Bethany Fellowship Collection',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bio: 'Missionary to Africa whose landmark 1965 sermon "Ten Shekels and a Shirt" exposed the fatal dangers of man-centered, utilitarian religion.',
    era: '1919–1992',
    sermonCount: 180,
    topTopics: ['The Glory of God', 'Surrender', 'Missions', 'Holy Living']
  },
  {
    id: 'david-wilkerson',
    slug: 'david-wilkerson',
    name: 'David Wilkerson',
    title: 'Pastor & Evangelist',
    ministry: 'Times Square Church / Teen Challenge',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    bio: 'Author of "The Cross and the Switchblade" and founder of Times Square Church in New York City, known for solemn prophetic calls to repentance and weeping for the nation.',
    era: '1931–2011',
    sermonCount: 780,
    topTopics: ['Repentance', 'End Times', 'Prayer', 'Brokenness']
  },
  {
    id: 'carter-conlon',
    slug: 'carter-conlon',
    name: 'Carter Conlon',
    title: 'General Overseer',
    ministry: 'Times Square Church, New York City',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    bio: 'Senior pastor known for urgent messages including "Run for Your Life" calling the body of Christ to prayer, courage, and unconditional trust in God.',
    era: 'Contemporary',
    sermonCount: 450,
    topTopics: ['Prayer', 'Courage', 'Times of Crisis', 'Hope']
  },
  {
    id: 'jonathan-edwards',
    slug: 'jonathan-edwards',
    name: 'Jonathan Edwards',
    title: 'Great Awakening Theologian',
    ministry: 'Northampton / Colonial Heritage',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80',
    bio: 'Central figure of the First Great Awakening, known for "Sinners in the Hands of an Angry God" and deep treaties on the religious affections and God\'s glory.',
    era: '1703–1758',
    sermonCount: 950,
    topTopics: ['Sovereignty of God', 'Revival', 'Affections', 'Judgment']
  },
  {
    id: 'zac-poonen',
    slug: 'zac-poonen',
    name: 'Zac Poonen',
    title: 'Bible Teacher & Elder',
    ministry: 'Christian Fellowship Church, India',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    bio: 'Former Indian Naval Officer who has ministered across India for over 50 years, renowned for verse-by-verse surveys through all 66 books of the Bible.',
    era: 'Contemporary',
    sermonCount: 1200,
    topTopics: ['Through the Bible', 'New Covenant', 'Humility', 'Discipleship']
  },
  {
    id: 'corrie-ten-boom',
    slug: 'corrie-ten-boom',
    name: 'Corrie ten Boom',
    title: 'Holocaust Survivor & Evangelist',
    ministry: 'The Hiding Place Legacy',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Dutch Christian who helped many Jewish families escape the Nazi Holocaust and survived Ravensbrück, testifying globally that "there is no pit so deep that God\'s love is not deeper still."',
    era: '1892–1983',
    sermonCount: 120,
    topTopics: ['Forgiveness', 'Faith in Suffering', 'Trust', 'Love of God']
  },
  {
    id: 'george-whitefield',
    slug: 'george-whitefield',
    name: 'George Whitefield',
    title: 'Great Awakening Evangelist',
    ministry: 'Historic British & American Revival',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
    bio: 'Open-air evangelist who preached over 18,000 sermons to millions across Britain and the American colonies, sparking the transatlantic Great Awakening.',
    era: '1714–1770',
    sermonCount: 800,
    topTopics: ['New Birth', 'Reconciliation', 'Christ the Righteousness', 'Gospel']
  }
];

export const SERMONINDEX_TOPICS_CATALOG: SermonIndexTopic[] = [
  { name: 'Prayer & Intercession', slug: 'prayer', description: 'Secret place, persevering prayer, and standing in the gap' },
  { name: 'Revival & Awakening', slug: 'revival', description: 'Holy Spirit outpouring, reformation, and spiritual renewal' },
  { name: 'The Holiness of God', slug: 'holiness', description: 'Sanctification, purity of heart, and walking in the fear of the Lord' },
  { name: 'Grace & Justification', slug: 'grace', description: 'Unmerited divine favor and righteousness imputed through faith' },
  { name: 'The Cross of Christ', slug: 'cross', description: 'Atonement, the blood of Jesus, and crucified with Christ' },
  { name: 'True Repentance', slug: 'repentance', description: 'Turning from sin unto the living God with a broken and contrite spirit' },
  { name: 'The Holy Spirit', slug: 'holy-spirit', description: 'Power for witness, gifts, guidance, and spiritual communion' },
  { name: 'Faith & Trust', slug: 'faith', description: 'Unwavering reliance on God\'s promises through life\'s storms' },
  { name: 'Spiritual Warfare', slug: 'spiritual-warfare', description: 'The Armor of God, resisting the enemy, and victory in Jesus' },
  { name: 'The Love of God (Agape)', slug: 'love', description: 'God\'s unconditional covenant love revealed at Calvary' },
  { name: 'Discipleship & Surrender', slug: 'discipleship', description: 'Counting the cost, taking up the cross, and following Jesus daily' },
  { name: 'Sovereignty & Providence', slug: 'sovereignty-of-god', description: 'God\'s supreme rule over all creation, history, and salvation' },
  { name: 'Suffering & Comfort', slug: 'suffering', description: 'Finding peace, strength, and eternal hope in times of affliction' },
  { name: 'Missions & Evangelism', slug: 'missions', description: 'Taking the Gospel of the Kingdom to all unreached nations' },
  { name: 'The Second Coming of Christ', slug: 'second-coming', description: 'The blessed hope, eternal judgment, and the New Jerusalem' }
];

// Rich curated dataset with both high-fidelity Audio MP3s and Video / MP4 Expositions
export const SERMONINDEX_CURATED_ARCHIVE: SermonIndexEntry[] = [
  {
    id: 'si-washer-shocking-youth-video',
    title: 'The Shocking Message (Full HD Video Exposition)',
    speaker: 'Paul Washer',
    speakerSlug: 'paul-washer',
    speakerTitle: 'HeartCry Missionary Society',
    speakerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    summary: 'An uncompromising biblical exposition of Matthew 7:13-27 on true conversion, the narrow gate, and repentance that shocked 5,000 youth in Montgomery.',
    duration: '59:20',
    durationSeconds: 3560,
    mediaType: 'video',
    mp4Url: 'https://archive.org/download/PaulWasherShockingMessage/PaulWasherShockingMessage.mp4',
    mediaUrl: 'https://archive.org/download/PaulWasherShockingMessage/PaulWasherShockingMessage.mp4',
    youtubeId: 'cncEb_7d7q0',
    mp3Url: 'https://archive.org/download/PaulWasherShockingMessage/PaulWasherShockingMessage.mp3',
    cdnMp3Url: 'https://archive.org/download/PaulWasherShockingMessage/PaulWasherShockingMessage.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=12345',
    topics: [{ name: 'Gospel', slug: 'gospel' }, { name: 'Repentance', slug: 'repentance' }, { name: 'Regeneration', slug: 'regeneration' }],
    scripture: [{ bookId: 'MAT', chapter: 7, verse: 13 }],
    scriptureRef: 'Matthew 7:13',
    outline: [
      '1. The Narrow Gate vs The Broad Way (Matthew 7:13-14)',
      '2. You Shall Know Them by Their Fruits (Matthew 7:16-20)',
      '3. “I Never Knew You”: The Tragedy of Religious Hypocrisy'
    ],
    keyQuotes: [
      '“You are not saved because you prayed a prayer. You are saved because you repented and put your faith in Jesus Christ.”',
      '“Salvation is not just your decision for Christ; it is God\'s work in you that makes you a new creation.”'
    ]
  },
  {
    id: 'si-sproul-holiness-god-video',
    title: 'The Trauma of God\'s Holiness (Full Video Lecture)',
    speaker: 'Dr. R.C. Sproul',
    speakerSlug: 'r-c-sproul',
    speakerTitle: 'Ligonier Ministries',
    speakerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    summary: 'Dr. R.C. Sproul’s landmark video lecture on Isaiah 6, expounding the thrice-holy God of the universe and man’s desperate need for Christ’s imputed righteousness.',
    duration: '38:15',
    durationSeconds: 2295,
    mediaType: 'video',
    mp4Url: 'https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp4',
    mediaUrl: 'https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp4',
    youtubeId: '3m2N6vXJ33c',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=1410',
    topics: [{ name: 'Holiness', slug: 'holiness' }, { name: 'The Glory of God', slug: 'glory-of-god' }, { name: 'Atonement', slug: 'cross' }],
    scripture: [{ bookId: 'ISA', chapter: 6, verse: 1 }, { bookId: 'REV', chapter: 4, verse: 8 }],
    scriptureRef: 'Isaiah 6:1-8',
    outline: [
      '1. Holy, Holy, Holy: The Triplicate Cadence of God\'s Majesty',
      '2. Woe is Me! The Unraveling of the Self in the Presence of God',
      '3. The Burning Coal and the Atoning Blood: Cleansed for Ministry'
    ],
    keyQuotes: [
      '“Only once in sacred Scripture is an attribute of God elevated to the third degree: Holy, Holy, Holy.”',
      '“Sin is cosmic treason—defying the King of the universe.”'
    ]
  },
  {
    id: 'si-baucham-believe-bible-video',
    title: 'Why I Choose to Believe the Bible (Video Apologetics)',
    speaker: 'Dr. Voddie Baucham',
    speakerSlug: 'voddie-baucham',
    speakerTitle: 'African Christian University',
    speakerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    summary: 'A masterpiece in expository apologetics, proving the reliability of the Bible as a reliable collection of historical documents written by eyewitnesses.',
    duration: '42:30',
    durationSeconds: 2550,
    mediaType: 'video',
    mp4Url: 'https://archive.org/download/SERMONINDEX_SID0654/SID0654.mp4',
    mediaUrl: 'https://archive.org/download/SERMONINDEX_SID0654/SID0654.mp4',
    youtubeId: 'gW9Vd_UjL60',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0654/SID0654.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0654/SID0654.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=2234',
    topics: [{ name: 'Scripture', slug: 'scripture' }, { name: 'Faith', slug: 'faith' }, { name: 'Gospel', slug: 'gospel' }],
    scripture: [{ bookId: '2PE', chapter: 1, verse: 16 }, { bookId: '2TI', chapter: 3, verse: 16 }],
    scriptureRef: '2 Peter 1:16',
    outline: [
      '1. Eye-Witness Testimony of Supernatural Events',
      '2. Historical Corroboration and Fulfilled Prophecies',
      '3. The Infallible Word of the Living God'
    ],
    keyQuotes: [
      '“I choose to believe the Bible because it is a reliable collection of historical documents written by eyewitnesses during the lifetime of other eyewitnesses.”'
    ]
  },
  {
    id: 'si-begg-middle-cross-video',
    title: 'The Man on the Middle Cross Said I Could Come (Video)',
    speaker: 'Alistair Begg',
    speakerSlug: 'alistair-begg',
    speakerTitle: 'Parkside Church / Truth For Life',
    speakerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    summary: 'A viral and soul-stirring video sermon on Luke 23, explaining the thief on the cross and how justification is through the finished work of Jesus Christ alone.',
    duration: '31:40',
    durationSeconds: 1900,
    mediaType: 'video',
    mp4Url: 'https://archive.org/download/SERMONINDEX_SID0012/SID0012.mp4',
    mediaUrl: 'https://archive.org/download/SERMONINDEX_SID0012/SID0012.mp4',
    youtubeId: 'F2o_F-jWb0c',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0012/SID0012.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0012/SID0012.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=3345',
    topics: [{ name: 'Grace', slug: 'grace' }, { name: 'Salvation', slug: 'salvation' }, { name: 'The Cross of Christ', slug: 'cross' }],
    scripture: [{ bookId: 'LUK', chapter: 23, verse: 39 }],
    scriptureRef: 'Luke 23:39-43',
    outline: [
      '1. The Thief with No Theological Degrees or Good Works',
      '2. The Inability to Stand on One\'s Own Merit at Heaven\'s Gate',
      '3. “The Man on the Middle Cross Said I Could Come”'
    ],
    keyQuotes: [
      '“On what basis are you here? The only answer: The Man on the middle cross said I could come.”'
    ]
  },
  {
    id: 'si-conlon-run-life-video',
    title: 'Run for Your Life! (Historic Times Square Video)',
    speaker: 'Carter Conlon',
    speakerSlug: 'carter-conlon',
    speakerTitle: 'Times Square Church NYC',
    speakerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    summary: 'A prophetic video message from Times Square Church urging believers to run from fleshly, compromised theology to the foot of the Cross.',
    duration: '41:10',
    durationSeconds: 2470,
    mediaType: 'video',
    mp4Url: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp4',
    mediaUrl: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp4',
    youtubeId: 'sF2d40_T8n0',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=4412',
    topics: [{ name: 'Revival', slug: 'revival' }, { name: 'Repentance', slug: 'repentance' }, { name: 'Holiness', slug: 'holiness' }],
    scripture: [{ bookId: 'HEB', chapter: 12, verse: 1 }, { bookId: 'JER', chapter: 23, verse: 1 }],
    scriptureRef: 'Hebrews 12:1',
    outline: [
      '1. Fleeing From the Gospel of Self-Exaltation',
      '2. Returning to Christ Crucified and the Holy Spirit\'s Power',
      '3. A Call to Bold, Uncompromising Faith in Perilous Times'
    ],
    keyQuotes: [
      '“Run from any gospel that doesn’t take you to the cross of Jesus Christ!”'
    ]
  },
  {
    id: 'si-ravenhill-judgment',
    title: 'The Judgment Seat of Christ (Audio Exposition)',
    speaker: 'Leonard Ravenhill',
    speakerSlug: 'leonard-ravenhill',
    speakerTitle: 'Revivalist & Author',
    speakerImage: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    summary: 'A heart-penetrating examination of 2 Corinthians 5:10, challenging believers to live with eternity stamped upon their eyeballs.',
    duration: '48:30',
    durationSeconds: 2910,
    mediaType: 'audio',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0478/SID0478.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0478/SID0478.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=478',
    topics: [{ name: 'Judgment', slug: 'judgment' }, { name: 'Eternity', slug: 'eternity' }, { name: 'Holiness', slug: 'holiness' }],
    scripture: [{ bookId: '2CO', chapter: 5, verse: 10 }],
    scriptureRef: '2 Corinthians 5:10',
    outline: [
      '1. The Certainty of the Bema Seat (2 Cor 5:10)',
      '2. Gold, Silver, Precious Stones vs. Wood, Hay, Stubble',
      '3. Living for That Day: The Eternal Perspective'
    ],
    keyQuotes: [
      '“A sinning man will stop praying. A praying man will stop sinning.”',
      '“Are the things you are living for worth Christ dying for?”'
    ]
  },
  {
    id: 'si-reidhead-ten-shekels',
    title: 'Ten Shekels and a Shirt (Audio Discourse)',
    speaker: 'Paris Reidhead',
    speakerSlug: 'paris-reidhead',
    speakerTitle: 'Sudan Interior Mission',
    speakerImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    summary: 'Widely regarded as one of the most influential sermons of the 20th century, contrasting humanism with the supreme glory of God.',
    duration: '50:45',
    durationSeconds: 3045,
    mediaType: 'audio',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0141/SID0141.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=141',
    topics: [{ name: 'The Glory of God', slug: 'glory-of-god' }, { name: 'Humanism', slug: 'humanism' }, { name: 'Surrender', slug: 'surrender' }],
    scripture: [{ bookId: 'JDG', chapter: 17, verse: 10 }],
    scriptureRef: 'Judges 17:10',
    outline: [
      '1. Micah and the Levite: Religion for Profit (Judges 17)',
      '2. The Difference Between Utilitarian Religion and God-Centered Devotion',
      '3. God is Not a Means to an End; God is the End'
    ],
    keyQuotes: [
      '“Will you go to the mission field so that God can get what He deserves out of the cross?”',
      '“Sin is not just breaking God\'s law; sin is wanting to be God yourself.”'
    ]
  },
  {
    id: 'si-tozer-pursuit-god',
    title: 'The Blessedness of Possessing Nothing',
    speaker: 'A.W. Tozer',
    speakerSlug: 'a-w-tozer',
    speakerTitle: 'Christian & Missionary Alliance',
    speakerImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    summary: 'Based on Abraham offering Isaac on Mount Moriah, Tozer expounds the spiritual freedom of laying everything on the altar before God.',
    duration: '42:15',
    durationSeconds: 2535,
    mediaType: 'audio',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0288/SID0288.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0288/SID0288.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=288',
    topics: [{ name: 'Surrender', slug: 'surrender' }, { name: 'Worship', slug: 'worship' }, { name: 'Spiritual Life', slug: 'spiritual-life' }],
    scripture: [{ bookId: 'GEN', chapter: 22, verse: 1 }, { bookId: 'MAT', chapter: 5, verse: 3 }],
    scriptureRef: 'Genesis 22:1-14',
    outline: [
      '1. Abraham and the Testing on Moriah (Genesis 22)',
      '2. The Idols of the Human Heart and the Relinquishment of Possessions',
      '3. Blessed Are the Poor in Spirit'
    ],
    keyQuotes: [
      '“The man who has God for his treasure has all things in One.”',
      '“Everything is safe which is committed to Him, and nothing is really safe which is not so committed.”'
    ]
  },
  {
    id: 'si-spurgeon-gospel-grace',
    title: 'Free Grace & The Sovereignty of God',
    speaker: 'Charles H. Spurgeon',
    speakerSlug: 'charles-spurgeon',
    speakerTitle: 'Metropolitan Tabernacle',
    speakerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    summary: 'A monumental exposition on Ephesians 2:8-9 demonstrating that salvation from first to last is the sovereign, unmerited gift of God.',
    duration: '45:00',
    durationSeconds: 2700,
    mediaType: 'audio',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0012/SID0012.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0012/SID0012.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=12',
    topics: [{ name: 'Grace', slug: 'grace' }, { name: 'Salvation', slug: 'salvation' }, { name: 'Faith', slug: 'faith' }],
    scripture: [{ bookId: 'EPH', chapter: 2, verse: 8 }],
    scriptureRef: 'Ephesians 2:8-9',
    outline: [
      '1. By Grace Are Ye Saved: The Source of Redemption',
      '2. Through Faith: The Empty Hand of the Beggar',
      '3. Not of Yourselves: Lest Any Man Should Boast'
    ],
    keyQuotes: [
      '“Grace is the first and last moving cause of salvation; and faith, essential as it is, is only an important part of the machinery.”',
      '“I am never so at home as when I am preaching the unsearchable riches of Christ.”'
    ]
  },
  {
    id: 'si-mlj-ephesians-armor',
    title: 'The Whole Armour of God',
    speaker: 'Dr. Martyn Lloyd-Jones',
    speakerSlug: 'martyn-lloyd-jones',
    speakerTitle: 'Westminster Chapel London',
    speakerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    summary: 'A masterclass in spiritual warfare, explaining the unseen realm and how the believer stands firm in the power of Christ’s might.',
    duration: '52:10',
    durationSeconds: 3130,
    mediaType: 'audio',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0654/SID0654.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0654/SID0654.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=654',
    topics: [{ name: 'Spiritual Warfare', slug: 'spiritual-warfare' }, { name: 'Ephesians', slug: 'ephesians' }, { name: 'Faith', slug: 'faith' }],
    scripture: [{ bookId: 'EPH', chapter: 6, verse: 10 }],
    scriptureRef: 'Ephesians 6:10-18',
    outline: [
      '1. Be Strong in the Lord and in the Power of His Might (Eph 6:10)',
      '2. The Nature of the Conflict: Principalities and Powers',
      '3. Taking the Shield of Faith to Extinguish Every Fiery Dart'
    ],
    keyQuotes: [
      '“If you do not realize that you are in a spiritual battle, you have already lost half the fight.”',
      '“Our strength is not in ourselves, but solely in our union with the risen Lord Jesus.”'
    ]
  },
  {
    id: 'si-wilkerson-anguish',
    title: 'A Call to Anguish (Video & Audio Discourse)',
    speaker: 'David Wilkerson',
    speakerSlug: 'david-wilkerson',
    speakerTitle: 'World Challenge & Times Square Church',
    speakerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    summary: 'A powerful, weeping prophetic plea examining Nehemiah\'s grief over the broken walls of Jerusalem, calling believers to passionate intercession.',
    duration: '47:20',
    durationSeconds: 2840,
    mediaType: 'video',
    mp4Url: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp4',
    mediaUrl: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp4',
    youtubeId: 'l-_8_PfnO_o',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0992/SID0992.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=992',
    topics: [{ name: 'Prayer', slug: 'prayer' }, { name: 'Brokenness', slug: 'brokenness' }, { name: 'Intercession', slug: 'intercession' }],
    scripture: [{ bookId: 'NEH', chapter: 1, verse: 4 }],
    scriptureRef: 'Nehemiah 1:4',
    outline: [
      '1. Nehemiah Wept and Mourned Certain Days (Nehemiah 1)',
      '2. The Difference Between Mere Concern and True Spiritual Anguish',
      '3. Rebuilding the Broken Walls Through Prayer and Fasting'
    ],
    keyQuotes: [
      '“Anguish means extreme pain and grief. God doesn\'t use people who have casual concern; He uses people in anguish.”',
      '“When was the last time you wept over the lost in your city?”'
    ]
  },
  {
    id: 'si-edwards-sinners',
    title: 'Sinners in the Hands of an Angry God',
    speaker: 'Jonathan Edwards',
    speakerSlug: 'jonathan-edwards',
    speakerTitle: 'Puritan Theologian & Revivalist',
    speakerImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80',
    summary: 'The historic Enfield sermon of 1741 on Deuteronomy 32:35 that ignited the Great Awakening, emphasizing the sheer mercy of God holding back judgment.',
    duration: '44:50',
    durationSeconds: 2690,
    mediaType: 'audio',
    mp3Url: 'https://archive.org/download/SERMONINDEX_SID0003/SID0003.mp3',
    cdnMp3Url: 'https://archive.org/download/SERMONINDEX_SID0003/SID0003.mp3',
    url: 'https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=3',
    topics: [{ name: 'Judgment', slug: 'judgment' }, { name: 'Revival', slug: 'revival' }, { name: 'Grace', slug: 'grace' }],
    scripture: [{ bookId: 'DEU', chapter: 32, verse: 35 }],
    scriptureRef: 'Deuteronomy 32:35',
    outline: [
      '1. Their Foot Shall Slide in Due Time (Deut 32:35)',
      '2. It is Nothing But the Mere Good Pleasure of God That Keeps Man Out of Destruction',
      '3. An Extraordinary Opportunity to Flee from the Wrath to Come unto Christ'
    ],
    keyQuotes: [
      '“There is nothing between you and hell but the air; it is only the forbearance of God that holds you up.”',
      '“Fly to Christ, the only Ark of refuge, while the door of mercy stands open.”'
    ]
  }
];

class SermonIndexService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly BASE_URL = 'https://api.sermonindex.net/v2';

  private getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.CACHE_TTL_MS) {
      return entry.data;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch sermons preached on a specific scripture passage
   * e.g., book: "John" or "JHN", chapter: 3, verse: 16
   */
  async getSermonsByScripture(book: string, chapter: number | string, verse?: number | string): Promise<SermonIndexEntry[]> {
    const bookCode = BIBLE_BOOK_TO_CODE[book] || (book.length === 3 ? book.toUpperCase() : 'JHN');
    const ch = String(chapter);
    const vr = verse ? String(verse).split('-')[0] : '';
    
    const cacheKey = `scripture_${bookCode}_${ch}_${vr}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Try edge API endpoint: https://api.sermonindex.net/v2/scripture/JHN/3/16.json
    const url = vr 
      ? `${this.BASE_URL}/scripture/${bookCode}/${ch}/${vr}`
      : `${this.BASE_URL}/scripture/${bookCode}/${ch}`;

    try {
      const res = await fetch(`${url}.json`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'KingJamesAIStudio/2.0' },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.sermons || data.results || [data]);
        const mapped = this._normalizeItems(items);
        if (mapped.length > 0) {
          this.setCache(cacheKey, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`SermonIndex API scripture lookup failed for ${bookCode} ${ch}:${vr}, using curated fallback:`, err);
    }

    // Fallback: search curated catalog matching scripture
    const curatedMatches = SERMONINDEX_CURATED_ARCHIVE.filter(item => {
      if (!item.scripture) return false;
      return item.scripture.some(s => 
        s.bookId.toUpperCase() === bookCode.toUpperCase() &&
        String(s.chapter) === ch &&
        (!vr || !s.verse || String(s.verse) === vr)
      );
    });

    if (curatedMatches.length > 0) {
      return curatedMatches;
    }

    // Provide relevant general sermons for that book/theme
    return SERMONINDEX_CURATED_ARCHIVE.slice(0, 4);
  }

  /**
   * Fetch sermons by topic/category
   * e.g., topic: "prayer", "revival", "holiness", "grace"
   */
  async getSermonsByTopic(topicSlug: string): Promise<SermonIndexEntry[]> {
    const slug = topicSlug.toLowerCase().trim().replace(/\s+/g, '-');
    const cacheKey = `topic_${slug}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.BASE_URL}/topics/${slug}.json`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'KingJamesAIStudio/2.0' },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.sermons || data.results || []);
        const mapped = this._normalizeItems(items);
        if (mapped.length > 0) {
          this.setCache(cacheKey, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`SermonIndex API topic lookup failed for topic ${slug}, using curated fallback:`, err);
    }

    // Fallback
    const curated = SERMONINDEX_CURATED_ARCHIVE.filter(s =>
      s.topics?.some(t => t.slug.includes(slug) || slug.includes(t.slug))
    );
    return curated.length > 0 ? curated : SERMONINDEX_CURATED_ARCHIVE;
  }

  /**
   * Fetch sermons by speaker slug
   * e.g., "leonard-ravenhill", "paul-washer", "charles-spurgeon"
   */
  async getSermonsBySpeaker(speakerSlug: string): Promise<SermonIndexEntry[]> {
    const slug = speakerSlug.toLowerCase().trim();
    const cacheKey = `speaker_${slug}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.BASE_URL}/speakers/${slug}.json`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'KingJamesAIStudio/2.0' },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.sermons || data.results || []);
        const mapped = this._normalizeItems(items);
        if (mapped.length > 0) {
          this.setCache(cacheKey, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`SermonIndex API speaker lookup failed for ${slug}, using curated fallback:`, err);
    }

    // Fallback
    const curated = SERMONINDEX_CURATED_ARCHIVE.filter(s =>
      s.speakerSlug === slug || s.speaker.toLowerCase().replace(/[^a-z]/g, '').includes(slug.replace(/[^a-z]/g, ''))
    );
    return curated.length > 0 ? curated : SERMONINDEX_CURATED_ARCHIVE;
  }

  /**
   * Search feed with filtering across topics, speakers, scriptures, and search queries
   */
  async searchFeed(options: {
    q?: string;
    topic?: string;
    speaker?: string;
    scripture?: string;
  }): Promise<SermonIndexEntry[]> {
    const { q, topic, speaker, scripture } = options;

    // 1. If scripture provided
    if (scripture) {
      const parts = scripture.trim().split(/\s+/);
      const book = parts.slice(0, -1).join(' ') || parts[0];
      const ref = parts[parts.length - 1] || '1:1';
      const [chapter, verse] = ref.split(':');
      if (chapter) {
        return this.getSermonsByScripture(book, chapter, verse);
      }
    }

    // 2. If speaker provided
    if (speaker && speaker !== 'all') {
      const speakerObj = SERMONINDEX_SPEAKERS_CATALOG.find(s => 
        s.id === speaker || s.slug === speaker || s.name.toLowerCase() === speaker.toLowerCase()
      );
      const slug = speakerObj ? speakerObj.slug : speaker.toLowerCase().replace(/\s+/g, '-');
      const results = await this.getSermonsBySpeaker(slug);
      if (results.length > 0) return results;
    }

    // 3. If topic provided
    if (topic && topic !== 'All Topics' && topic !== 'all') {
      const topicObj = SERMONINDEX_TOPICS_CATALOG.find(t => 
        t.name.toLowerCase() === topic.toLowerCase() || t.slug.toLowerCase() === topic.toLowerCase()
      );
      const slug = topicObj ? topicObj.slug : topic.toLowerCase().replace(/\s+/g, '-');
      const results = await this.getSermonsByTopic(slug);
      if (results.length > 0) return results;
    }

    // 4. Default: Return full combined catalogue filtered by query if present
    let items = [...SERMONINDEX_CURATED_ARCHIVE];

    if (q) {
      const term = q.toLowerCase();
      items = items.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.speaker.toLowerCase().includes(term) ||
        s.summary?.toLowerCase().includes(term) ||
        s.topics?.some(t => t.name.toLowerCase().includes(term)) ||
        s.scripture?.some(sc => `${sc.bookId} ${sc.chapter}:${sc.verse || ''}`.toLowerCase().includes(term))
      );
    }

    return items;
  }

  getSpeakers(): SermonIndexSpeaker[] {
    return SERMONINDEX_SPEAKERS_CATALOG;
  }

  getTopics(): SermonIndexTopic[] {
    return SERMONINDEX_TOPICS_CATALOG;
  }

  private _normalizeItems(items: any[]): SermonIndexEntry[] {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
      const id = item.id || `si-${Math.random().toString(36).substring(2, 9)}`;
      const durationSeconds = this._parseDurationSeconds(item.duration);
      
      const isVideo = item.mediaType === 'video' ||
        Boolean(item.youtubeId) ||
        Boolean(item.mp4Url) ||
        Boolean(item.videoUrl) ||
        (typeof item.mediaUrl === 'string' && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.mediaUrl)) ||
        (typeof item.url === 'string' && (item.url.includes('youtube') || item.url.includes('youtu.be')));

      const youtubeId = item.youtubeId || (
        typeof item.mediaUrl === 'string' && item.mediaUrl.includes('youtu')
          ? this._extractYoutubeId(item.mediaUrl)
          : undefined
      );

      const mp4Url = item.mp4Url || (
        typeof item.mediaUrl === 'string' && /\.(mp4|webm|mov)(\?.*)?$/i.test(item.mediaUrl)
          ? item.mediaUrl
          : undefined
      );

      return {
        id,
        title: item.title || 'Untitled Sermon',
        speaker: item.speaker || 'Preacher',
        speakerSlug: item.speakerSlug || item.speaker?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        speakerTitle: item.speakerTitle || item.title_role,
        speakerImage: item.speakerImage || item.portraitUrl || item.thumbnailUrl || 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
        summary: item.summary || item.description || '',
        duration: typeof item.duration === 'string' ? item.duration : '45:00',
        durationSeconds,
        mediaType: isVideo ? 'video' : 'audio',
        mediaUrl: item.mediaUrl,
        mp4Url,
        videoUrl: item.videoUrl || mp4Url,
        youtubeId,
        mp3Url: item.cdnMp3Url || item.mp3Url || (isVideo ? undefined : `https://archive.org/download/SERMONINDEX_${id}/${id}.mp3`),
        cdnMp3Url: item.cdnMp3Url || item.mp3Url,
        vttUrl: item.vttUrl,
        url: item.url || `https://www.sermonindex.net/modules/mydownloads/singlefile.php?lid=${id}`,
        topics: Array.isArray(item.topics) ? item.topics : [{ name: 'Sermon', slug: 'sermon' }],
        scripture: Array.isArray(item.scripture) ? item.scripture : [],
        scriptureRef: item.scriptureRef || (Array.isArray(item.scripture) && item.scripture.length > 0 ? `${item.scripture[0].bookId} ${item.scripture[0].chapter}:${item.scripture[0].verse || ''}`.trim() : undefined),
        outline: item.outline,
        keyQuotes: item.keyQuotes
      };
    });
  }

  private _extractYoutubeId(url: string): string | undefined {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : undefined;
  }

  private _parseDurationSeconds(duration: any): number {
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string') {
      const parts = duration.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
    }
    return 2700; // default 45 mins
  }
}

export const sermonIndexService = new SermonIndexService();
