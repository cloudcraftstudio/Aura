/**
 * Complete 66-Book KJV Bible with Featured Chapters & Verses
 */

export const BIBLE_BOOKS = {
  // Old Testament - Law
  'Genesis': {
    testament: 'Old Testament',
    category: 'Law',
    author: 'Moses',
    chapters: 50,
    featured: {
      chapters: [1, 3, 12, 37],
      verses: ['1:1', '3:15', '12:1-3', '37:1-40']
    }
  },
  'Exodus': {
    testament: 'Old Testament',
    category: 'Law',
    author: 'Moses',
    chapters: 40,
    featured: {
      chapters: [3, 12, 20, 33],
      verses: ['3:14', '12:1-14', '20:1-17', '33:12-23']
    }
  },
  'Leviticus': {
    testament: 'Old Testament',
    category: 'Law',
    author: 'Moses',
    chapters: 27,
    featured: {
      chapters: [16, 19, 23],
      verses: ['16:1-34', '19:1-18', '23:4-8']
    }
  },
  'Numbers': {
    testament: 'Old Testament',
    category: 'Law',
    author: 'Moses',
    chapters: 36,
    featured: {
      chapters: [6, 13, 21],
      verses: ['6:24-26', '13:1-33', '21:4-9']
    }
  },
  'Deuteronomy': {
    testament: 'Old Testament',
    category: 'Law',
    author: 'Moses',
    chapters: 34,
    featured: {
      chapters: [6, 10, 30],
      verses: ['6:4-9', '10:12-22', '30:11-20']
    }
  },
  // Old Testament - History
  'Joshua': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Joshua',
    chapters: 24,
    featured: {
      chapters: [1, 3, 6, 24],
      verses: ['1:8', '3:14-17', '6:1-20', '24:14-15']
    }
  },
  'Judges': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Samuel',
    chapters: 21,
    featured: {
      chapters: [6, 13, 16],
      verses: ['6:11-40', '13:1-25', '16:4-30']
    }
  },
  '1 Samuel': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Samuel',
    chapters: 31,
    featured: {
      chapters: [3, 16, 17],
      verses: ['3:1-21', '16:1-13', '17:1-58']
    }
  },
  '2 Samuel': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Nathan',
    chapters: 24,
    featured: {
      chapters: [7, 11, 12],
      verses: ['7:1-29', '11:1-27', '12:1-25']
    }
  },
  '1 Kings': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Jeremiah',
    chapters: 22,
    featured: {
      chapters: [3, 8, 18],
      verses: ['3:1-15', '8:22-53', '18:20-40']
    }
  },
  '2 Kings': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Jeremiah',
    chapters: 25,
    featured: {
      chapters: [5, 19, 25],
      verses: ['5:1-19', '19:1-37', '25:1-30']
    }
  },
  '1 Chronicles': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Ezra',
    chapters: 29,
    featured: {
      chapters: [17, 28, 29],
      verses: ['17:1-27', '28:1-21', '29:10-19']
    }
  },
  '2 Chronicles': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Ezra',
    chapters: 36,
    featured: {
      chapters: [7, 20, 36],
      verses: ['7:1-22', '20:1-30', '36:22-23']
    }
  },
  'Ezra': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Ezra',
    chapters: 10,
    featured: {
      chapters: [1, 3, 7],
      verses: ['1:1-11', '3:1-13', '7:1-28']
    }
  },
  'Nehemiah': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Nehemiah',
    chapters: 13,
    featured: {
      chapters: [1, 2, 8],
      verses: ['1:1-11', '2:1-20', '8:1-12']
    }
  },
  'Esther': {
    testament: 'Old Testament',
    category: 'History',
    author: 'Unknown',
    chapters: 10,
    featured: {
      chapters: [4, 7, 9],
      verses: ['4:12-17', '7:1-10', '9:1-32']
    }
  },
  // Old Testament - Poetry & Wisdom
  'Job': {
    testament: 'Old Testament',
    category: 'Poetry',
    author: 'Unknown',
    chapters: 42,
    featured: {
      chapters: [1, 19, 42],
      verses: ['1:1-22', '19:23-27', '42:1-17']
    }
  },
  'Psalms': {
    testament: 'Old Testament',
    category: 'Poetry',
    author: 'David',
    chapters: 150,
    featured: {
      chapters: [23, 42, 139],
      verses: ['23:1-6', '42:1-11', '139:1-24']
    }
  },
  'Proverbs': {
    testament: 'Old Testament',
    category: 'Wisdom',
    author: 'Solomon',
    chapters: 31,
    featured: {
      chapters: [3, 8, 31],
      verses: ['3:5-6', '8:1-36', '31:10-31']
    }
  },
  'Ecclesiastes': {
    testament: 'Old Testament',
    category: 'Wisdom',
    author: 'Solomon',
    chapters: 12,
    featured: {
      chapters: [1, 3, 12],
      verses: ['1:1-18', '3:1-8', '12:1-14']
    }
  },
  'Song of Solomon': {
    testament: 'Old Testament',
    category: 'Poetry',
    author: 'Solomon',
    chapters: 8,
    featured: {
      chapters: [2, 4, 8],
      verses: ['2:1-17', '4:1-16', '8:6-7']
    }
  },
  // Old Testament - Major Prophets
  'Isaiah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Isaiah',
    chapters: 66,
    featured: {
      chapters: [6, 40, 53],
      verses: ['6:1-13', '40:1-31', '53:1-12']
    }
  },
  'Jeremiah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Jeremiah',
    chapters: 52,
    featured: {
      chapters: [1, 29, 31],
      verses: ['1:1-19', '29:10-14', '31:31-34']
    }
  },
  'Lamentations': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Jeremiah',
    chapters: 5,
    featured: {
      chapters: [1, 3, 5],
      verses: ['1:1-22', '3:22-33', '5:1-22']
    }
  },
  'Ezekiel': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Ezekiel',
    chapters: 48,
    featured: {
      chapters: [1, 37, 47],
      verses: ['1:1-28', '37:1-14', '47:1-12']
    }
  },
  'Daniel': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Daniel',
    chapters: 12,
    featured: {
      chapters: [2, 6, 12],
      verses: ['2:1-49', '6:1-28', '12:1-13']
    }
  },
  // Old Testament - Minor Prophets
  'Hosea': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Hosea',
    chapters: 14,
    featured: {
      chapters: [1, 3, 14],
      verses: ['1:1-11', '3:1-5', '14:1-9']
    }
  },
  'Joel': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Joel',
    chapters: 3,
    featured: {
      chapters: [1, 2, 3],
      verses: ['1:1-20', '2:28-32', '3:1-21']
    }
  },
  'Amos': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Amos',
    chapters: 9,
    featured: {
      chapters: [3, 5, 9],
      verses: ['3:1-8', '5:4-6', '9:11-15']
    }
  },
  'Obadiah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Obadiah',
    chapters: 1,
    featured: {
      chapters: [1],
      verses: ['1:1-21']
    }
  },
  'Jonah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Jonah',
    chapters: 4,
    featured: {
      chapters: [1, 2, 4],
      verses: ['1:1-17', '2:1-10', '4:1-11']
    }
  },
  'Micah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Micah',
    chapters: 7,
    featured: {
      chapters: [5, 6, 7],
      verses: ['5:2-5', '6:6-8', '7:18-20']
    }
  },
  'Nahum': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Nahum',
    chapters: 3,
    featured: {
      chapters: [1, 2, 3],
      verses: ['1:1-15', '2:1-13', '3:1-19']
    }
  },
  'Habakkuk': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Habakkuk',
    chapters: 3,
    featured: {
      chapters: [1, 2, 3],
      verses: ['1:1-17', '2:1-20', '3:1-19']
    }
  },
  'Zephaniah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Zephaniah',
    chapters: 3,
    featured: {
      chapters: [1, 2, 3],
      verses: ['1:1-18', '2:1-15', '3:14-20']
    }
  },
  'Haggai': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Haggai',
    chapters: 2,
    featured: {
      chapters: [1, 2],
      verses: ['1:1-15', '2:1-23']
    }
  },
  'Zechariah': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Zechariah',
    chapters: 14,
    featured: {
      chapters: [1, 9, 14],
      verses: ['1:1-21', '9:1-17', '14:1-21']
    }
  },
  'Malachi': {
    testament: 'Old Testament',
    category: 'Prophecy',
    author: 'Malachi',
    chapters: 4,
    featured: {
      chapters: [1, 3, 4],
      verses: ['1:1-14', '3:1-18', '4:1-6']
    }
  },
  // New Testament - Gospels
  'Matthew': {
    testament: 'New Testament',
    category: 'Gospel',
    author: 'Matthew',
    chapters: 28,
    featured: {
      chapters: [1, 5, 28],
      verses: ['1:1-25', '5:1-12', '28:1-20']
    }
  },
  'Mark': {
    testament: 'New Testament',
    category: 'Gospel',
    author: 'Mark',
    chapters: 16,
    featured: {
      chapters: [1, 8, 16],
      verses: ['1:1-20', '8:27-38', '16:1-20']
    }
  },
  'Luke': {
    testament: 'New Testament',
    category: 'Gospel',
    author: 'Luke',
    chapters: 24,
    featured: {
      chapters: [1, 15, 24],
      verses: ['1:1-80', '15:1-32', '24:1-53']
    }
  },
  'John': {
    testament: 'New Testament',
    category: 'Gospel',
    author: 'John',
    chapters: 21,
    featured: {
      chapters: [1, 3, 21],
      verses: ['1:1-18', '3:1-21', '21:1-25']
    }
  },
  // New Testament - Acts
  'Acts': {
    testament: 'New Testament',
    category: 'History',
    author: 'Luke',
    chapters: 28,
    featured: {
      chapters: [1, 2, 17],
      verses: ['1:1-26', '2:1-47', '17:22-31']
    }
  },
  // New Testament - Paul's Epistles
  'Romans': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 16,
    featured: {
      chapters: [3, 6, 12],
      verses: ['3:21-31', '6:1-14', '12:1-21']
    }
  },
  '1 Corinthians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 16,
    featured: {
      chapters: [13, 15],
      verses: ['13:1-13', '15:1-58']
    }
  },
  '2 Corinthians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 13,
    featured: {
      chapters: [5, 12],
      verses: ['5:17-21', '12:1-10']
    }
  },
  'Galatians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 6,
    featured: {
      chapters: [2, 5],
      verses: ['2:20', '5:22-26']
    }
  },
  'Ephesians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 6,
    featured: {
      chapters: [1, 3, 6],
      verses: ['1:3-14', '3:14-21', '6:10-20']
    }
  },
  'Philippians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 4,
    featured: {
      chapters: [2, 4],
      verses: ['2:5-11', '4:4-9']
    }
  },
  'Colossians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 4,
    featured: {
      chapters: [1, 3],
      verses: ['1:15-20', '3:1-17']
    }
  },
  '1 Thessalonians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 5,
    featured: {
      chapters: [4, 5],
      verses: ['4:13-18', '5:16-18']
    }
  },
  '2 Thessalonians': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 3,
    featured: {
      chapters: [2, 3],
      verses: ['2:1-17', '3:1-18']
    }
  },
  '1 Timothy': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 6,
    featured: {
      chapters: [1, 6],
      verses: ['1:12-17', '6:10-12']
    }
  },
  '2 Timothy': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 4,
    featured: {
      chapters: [2, 4],
      verses: ['2:1-13', '4:1-8']
    }
  },
  'Titus': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 3,
    featured: {
      chapters: [1, 2, 3],
      verses: ['1:1-16', '2:1-15', '3:1-15']
    }
  },
  'Philemon': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Paul',
    chapters: 1,
    featured: {
      chapters: [1],
      verses: ['1:1-25']
    }
  },
  // New Testament - Hebrews & James
  'Hebrews': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Unknown',
    chapters: 13,
    featured: {
      chapters: [1, 11, 12],
      verses: ['1:1-4', '11:1-40', '12:1-3']
    }
  },
  'James': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'James',
    chapters: 5,
    featured: {
      chapters: [1, 2, 5],
      verses: ['1:2-4', '2:1-26', '5:7-11']
    }
  },
  // New Testament - Peter, John, Jude
  '1 Peter': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Peter',
    chapters: 5,
    featured: {
      chapters: [1, 2, 5],
      verses: ['1:3-9', '2:1-10', '5:6-11']
    }
  },
  '2 Peter': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Peter',
    chapters: 3,
    featured: {
      chapters: [1, 3],
      verses: ['1:1-21', '3:1-18']
    }
  },
  '1 John': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'John',
    chapters: 5,
    featured: {
      chapters: [1, 3, 5],
      verses: ['1:1-10', '3:1-10', '5:1-12']
    }
  },
  '2 John': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'John',
    chapters: 1,
    featured: {
      chapters: [1],
      verses: ['1:1-14']
    }
  },
  '3 John': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'John',
    chapters: 1,
    featured: {
      chapters: [1],
      verses: ['1:1-14']
    }
  },
  'Jude': {
    testament: 'New Testament',
    category: 'Epistle',
    author: 'Jude',
    chapters: 1,
    featured: {
      chapters: [1],
      verses: ['1:1-25']
    }
  },
  // New Testament - Revelation
  'Revelation': {
    testament: 'New Testament',
    category: 'Prophecy',
    author: 'John',
    chapters: 22,
    featured: {
      chapters: [1, 21, 22],
      verses: ['1:1-20', '21:1-27', '22:1-21']
    }
  }
};

export function getBibleBooks() {
  return BIBLE_BOOKS;
}

export function getBooksByTestament(testament: 'Old Testament' | 'New Testament') {
  return Object.entries(BIBLE_BOOKS)
    .filter(([_, book]) => book.testament === testament)
    .map(([name, book]) => ({ name, ...book }));
}

export function getBookMetadata(bookName: string) {
  return BIBLE_BOOKS[bookName as keyof typeof BIBLE_BOOKS];
}
