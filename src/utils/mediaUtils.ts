export interface ExtractedVideo {
  type: 'youtube' | 'vimeo' | 'direct';
  url: string;
  embedUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
}

/**
 * Extracts YouTube video ID and optional start time from various YouTube URL formats.
 */
export function extractYouTubeInfo(url: string): { videoId: string; startTime?: number } | null {
  try {
    const cleanUrl = url.trim();
    // Patterns for YouTube
    // 1. youtube.com/watch?v=ID
    // 2. youtu.be/ID
    // 3. youtube.com/embed/ID
    // 4. youtube.com/shorts/ID
    // 5. youtube.com/live/ID
    const ytRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = cleanUrl.match(ytRegex);
    if (!match || !match[1]) return null;

    const videoId = match[1];
    let startTime: number | undefined;

    // Check for timestamp (e.g. t=120, t=2m15s, start=120)
    const tMatch = cleanUrl.match(/[?&](?:t|start)=([0-9hms]+)/);
    if (tMatch && tMatch[1]) {
      const tStr = tMatch[1];
      if (/^\d+$/.test(tStr)) {
        startTime = parseInt(tStr, 10);
      } else {
        let total = 0;
        const hours = tStr.match(/(\d+)h/);
        const mins = tStr.match(/(\d+)m/);
        const secs = tStr.match(/(\d+)s/);
        if (hours) total += parseInt(hours[1], 10) * 3600;
        if (mins) total += parseInt(mins[1], 10) * 60;
        if (secs) total += parseInt(secs[1], 10);
        if (total > 0) startTime = total;
      }
    }

    return { videoId, startTime };
  } catch {
    return null;
  }
}

/**
 * Returns a youtube-nocookie embed URL for any YouTube URL format
 * (standard, youtu.be short links, /shorts/ID).
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const info = extractYouTubeInfo(url);
  if (!info) return null;
  const startParam = info.startTime ? `?start=${info.startTime}` : '';
  return `https://www.youtube-nocookie.com/embed/${info.videoId}${startParam}`;
}

/**
 * Extracts Vimeo video ID from Vimeo URL formats.
 */
export function extractVimeoId(url: string): string | null {
  try {
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/;
    const match = url.trim().match(vimeoRegex);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is a direct HTML5 video file (.mp4, .webm, .ogg, .mov).
 */
export function isDirectVideoUrl(url: string): boolean {
  try {
    const trimmed = url.trim();
    if (trimmed.startsWith('blob:')) return true;
    if (trimmed.startsWith('localmedia://video/')) return true;
    return /^https?:\/\/[^\s]+?\.(mp4|webm|ogg|mov)(\?[^\s]*)?$/i.test(trimmed);
  } catch {
    return false;
  }
}

/**
 * Detects all video sources in a given text or media list.
 */
export function extractVideosFromText(text: string): ExtractedVideo[] {
  if (!text) return [];
  const videos: ExtractedVideo[] = [];
  const seenUrls = new Set<string>();

  // Extract all URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];

  for (const rawUrl of matches) {
    // Strip trailing punctuation like .,;:!?)"
    const cleanUrl = rawUrl.replace(/[.,;:!?)]+$/, '');
    if (seenUrls.has(cleanUrl)) continue;

    // Check YouTube
    const yt = extractYouTubeInfo(cleanUrl);
    if (yt) {
      seenUrls.add(cleanUrl);
      const startParam = yt.startTime ? `&start=${yt.startTime}` : '';
      videos.push({
        type: 'youtube',
        url: cleanUrl,
        videoId: yt.videoId,
        embedUrl: `https://www.youtube.com/embed/${yt.videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${startParam}`,
        thumbnailUrl: `https://img.youtube.com/vi/${yt.videoId}/hqdefault.jpg`,
      });
      continue;
    }

    // Check Vimeo
    const vimeoId = extractVimeoId(cleanUrl);
    if (vimeoId) {
      seenUrls.add(cleanUrl);
      videos.push({
        type: 'vimeo',
        url: cleanUrl,
        videoId: vimeoId,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?dnt=1&app_id=122963`,
      });
      continue;
    }

    // Check Direct Video
    if (isDirectVideoUrl(cleanUrl)) {
      seenUrls.add(cleanUrl);
      videos.push({
        type: 'direct',
        url: cleanUrl,
        embedUrl: cleanUrl,
      });
    }
  }

  return videos;
}

/**
 * Parses plain text into formatted tokens containing plain strings and clickable links.
 */
export interface TextToken {
  type: 'text' | 'link' | 'mention' | 'hashtag' | 'bible-ref';
  value: string;
  url?: string;
}

const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", 
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", 
  "Nehemiah", "Esther", "Job", "Psalms", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", 
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", 
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", 
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", 
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", 
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", 
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const BIBLE_TOPICS = ["Jesus", "Christ", "Holy Spirit", "God", "Bible"];

export function parseRichText(text: string): TextToken[] {
  if (!text) return [];

  const standardPattern = `https?:\\/\\/[^\\s]+|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+`;
  const bookPattern = BIBLE_BOOKS.join("|");
  const versePattern = `\\b(?:${bookPattern})\\s+\\d+:\\d+(?:-\\d+)?\\b`;
  const topicPattern = `\\b(?:${BIBLE_TOPICS.join("|")})\\b`;

  const tokenRegex = new RegExp(`(${standardPattern}|${versePattern}|${topicPattern})`, 'gi');

  const tokens: TextToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: text.substring(lastIndex, match.index),
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('http://') || matchedStr.startsWith('https://')) {
      const cleanUrl = matchedStr.replace(/[.,;:!?)]+$/, '');
      const trailing = matchedStr.slice(cleanUrl.length);

      tokens.push({
        type: 'link',
        value: cleanUrl,
        url: cleanUrl,
      });

      if (trailing) {
        tokens.push({
          type: 'text',
          value: trailing,
        });
      }
    } else if (matchedStr.startsWith('@')) {
      tokens.push({
        type: 'mention',
        value: matchedStr,
      });
    } else if (matchedStr.startsWith('#')) {
      tokens.push({
        type: 'hashtag',
        value: matchedStr,
      });
    } else {
      tokens.push({
        type: 'bible-ref',
        value: matchedStr,
      });
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      value: text.substring(lastIndex),
    });
  }

  return tokens;
}
