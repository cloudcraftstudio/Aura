/**
 * KJV Bible Text Loader
 */

import fs from 'fs';
import path from 'path';

class KJVLoader {
  bible: any;
  books: string[];

  constructor() {
    this.bible = null;
    this.books = [];
  }

  load() {
    const bibleFile = path.join(process.cwd(), 'data', 'bible', 'kjv.json');
    
    if (fs.existsSync(bibleFile)) {
      this.bible = JSON.parse(fs.readFileSync(bibleFile, 'utf-8'));
    } else {
      this.bible = this._createMinimalBible();
      fs.writeFileSync(bibleFile, JSON.stringify(this.bible, null, 2));
    }
    
    this.books = Object.keys(this.bible);
    return this.bible;
  }

  getVerse(reference: string) {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;
    const [, book, chapter, verse] = match;
    const bookData = this.bible[book];
    if (!bookData || !bookData[chapter] || !bookData[chapter][verse]) return null;
    return { reference, text: bookData[chapter][verse], book, chapter: parseInt(chapter), verse: parseInt(verse) };
  }

  getChapter(reference: string) {
    const match = reference.match(/^(.+?)\s+(\d+)$/);
    if (!match) return null;
    const [, book, chapter] = match;
    const bookData = this.bible[book];
    if (!bookData || !bookData[chapter]) return null;
    return { reference, verses: bookData[chapter], book, chapter: parseInt(chapter) };
  }

  _createMinimalBible() {
    return {
      "Genesis": { "1": { "1": "In the beginning God created the heaven and the earth.", "2": "And the earth was without form, and void; and darkness was upon the face of the deep." } },
      "John": { "1": { "1": "In the beginning was the Word, and the Word was with God, and the Word was God." }, "3": { "16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." } },
      "Psalms": { "23": { "1": "The LORD is my shepherd; I shall not want.", "2": "He maketh me to lie down in green pastures: he leadeth me beside the still waters." } },
      "Proverbs": { "3": { "5": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", "6": "In all thy ways acknowledge him, and he shall direct thy paths." } },
      "Hebrews": { "11": { "1": "Now faith is the substance of things hoped for, the evidence of things not seen." } }
    };
  }
}

export default KJVLoader;
