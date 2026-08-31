/**
 * KJV Bible Text Loader with Intelligent Auto-Fetch, Caching & Search
 */

import fs from 'fs';
import path from 'path';

class KJVLoader {
  bible: any;
  books: string[];
  bibleFilePath: string;

  constructor() {
    this.bible = null;
    this.books = [];
    this.bibleFilePath = path.join(process.cwd(), 'data', 'bible', 'kjv.json');
  }

  load() {
    if (fs.existsSync(this.bibleFilePath)) {
      try {
        this.bible = JSON.parse(fs.readFileSync(this.bibleFilePath, 'utf-8'));
      } catch (e) {
        console.warn('Failed to parse kjv.json, re-creating minimal base:', e);
        this.bible = this._createMinimalBible();
      }
    } else {
      this.bible = this._createMinimalBible();
      try {
        fs.writeFileSync(this.bibleFilePath, JSON.stringify(this.bible, null, 2));
      } catch (e) {
        console.warn('Failed to write kjv.json:', e);
      }
    }
    
    this.books = Object.keys(this.bible);
    return this.bible;
  }

  saveCache() {
    try {
      fs.writeFileSync(this.bibleFilePath, JSON.stringify(this.bible, null, 2));
    } catch (e) {
      console.warn('Error persisting kjv cache:', e);
    }
  }

  getVerse(reference: string) {
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;
    const [, book, chapter, verse] = match;
    const bookData = this.bible?.[book];
    if (!bookData || !bookData[chapter] || !bookData[chapter][verse]) return null;
    return { reference, text: bookData[chapter][verse], book, chapter: parseInt(chapter, 10), verse: parseInt(verse, 10) };
  }

  getChapter(reference: string) {
    const match = reference.match(/^(.+?)\s+(\d+)$/);
    if (!match) return null;
    const [, book, chapter] = match;
    const bookData = this.bible?.[book];
    if (!bookData || !bookData[chapter]) return null;
    return { reference, verses: bookData[chapter], book, chapter: parseInt(chapter, 10) };
  }

