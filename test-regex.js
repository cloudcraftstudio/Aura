const bibleBooks = [
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

const topics = ["Jesus", "Christ", "Holy Spirit", "God", "Bible"];

// Create regex pattern
const bookPattern = bibleBooks.join("|");
const verseRegexStr = `\\b(?:${bookPattern})\\s+\\d+:\\d+(?:-\\d+)?\\b`;
const topicRegexStr = `\\b(?:${topics.join("|")})\\b`;

const combined = new RegExp(`(${verseRegexStr}|${topicRegexStr})`, 'g');

const text = "I love Jesus and John 3:16 but also 1 Corinthians 13:4-8. What about God?";
console.log(text.match(combined));
