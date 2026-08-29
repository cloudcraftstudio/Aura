export interface SermonAudioItem {
  id: string;
  title: string;
  speaker: string;
  speakerTitle?: string;
  broadcaster: string;
  series?: string;
  scriptureRef: string;
  category: string;
  description: string;
  mediaType: 'audio' | 'video';
  mediaUrl: string;
  youtubeId?: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  dateRecorded: string;
  listenCount: number;
  sermonAudioUrl: string;
  outline?: string[];
  keyQuotes?: string[];
}

export interface SermonAudioSpeaker {
  id: string;
  name: string;
  title: string;
  ministry: string;
  avatarUrl: string;
  bio: string;
  sermonCount: number;
}

export const SERMONAUDIO_SPEAKERS: SermonAudioSpeaker[] = [
  {
    id: 'paul-washer',
    name: 'Paul Washer',
    title: 'Founder & Director',
    ministry: 'HeartCry Missionary Society',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    bio: 'Renowned missionary evangelist known for passionate gospel preaching on biblical repentance, regeneration, and the narrow gate.',
    sermonCount: 420
  },
  {
    id: 'martyn-lloyd-jones',
    name: 'Dr. Martyn Lloyd-Jones',
    title: 'Late Pastor & Expositor',
    ministry: 'Westminster Chapel, London',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Celebrated 20th-century Welsh physician and preacher whose verse-by-verse expositions in London set the gold standard for expository preaching.',
    sermonCount: 1600
  },
  {
    id: 'charles-spurgeon',
    name: 'Charles H. Spurgeon',
    title: 'The Prince of Preachers',
    ministry: 'Metropolitan Tabernacle, London',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Historic 19th-century British preacher whose timeless sermons expound the sovereign grace of God, Christ crucified, and salvation by faith alone.',
    sermonCount: 3500
  },
  {
    id: 'rc-sproul',
    name: 'Dr. R.C. Sproul',
    title: 'Theologian & Founder',
    ministry: 'Ligonier Ministries',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    bio: 'Distinguished Reformed theologian and author renowned worldwide for his definitive series on the Holiness and absolute sovereignty of God.',
    sermonCount: 890
  },
  {
    id: 'john-macarthur',
    name: 'John MacArthur',
    title: 'Pastor-Teacher',
    ministry: 'Grace Community Church / Grace to You',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    bio: 'Veteran expositor and radio broadcaster who spent over 50 years preaching through every single verse of the New Testament.',
    sermonCount: 3200
  },
  {
    id: 'alistair-begg',
    name: 'Alistair Begg',
    title: 'Senior Pastor',
    ministry: 'Parkside Church / Truth For Life',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    bio: 'Scottish-born pastor dedicated to opening the Scriptures clearly so that all may understand, trust, and obey the Word of God.',
    sermonCount: 1450
  },
  {
    id: 'steve-lawson',
    name: 'Dr. Steven J. Lawson',
    title: 'President',
    ministry: 'OnePassion Ministries',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
    bio: 'Passionate expositor and professor specializing in the doctrines of grace and expository preaching across the Psalms.',
    sermonCount: 780
  },
  {
    id: 'voddie-baucham',
    name: 'Dr. Voddie Baucham',
    title: 'Dean of Theology',
    ministry: 'African Christian University / Grace Family Baptist',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Preacher, cultural apologist, and author known for unapologetic biblical defense of family discipleship and biblical worldview.',
    sermonCount: 650
  },
  {
    id: 'leonard-ravenhill',
    name: 'Leonard Ravenhill',
    title: 'Revivalist & Author',
    ministry: 'SermonIndex Historic Archive',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    bio: 'British evangelist and author of "Why Revival Tarries", renowned for fiery preaching on prayer, personal holiness, and the judgment seat of Christ.',
    sermonCount: 310
  },
  {
    id: 'aw-tozer',
    name: 'A.W. Tozer',
    title: '20th Century Prophet',
    ministry: 'Christian & Missionary Alliance',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    bio: 'Author of "The Pursuit of God" and "The Knowledge of the Holy", famed for call to deep spiritual intimacy and reverent contemplation of God.',
    sermonCount: 520
  },
  {
    id: 'paris-reidhead',
    name: 'Paris Reidhead',
    title: 'Missionary & Teacher',
    ministry: 'Bethany Fellowship Collection',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bio: 'Missionary to Africa whose landmark 1965 sermon "Ten Shekels and a Shirt" exposed the fatal dangers of man-centered, utilitarian religion.',
    sermonCount: 180
  },
  {
    id: 'jonathan-edwards',
    name: 'Jonathan Edwards',
    title: 'Great Awakening Theologian',
    ministry: 'Northampton / Colonial Heritage',
    avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80',
    bio: 'Philosopher, missionary, and central figure of the First Great Awakening, known for unmatched intellectual rigor and vivid biblical preaching.',
    sermonCount: 950
  }
];

