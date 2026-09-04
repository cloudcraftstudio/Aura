export type DevotionalType = 'morning' | 'midday' | 'evening';

export interface DevotionalEntry {
  title: string;
  reference: string;
  text: string;
  topic: string;
  values: string[];
  points: string[];
  reminder: string;
  prayer: string;
}

export interface DailyDevotional {
  id: string;
  morning: DevotionalEntry;
  midday: DevotionalEntry;
  evening: DevotionalEntry;
}

export const devotionalPlan: DailyDevotional[] = [
  {
    id: 'day-1',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 5:3',
      text: 'My voice shalt thou hear in the morning, O LORD; in the morning will I direct my prayer unto thee, and will look up.',
      topic: 'Anticipation and Direction',
      values: ['Faithfulness', 'Discipline', 'Hope'],
      points: [
        'Start the day with intentional communication with God.',
        'Direct your focus upwards before looking at the world.',
        'Expect God to answer and work in your day.'
      ],
      reminder: 'Set your focus on God before the day demands your attention.',
      prayer: 'Lord, as the sun rises, let my first thoughts be of You. Hear my voice and guide my steps today. Amen.'
    },
    midday: {
      title: 'Midday Scripture (Daily Bread)',
      reference: 'Psalm 55:17',
      text: 'Evening, and morning, and at noon, will I pray, and cry aloud: and he shall hear my voice.',
      topic: 'Persistent Prayer',
      values: ['Consistency', 'Dependence', 'Patience'],
      points: [
        'Prayer is not limited to the start and end of the day.',
        'Crying out to God in the middle of our busyness realigns us.',
        'God is always listening, no matter the hour.'
      ],
      reminder: 'Pause your work to remember the One you are working for.',
      prayer: 'Father, in the middle of this busy day, I pause to seek Your face. Keep my heart anchored in Your peace. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 4:8',
      text: 'I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.',
      topic: 'Peace and Rest',
      values: ['Trust', 'Rest', 'Safety'],
      points: [
        'True peace comes from trusting God, not our circumstances.',
        'Sleep is a gift given to those who rest in His protection.',
        'Let go of the day\'s worries and surrender them to God.'
      ],
      reminder: 'You can rest tonight because God is awake.',
      prayer: 'Lord, as I close my eyes, I release today\'s burdens to You. Grant me peaceful sleep and safety in Your arms. Amen.'
    }
  },
  {
    id: 'day-2',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Lamentations 3:22-23',
      text: 'It is of the LORD\'s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.',
      topic: 'New Mercies',
      values: ['Grace', 'Renewal', 'Gratitude'],
      points: [
        'Every day is a fresh start provided by God\'s grace.',
        'His compassion is infinite and never runs out.',
        'We can trust His faithfulness no matter what yesterday held.'
      ],
      reminder: 'Leave yesterday\'s mistakes behind; embrace today\'s fresh grace.',
      prayer: 'Father, thank You for new mercies today. Help me walk in Your grace and be a vessel of Your compassion. Amen.'
    },
    midday: {
      title: 'Midday Scripture (Daily Bread)',
      reference: 'Psalm 119:105',
      text: 'Thy word is a lamp unto my feet, and a light unto my path.',
      topic: 'Guidance and Clarity',
      values: ['Wisdom', 'Direction', 'Truth'],
      points: [
        'God\'s Word provides clarity for the next step, not always the whole journey.',
        'In the middle of daily confusion, scripture is our compass.',
        'Walk confidently when guided by His truth.'
      ],
      reminder: 'When you do not know what to do next, consult the Word.',
      prayer: 'Lord, illuminate my path this afternoon. Guide my decisions and keep my feet from stumbling. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 63:6',
      text: 'When I remember thee upon my bed, and meditate on thee in the night watches.',
      topic: 'Midnight Meditation',
      values: ['Intimacy', 'Reflection', 'Stillness'],
      points: [
        'The quiet of the night is a perfect time for deep reflection on God.',
        'Replace anxious thoughts with meditation on His goodness.',
        'Intimacy with God grows in the still moments.'
      ],
      reminder: 'Let your last thoughts before sleep be filled with His promises.',
      prayer: 'Father, as the house grows quiet, my mind turns to You. Thank You for Your presence in the still watches of the night. Amen.'
    }
  },
  {
    id: 'day-3',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 143:8',
      text: 'Cause me to hear thy lovingkindness in the morning; for in thee do I trust: cause me to know the way wherein I should walk; for I lift up my soul unto thee.',
      topic: 'Seeking Direction',
      values: ['Guidance', 'Trust', 'Surrender'],
      points: [
        'Listen for God\'s lovingkindness before the noise of the world.',
        'Trust Him to direct your steps throughout the day.',
        'Lifting your soul to Him is an act of total surrender.'
      ],
      reminder: 'Ask God to show you the way before you take the first step.',
      prayer: 'Lord, let me hear Your voice of love this morning. Show me the way I should walk today, for I trust in You. Amen.'
    },
    midday: {
      title: 'Midday Scripture (Daily Bread)',
      reference: 'Isaiah 26:3',
      text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.',
      topic: 'Perfect Peace',
      values: ['Focus', 'Peace', 'Trust'],
      points: [
        'Perfect peace is possible even in a chaotic day.',
        'The key to peace is where we anchor our focus.',
        'Trusting God keeps our minds steadfast.'
      ],
      reminder: 'If you are losing your peace, check your focus.',
      prayer: 'Father, keep my mind stayed on You this afternoon. Restore my peace as I trust in Your sovereign control. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Proverbs 3:24',
      text: 'When thou liest down, thou shalt not be afraid: yea, thou shalt lie down, and thy sleep shall be sweet.',
      topic: 'Sweet Sleep',
      values: ['Security', 'Peacefulness', 'Restoration'],
      points: [
        'Fear has no place in the heart of a resting believer.',
        'God promises sweet and restorative sleep to His children.',
        'Rest is a spiritual act of trusting God with the outcomes.'
      ],
      reminder: 'You are safe. Sleep sweetly under His watchful eye.',
      prayer: 'Lord, remove all fear from my heart tonight. Grant me sweet, restorative sleep so I may wake refreshed for Your purpose. Amen.'
    }
  },
  {
    id: 'day-4',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Lamentations 3:22-23',
      text: 'It is of the LORD\'s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.',
      topic: 'New Mercies',
      values: ['Grace', 'Faithfulness', 'Gratitude'],
      points: [
        'God\'s mercy hits the reset button on our lives every single morning.',
        'His compassion does not run out, even when our strength does.',
        'We can trust His faithfulness today, regardless of yesterday\'s failures.'
      ],
      reminder: 'You are operating on fresh grace today. Don\'t carry yesterday\'s burdens.',
      prayer: 'Lord, thank You for new mercies this morning. I leave yesterday behind and walk in Your faithful grace today. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Isaiah 26:3',
      text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.',
      topic: 'Perfect Peace',
      values: ['Peace', 'Focus', 'Trust'],
      points: [
        'Peace is not the absence of chaos, but the presence of God.',
        'Our peace is tied directly to what our minds are focused on.',
        'Trusting God in the middle of a busy day anchors our soul.'
      ],
      reminder: 'Stop and refocus your mind on Him to regain your peace.',
      prayer: 'Father, in the middle of this busy day, I fix my mind on You. Keep me in Your perfect peace. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 4:8',
      text: 'I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.',
      topic: 'Safe and Secure',
      values: ['Safety', 'Rest', 'Confidence'],
      points: [
        'True rest comes from knowing God is standing guard.',
        'We can let go of the day\'s anxieties because He handles the night.',
        'Safety is found in His presence, not in our circumstances.'
      ],
      reminder: 'Release the day into His hands. You are safe.',
      prayer: 'Lord, I lay down all my worries. Thank You for keeping me safe while I sleep. Amen.'
    }
  },
  {
    id: 'day-5',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Isaiah 40:31',
      text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
      topic: 'Renewed Strength',
      values: ['Patience', 'Endurance', 'Strength'],
      points: [
        'Waiting on God is not passive; it is an active posture of trust.',
        'He exchanges our weakness for His endless strength.',
        'We are built to overcome obstacles, soaring above the storms.'
      ],
      reminder: 'Wait on Him. Your strength is being renewed right now.',
      prayer: 'Father, I wait on You this morning. Renew my strength so I can walk through this day without fainting. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Philippians 4:13',
      text: 'I can do all things through Christ which strengtheneth me.',
      topic: 'Empowered Living',
      values: ['Power', 'Confidence', 'Faith'],
      points: [
        'Our ability is not based on our own resources, but Christ within us.',
        'There is no task too difficult when He is the one supplying the strength.',
        'We are empowered for whatever this day demands.'
      ],
      reminder: 'You have divine strength for whatever you are facing right now.',
      prayer: 'Lord, I feel the pressure of the day, but I know I can do all things through Your strength. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Matthew 11:28',
      text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
      topic: 'The Invitation to Rest',
      values: ['Rest', 'Surrender', 'Comfort'],
      points: [
        'Jesus invites us to bring our exhaustion directly to Him.',
        'We are not meant to carry heavy spiritual burdens alone.',
        'True rest is a gift He freely gives when we surrender to Him.'
      ],
      reminder: 'Lay your heavy burdens at His feet tonight.',
      prayer: 'Jesus, I am tired. I bring my heavy burdens to You and receive the rest You promised. Amen.'
    }
  },
  {
    id: 'day-6',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 143:8',
      text: 'Cause me to hear thy lovingkindness in the morning; for in thee do I trust: cause me to know the way wherein I should walk; for I lift up my soul unto thee.',
      topic: 'Guidance and Love',
      values: ['Guidance', 'Trust', 'Listening'],
      points: [
        'Starting the day by hearing God\'s love sets the tone for everything else.',
        'Trusting Him requires lifting our soul up to Him in prayer.',
        'He will direct our steps when we seek His way first.'
      ],
      reminder: 'Listen for His lovingkindness before the world gets too loud.',
      prayer: 'Lord, let me hear Your love this morning. Guide my steps and show me the way I should walk today. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Proverbs 4:23',
      text: 'Keep thy heart with all diligence; for out of it are the issues of life.',
      topic: 'Guarding the Heart',
      values: ['Diligence', 'Purity', 'Wisdom'],
      points: [
        'Our heart is the control center of our lives; what goes in affects everything.',
        'We must actively defend against negativity, bitterness, and sin.',
        'A pure heart produces a life of wisdom and peace.'
      ],
      reminder: 'Check what you are allowing into your heart today. Guard it closely.',
      prayer: 'Father, help me guard my heart today. Keep me from bitterness and fill me with Your truth. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 121:3-4',
      text: 'He will not suffer thy foot to be moved: he that keepeth thee will not slumber. Behold, he that keepeth Israel shall neither slumber nor sleep.',
      topic: 'The Watchful Keeper',
      values: ['Security', 'Vigilance', 'Peace'],
      points: [
        'God never takes a break or falls asleep on the job.',
        'Because He is awake watching over us, we can sleep soundly.',
        'He provides a firm foundation so we will not be moved.'
      ],
      reminder: 'God is awake tonight so you don\'t have to be. Go to sleep.',
      prayer: 'Lord, thank You for never sleeping. I rest securely knowing You are keeping watch over my life. Amen.'
    }
  },
  {
    id: 'day-7',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Joshua 1:9',
      text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
      topic: 'Courage for the Journey',
      values: ['Courage', 'Strength', 'Presence'],
      points: [
        'Courage is not a suggestion; it is a command from God.',
        'We can be bold because His presence goes with us everywhere.',
        'Fear has no place when the Creator of the universe is by our side.'
      ],
      reminder: 'Step out in courage today. God is with you.',
      prayer: 'Lord, I refuse fear today. I step out in strength and courage, knowing You are with me. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 46:10',
      text: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
      topic: 'The Power of Stillness',
      values: ['Stillness', 'Knowledge', 'Reverence'],
      points: [
        'In the rush of the day, stillness is a weapon against anxiety.',
        'Knowing God requires pausing our own efforts and recognizing His sovereignty.',
        'He will handle the chaos; our job is to trust Him.'
      ],
      reminder: 'Take 60 seconds right now to just be still and acknowledge Him.',
      prayer: 'Father, I pause the busyness of this day. I am still, and I declare that You are God over my life. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Zephaniah 3:17',
      text: 'The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.',
      topic: 'Resting in His Love',
      values: ['Love', 'Joy', 'Salvation'],
      points: [
        'God is not just with us; He is mighty to save us.',
        'He actually rejoices over us with singing as we rest.',
        'His love is the ultimate place of safety and peace.'
      ],
      reminder: 'Listen to the song of His love over you tonight.',
      prayer: 'Lord, thank You for rejoicing over me. I rest completely in Your mighty love tonight. Amen.'
    }
  },
  {
    id: 'day-8',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 118:24',
      text: 'This is the day which the LORD hath made; we will rejoice and be glad in it.',
      topic: 'Choosing Joy',
      values: ['Joy', 'Gratitude', 'Perspective'],
      points: [
        'Every single day is a handcrafted gift from God.',
        'Joy is a choice we make, regardless of our circumstances.',
        'Gratitude in the morning sets a positive trajectory for the whole day.'
      ],
      reminder: 'Choose joy today. This day is a gift.',
      prayer: 'Lord, thank You for this new day. I choose to rejoice and be glad in what You have made. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Colossians 3:2',
      text: 'Set your affection on things above, not on things on the earth.',
      topic: 'Heavenly Perspective',
      values: ['Perspective', 'Focus', 'Eternity'],
      points: [
        'Earthly frustrations lose their power when we look at them from heaven\'s viewpoint.',
        'Our affections and priorities must be intentionally set, not drifting.',
        'Focus on what matters eternally, not just what is urgent right now.'
      ],
      reminder: 'Look up. Don\'t let earthly stress steal your heavenly focus.',
      prayer: 'Father, redirect my thoughts. Help me focus on eternal things rather than the temporary stress of today. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 91:1',
      text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.',
      topic: 'The Secret Place',
      values: ['Protection', 'Intimacy', 'Abiding'],
      points: [
        'Intimacy with God provides the ultimate protection from the enemy.',
        'We are called to dwell there constantly, not just visit occasionally.',
        'Under His shadow, the heat of the day cannot reach us.'
      ],
      reminder: 'Retreat into His secret place tonight.',
      prayer: 'Lord, I choose to dwell in Your secret place tonight. Keep me safe under the shadow of Your wings. Amen.'
    }
  },
  {
    id: 'day-9',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Proverbs 3:5-6',
      text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
      topic: 'Total Trust',
      values: ['Trust', 'Surrender', 'Direction'],
      points: [
        'Our own logic is flawed; God\'s wisdom is perfect.',
        'Trusting Him requires all of our heart, leaving no room for doubt.',
        'When we acknowledge Him in everything, He guarantees to clear the path.'
      ],
      reminder: 'Stop trying to figure it all out. Trust Him and let Him lead.',
      prayer: 'Father, I surrender my understanding to You. Guide my decisions and direct my path today. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Galatians 6:9',
      text: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.',
      topic: 'Perseverance',
      values: ['Endurance', 'Hope', 'Faithfulness'],
      points: [
        'Doing the right thing can be exhausting, but it is always worth it.',
        'The harvest is guaranteed if we refuse to give up.',
        'God\'s timing (due season) is perfect, even when it feels delayed.'
      ],
      reminder: 'Don\'t quit now. Your harvest is coming.',
      prayer: 'Lord, give me the strength to keep doing good even when I am tired. Help me to not faint. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: '1 Peter 5:7',
      text: 'Casting all your care upon him; for he careth for you.',
      topic: 'Releasing Cares',
      values: ['Release', 'Comfort', 'Trust'],
      points: [
        'We are not designed to carry anxiety; we are commanded to throw it onto Him.',
        'He invites our burdens because His love for us is profound.',
        'Sleeping with worry is a sign we haven\'t cast our cares.'
      ],
      reminder: 'Throw every worry from today onto Him. He can handle it.',
      prayer: 'Jesus, I cast all my anxiety and stress from this day onto You. Thank You for caring for me. Amen.'
    }
  },
  {
    id: 'day-10',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 19:14',
      text: 'Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD, my strength, and my redeemer.',
      topic: 'Pure Words and Thoughts',
      values: ['Purity', 'Mindfulness', 'Honor'],
      points: [
        'Our words and our internal thoughts are equally visible to God.',
        'We must intentionally align both with His standard of righteousness.',
        'He is the strength that enables us to live honorably.'
      ],
      reminder: 'Filter your words and your thoughts through His grace today.',
      prayer: 'Lord, guard my mouth and my mind today. May everything I say and think bring honor to You. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Romans 8:28',
      text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      topic: 'Divine Purpose',
      values: ['Purpose', 'Trust', 'Sovereignty'],
      points: [
        'God is a master weaver, turning even bad situations into something good.',
        'This promise is for those who actively love Him and pursue His calling.',
        'Nothing you face today is outside of His sovereign control.'
      ],
      reminder: 'God is using whatever you are going through right now for your good.',
      prayer: 'Father, I trust that You are working all things together for my good today, even the difficult things. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 16:11',
      text: 'Thou wilt shew me the path of life: in thy presence is fulness of joy; at thy right hand there are pleasures for evermore.',
      topic: 'The Joy of His Presence',
      values: ['Joy', 'Presence', 'Life'],
      points: [
        'True life is found only on the path God reveals.',
        'Joy is not found in things, but strictly in His presence.',
        'As the day ends, we can experience a taste of eternal pleasure with Him.'
      ],
      reminder: 'Step into His presence tonight and find full joy.',
      prayer: 'Lord, thank You for showing me the path of life today. I rest in the fullness of Your joy tonight. Amen.'
    }
  },
  {
    id: 'day-11',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Ephesians 6:11',
      text: 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.',
      topic: 'Spiritual Armor',
      values: ['Preparation', 'Defense', 'Stand'],
      points: [
        'Every day is a spiritual battle, and we must dress accordingly.',
        'We need the whole armor, not just the pieces we like.',
        'Our goal is to stand firm, fully defended against deception.'
      ],
      reminder: 'Suit up. You are walking onto a battlefield today.',
      prayer: 'Lord, I put on Your full armor this morning. Give me the strength to stand firm against every attack. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'James 1:5',
      text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
      topic: 'Asking for Wisdom',
      values: ['Wisdom', 'Humility', 'Generosity'],
      points: [
        'Admitting we lack wisdom is the first step to receiving it.',
        'God gives wisdom generously without making us feel foolish for asking.',
        'When faced with a tough midday decision, simply ask Him.'
      ],
      reminder: 'Don\'t guess what to do next. Ask God for wisdom right now.',
      prayer: 'Father, I need Your wisdom for the decisions I am making today. Thank You for giving it generously. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 34:7',
      text: 'The angel of the LORD encampeth round about them that fear him, and delivereth them.',
      topic: 'Angelic Protection',
      values: ['Protection', 'Reverence', 'Deliverance'],
      points: [
        'We are physically surrounded by God\'s spiritual forces.',
        'This protection is promised to those who hold Him in reverence (fear).',
        'He is an active deliverer, stepping in when we are in danger.'
      ],
      reminder: 'You are surrounded by His protection tonight.',
      prayer: 'Lord, thank You for encamping around me. I sleep peacefully knowing Your angels are watching over me. Amen.'
    }
  },
  {
    id: 'day-12',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Hebrews 12:1',
      text: 'Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us,',
      topic: 'Running the Race',
      values: ['Focus', 'Patience', 'Endurance'],
      points: [
        'We must actively strip away the distractions and sins that slow us down.',
        'This life is a marathon requiring patience, not a sprint.',
        'We have a specific race set before us; we shouldn\'t run someone else\'s.'
      ],
      reminder: 'Drop the baggage. Run your race with focus today.',
      prayer: 'Lord, help me lay aside every distraction today so I can run the race You have specifically given to me. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: '2 Timothy 1:7',
      text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.',
      topic: 'A Sound Mind',
      values: ['Power', 'Love', 'Clarity'],
      points: [
        'Fear and anxiety do not originate from God.',
        'He provides a spirit of power to overcome, love to cast out fear, and a sound mind for clarity.',
        'We can reject panic and choose sound, disciplined thinking.'
      ],
      reminder: 'Reject fear. You have a sound and disciplined mind in Christ.',
      prayer: 'Father, I reject the spirit of fear right now. I claim Your power, Your love, and a sound mind today. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 103:12',
      text: 'As far as the east is from the west, so far hath he removed our transgressions from us.',
      topic: 'Total Forgiveness',
      values: ['Forgiveness', 'Grace', 'Freedom'],
      points: [
        'God\'s forgiveness is infinite; east and west never meet.',
        'We do not need to carry the guilt of forgiven sin into tomorrow.',
        'His grace removes our failures completely.'
      ],
      reminder: 'Your past is gone. Rest in His total forgiveness tonight.',
      prayer: 'Lord, thank You for removing my sins as far as the east is from the west. I rest in Your complete forgiveness. Amen.'
    }
  },
  {
    id: 'day-13',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Lamentations 3:25',
      text: 'The LORD is good unto them that wait for him, to the soul that seeketh him.',
      topic: 'The Goodness of Seeking',
      values: ['Seeking', 'Goodness', 'Patience'],
      points: [
        'God\'s goodness is poured out on those who actively seek Him.',
        'Waiting is not empty time; it is a spiritual discipline of seeking.',
        'Start the day by positioning your soul to look for Him.'
      ],
      reminder: 'Seek Him first today, and you will experience His goodness.',
      prayer: 'Lord, I seek You first this morning. I wait on You, knowing You are good to my soul. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 23:3',
      text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
      topic: 'Soul Restoration',
      values: ['Restoration', 'Righteousness', 'Leadership'],
      points: [
        'When the day drains us, God is the one who restores our inner being.',
        'He leads us on the right path so we don\'t have to guess the way.',
        'Our lives bring honor to His name when we follow His lead.'
      ],
      reminder: 'Let Him restore your tired soul right now.',
      prayer: 'Father, restore my soul in the middle of this day. Lead me on the right path for Your glory. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Isaiah 26:12',
      text: 'LORD, thou wilt ordain peace for us: for thou also hast wrought all our works in us.',
      topic: 'Ordained Peace',
      values: ['Peace', 'Accomplishment', 'Rest'],
      points: [
        'Peace is divinely established and ordained for us by God.',
        'Any good we accomplished today was actually Him working through us.',
        'We can rest because the work is ultimately His.'
      ],
      reminder: 'God ordained peace for you tonight. Step into it.',
      prayer: 'Lord, thank You for working through me today. I accept the peace You have ordained for me tonight. Amen.'
    }
  },
  {
    id: 'day-14',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Jeremiah 29:11',
      text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
      topic: 'A Future and a Hope',
      values: ['Hope', 'Future', 'Peace'],
      points: [
        'God is actively thinking about you, and His thoughts are good.',
        'He has a specific, hopeful destination planned for your life.',
        'You can face today with confidence because He controls tomorrow.'
      ],
      reminder: 'God has a good plan for you today. Walk confidently into it.',
      prayer: 'Lord, thank You for thinking good thoughts toward me. I trust the hopeful future You have planned for my life. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Proverbs 16:3',
      text: 'Commit thy works unto the LORD, and thy thoughts shall be established.',
      topic: 'Committed Works',
      values: ['Commitment', 'Stability', 'Focus'],
      points: [
        'When we hand our daily tasks over to God, He stabilizes our minds.',
        'Anxiety over work disappears when the work is committed to Him.',
        'Our plans succeed when they are aligned with His will.'
      ],
      reminder: 'Hand your current project or task over to Him right now.',
      prayer: 'Father, I commit all my work and plans today to You. Establish my thoughts and give me success. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 4:3',
      text: 'But know that the LORD hath set apart him that is godly for himself: the LORD will hear when I call unto him.',
      topic: 'Set Apart',
      values: ['Holiness', 'Access', 'Assurance'],
      points: [
        'We belong entirely to God; we are set apart for His purposes.',
        'Because we are His, we have VIP access to His ear at all times.',
        'He is listening whenever we call.'
      ],
      reminder: 'You are His. He hears you when you pray tonight.',
      prayer: 'Lord, thank You for setting me apart for Yourself. I know You hear me as I call to You tonight. Amen.'
    }
  }

