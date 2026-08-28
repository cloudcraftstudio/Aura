import React, { useState, useEffect } from 'react';
import { BookOpen, Share2, ChevronDown, Loader, MessageCircle, Sparkles, Play } from 'lucide-react';
import { KingJamesTutor } from './KingJamesTutor';
import { PodcastFeed } from './PodcastFeed';
import { getBooksByTestament, getBookMetadata } from '../../data/bibleBooks';

interface Course {
  id: string;
  title: string;
  description?: string;
}

interface Lesson {
  id: string;
  title: string;
  scriptureRef?: string;
}

interface StudyBreakdown {
  passageText: string;
  bookSummary: {
    author: string;
    era: string;
    audience: string;
  };
  historicalContext: {
    mindsetThen: string;
    originalIssue: string;
  };
  thenVsNow: {
    then: string;
    now: string;
  };
  dailyApplication: string[];
  prayer: string;
}

export function BibleStudy() {
  const [activeTab, setActiveTab] = useState<'courses' | 'study' | 'ask' | 'podcasts'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(false);

  // Study Engine state
  const [selectedTestament, setSelectedTestament] = useState<'Old Testament' | 'New Testament'>('New Testament');
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState('3');
  const [selectedVerse, setSelectedVerse] = useState('16');
  const [studyBreakdown, setStudyBreakdown] = useState<StudyBreakdown | null>(null);
  const [studyLoading, setStudyLoading] = useState(false);

  // Tutor state
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem('bible_onboarding_complete') === 'true';
    } catch {
      return false;
    }
  });

  const oldTestamentBooks = getBooksByTestament('Old Testament');
  const newTestamentBooks = getBooksByTestament('New Testament');
  const currentBooks = selectedTestament === 'Old Testament' ? oldTestamentBooks : newTestamentBooks;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bible/courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    if (courseLessons[courseId]) {
      setExpandedCourse(expandedCourse === courseId ? null : courseId);
      return;
    }

    try {
      const res = await fetch(`/api/bible/courses/${courseId}/lessons`);
      const data = await res.json();
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: data.lessons
      }));
      setExpandedCourse(courseId);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const fetchStudyBreakdown = async () => {
    setStudyLoading(true);
    try {
      const res = await fetch(`/api/bible/study?book=${selectedBook}&chapter=${selectedChapter}&verse=${selectedVerse}`);
      const data = await res.json();
      setStudyBreakdown(data);
    } catch (error) {
      console.error('Failed to fetch study breakdown:', error);
    } finally {
      setStudyLoading(false);
    }
  };

  const handleShare = async () => {
    if (!studyBreakdown) return;

    try {
      const res = await fetch('/api/bible/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseRef: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
          passageText: studyBreakdown.passageText,
          takeaway: studyBreakdown.dailyApplication[0]
        })
      });
      const sharePayload = await res.json();
      
      // Dispatch custom event to open share modal with the payload
      window.dispatchEvent(new CustomEvent('open_share_modal', {
        detail: { type: 'general' }
      }));
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* King James Tutor Modal */}
      <KingJamesTutor
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        isOnboarding={!hasCompletedOnboarding}
        onOnboardingComplete={() => {
          try {
            localStorage.setItem('bible_onboarding_complete', 'true');
          } catch {}
          setHasCompletedOnboarding(true);
          setIsTutorOpen(false);
        }}
      />

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-blue-500/30 overflow-x-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'courses'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <BookOpen className="inline mr-2 w-5 h-5" />
          Courses
        </button>
        <button
          onClick={() => setActiveTab('study')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'study'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Sparkles className="inline mr-2 w-5 h-5" />
          Study
        </button>
        <button
          onClick={() => setActiveTab('ask')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'ask'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <MessageCircle className="inline mr-2 w-5 h-5" />
          Ask King James
        </button>
        <button
          onClick={() => setActiveTab('podcasts')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'podcasts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Play className="inline mr-2 w-5 h-5" />
          Podcasts & Sermons
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="bg-blue-950/30 border border-blue-500/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => fetchLessons(course.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-blue-900/20 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-blue-300">{course.title}</h3>
                    <p className="text-sm text-gray-400">{course.description}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-400 transition-transform ${
                      expandedCourse === course.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedCourse === course.id && courseLessons[course.id] && (
                  <div className="bg-blue-900/10 border-t border-blue-500/20 p-4 space-y-2">
                    {courseLessons[course.id].map(lesson => (
                      <div key={lesson.id}>
                        <button
                          onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                          className="w-full text-left p-3 bg-blue-900/20 rounded border border-blue-500/20 hover:bg-blue-900/30 transition-colors"
                        >
                          <p className="font-semibold text-blue-200">{lesson.title}</p>
                          {lesson.scriptureRef && (
                            <p className="text-sm text-gray-400 mt-1">{lesson.scriptureRef}</p>
                          )}
                        </button>
                        
                        {expandedLesson === lesson.id && (
                          <div className="mt-2 p-3 bg-blue-900/30 rounded border border-blue-500/20 space-y-3">
                            {lesson.notes && (
                              <div>
                                <p className="text-sm text-gray-400 font-semibold">Notes:</p>
                                <p className="text-sm text-gray-200">{lesson.notes}</p>
                              </div>
                            )}
                            
                            {lesson.mediaType === 'youtube' && lesson.mediaUrl && (
                              <div>
                                <p className="text-sm text-gray-400 font-semibold mb-2">Video:</p>
                                {(() => {
                                  const vid = lesson.mediaUrl.match(
                                    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
                                  )?.[1];
                                  return vid ? (
                                    <iframe
                                      width="100%"
                                      height="250"
                                      src={`https://www.youtube-nocookie.com/embed/${vid}`}
                                      title={lesson.title}
                                      className="rounded"
                                      allowFullScreen
                                    />
                                  ) : null;
                                })()}
                              </div>
                            )}
                            
                            {lesson.mediaType === 'upload' && lesson.mediaUrl && (
                              <div>
                                <p className="text-sm text-gray-400 font-semibold mb-2">Media:</p>
                                {lesson.mediaUrl.match(/\.(mp4|webm|ogg)$/i) && (
                                  <video controls className="w-full rounded">
                                    <source src={lesson.mediaUrl} />
                                  </video>
                                )}
                                {lesson.mediaUrl.match(/\.(mp3|wav|ogg)$/i) && (
                                  <audio controls className="w-full">
                                    <source src={lesson.mediaUrl} />
                                  </audio>
                                )}
                                {lesson.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) && (
                                  <img src={lesson.mediaUrl} alt={lesson.title} className="w-full rounded" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Study Engine Tab */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          {/* Testament & Book Selector */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-bold text-lg text-blue-300 mb-4">Select Scripture</h3>
            
            {/* Testament Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedTestament('Old Testament');
                  setSelectedBook(oldTestamentBooks[0]?.name ?? '');
                }}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  selectedTestament === 'Old Testament'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-900/30 text-gray-300 hover:bg-blue-900/50'
                }`}
              >
                Old Testament
              </button>
              <button
                onClick={() => {
                  setSelectedTestament('New Testament');
                  setSelectedBook(newTestamentBooks[0]?.name ?? '');
                }}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  selectedTestament === 'New Testament'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-900/30 text-gray-300 hover:bg-blue-900/50'
                }`}
              >
                New Testament
              </button>
            </div>

            {/* Book Selector */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Book</label>
              <select
                value={selectedBook}
                onChange={e => setSelectedBook(e.target.value)}
                className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
              >
                {currentBooks.map(book => (
                  <option key={book.name} value={book.name}>{book.name}</option>
                ))}
              </select>
            </div>

            {/* Featured Chapters & Verses */}
            {selectedBook && getBookMetadata(selectedBook) && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Featured Chapters & Verses</p>
                <div className="flex flex-wrap gap-2">
                  {getBookMetadata(selectedBook)?.featured.chapters.map(ch => (
                    <button
                      key={`ch-${ch}`}
                      onClick={() => setSelectedChapter(ch.toString())}
                      className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-blue-200 rounded text-sm transition-colors"
                    >
                      Ch {ch}
                    </button>
                  ))}
                  {getBookMetadata(selectedBook)?.featured.verses.map(v => (
                    <button
                      key={`v-${v}`}
                      onClick={() => {
                        const [ch, vs] = v.split(':');
                        setSelectedChapter(ch);
                        setSelectedVerse(vs.split('-')[0]);
                      }}
                      className="px-3 py-1 bg-indigo-600/50 hover:bg-indigo-600 text-indigo-200 rounded text-sm transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter & Verse Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Chapter</label>
                <input
                  type="number"
                  value={selectedChapter}
                  onChange={e => setSelectedChapter(e.target.value)}
                  className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Verse</label>
                <input
                  type="number"
                  value={selectedVerse}
                  onChange={e => setSelectedVerse(e.target.value)}
                  className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
                  min="1"
                />
              </div>
            </div>

            <button
              onClick={fetchStudyBreakdown}
              disabled={studyLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 rounded transition-colors"
            >
              {studyLoading ? 'Loading...' : 'Generate Study Breakdown'}
            </button>
          </div>

          {/* Study Breakdown Display */}
          {studyBreakdown && (
            <div className="space-y-4">
              {/* Passage Text */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-2">Passage</h4>
                <p className="text-gray-200 italic">{studyBreakdown.passageText}</p>
              </div>

              {/* Book Summary */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Book Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Author</p>
                    <p className="text-blue-200">{studyBreakdown.bookSummary.author}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Era</p>
                    <p className="text-blue-200">{studyBreakdown.bookSummary.era}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Audience</p>
                    <p className="text-blue-200">{studyBreakdown.bookSummary.audience}</p>
                  </div>
                </div>
              </div>

              {/* Historical Context */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Historical Context</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Mindset Then</p>
                    <p className="text-gray-200">{studyBreakdown.historicalContext.mindsetThen}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Original Issue</p>
                    <p className="text-gray-200">{studyBreakdown.historicalContext.originalIssue}</p>
                  </div>
                </div>
              </div>

              {/* Then vs Now */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Then vs Now</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 font-semibold mb-2">Then</p>
                    <p className="text-gray-200">{studyBreakdown.thenVsNow.then}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-semibold mb-2">Now</p>
                    <p className="text-gray-200">{studyBreakdown.thenVsNow.now}</p>
                  </div>
                </div>
              </div>

              {/* Daily Application */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Daily Application</h4>
                <ul className="space-y-2 text-sm">
                  {studyBreakdown.dailyApplication.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-blue-400 font-bold">{idx + 1}.</span>
                      <span className="text-gray-200">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prayer */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-2">Closing Prayer</h4>
                <p className="text-gray-200 italic">{studyBreakdown.prayer}</p>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share to Feed
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ask King James Tab */}
      {activeTab === 'ask' && (
        <div className="space-y-4">
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-6 text-center">
            <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-blue-300 mb-2">Ask King James</h3>
            <p className="text-gray-300 mb-6">
              Have a question about scripture, theology, or how to apply God's Word to your life?
              Ask the King James AI Tutor for guidance and wisdom.
            </p>
            <button
              onClick={() => setIsTutorOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Open King James Tutor
            </button>
          </div>
        </div>
      )}

      {/* Podcasts & Sermons Tab */}
      {activeTab === 'podcasts' && (
        <PodcastFeed onStudyPassage={(scriptureRef) => {
          const spaceIdx = scriptureRef.lastIndexOf(' ');
          if (spaceIdx === -1) return;
          const book = scriptureRef.slice(0, spaceIdx);
          const [chapter, verse] = scriptureRef.slice(spaceIdx + 1).split(':');
          if (!book || !chapter) return;
          setSelectedBook(book);
          setSelectedChapter(chapter);
          setSelectedVerse(verse?.split('-')[0] || '1');
          setActiveTab('study');
        }} />
      )}
    </div>
  );
}