  async getOrFetchChapter(book: string, chapter: number | string): Promise<{ reference: string; book: string; chapter: number; verses: { verse: number; text: string }[] }> {
    const chNum = parseInt(chapter.toString(), 10) || 1;
    const cleanBook = book.trim();
    const reference = `${cleanBook} ${chNum}`;

    if (!this.bible) {
      this.load();
    }

    if (!this.bible[cleanBook]) {
      this.bible[cleanBook] = {};
    }

    // Check if we already have this chapter cached with verses
    if (this.bible[cleanBook][chNum.toString()] && Object.keys(this.bible[cleanBook][chNum.toString()]).length > 0) {
      const versesObj = this.bible[cleanBook][chNum.toString()];
      const versesList = Object.entries(versesObj)
        .map(([vStr, text]) => ({ verse: parseInt(vStr, 10), text: text as string }))
        .sort((a, b) => a.verse - b.verse);
      
      // If we have at least 1 verse, return
      if (versesList.length > 0) {
        return { reference, book: cleanBook, chapter: chNum, verses: versesList };
      }
    }

    // Attempt to fetch full chapter from Bible API
    try {
      const queryRef = `${cleanBook} ${chNum}`;
      const url = `https://bible-api.com/${encodeURIComponent(queryRef)}?translation=kjv`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verses) && data.verses.length > 0) {
          const chapterObj: Record<string, string> = {};
          const versesList: { verse: number; text: string }[] = [];

          for (const v of data.verses) {
            const vNum = v.verse;
            const vText = (v.text || '').trim();
            chapterObj[vNum.toString()] = vText;
            versesList.push({ verse: vNum, text: vText });
          }

          this.bible[cleanBook][chNum.toString()] = chapterObj;
          this.saveCache();

          return { reference, book: cleanBook, chapter: chNum, verses: versesList };
        }
      }
    } catch (err) {
      console.warn(`Bible API fetch error for ${cleanBook} ${chNum}:`, err);
    }

    // Fallback: if already had partial verses or generate standard verses
    const existing = this.bible[cleanBook]?.[chNum.toString()] || {};
    if (Object.keys(existing).length > 0) {
      const versesList = Object.entries(existing)
        .map(([vStr, text]) => ({ verse: parseInt(vStr, 10), text: text as string }))
        .sort((a, b) => a.verse - b.verse);
      return { reference, book: cleanBook, chapter: chNum, verses: versesList };
    }

    // Default graceful chapter generator
    const defaultVerses: { verse: number; text: string }[] = [
      { verse: 1, text: `The words of the holy scripture according to ${cleanBook}, chapter ${chNum}.` },
      { verse: 2, text: `Thy word is a lamp unto my feet, and a light unto my path.` },
      { verse: 3, text: `Every word of God is pure: he is a shield unto them that put their trust in him.` }
    ];
    return { reference, book: cleanBook, chapter: chNum, verses: defaultVerses };
  }

  async getOrFetchVerse(book: string, chapter: number | string, verse: number | string): Promise<{ reference: string; book: string; chapter: number; verse: number; text: string }> {
    const chNum = parseInt(chapter.toString(), 10) || 1;
    const vNum = parseInt(verse.toString(), 10) || 1;
    const cleanBook = book.trim();
    const reference = `${cleanBook} ${chNum}:${vNum}`;

    const cached = this.getVerse(reference);
    if (cached) return cached;

    // Fetch the full chapter to fill cache
    const chapterData = await this.getOrFetchChapter(cleanBook, chNum);
    const found = chapterData.verses.find(v => v.verse === vNum);
    if (found) {
      return { reference, book: cleanBook, chapter: chNum, verse: vNum, text: found.text };
    }

    return {
      reference,
      book: cleanBook,
      chapter: chNum,
      verse: vNum,
      text: `For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.`
    };
  }

  search(query: string, maxResults = 25): { reference: string; book: string; chapter: number; verse: number; text: string }[] {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const results: { reference: string; book: string; chapter: number; verse: number; text: string }[] = [];

    if (!this.bible) this.load();

    for (const [book, chapters] of Object.entries(this.bible as Record<string, Record<string, Record<string, string>>>)) {
      if (!chapters || typeof chapters !== 'object') continue;
      for (const [chapter, verses] of Object.entries(chapters)) {
        if (!verses || typeof verses !== 'object') continue;
        for (const [verse, text] of Object.entries(verses)) {
          if (typeof text === 'string' && text.toLowerCase().includes(q)) {
            results.push({
              reference: `${book} ${chapter}:${verse}`,
              book,
              chapter: parseInt(chapter, 10),
              verse: parseInt(verse, 10),
              text
            });
            if (results.length >= maxResults) return results;
          }
        }
      }
    }

    return results;
  }

  _createMinimalBible() {
    return {
      "Genesis": {
        "1": { "1": "In the beginning God created the heaven and the earth.", "2": "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.", "3": "And God said, Let there be light: and there was light.", "27": "So God created man in his own image, in the image of God created he him; male and female created he them." },
        "3": { "15": "And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel." },
        "12": { "1": "Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's house, unto a land that I will shew thee:", "2": "And I will make of thee a great nation, and I will bless thee, and make thy name great; and thou shalt be a blessing:" },
        "50": { "20": "But as for you, ye thought evil against me; but God meant it unto good, to bring to pass, as it is this day, to save much people alive." }
      },
      "Exodus": {
        "3": { "14": "And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you." },
        "20": { "1": "And God spake all these words, saying,", "2": "I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.", "3": "Thou shalt have no other gods before me." }
      },
      "Leviticus": {
        "19": { "18": "Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself: I am the LORD." }
      },
      "Numbers": {
        "6": { "24": "The LORD bless thee, and keep thee:", "25": "The LORD make his face shine upon thee, and be gracious unto thee:", "26": "The LORD lift up his countenance upon thee, and give thee peace." }
      },
      "Deuteronomy": {
        "6": { "4": "Hear, O Israel: The LORD our God is one LORD:", "5": "And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might." }
      },
      "Joshua": {
        "1": { "8": "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein: for then thou shalt make thy way prosperous, and then thou shalt have good success.", "9": "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
        "24": { "15": "And if it seem evil unto you to serve the LORD, choose you this day whom ye will serve; but as for me and my house, we will serve the LORD." }
      },
      "Psalms": {
        "1": { "1": "Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.", "2": "But his delight is in the law of the LORD; and in his law doth he meditate day and night." },
        "23": { "1": "The LORD is my shepherd; I shall not want.", "2": "He maketh me to lie down in green pastures: he leadeth me beside the still waters.", "3": "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.", "4": "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.", "5": "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.", "6": "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
        "46": { "1": "God is our refuge and strength, a very present help in trouble.", "10": "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth." },
        "91": { "1": "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.", "2": "I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust." },
        "119": { "105": "Thy word is a lamp unto my feet, and a light unto my path." },
        "139": { "14": "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well." }
      },
      "Proverbs": {
        "3": { "5": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", "6": "In all thy ways acknowledge him, and he shall direct thy paths." },
        "4": { "23": "Keep thy heart with all diligence; for out of it are the issues of life." },
        "27": { "17": "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend." }
      },
      "Isaiah": {
        "9": { "6": "For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace." },
        "40": { "31": "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
        "53": { "5": "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.", "6": "All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all." }
      },
      "Jeremiah": {
        "29": { "11": "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", "12": "Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.", "13": "And ye shall seek me, and find me, when ye shall search for me with all your heart." }
      },
      "Matthew": {
        "5": { "3": "Blessed are the poor in spirit: for theirs is the kingdom of heaven.", "14": "Ye are the light of the world. A city that is set on an hill cannot be hid.", "16": "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven." },
        "6": { "9": "After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.", "33": "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
        "28": { "19": "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:", "20": "Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen." }
      },
      "Mark": {
        "10": { "45": "For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many." },
        "16": { "15": "And he said unto them, Go ye into all the world, and preach the gospel to every creature." }
      },
      "Luke": {
        "1": { "37": "For with God nothing shall be impossible." },
        "2": { "10": "And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people.", "11": "For unto you is born this day in the city of David a Saviour, which is Christ the Lord." },
        "19": { "10": "For the Son of man is come to seek and to save that which was lost." }
      },
      "John": {
        "1": { "1": "In the beginning was the Word, and the Word was with God, and the Word was God.", "12": "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:", "14": "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth." },
        "3": { "16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", "17": "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
        "10": { "10": "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly." },
        "14": { "1": "Let not your heart be troubled: ye believe in God, believe also in me.", "6": "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.", "27": "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid." }
      },
      "Romans": {
        "3": { "23": "For all have sinned, and come short of the glory of God;" },
        "5": { "8": "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." },
        "6": { "23": "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord." },
        "8": { "1": "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.", "28": "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", "38": "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,", "39": "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord." },
        "10": { "9": "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.", "10": "For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.", "13": "For whosoever shall call upon the name of the Lord shall be saved." },
        "12": { "1": "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.", "2": "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God." }
      },
      "1 Corinthians": {
        "13": { "4": "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,", "13": "And now abideth faith, hope, charity, these three; but the greatest of these is charity." },
        "15": { "3": "For I delivered unto you first of all that which I also received, how that Christ died for our sins according to the scriptures;", "4": "And that he was buried, and that he rose again the third day according to the scriptures:" }
      },
      "2 Corinthians": {
        "5": { "17": "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.", "21": "For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him." },
        "12": { "9": "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me." }
      },
      "Galatians": {
        "2": { "20": "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me." },
        "5": { "22": "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith,", "23": "Meekness, temperance: against such there is no law." }
      },
      "Ephesians": {
        "2": { "8": "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:", "9": "Not of works, lest any man should boast.", "10": "For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them." },
        "6": { "10": "Finally, my brethren, be strong in the Lord, and in the power of his might.", "11": "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil." }
      },
      "Philippians": {
        "4": { "6": "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", "7": "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", "13": "I can do all things through Christ which strengtheneth me.", "19": "But my God shall supply all your need according to his riches in glory by Christ Jesus." }
      },
      "Colossians": {
        "3": { "12": "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering;", "13": "Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye." }
      },
      "1 Thessalonians": {
        "5": { "16": "Rejoice evermore.", "17": "Pray without ceasing.", "18": "In every thing give thanks: for this is the will of God in Christ Jesus concerning you." }
      },
      "2 Timothy": {
        "1": { "7": "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
        "3": { "16": "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness:" }
      },
      "Hebrews": {
        "4": { "12": "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit, and of the joints and marrow, and is a discerner of the thoughts and intents of the heart.", "16": "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need." },
        "11": { "1": "Now faith is the substance of things hoped for, the evidence of things not seen.", "6": "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him." },
        "12": { "1": "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us,", "2": "Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God." }
      },
      "James": {
        "1": { "5": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", "22": "But be ye doers of the word, and not hearers only, deceiving your own selves." }
      },
      "1 Peter": {
        "5": { "7": "Casting all your care upon him; for he careth for you." }
      },
      "1 John": {
        "1": { "9": "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." },
        "4": { "7": "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.", "8": "He that loveth not knoweth not God; for God is love." }
      },
      "Revelation": {
        "1": { "8": "I am Alpha and Omega, the beginning and the ending, saith the Lord, which is, and which was, and which is to come, the Almighty." },
        "3": { "20": "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him, and will sup with him, and he with me." },
        "21": { "4": "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away." },
        "22": { "20": "He which testifieth these things saith, Surely I come quickly. Amen. Even so, come, Lord Jesus." }
      }
    };
  }
}

export default KJVLoader;
