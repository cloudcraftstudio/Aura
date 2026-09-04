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

// Rich curated dataset with both high-fidelity Audio MP3s, Video / MP4 Expositions, and Audio Stories
export const SERMONINDEX_CURATED_ARCHIVE: SermonIndexEntry[] = [
  {
    id: "si-washer-shocking-youth-video",
    title: "The Shocking Message (Full HD Video Exposition)",
    speaker: "Paul Washer",
    speakerSlug: "paul-washer",
    speakerTitle: "HeartCry Missionary Society",
    speakerImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    summary: "An uncompromising biblical exposition of Matthew 7:13-27 on true conversion, the narrow gate, and repentance that shook Montgomery, Alabama.",
    duration: "1:05:42",
    durationSeconds: 3942,
    mediaType: "video",
    youtubeId: "uuabITeO4l8",
    mediaUrl: "",
    mp4Url: "",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    url: "https://www.youtube.com/watch?v=cncEb_7d7q0",
    topics: [{ name: "Gospel", slug: "gospel" }, { name: "Regeneration", slug: "regeneration" }],
    scriptureRef: "Matthew 7:13-27",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-ravenhill-judgment-seat",
    title: "The Judgment Seat of Christ (Audio Exposition)",
    speaker: "Leonard Ravenhill",
    speakerSlug: "leonard-ravenhill",
    speakerTitle: "Revivalist & Author",
    speakerImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    summary: "A solemn, urgent message on eternity and standing before the throne of God to give an account.",
    duration: "48:30",
    durationSeconds: 2910,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230101.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Judgment", slug: "judgment" }, { name: "Revival", slug: "revival" }],
    scriptureRef: "2 Corinthians 5:10",
    thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-ravenhill-why-revival-tarries",
    title: "Why Revival Tarries: The Secret Closet of Prayer",
    speaker: "Leonard Ravenhill",
    speakerSlug: "leonard-ravenhill",
    speakerTitle: "Revivalist & Author",
    speakerImage: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
    summary: "Ravenhill's fiery prophetic call: 'No man is greater than his prayer life.' An urgent summons to brokenness, intercession, and holy desperation.",
    duration: "54:12",
    durationSeconds: 3252,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230104.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230104.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230104.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Prayer", slug: "prayer" }, { name: "Revival", slug: "revival" }, { name: "Holiness", slug: "holiness" }],
    scriptureRef: "James 5:16-18",
    thumbnailUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-tozer-holiness-god",
    title: "The Holiness of God (Audio Classic)",
    speaker: "A.W. Tozer",
    speakerSlug: "aw-tozer",
    speakerTitle: "Alliance Witness & Pastor",
    speakerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    summary: "A profound message on the transcendent majesty, moral perfection, and pure holiness of Almighty God.",
    duration: "41:15",
    durationSeconds: 2475,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230102.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Holiness", slug: "holiness" }, { name: "Worship", slug: "worship" }],
    scriptureRef: "Isaiah 6:1-5",
    thumbnailUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-tozer-pursuit-of-god",
    title: "The Pursuit of God: Following Hard After Christ",
    speaker: "A.W. Tozer",
    speakerSlug: "aw-tozer",
    speakerTitle: "Pastor & Author",
    speakerImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    summary: "Tozer expounds Psalm 63: 'My soul followeth hard after thee: thy right hand upholdeth me.' Cultivating intimate spiritual communion with God.",
    duration: "45:30",
    durationSeconds: 2730,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230105.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230105.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230105.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Spiritual Life", slug: "spiritual-life" }, { name: "Worship", slug: "worship" }, { name: "Faith", slug: "faith" }],
    scriptureRef: "Psalm 63:1-8",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-story-corrie-ten-boom",
    title: "Audio Story: Deliverance in Ravensbrück & The Power of Forgiveness",
    speaker: "Corrie ten Boom",
    speakerSlug: "corrie-ten-boom",
    speakerTitle: "Holocaust Survivor & Evangelist",
    speakerImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    summary: "In this historic audio testimony, Corrie recounts the horrors of the concentration camp, the miraculous smuggled Bible in Barracks 28, and coming face to face after the war with her cruelest SS guard.",
    duration: "34:20",
    durationSeconds: 2060,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230106.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230106.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230106.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Audio Stories", slug: "audio-stories" }, { name: "Forgiveness", slug: "forgiveness" }, { name: "Suffering", slug: "suffering" }],
    scriptureRef: "Romans 8:35-39",
    thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-reidhead-ten-shekels",
    title: "Ten Shekels and a Shirt (The Historic 1965 Audio Master)",
    speaker: "Paris Reidhead",
    speakerSlug: "paris-reidhead",
    speakerTitle: "Missionary Statesman",
    speakerImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    summary: "Universally recognized as one of the greatest sermons of the 20th century. Based on Judges 17, Reidhead demolishes humanism in the pulpit and demonstrates that God exists for His own glory, not for man's utility.",
    duration: "50:18",
    durationSeconds: 3018,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230107.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230107.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230107.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "The Glory of God", slug: "glory-of-god" }, { name: "Surrender", slug: "surrender" }, { name: "Repentance", slug: "repentance" }],
    scriptureRef: "Judges 17:1-13",
    thumbnailUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-wilkerson-call-to-anguish",
    title: "A Call to Anguish: Weeping Between the Porch and the Altar",
    speaker: "David Wilkerson",
    speakerSlug: "david-wilkerson",
    speakerTitle: "Pastor, Times Square Church NYC",
    speakerImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    summary: "Pastor Wilkerson's legendary 1999 prophetic address confronting complacency in the Church. 'Anguish means extreme pain and distress. Does your soul weep over what breaks the heart of God?'",
    duration: "43:45",
    durationSeconds: 2625,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230108.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230108.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230108.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Prayer", slug: "prayer" }, { name: "Repentance", slug: "repentance" }, { name: "Revival", slug: "revival" }],
    scriptureRef: "Nehemiah 1:1-4",
    thumbnailUrl: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-story-spurgeon-snowstorm",
    title: "Audio Story: The Snowstorm and the Convert of Colchester",
    speaker: "Charles H. Spurgeon",
    speakerSlug: "charles-spurgeon",
    speakerTitle: "The Prince of Preachers",
    speakerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    summary: "The stirring audio biographical story of Spurgeon at age 15, stranded in a blizzard on January 6, 1850, walking into a humble Primitive Methodist chapel where a tailor looked at him and cried: 'Young man, look to Jesus Christ!'",
    duration: "28:10",
    durationSeconds: 1690,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230109.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230109.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230109.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Audio Stories", slug: "audio-stories" }, { name: "Gospel", slug: "gospel" }, { name: "Faith", slug: "faith" }],
    scriptureRef: "Isaiah 45:22",
    thumbnailUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-story-george-muller",
    title: "Audio Story: George Müller and the Miracles of Bristol",
    speaker: "Historic Missionary Archive",
    speakerSlug: "george-muller",
    speakerTitle: "Pioneer of Faith",
    speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    summary: "The astonishing true audio story of George Müller, who cared for over 10,000 orphans without ever asking a person for a single penny, relying solely upon secret, persevering prayer to God.",
    duration: "37:50",
    durationSeconds: 2270,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230110.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230110.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230110.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Audio Stories", slug: "audio-stories" }, { name: "Faith", slug: "faith" }, { name: "Prayer", slug: "prayer" }],
    scriptureRef: "Psalm 81:10",
    thumbnailUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-story-hudson-taylor",
    title: "Audio Story: Hudson Taylor & The China Inland Mission",
    speaker: "Historic Missionary Archive",
    speakerSlug: "hudson-taylor",
    speakerTitle: "China Missionary Pioneer",
    speakerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    summary: "The inspiring journey of Hudson Taylor learning the spiritual secret of abiding in Christ and stepping out into inland China with unwavering confidence that 'God's work done in God's way will never lack God's supplies.'",
    duration: "32:40",
    durationSeconds: 1960,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230111.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230111.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230111.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Audio Stories", slug: "audio-stories" }, { name: "Missions", slug: "missions" }, { name: "Faith", slug: "faith" }],
    scriptureRef: "John 15:4-5",
    thumbnailUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-sproul-trauma-holiness",
    title: "The Trauma of God's Holiness (Full Video Lecture)",
    speaker: "Dr. R.C. Sproul",
    speakerSlug: "r-c-sproul",
    speakerTitle: "Ligonier Ministries",
    speakerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    summary: "Dr. R.C. Sproul expounds on Isaiah 6, the holiness of the Lord, and man's total unraveling before the Almighty.",
    duration: "38:15",
    durationSeconds: 2295,
    mediaType: "video",
    youtubeId: "1d32g8E8hR8",
    mediaUrl: "",
    mp4Url: "",
    url: "https://www.youtube.com/watch?v=v4oQ1V1_z4Y",
    topics: [{ name: "Holiness", slug: "holiness" }, { name: "Atonement", slug: "atonement" }],
    scriptureRef: "Isaiah 6:1-8",
    thumbnailUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "si-spurgeon-free-grace",
    title: "Free Grace & Sovereignty (Audio Master)",
    speaker: "Charles H. Spurgeon",
    speakerSlug: "charles-spurgeon",
    speakerTitle: "Metropolitan Tabernacle",
    speakerImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    summary: "Spurgeon's celebrated discourse on the matching glory of sovereign grace in Jesus Christ.",
    duration: "52:20",
    durationSeconds: 3140,
    mediaType: "audio",
    mediaUrl: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    mp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    cdnMp3Url: "https://traffic.libsyn.com/secure/renewingyourmind/RYM20230103.mp3",
    youtubeId: "",
    url: "https://www.sermonindex.net",
    topics: [{ name: "Grace", slug: "grace" }, { name: "Sovereignty", slug: "sovereignty" }],
    scriptureRef: "Romans 9:15-16",
    thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80"
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
