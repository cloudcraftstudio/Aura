import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Types ──────────────────────────────────────────────────────────────────

export interface ParsedRef {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

export interface VerseResult {
  ref: ParsedRef;
  verses: { verse: number; text: string }[];
  bookSummary: string | null;
}

// ── Book name aliases ──────────────────────────────────────────────────────

const BOOK_ALIASES: Record<string, string> = {
  gen: 'Genesis', genesis: 'Genesis',
  ps: 'Psalms', psa: 'Psalms', psalm: 'Psalms', psalms: 'Psalms',
  prov: 'Proverbs', proverbs: 'Proverbs',
  isa: 'Isaiah', isaiah: 'Isaiah',
  matt: 'Matthew', mt: 'Matthew', matthew: 'Matthew',
  jn: 'John', john: 'John',
  rom: 'Romans', romans: 'Romans',
  '1cor': '1 Corinthians', '1 cor': '1 Corinthians', '1corinthians': '1 Corinthians',
  '1 corinthians': '1 Corinthians',
  phil: 'Philippians', php: 'Philippians', philippians: 'Philippians',
  jas: 'James', james: 'James',
  rev: 'Revelation', revelation: 'Revelation',
};

function normalizeBook(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  return BOOK_ALIASES[key] ?? raw;
}

// ── Scripture reference parser ─────────────────────────────────────────────
// Handles: "John 3:16", "Ps 23:1-6", "1 Cor 13:4", "James 2:3"

export function parseScriptureRef(input: string): ParsedRef | null {
  // Regex: optional leading digit + book name + chapter:verse[-verse]
  const match = input.trim().match(
    /^(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?$/
  );
  if (!match) return null;

  const [, rawBook, chStr, vsStr, veStr] = match;
  const book = normalizeBook(rawBook.trim());
  const chapter = parseInt(chStr, 10);
  const verseStart = parseInt(vsStr, 10);
  const verseEnd = veStr ? parseInt(veStr, 10) : verseStart;

  if (isNaN(chapter) || isNaN(verseStart)) return null;
  return { book, chapter, verseStart, verseEnd };
}

// ── KJV data loader ────────────────────────────────────────────────────────

let _kjv: Record<string, any> | null = null;

function getKJV(): Record<string, any> {
  if (!_kjv) {
    const dataPath = path.join(__dirname, '..', 'data', 'kjv_seed.json');
    _kjv = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }
  return _kjv!;
}

// ── Verse lookup ───────────────────────────────────────────────────────────

export function lookupVerses(ref: ParsedRef): VerseResult | null {
  const kjv = getKJV();
  const bookData = kjv[ref.book];
  if (!bookData) return null;

  const chapterData = bookData[String(ref.chapter)];
  if (!chapterData) return null;

  const verses: { verse: number; text: string }[] = [];
  for (let v = ref.verseStart; v <= ref.verseEnd; v++) {
    const text = chapterData[String(v)];
    if (text) verses.push({ verse: v, text });
  }

  if (verses.length === 0) return null;

  return {
    ref,
    verses,
    bookSummary: bookData.summary ?? null,
  };
}

export function lookupByString(input: string): VerseResult | null {
  const ref = parseScriptureRef(input);
  if (!ref) return null;
  return lookupVerses(ref);
}
