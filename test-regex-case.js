const BIBLE_BOOKS = ["Genesis", "John"];
const BIBLE_TOPICS = ["Jesus", "Christ", "Holy Spirit", "God", "Bible"];

const standardPattern = `https?:\\/\\/[^\\s]+|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+`;
const bookPattern = BIBLE_BOOKS.join("|");
const versePattern = `\\b(?:${bookPattern})\\s+\\d+:\\d+(?:-\\d+)?\\b`;
const topicPattern = `\\b(?:${BIBLE_TOPICS.join("|")})\\b`;

const tokenRegex = new RegExp(`(${standardPattern}|${versePattern}|${topicPattern})`, 'gi');

console.log("I love jesus and john 3:16".match(tokenRegex));