export const SERMONAUDIO_CATEGORIES = [
  'All Topics',
  'Salvation & The Gospel',
  'Expository Preaching',
  'Christian Living & Holiness',
  'Biblical Theology & Doctrine',
  'Prayer & Revival',
  'Family & Discipleship',
  'Church History & Biographies'
];

export const SERMONAUDIO_FEED: SermonAudioItem[] = [
  {
    id: 'sa-pw-shocking-youth',
    title: 'The Shocking Message of the True Gospel',
    speaker: 'Paul Washer',
    speakerTitle: 'Founder, HeartCry Missionary Society',
    broadcaster: 'HeartCry Missionary Society',
    series: 'Biblical Salvation & Regeneration',
    scriptureRef: 'Matthew 7:13-27',
    category: 'Salvation & The Gospel',
    description: 'An urgent, uncompromising expository message examining the narrow gate, true regeneration, and the biblical evidence of genuine conversion in Jesus Christ.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/cncEb_g1w6A',
    youtubeId: 'cncEb_g1w6A',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80',
    duration: 3420,
    dateRecorded: 'Classic Broadcast',
    listenCount: 245000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Narrow Gate vs. The Broad Way of Deception (Matthew 7:13-14)',
      'Fruit as the Infallible Evidence of a Changed Heart (Matthew 7:16-20)',
      'The Horror of False Assurance: "Lord, Lord" (Matthew 7:21-23)',
      'Building upon the Solid Rock of Christ\'s Word (Matthew 7:24-27)'
    ],
    keyQuotes: [
      '"Salvation is not about walking an aisle or repeating a prayer; it is a supernatural work of Almighty God creating a new creature in Christ."',
      '"The evidence of past genuine conversion is present ongoing sanctification and love for God\'s commandments."'
    ]
  },
  {
    id: 'sa-rcs-holiness-of-god',
    title: 'The Trauma of God\'s Holiness',
    speaker: 'Dr. R.C. Sproul',
    speakerTitle: 'Founder, Ligonier Ministries',
    broadcaster: 'Ligonier Ministries',
    series: 'The Holiness of God Series',
    scriptureRef: 'Isaiah 6:1-8',
    category: 'Biblical Theology & Doctrine',
    description: 'A life-transforming study of the prophet Isaiah entering the temple and encountering the holy, sovereign Lord seated upon His throne high and lifted up.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/o_q-U7t98v0',
    youtubeId: 'o_q-U7t98v0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80',
    duration: 2540,
    dateRecorded: 'Ligonier Classic Series',
    listenCount: 420000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Heavenly Vision: The Sovereign Lord on His Throne (Isaiah 6:1-3)',
      'The Tri-Holy Chants of the Seraphim (Isaiah 6:3-4)',
      'The Prophet\'s Total Undoing: "Woe is me, for I am undone!" (Isaiah 6:5)',
      'The Burning Coal of Atonement and the Commission: "Here am I; send me!" (Isaiah 6:6-8)'
    ],
    keyQuotes: [
      '"Only once in sacred Scripture is an attribute of God elevated to the third degree of repetition: Holy, Holy, Holy is the Lord God Almighty."',
      '"When man encounters the holiness of God, his first sensation is not warm sentiment, but absolute moral disintegration before infinite perfection."'
    ]
  },
  {
    id: 'sa-mlj-cross-of-christ',
    title: 'The Incomparable Glory of the Cross',
    speaker: 'Dr. Martyn Lloyd-Jones',
    speakerTitle: 'Westminster Chapel, London',
    broadcaster: 'The Martyn Lloyd-Jones Trust',
    series: 'Studies in Galatians',
    scriptureRef: 'Galatians 6:14',
    category: 'Expository Preaching',
    description: 'Dr. Martyn Lloyd-Jones expounds the Apostle Paul\'s triumphant declaration: God forbid that I should glory, save in the cross of our Lord Jesus Christ.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/X2r0t9jN-qA',
    youtubeId: 'X2r0t9jN-qA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
    duration: 2780,
    dateRecorded: 'Westminster Chapel Historic Archive',
    listenCount: 189000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The World\'s Vain Glories vs. The Christian\'s Singular Boast (Galatians 6:14a)',
      'The Cross as the Complete Demonstration of God\'s Justice and Mercy',
      'Crucified to the World and the World Crucified to Us (Galatians 6:14b)',
      'Living in the Constant Light and Power of Calvary'
    ],
    keyQuotes: [
      '"Preaching is theology coming through a man who is on fire. The Cross of Christ is the central pivot of all eternal reality."',
      '"The Christian is one who has seen everything in this passing world eclipsed by the dazzling, saving majesty of the Son of God on the tree."'
    ]
  },
  {
    id: 'sa-chs-all-of-grace',
    title: 'All of Grace: Free Pardon by Jesus Christ',
    speaker: 'Charles H. Spurgeon',
    speakerTitle: 'Metropolitan Tabernacle',
    broadcaster: 'Spurgeon Heritage Audio',
    series: 'Grace & Truth Classics',
    scriptureRef: 'Ephesians 2:8-10',
    category: 'Salvation & The Gospel',
    description: 'Spurgeon preaches the glorious truth of God\'s unmerited favor and why salvation is wholly of the Lord from beginning to eternity.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/b-g8q00FqYc',
    youtubeId: 'b-g8q00FqYc',
    thumbnailUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
    duration: 3100,
    dateRecorded: 'Spurgeon Classic Collection',
    listenCount: 312000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Fountain of Grace: Free, Unbought, and Sovereign (Ephesians 2:8)',
      'Faith as the Receiving Hand, Not the Meritorious Work',
      'Exclusion of All Human Boasting (Ephesians 2:9)',
      'His Workmanship Created for Good Works Prepared of God (Ephesians 2:10)'
    ],
    keyQuotes: [
      '"A whole Christ for my whole need; Jesus alone, Jesus entirely, Jesus forever."',
      '"If there is one stitch in the garment of our salvation that we had to weave ourselves, we would be lost forever. It is all of grace!"'
    ]
  },
  {
    id: 'sa-jmac-sufficiency-scripture',
    title: 'The Sufficiency and Power of Scripture',
    speaker: 'John MacArthur',
    speakerTitle: 'Grace Community Church / Grace to You',
    broadcaster: 'Grace to You Broadcast',
    series: 'Authority of the Word',
    scriptureRef: '2 Timothy 3:16-17',
    category: 'Expository Preaching',
    description: 'Pastor MacArthur explains how all Scripture is breathed out by God, providing everything necessary for life, godliness, and doctrinal truth.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/o7kY7U1iWcE',
    youtubeId: 'o7kY7U1iWcE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    duration: 3300,
    dateRecorded: 'Grace to You Feed',
    listenCount: 280000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Divine Origin: Theopneustos (God-Breathed) (2 Timothy 3:16a)',
      'The Fourfold Profitability: Doctrine, Reproof, Correction, Instruction (2 Timothy 3:16b)',
      'The Result: The Man of God Fully Equipped for Every Good Work (2 Timothy 3:17)',
      'Standing Firm Against Modern Pragmatism with the Unchanging Word'
    ],
    keyQuotes: [
      '"Scripture is not an addition to human wisdom; it is the sole and sufficient revelation by which every human thought must be judged."',
      '"If you want to hear God speak, read the Bible. If you want to hear Him speak out loud, read it out loud."'
    ]
  },
  {
    id: 'sa-ab-anchor-for-soul',
    title: 'An Anchor for the Soul in Tumultuous Times',
    speaker: 'Alistair Begg',
    speakerTitle: 'Senior Pastor, Parkside Church',
    broadcaster: 'Truth For Life',
    series: 'Steadfast in Hope',
    scriptureRef: 'Hebrews 6:19-20',
    category: 'Christian Living & Holiness',
    description: 'Alistair Begg points believers to the steadfast, sure anchor of our hope which enters into that within the veil where Jesus our forerunner has entered.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/p5fL_B-yJ1A',
    youtubeId: 'p5fL_B-yJ1A',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    duration: 2450,
    dateRecorded: 'Truth For Life Daily',
    listenCount: 165000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Storms of This Life and the Danger of Drifting',
      'The Nature of the Christian\'s Anchor: Sure and Steadfast (Hebrews 6:19)',
      'The Location of the Anchor: Fixed Behind the Heavenly Veil',
      'Jesus Christ the High Priest and Forerunner on Our Behalf (Hebrews 6:20)'
    ],
    keyQuotes: [
      '"Our hope is not pinned upon the strength of our faith, but upon the unshakable trustworthiness of the One in whom our faith rests."',
      '"The anchor does not hold in the shifting sands of human feelings, but in the finished work of Christ in the Holy of Holies."'
    ]
  },
  {
    id: 'sa-sjl-psalm23',
    title: 'The Lord is My Shepherd: Sovereign Care',
    speaker: 'Dr. Steven J. Lawson',
    speakerTitle: 'President, OnePassion Ministries',
    broadcaster: 'OnePassion Ministries',
    series: 'Treasury of the Psalms',
    scriptureRef: 'Psalm 23:1-6',
    category: 'Expository Preaching',
    description: 'An uplifting verse-by-verse exposition into David\'s greatest psalm of divine protection, providence, and eternal fellowship in the house of the LORD.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/_tD7sN4_qfU',
    youtubeId: '_tD7sN4_qfU',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    duration: 2890,
    dateRecorded: 'Expositors Summit',
    listenCount: 140000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Great Shepherd: Sovereign Provision and Total Sufficiency (Psalm 23:1-3)',
      'The Dark Valley: The Comfort of His Presence and His Rod & Staff (Psalm 23:4)',
      'The Prepared Table: Victory in the Presence of Enemies (Psalm 23:5)',
      'Goodness and Mercy Pursuing Us All the Days of Our Lives (Psalm 23:6)'
    ],
    keyQuotes: [
      '"When the Lord is your Shepherd, you lack absolutely nothing that is essential for your spiritual well-being and eternal destiny."',
      '"David does not say \'if\' I walk through the valley, but \'though\' I walk. Yet even in the deepest shadows, the Shepherd walks with us."'
    ]
  },
  {
    id: 'sa-vb-gospel-for-family',
    title: 'Family Shepherding & The Gospel in the Home',
    speaker: 'Dr. Voddie Baucham',
    speakerTitle: 'Dean of Theology, ACU',
    broadcaster: 'Grace Family Baptist',
    series: 'Family Driven Faith',
    scriptureRef: 'Deuteronomy 6:4-9',
    category: 'Family & Discipleship',
    description: 'Dr. Baucham provides biblical clarity on raising children in the nurture and admonition of the Lord and establishing multi-generational faithfulness.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/gfZkLqLz2b8',
    youtubeId: 'gfZkLqLz2b8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1476820865390-c52aeea957d7?w=800&auto=format&fit=crop&q=80',
    duration: 3180,
    dateRecorded: 'National Conference',
    listenCount: 390000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Shema: Loving the Lord Your God with All Your Heart (Deuteronomy 6:4-5)',
      'Internalizing God\'s Word Before Teaching It (Deuteronomy 6:6)',
      'Diligent, Everyday Discipleship in the Home (Deuteronomy 6:7)',
      'Guarding Against Cultural Conformity and Worldly Distractions (Deuteronomy 6:8-9)'
    ],
    keyQuotes: [
      '"If I teach my children to be brilliant scholars, champion athletes, or wealthy professionals, but fail to teach them the gospel, I have failed as a father."',
      '"Discipleship is not a Sunday event; it is the rhythm of daily life when you sit, walk, lie down, and rise."'
    ]
  },
  {
    id: 'sa-lr-judgment-seat',
    title: 'The Judgment Seat of Christ & Eternity in View',
    speaker: 'Leonard Ravenhill',
    speakerTitle: 'Revivalist & Evangelist',
    broadcaster: 'SermonIndex Classic Archive',
    series: 'Eternity\'s Values in View',
    scriptureRef: '2 Corinthians 5:9-11',
    category: 'Prayer & Revival',
    description: 'A fiery, soul-stirring revival classic calling believers to forsake worldly trivialities and live every moment in the sober light of the Judgment Seat of Christ.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/5rP8M_8Kmqg',
    youtubeId: '5rP8M_8Kmqg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80',
    duration: 3540,
    dateRecorded: 'Historic Revival Broadcast',
    listenCount: 510000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Inevitable Appointment: All Must Appear Before the Bema Seat (2 Corinthians 5:10)',
      'The Trial by Fire: Wood, Hay, and Stubble vs. Gold, Silver, and Precious Stones',
      'The Tragedy of a Wasted Life Lived for Temporal Acclaim',
      'The Passion to Please Christ in View of the Terror of the Lord (2 Corinthians 5:11)'
    ],
    keyQuotes: [
      '"Are the things you are living for worth Christ dying for? Live with eternity\'s values in view!"',
      '"The opportunity of a lifetime must be seized in the lifetime of the opportunity. We must stand before the King of kings."'
    ]
  },
  {
    id: 'sa-awt-attributes-god',
    title: 'The Majesty and Attributes of God',
    speaker: 'A.W. Tozer',
    speakerTitle: 'Pastor & Author',
    broadcaster: 'Christian & Missionary Alliance',
    series: 'The Knowledge of the Holy',
    scriptureRef: 'Psalm 139:1-12',
    category: 'Biblical Theology & Doctrine',
    description: 'A deeply reverent contemplation of God\'s unsearchable greatness, omnipresence, omniscience, and why a high view of God is the cure for human despair.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/J2Ua9T8h220',
    youtubeId: 'J2Ua9T8h220',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
    duration: 2650,
    dateRecorded: 'Historic Tape Archive',
    listenCount: 330000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'What Comes Into Our Minds When We Think About God',
      'God\'s Incomprehensible Transcendence and Immanence',
      'The Knowledge of the Holy as the Highest Pursuit of Man',
      'Recovering Reverence and Awe in Modern Worship'
    ],
    keyQuotes: [
      '"What comes into our minds when we think about God is the most important thing about us."',
      '"God never hurries. There are no deadlines against which He must work. To know that He is in sovereign control gives the soul peace."'
    ]
  },
  {
    id: 'sa-pr-ten-shekels',
    title: 'Ten Shekels and a Shirt: The Self-Centered Gospel Rebuked',
    speaker: 'Paris Reidhead',
    speakerTitle: 'Missionary to Africa',
    broadcaster: 'Bethany Fellowship Collection',
    series: 'Landmark Sermons of the 20th Century',
    scriptureRef: 'Judges 17:1-13',
    category: 'Salvation & The Gospel',
    description: 'One of the most profound sermons ever recorded, exposing how humanism has hijacked Christianity to make God a servant of man rather than man a servant of God.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/_R4Z37Z0rXk',
    youtubeId: '_R4Z37Z0rXk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
    duration: 3200,
    dateRecorded: 'Bethany Summer Conference 1965',
    listenCount: 680000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'Micah\'s Hired Priest: Utilitarian Religion for Personal Advantage (Judges 17:10)',
      'Humanism Infiltrating the Pulpit: Using God to Escape Hell vs. Surrendering for His Glory',
      'The Moravian Cry: "May the Lamb that was Slain Receive the Reward of His Sufferings"',
      'True Repentance: Loving God for Who He Is, Not Just What He Gives'
    ],
    keyQuotes: [
      '"If you accept Jesus Christ only to keep from going to hell, you are using Him! Salvation is bowing before the Lord of glory because He is worthy."',
      '"The question is not what will God give to you, but what will God receive from the life you offer unto Him."'
    ]
  },
  {
    id: 'sa-je-sinners-hands',
    title: 'Sinners in the Hands of an Angry God',
    speaker: 'Jonathan Edwards',
    speakerTitle: 'Theologian & Missionary',
    broadcaster: 'Great Awakening Archive',
    series: 'Enfield Historical Awakening',
    scriptureRef: 'Deuteronomy 32:35',
    category: 'Church History & Biographies',
    description: 'The historic Enfield sermon that sparked the Great Awakening, vividly setting forth the precarious nature of human life and the urgent necessity of fleeing to Christ.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube-nocookie.com/embed/y-x6305iRco',
    youtubeId: 'y-x6305iRco',
    thumbnailUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&auto=format&fit=crop&q=80',
    duration: 2900,
    dateRecorded: 'Historic 1741 Enfield Discourse',
    listenCount: 450000,
    sermonAudioUrl: 'https://www.sermonaudio.com',
    outline: [
      'The Slippery Places: "Their foot shall slide in due time" (Deuteronomy 32:35)',
      'The Sovereign Mercy of God Holding Back Imminent Judgment',
      'The Awful Reality of Eternity Without Christ',
      'The Door of Mercy Thrown Wide Open: Fleeing to the Savior Today'
    ],
    keyQuotes: [
      '"There is nothing between you and eternity but the thin air and the sovereign pleasure of Almighty God."',
      '"Now you have an extraordinary opportunity, a day wherein Christ has thrown the door of mercy wide open, calling with a loud voice to poor sinners."'
    ]
  }
];