,{
    id: 'day-15',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 1:1-3',
      text: 'Blessed is the man that walketh not in the counsel of the ungodly... but his delight is in the law of the LORD... he shall be like a tree planted by the rivers of water.',
      topic: 'Planted by the Water',
      values: ['Growth', 'Roots', 'Stability'],
      points: [
        'Where we plant ourselves determines how we grow.',
        'Delighting in God\'s word provides a continuous source of spiritual nourishment.',
        'A well-watered tree does not wither when the heat comes.'
      ],
      reminder: 'Plant yourself in His word today so you won\'t wither under stress.',
      prayer: 'Lord, plant me deeply in Your truth today. Let my roots draw from Your living water so I can bear good fruit. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Proverbs 16:9',
      text: 'A man\'s heart deviseth his way: but the LORD directeth his steps.',
      topic: 'Divine Direction',
      values: ['Surrender', 'Guidance', 'Flexibility'],
      points: [
        'It is okay to make plans, but we must hold them loosely.',
        'God often reroutes us for our protection or our purpose.',
        'True peace is letting God have the final say over our schedule.'
      ],
      reminder: 'If your plans got interrupted today, trust the One directing your steps.',
      prayer: 'Father, I have my plans for today, but I surrender them to You. Direct my steps exactly where You want me. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 127:2',
      text: 'It is vain for you to rise up early, to sit up late, to eat the bread of sorrows: for so he giveth his beloved sleep.',
      topic: 'The Gift of Sleep',
      values: ['Rest', 'Trust', 'Love'],
      points: [
        'Overworking out of anxiety is a vanity that steals our peace.',
        'God considers sleep a gift to the ones He loves.',
        'He is working the night shift; we don\'t have to.'
      ],
      reminder: 'Stop striving. Receive the gift of sleep He is offering you tonight.',
      prayer: 'Lord, forgive my anxious striving today. I accept Your gift of sweet sleep tonight. Amen.'
    }
  },
  {
    id: 'day-16',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Isaiah 41:10',
      text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
      topic: 'Upholding Strength',
      values: ['Courage', 'Support', 'Presence'],
      points: [
        'God commands us not to fear because His presence is our shield.',
        'When we are weak, He actively supplies the strength we lack.',
        'His righteous right hand is holding us; we will not fall.'
      ],
      reminder: 'You are being held up by the right hand of God today.',
      prayer: 'Lord, I refuse fear today because You are with me. Thank You for upholding me when I feel weak. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Philippians 4:6-7',
      text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
      topic: 'Trading Anxiety for Peace',
      values: ['Prayer', 'Gratitude', 'Peace'],
      points: [
        'Anxiety is a signal that we need to pray, not panic.',
        'Gratitude shifts our focus from what we lack to what God has done.',
        'The exchange rate of heaven is our worries for His perfect peace.'
      ],
      reminder: 'Don\'t just worry about it. Stop right now and pray about it.',
      prayer: 'Father, I trade my midday anxiety for Your perfect peace. I bring my requests to You with a thankful heart. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Proverbs 3:24',
      text: 'When thou liest down, thou shalt not be afraid: yea, thou shalt lie down, and thy sleep shall be sweet.',
      topic: 'Fearless Slumber',
      values: ['Peace', 'Comfort', 'Safety'],
      points: [
        'The night can bring fears, but God promises a fearless rest.',
        'Sweet sleep is a byproduct of a mind stayed on God.',
        'We can lie down with confidence knowing He is our protector.'
      ],
      reminder: 'Evict fear from your bedroom. Your sleep will be sweet tonight.',
      prayer: 'Lord, I banish all fear from my mind tonight. Give me sweet, restorative sleep in Your presence. Amen.'
    }
  },
  {
    id: 'day-17',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Matthew 6:33',
      text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
      topic: 'Proper Priorities',
      values: ['Focus', 'Kingdom', 'Provision'],
      points: [
        'Our first priority every morning must be God\'s kingdom.',
        'When we align our desires with His righteousness, provision follows naturally.',
        'Seeking Him first eliminates the need to aggressively chase earthly things.'
      ],
      reminder: 'Make sure your priorities are in the right order before you start the day.',
      prayer: 'Lord, I seek Your kingdom first today. I trust that You will provide everything else I need. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Romans 12:12',
      text: 'Rejoicing in hope; patient in tribulation; continuing instant in prayer.',
      topic: 'Midday Resilience',
      values: ['Hope', 'Patience', 'Prayer'],
      points: [
        'Hope gives us a reason to rejoice, even in the middle of a hard day.',
        'Tribulation requires patience, a fruit of the Spirit we must cultivate.',
        'Constant prayer is the tether that keeps us connected to our strength.'
      ],
      reminder: 'Stay patient. Keep praying. Hold on to hope.',
      prayer: 'Father, give me patience for the frustrations of this day. Keep my heart joyful and tethered to You in prayer. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 16:8',
      text: 'I have set the LORD always before me: because he is at my right hand, I shall not be moved.',
      topic: 'Unshakeable Stability',
      values: ['Stability', 'Focus', 'Presence'],
      points: [
        'Setting the Lord before us is an intentional, daily choice.',
        'When He is in His rightful place beside us, nothing can shake us.',
        'We can sleep soundly because our foundation is unshakeable.'
      ],
      reminder: 'You will not be moved, because He is right beside you.',
      prayer: 'Lord, I set You before me tonight. Because You are with me, I know my life is secure. Amen.'
    }
  },
  {
    id: 'day-18',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 37:4',
      text: 'Delight thyself also in the LORD; and he shall give thee the desires of thine heart.',
      topic: 'Holy Desires',
      values: ['Joy', 'Desire', 'Alignment'],
      points: [
        'When we find our ultimate joy in God, our desires begin to change.',
        'He doesn\'t just give us what we want; He shapes what we want to align with His will.',
        'Delighting in Him is the prerequisite to answered prayers.'
      ],
      reminder: 'Make God your greatest delight today, and watch your desires shift.',
      prayer: 'Lord, I choose to delight in You above all else today. Align the desires of my heart with Your perfect will. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Colossians 3:15',
      text: 'And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.',
      topic: 'The Umpire of Peace',
      values: ['Peace', 'Authority', 'Gratitude'],
      points: [
        'God\'s peace is meant to be the ruling authority (umpire) in our hearts.',
        'When chaos tries to take over, we must consciously let peace make the call.',
        'Gratitude is the atmosphere where peace thrives best.'
      ],
      reminder: 'Let peace make the decisions for you the rest of the day.',
      prayer: 'Father, I let Your peace rule my heart right now. Thank You for guiding my emotions and decisions. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 62:1',
      text: 'Truly my soul waiteth upon God: from him cometh my salvation.',
      topic: 'Waiting in Silence',
      values: ['Silence', 'Expectation', 'Salvation'],
      points: [
        'Sometimes the most spiritual thing we can do is sit in total silence before God.',
        'True salvation and rescue come from Him alone, not our own striving.',
        'Waiting on Him settles the noise of the soul.'
      ],
      reminder: 'Quiet your soul. Wait silently on Him tonight.',
      prayer: 'Lord, my soul waits in silence for You tonight. You are my only source of true rescue and rest. Amen.'
    }
  },
  {
    id: 'day-19',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Romans 5:8',
      text: 'But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.',
      topic: 'Unconditional Love',
      values: ['Love', 'Grace', 'Sacrifice'],
      points: [
        'God didn\'t wait for us to clean up our act before He loved us.',
        'The cross is the ultimate, undeniable proof of His love.',
        'We can start today knowing our worth is secured by His sacrifice, not our performance.'
      ],
      reminder: 'You are deeply loved by God, exactly as you are right now.',
      prayer: 'Lord, thank You for loving me even at my worst. I walk into today securely anchored in Your amazing grace. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: '2 Corinthians 12:9',
      text: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.',
      topic: 'Sufficient Grace',
      values: ['Grace', 'Weakness', 'Strength'],
      points: [
        'We don\'t need to be strong all the time; God\'s grace is enough.',
        'Our moments of midday exhaustion are the exact places His strength shines brightest.',
        'We can boast in our weakness because it invites His power.'
      ],
      reminder: 'If you feel weak right now, it just means you are perfectly positioned for His strength.',
      prayer: 'Father, I feel weak right now, but I know Your grace is entirely sufficient for me. Be my strength. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Matthew 11:29',
      text: 'Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.',
      topic: 'Learning to Rest',
      values: ['Humility', 'Learning', 'Rest'],
      points: [
        'Jesus invites us to partner with Him (yoke) rather than carrying life alone.',
        'Rest is something we must actively learn from Him.',
        'True soul rest comes from adopting His gentle, humble posture.'
      ],
      reminder: 'Trade your heavy yoke for His easy one tonight.',
      prayer: 'Jesus, I take off the heavy yoke of this day and put on Yours. Teach my soul how to truly rest in You tonight. Amen.'
    }
  },
  {
    id: 'day-20',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 119:105',
      text: 'Thy word is a lamp unto my feet, and a light unto my path.',
      topic: 'Illuminated Steps',
      values: ['Word', 'Guidance', 'Light'],
      points: [
        'God\'s Word provides enough light for the next step, even if we can\'t see the whole mile.',
        'In a dark world, Scripture is the only reliable navigation system.',
        'Reading the Word in the morning turns the lights on for the day.'
      ],
      reminder: 'Let His Word light up the next step you need to take today.',
      prayer: 'Lord, Your Word is my light. Illuminate my path today so I don\'t stumble in the dark. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'James 1:17',
      text: 'Every good gift and every perfect gift is from above, and cometh down from the Father of lights, with whom is no variableness, neither shadow of turning.',
      topic: 'The Unchanging Giver',
      values: ['Gratitude', 'Consistency', 'Goodness'],
      points: [
        'Take a moment to recognize that every good thing you experienced today came from God.',
        'People change, circumstances shift, but God\'s goodness is entirely consistent.',
        'He doesn\'t have moods or shadows; He is consistently light.'
      ],
      reminder: 'Pause and thank Him for one specific good gift you\'ve seen today.',
      prayer: 'Father, thank You for the good gifts You have given me today. I trust Your unchanging, consistent love. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'John 14:27',
      text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
      topic: 'Supernatural Peace',
      values: ['Peace', 'Courage', 'Gift'],
      points: [
        'Jesus left us His own personal peace—a peace that defies circumstances.',
        'The world\'s peace is fragile and temporary; His is eternal and strong.',
        'We have the authority to tell our own hearts not to be troubled.'
      ],
      reminder: 'Refuse to let your heart be troubled tonight. Take His peace.',
      prayer: 'Jesus, I receive Your supernatural peace tonight. I command my heart not to be troubled or afraid. Amen.'
    }
  },
  {
    id: 'day-21',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Isaiah 43:2',
      text: 'When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee: when thou walkest through the fire, thou shalt not be burned.',
      topic: 'Through the Fire',
      values: ['Protection', 'Presence', 'Overcoming'],
      points: [
        'God doesn\'t always keep us out of the fire, but He promises to be in it with us.',
        'The floods and flames of life have limits; they cannot destroy us.',
        'His presence is our ultimate protection in every crisis.'
      ],
      reminder: 'Whatever waters you are walking through today, you will not drown.',
      prayer: 'Lord, thank You for being with me in the flood and the fire. I walk confidently today knowing I am protected. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 27:1',
      text: 'The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?',
      topic: 'The Antidote to Fear',
      values: ['Fearless', 'Light', 'Salvation'],
      points: [
        'Fear dissolves when we truly realize who is standing with us.',
        'If God is our strength and salvation, every earthly threat is put in perspective.',
        'We can face the afternoon\'s challenges boldly.'
      ],
      reminder: 'Whom shall you fear? Absolutely no one, because God is with you.',
      prayer: 'Father, You are the strength of my life. I banish all fear and intimidation in Jesus\' name. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 91:4',
      text: 'He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.',
      topic: 'Under His Wings',
      values: ['Comfort', 'Trust', 'Truth'],
      points: [
        'The imagery of wings represents ultimate comfort, warmth, and protection.',
        'We can nestle into His presence and find safety from the elements of the world.',
        'His truth acts as a shield against the enemy\'s nighttime lies.'
      ],
      reminder: 'Rest under the shelter of His wings tonight.',
      prayer: 'Lord, cover me with Your feathers tonight. I find my comfort, trust, and shield in You alone. Amen.'
    }
  },
  {
    id: 'day-22',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Micah 6:8',
      text: 'He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?',
      topic: 'The Daily Requirement',
      values: ['Justice', 'Mercy', 'Humility'],
      points: [
        'God\'s requirements for our day are remarkably simple and profound.',
        'We are called to act with integrity (justice) and extend grace (mercy).',
        'Walking humbly with God is the foundation of a successful day.'
      ],
      reminder: 'Keep it simple today: Do right, love mercy, walk humbly.',
      prayer: 'Lord, help me to do justice, love mercy, and walk in deep humility with You every step I take today. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Galatians 5:22-23',
      text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, Meekness, temperance: against such there is no law.',
      topic: 'The Fruit Test',
      values: ['Character', 'Spirit', 'Temperance'],
      points: [
        'Midday is a great time to check what kind of fruit your life is producing.',
        'These traits are not forced; they grow naturally when we are connected to the Spirit.',
        'Stress tests our fruit; let patience and gentleness win.'
      ],
      reminder: 'What kind of fruit are you displaying right now? Choose peace and gentleness.',
      prayer: 'Father, let the fruit of Your Spirit be evident in my reactions, my words, and my attitude this afternoon. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: '1 Peter 5:7',
      text: 'Casting all your care upon him; for he careth for you.',
      topic: 'The Nighttime Surrender',
      values: ['Surrender', 'Care', 'Relief'],
      points: [
        'Holding onto anxiety is carrying a weight God explicitly told us to drop.',
        'We can cast our cares confidently because His love for us is deeply personal.',
        'Sleep requires empty hands; give Him everything.'
      ],
      reminder: 'Empty your hands of every worry before you close your eyes.',
      prayer: 'Lord, I cast every single care, worry, and stress from today squarely onto Your shoulders. Thank You for carrying them. Amen.'
    }
  },
  {
    id: 'day-23',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Romans 15:13',
      text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',
      topic: 'Abounding Hope',
      values: ['Hope', 'Joy', 'Power'],
      points: [
        'God is the original source and author of true hope.',
        'Joy and peace are the direct results of choosing to believe Him.',
        'The Holy Spirit empowers us to overflow with hope, even on difficult mornings.'
      ],
      reminder: 'Let the Holy Spirit fill your tank with overflowing hope today.',
      prayer: 'Lord, fill me with all joy and peace as I choose to believe Your promises today. Let me abound in hope. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Hebrews 4:16',
      text: 'Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.',
      topic: 'Bold Access',
      values: ['Boldness', 'Grace', 'Access'],
      points: [
        'We don\'t have to tiptoe into God\'s presence; Christ gave us bold access.',
        'The throne of heaven is characterized by grace, not condemnation.',
        'When you hit a wall today, mercy and grace are waiting for you.'
      ],
      reminder: 'You have VIP access to the throne of grace. Use it right now.',
      prayer: 'Father, I come boldly to Your throne right now in the middle of my day to ask for the grace and mercy I need to continue. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 3:5',
      text: 'I laid me down and slept; I awaked; for the LORD sustained me.',
      topic: 'The Sustainer',
      values: ['Sustenance', 'Rest', 'Faith'],
      points: [
        'Sleeping is an act of faith, trusting that God keeps the world spinning while we rest.',
        'It is His sustaining power, not our own heartbeat, that keeps us alive.',
        'We can lay down in total peace knowing the Sustainer is awake.'
      ],
      reminder: 'God is sustaining your life. You can safely go to sleep.',
      prayer: 'Lord, as I lay down to sleep, I thank You that it is Your power that sustains me. I rest in Your capable hands. Amen.'
    }
  },
  {
    id: 'day-24',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Isaiah 54:10',
      text: 'For the mountains shall depart, and the hills be removed; but my kindness shall not depart from thee, neither shall the covenant of my peace be removed.',
      topic: 'Unshakeable Kindness',
      values: ['Covenant', 'Kindness', 'Permanence'],
      points: [
        'Even if the most permanent things on earth vanish, God\'s kindness remains.',
        'His peace is a covenant, a binding promise He will never break.',
        'Start your day anchored to the permanence of His love.'
      ],
      reminder: 'God\'s kindness toward you is more permanent than the ground you walk on.',
      prayer: 'Lord, I anchor my soul to Your unshakeable kindness today. Thank You for Your permanent covenant of peace. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 118:6',
      text: 'The LORD is on my side; I will not fear: what can man do unto me?',
      topic: 'God on My Side',
      values: ['Confidence', 'Fearless', 'Support'],
      points: [
        'Recognizing that the Creator of the universe is on your side changes everything.',
        'The opinions or actions of people lose their power when God is your defender.',
        'Walk through the rest of this day with unshakeable confidence.'
      ],
      reminder: 'God is on your side. Let that truth silence your fear of others.',
      prayer: 'Father, thank You for being on my side. Because You are with me, I refuse to fear what any person can do. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 8:3-4',
      text: 'When I consider thy heavens, the work of thy fingers, the moon and the stars... What is man, that thou art mindful of him?',
      topic: 'Mindful Creator',
      values: ['Awe', 'Humility', 'Value'],
      points: [
        'Looking at the vastness of the night sky reminds us of God\'s infinite power.',
        'Yet, the God who placed the stars is intimately mindful of you.',
        'You are deeply valued by the Creator of the cosmos.'
      ],
      reminder: 'The God who named the stars knows your name and is watching over you.',
      prayer: 'Lord, it amazes me that the Creator of the universe is mindful of me. I rest securely in Your immense love tonight. Amen.'
    }
  },
  {
    id: 'day-25',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: '1 John 4:18',
      text: 'There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.',
      topic: 'Perfect Love',
      values: ['Love', 'Freedom', 'Purity'],
      points: [
        'Fear and God\'s perfect love cannot coexist in the same space.',
        'When we fully comprehend how much He loves us, fear is violently evicted.',
        'Torment belongs to the enemy; freedom belongs to the children of God.'
      ],
      reminder: 'Let His perfect love push every ounce of fear out of your mind today.',
      prayer: 'Lord, saturate my mind with Your perfect love this morning, and cast out every shadow of fear or anxiety. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 34:18',
      text: 'The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.',
      topic: 'Close to the Broken',
      values: ['Comfort', 'Closeness', 'Healing'],
      points: [
        'God does not abandon us when we hurt; He leans in closer.',
        'A broken heart acts as a magnet for the presence of the Lord.',
        'He is the Savior who specializes in rescuing crushed spirits.'
      ],
      reminder: 'If you are hurting today, know that God is standing closer to you right now than ever.',
      prayer: 'Father, if there is brokenness in my heart today, thank You for being near to me and bringing Your healing salvation. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Psalm 139:17-18',
      text: 'How precious also are thy thoughts unto me, O God! how great is the sum of them! If I should count them, they are more in number than the sand.',
      topic: 'Countless Thoughts',
      values: ['Precious', 'Value', 'Intimacy'],
      points: [
        'God is thinking about you constantly; His thoughts are precious and good.',
        'If you tried to count how many times He thinks of you, it would outnumber the sand.',
        'You are never forgotten, especially in the quiet of the night.'
      ],
      reminder: 'Fall asleep knowing God is thinking precious thoughts about you right now.',
      prayer: 'Lord, it overwhelms me to know how much You think about me. I go to sleep wrapped in the comfort of Your countless thoughts. Amen.'
    }
  },
  {
    id: 'day-26',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: '2 Chronicles 7:14',
      text: 'If my people, which are called by my name, shall humble themselves, and pray, and seek my face, and turn from their wicked ways; then will I hear from heaven...',
      topic: 'The Posture of Revival',
      values: ['Humility', 'Prayer', 'Repentance'],
      points: [
        'God promises healing and restoration when we adopt the right posture.',
        'Humility and prayer are the keys that unlock heaven\'s attention.',
        'Turning from our old ways guarantees that God will hear and heal.'
      ],
      reminder: 'Start the day with humility. Seek His face above everything else.',
      prayer: 'Lord, I humble myself before You this morning. I seek Your face, turn from my own ways, and ask for Your healing touch today. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 51:10',
      text: 'Create in me a clean heart, O God; and renew a right spirit within me.',
      topic: 'A Renewed Spirit',
      values: ['Renewal', 'Purity', 'Cleansing'],
      points: [
        'By midday, our attitudes can become polluted by stress or frustration.',
        'We need God to continuously renew our spirit and wash our hearts.',
        'A clean heart changes how we interact with everyone for the rest of the day.'
      ],
      reminder: 'Hit the reset button on your attitude. Ask God for a clean heart.',
      prayer: 'Father, check my attitude right now. Create in me a clean heart and renew a right spirit within me for the rest of this day. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Romans 8:38-39',
      text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers... shall be able to separate us from the love of God.',
      topic: 'Inseparable Love',
      values: ['Security', 'Love', 'Victory'],
      points: [
        'There is absolutely no force in the universe strong enough to break God\'s love for you.',
        'Our mistakes from today do not have the power to sever our connection to Him.',
        'We can sleep in ultimate victory because we are held securely in His love.'
      ],
      reminder: 'Nothing you did today separated you from His love. Rest securely.',
      prayer: 'Lord, I am completely persuaded that nothing can separate me from Your love. Thank You for holding me tight tonight. Amen.'
    }
  },
  {
    id: 'day-27',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Revelation 21:4',
      text: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain.',
      topic: 'The Ultimate Promise',
      values: ['Hope', 'Eternity', 'Comfort'],
      points: [
        'The struggles we face today are temporary; the eternal promise is perfect joy.',
        'God Himself will one day tenderly wipe every tear from our eyes.',
        'Let the promise of a pain-free eternity give you strength for today\'s battles.'
      ],
      reminder: 'Your pain is temporary. Your eternal joy is guaranteed.',
      prayer: 'Lord, thank You for the ultimate promise that one day all pain will end. Give me the strength to endure today with eternity in mind. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Psalm 23:6',
      text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
      topic: 'Pursued by Goodness',
      values: ['Mercy', 'Goodness', 'Dwelling'],
      points: [
        'You are not just walking through life; goodness and mercy are actively chasing you.',
        'God has assigned His grace to follow your every step today.',
        'Our ultimate destination is dwelling in His presence forever.'
      ],
      reminder: 'Look over your shoulder. God\'s goodness and mercy are right behind you.',
      prayer: 'Father, thank You that Your goodness and mercy are actively pursuing me today. I choose to dwell in Your presence right now. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Numbers 6:24-26',
      text: 'The LORD bless thee, and keep thee: The LORD make his face shine upon thee... and give thee peace.',
      topic: 'The Nightly Blessing',
      values: ['Blessing', 'Peace', 'Favor'],
      points: [
        'This ancient priestly blessing is God\'s heart toward you as you end your day.',
        'He desires to keep you, smile upon you, and grant you deep peace.',
        'Receive His shining face and His favor as you drift to sleep.'
      ],
      reminder: 'Receive the blessing: He is keeping you, smiling at you, and giving you peace.',
      prayer: 'Lord, I receive Your blessing tonight. Make Your face shine upon me, keep me safe, and grant me Your profound peace. Amen.'
    }
  },
  {
    id: 'day-28',
    morning: {
      title: 'Morning Manna (Bread of Life)',
      reference: 'Psalm 46:1',
      text: 'God is our refuge and strength, a very present help in trouble.',
      topic: 'The Present Helper',
      values: ['Refuge', 'Strength', 'Help'],
      points: [
        'God is not distant when trouble strikes; He is immediately and intensely present.',
        'He is both the safe place to hide (refuge) and the power to fight (strength).',
        'You do not have to face whatever comes today alone.'
      ],
      reminder: 'God is a very present help to you today. Lean on Him.',
      prayer: 'Lord, You are my refuge and strength today. Thank You for being a very present help in any trouble I might face. Amen.'
    },
    midday: {
      title: 'Midday Manna (Walking the Path)',
      reference: 'Proverbs 4:18',
      text: 'But the path of the just is as the shining light, that shineth more and more unto the perfect day.',
      topic: 'A Brighter Path',
      values: ['Light', 'Progress', 'Righteousness'],
      points: [
        'Walking with God means our path should be getting continually brighter, not darker.',
        'Even on confusing days, the light of His righteousness will eventually break through.',
        'Keep walking; the perfect day is coming.'
      ],
      reminder: 'Keep taking steps forward. Your path is getting brighter.',
      prayer: 'Father, guide my steps on the path of the just. Let Your light shine brighter and brighter on my life this afternoon. Amen.'
    },
    evening: {
      title: 'Evening Scripture (Night Watches)',
      reference: 'Jude 1:24',
      text: 'Now unto him that is able to keep you from falling, and to present you faultless before the presence of his glory with exceeding joy,',
      topic: 'Kept from Falling',
      values: ['Joy', 'Preservation', 'Glory'],
      points: [
        'We do not keep ourselves saved; God\'s power is what keeps us from falling.',
        'He will present us faultless—not because we are perfect, but because Christ is.',
        'He anticipates our arrival in heaven with exceeding joy.'
      ],
      reminder: 'God\'s grip on you is stronger than your tendency to fall. Rest easy.',
      prayer: 'Lord, thank You for being able to keep me from falling. I rest tonight in the joy of Your preserving grace. Amen.'
    }
  }

];

export const getCurrentDevotional = (): DailyDevotional => {
  // Rotate based on day of year
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (new Date().getTime() - start.getTime()) + ((start.getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  
  return devotionalPlan[day % devotionalPlan.length];
};
