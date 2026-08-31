import { PrayerWall } from './PrayerWall';
import { ScriptureLinker } from './ScriptureLinker';
import React, { useState, useEffect } from 'react';
import { BookOpen, LayoutGrid, List, Share2, ChevronDown, Loader, MessageCircle, Sparkles, Play } from 'lucide-react';

import { PodcastFeed } from './PodcastFeed';
import { getBooksByTestament, getBookMetadata } from '../../data/bibleBooks';

interface Course {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  category?: string;
  level?: string;
}

interface Lesson {
  id: string;
  title: string;
  scriptureRef?: string;
  notes?: string;
  mediaType?: 'youtube' | 'upload' | 'vimeo' | string;
  mediaUrl?: string;
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
  const [activeTab, setActiveTab] = useState<'courses' | 'study' | 'podcasts' | 'prayers'>(() => {
    try {
      const saved = localStorage.getItem('aura_study_initial_tab');
      if (saved === 'prayer' || saved === 'prayers') {
        localStorage.removeItem('aura_study_initial_tab');
        return 'prayers';
      }
    } catch {}
    return 'courses';
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(false);
  const [courseViewMode, setCourseViewMode] = useState<'grid' | 'list'>('grid');

  // Study Engine state
  const [selectedTestament, setSelectedTestament] = useState<'Old Testament' | 'New Testament'>('New Testament');
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState('3');
  const [selectedVerse, setSelectedVerse] = useState('16');
  const [studyBreakdown, setStudyBreakdown] = useState<StudyBreakdown | null>(null);
  const [matchingSermons, setMatchingSermons] = useState<any[]>([]);
  const [studyLoading, setStudyLoading] = useState(false);
  const [bibleFontSize, setBibleFontSize] = useState<number>(18);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);

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

    const handleSwitchStudyTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string }>;
      const target = customEvent.detail?.tab;
      if (target === 'prayer' || target === 'prayers') {
        setActiveTab('prayers');
      } else if (target === 'courses' || target === 'study' || target === 'podcasts') {
        setActiveTab(target as any);
      }
    };

    window.addEventListener('switch_study_tab', handleSwitchStudyTab);
    return () => {
      window.removeEventListener('switch_study_tab', handleSwitchStudyTab);
    };
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
      const res = await fetch(`/api/bible/study?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}&verse=${selectedVerse}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      if (data && typeof data === 'object') {
        const safeData: StudyBreakdown = {
          passageText: data.passageText || `"${selectedBook} ${selectedChapter}:${selectedVerse}" — King James Version`,
          bookSummary: {
            author: data.bookSummary?.author || 'Biblical Author',
            era: data.bookSummary?.era || 'Biblical Antiquity',
            audience: data.bookSummary?.audience || "God's Covenant People"
          },
          historicalContext: {
            mindsetThen: data.historicalContext?.mindsetThen || 'The original audience lived in deep reverence for God\'s covenant word.',
            originalIssue: data.historicalContext?.originalIssue || `Spiritual guidance and truth in ${selectedBook} ${selectedChapter}:${selectedVerse}.`
          },
          thenVsNow: {
            then: data.thenVsNow?.then || 'Believers looked to God\'s promises for light and strength.',
            now: data.thenVsNow?.now || 'We apply this timeless divine wisdom to our daily walk.'
          },
          dailyApplication: Array.isArray(data.dailyApplication) && data.dailyApplication.length > 0
            ? data.dailyApplication
            : [
                'Reflect on how this passage speaks to your life today.',
                'Meditate on God\'s faithfulness in all circumstances.',
                'Share this encouraging scripture with someone in your community.'
              ],
          prayer: data.prayer || `Lord, open my eyes that I may behold wondrous things out of Thy law. Lead my steps today in Jesus' name. Amen.`
        };
        setStudyBreakdown(safeData);
      }

      // Fetch matching sermons on this passage from SermonIndex API
      try {
        const sermonRes = await fetch(`/api/bible/sermonindex/scripture/${encodeURIComponent(selectedBook)}/${selectedChapter}/${selectedVerse}`);
        if (sermonRes.ok) {
          const sermonData = await sermonRes.json();
          if (Array.isArray(sermonData)) {
            setMatchingSermons(sermonData);
          }
        }
      } catch (sErr) {
        console.warn('Failed to load matching sermons:', sErr);
      }
    } catch (error) {
      console.warn('Using client fallback for study breakdown:', error);
      setStudyBreakdown({
        passageText: `"${selectedBook} ${selectedChapter}:${selectedVerse}" — King James Version`,
        bookSummary: {
          author: 'Biblical Writer',
          era: 'Ancient Era',
          audience: "God's People"
        },
        historicalContext: {
          mindsetThen: 'The historical audience looked to God for salvation, hope, and covenant fellowship.',
          originalIssue: `Seeking divine instruction and peace in ${selectedBook} ${selectedChapter}:${selectedVerse}.`
        },
        thenVsNow: {
          then: 'Scripture guided their faith and everyday life.',
          now: 'God\'s timeless truth speaks directly into our modern hearts.'
        },
        dailyApplication: [
          'Read and meditate on this passage in its broader context.',
          'Bring your heartfelt prayers to God with faith.',
          'Walk in obedience and share Christ\'s love.'
        ],
        prayer: `Heavenly Father, bless my study of ${selectedBook} ${selectedChapter}:${selectedVerse}. Grant me wisdom, discernment, and peace. In Jesus' name, Amen.`
      });
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
      {/* King James Modal Removed */}

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
        <button
          onClick={() => setActiveTab('prayers')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'prayers'
              ? 'text-rose-400 border-b-2 border-rose-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <span>🙏</span>
          <span>Prayer Wall</span>
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Header Controls: View Toggle */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              {courses.length} Available {courses.length === 1 ? 'Course' : 'Courses'}
            </p>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setCourseViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  courseViewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCourseViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  courseViewMode === 'list'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className={courseViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {courses.map(course => (
              <div key={course.id} className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-blue-500/40 rounded-2xl overflow-hidden shadow-lg transition-all">
                {/* Course Cover Image Banner */}
                {course.coverImage ? (
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                      {course.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 text-white px-2 py-0.5 rounded-md shadow">
                          {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white px-2 py-0.5 rounded-md shadow">
                          {course.level}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 p-3 flex items-end justify-between border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      {course.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/80 text-white px-2 py-0.5 rounded-md">
                          {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600/80 text-white px-2 py-0.5 rounded-md">
                          {course.level}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => fetchLessons(course.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <div className="text-left flex-1 min-w-0 pr-3">
                    <h3 className="font-bold text-base sm:text-lg text-white truncate">{course.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 text-blue-400 transition-transform ${
                        expandedCourse === course.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
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
                                <p className="text-sm text-gray-200 leading-relaxed"><ScriptureLinker text={lesson.notes} onOpenStudy={(ref) => {
                                const spaceIdx = ref.lastIndexOf(' ');
                                if (spaceIdx !== -1) {
                                  const b = ref.slice(0, spaceIdx).trim();
                                  const rest = ref.slice(spaceIdx + 1).trim();
                                  const parts = rest.split(':');
                                  const c = parts[0] || '1';
                                  const v = parts[1] ? parts[1].split('-')[0] : '1';
                                  setSelectedBook(b);
                                  setSelectedChapter(c);
                                  setSelectedVerse(v);
                                }
                                setActiveTab('study');
                              }} /></p>
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
              }
            </div>
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
                    <p className="text-blue-200">{studyBreakdown.bookSummary?.author || 'Biblical Author'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Era</p>
                    <p className="text-blue-200">{studyBreakdown.bookSummary?.era || 'Biblical Antiquity'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Audience</p>
                    <p className="text-blue-200">{studyBreakdown.bookSummary?.audience || "God's Covenant People"}</p>
                  </div>
                </div>
              </div>

              {/* Historical Context */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Historical Context</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Mindset Then</p>
                    <p className="text-gray-200">{studyBreakdown.historicalContext?.mindsetThen || 'The audience looked to God for truth, protection, and hope.'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Original Issue</p>
                    <p className="text-gray-200">{studyBreakdown.historicalContext?.originalIssue || 'Spiritual growth and obedience to God\'s command.'}</p>
                  </div>
                </div>
              </div>

              {/* Then vs Now */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Then vs Now</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 font-semibold mb-2">Then</p>
                    <p className="text-gray-200">{studyBreakdown.thenVsNow?.then || 'Faithful believers relied on God\'s promises.'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-semibold mb-2">Now</p>
                    <p className="text-gray-200">{studyBreakdown.thenVsNow?.now || 'We walk by the same eternal Word and Holy Spirit today.'}</p>
                  </div>
                </div>
              </div>

              {/* Daily Application */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-3">Daily Application</h4>
                <ul className="space-y-2 text-sm">
                  {(studyBreakdown.dailyApplication || []).map((step, idx) => (
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
                <p className="text-gray-200 italic">{studyBreakdown.prayer || 'Lord, guide my heart and walk in Thy truth. Amen.'}</p>
              </div>

              {/* Expository Sermons on this Scripture from SermonIndex API */}
              {matchingSermons && matchingSermons.length > 0 && (
                <div className="bg-gradient-to-br from-[#0c133a] to-blue-950/60 border border-blue-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-400 fill-current" />
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        Expository Sermons on {selectedBook} {selectedChapter}:{selectedVerse}
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                      SermonIndex API
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Listen to historic and contemporary preachers open and expound this exact passage of Scripture:
                  </p>

                  <div className="space-y-2.5">
                    {matchingSermons.slice(0, 3).map((sermon: any) => (
                      <div
                        key={sermon.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-blue-400/50 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={sermon.speakerImage || sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80'}
                            alt={sermon.speaker}
                            className="w-10 h-10 rounded-xl object-cover border border-white/15 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{sermon.title}</p>
                            <p className="text-[11px] text-blue-300 truncate">{sermon.speaker} {sermon.duration ? `• ${sermon.duration}` : ''}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('podcasts');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 shadow"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Listen</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          {/* Prayer Wall Tab */}
      {activeTab === 'prayers' && (
        <div className="space-y-4">
          <PrayerWall />
        </div>
      )}

</div>
  );
}
