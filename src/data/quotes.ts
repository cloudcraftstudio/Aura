export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  role?: string;
  category: 'Focus' | 'Courage' | 'Innovation' | 'Resilience' | 'Vision' | 'Creativity' | 'Wisdom';
  vibeColor: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'q1',
    quote: 'The secret of change is to focus all of your energy not on fighting the old, but on building the new.',
    author: 'Socrates',
    role: 'Philosopher',
    category: 'Innovation',
    vibeColor: 'from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'q2',
    quote: 'Do not wait for extraordinary circumstances to do good action; try to use ordinary situations.',
    author: 'Jean-Paul Richter',
    role: 'Author',
    category: 'Focus',
    vibeColor: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30',
  },
  {
    id: 'q3',
    quote: 'Energy and persistence conquer all things. What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    author: 'Ralph Waldo Emerson',
    role: 'Essayist & Poet',
    category: 'Resilience',
    vibeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'q4',
    quote: 'Creativity is intelligence having fun. Imagination is everything; it is the preview of life’s coming attractions.',
    author: 'Albert Einstein',
    role: 'Theoretical Physicist',
    category: 'Creativity',
    vibeColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
  },
  {
    id: 'q5',
    quote: 'The future belongs to those who believe in the beauty of their dreams and act with courage today.',
    author: 'Eleanor Roosevelt',
    role: 'Diplomat & Activist',
    category: 'Vision',
    vibeColor: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30',
  },
  {
    id: 'q6',
    quote: 'It always seems impossible until it is done. Make each day your masterpiece.',
    author: 'Nelson Mandela',
    role: 'Global Leader',
    category: 'Courage',
    vibeColor: 'from-blue-600/20 to-violet-600/20 text-blue-300 border-blue-500/30',
  },
  {
    id: 'q7',
    quote: 'Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.',
    author: 'Steve Jobs',
    role: 'Visionary & Creator',
    category: 'Innovation',
    vibeColor: 'from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30',
  },
  {
    id: 'q8',
    quote: 'The way to get started is to quit talking and begin doing. Great things never came from comfort zones.',
    author: 'Walt Disney',
    role: 'Pioneer & Animator',
    category: 'Focus',
    vibeColor: 'from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'q9',
    quote: 'Keep your face always toward the sunshine—and shadows will fall behind you.',
    author: 'Walt Whitman',
    role: 'Poet',
    category: 'Wisdom',
    vibeColor: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
  },
  {
    id: 'q10',
    quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    role: 'Statesman',
    category: 'Resilience',
    vibeColor: 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30',
  },
  {
    id: 'q11',
    quote: 'You do not find the happy life. You make it. Connect with purpose, share with passion.',
    author: 'Camilla Eyring Kimball',
    role: 'Educator',
    category: 'Wisdom',
    vibeColor: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-300 border-fuchsia-500/30',
  },
  {
    id: 'q12',
    quote: 'In the middle of difficulty lies opportunity. Keep building, keep discovering.',
    author: 'Albert Einstein',
    role: 'Physicist',
    category: 'Innovation',
    vibeColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
  },
];

/**
 * Deterministically returns the daily quote based on the current date (YYYY-MM-DD),
 * ensuring every user across all devices sees the exact same quote each day.
 */
export function getDailyQuote(customDate?: Date): MotivationalQuote {
  const date = customDate || new Date();
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const quoteIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[quoteIndex];
}

/**
 * Formatted current date string e.g. "Tuesday, August 25, 2026"
 */
export function getFormattedToday(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date().toLocaleDateString(undefined, options);
}
