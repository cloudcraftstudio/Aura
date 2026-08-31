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
