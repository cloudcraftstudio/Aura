import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  LayoutGrid, 
  List, 
  Share2, 
  ChevronDown, 
  Loader, 
  Sparkles, 
  Play, 
  Radio, 
  GraduationCap, 
  FileText, 
  Search, 
  BookMarked 
} from "lucide-react";

import { BibleReader } from "./BibleReader";
import { PodcastFeed } from "./PodcastFeed";
import { ScriptureLinker } from "./ScriptureLinker";
import { PrayerWall } from "./PrayerWall";
import { getBooksByTestament } from "../../data/bibleBooks";

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
  mediaType?: "youtube" | "upload" | "vimeo" | string;
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
  const [activeTab, setActiveTab] = useState<"reader" | "pulpit" | "study" | "courses" | "prayers">(() => {
    try {
      const saved = localStorage.getItem("aura_study_initial_tab");
      if (saved === "prayer" || saved === "prayers") {
        localStorage.removeItem("aura_study_initial_tab");
        return "prayers";
      }
      if (saved === "podcasts" || saved === "pulpit") return "pulpit";
      if (saved === "reader" || saved === "bible") return "reader";
    } catch {}
    return "reader";
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({});
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseViewSubTab, setCourseViewSubTab] = useState<"courses" | "lessons">("courses");
  const [courseDisplayMode, setCourseDisplayMode] = useState<"grid" | "list">("grid");

  const [selectedTestament, setSelectedTestament] = useState<"Old Testament" | "New Testament">("New Testament");
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [selectedChapter, setSelectedChapter] = useState("1");
  const [selectedVerse, setSelectedVerse] = useState("1");
  const [studyBreakdown, setStudyBreakdown] = useState<StudyBreakdown | null>(null);
  const [matchingSermons, setMatchingSermons] = useState<any[]>([]);
  const [studyLoading, setStudyLoading] = useState(false);

  const oldTestamentBooks = getBooksByTestament("Old Testament");
  const newTestamentBooks = getBooksByTestament("New Testament");
  const currentBooks = selectedTestament === "Old Testament" ? oldTestamentBooks : newTestamentBooks;

  useEffect(() => {
    fetchCourses();

    const handleSwitchStudyTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; reference?: string }>;
      const target = customEvent.detail?.tab;
      if (target === "prayer" || target === "prayers") setActiveTab("prayers");
      else if (target === "courses") setActiveTab("courses");
      else if (target === "study") setActiveTab("study");
      else if (target === "pulpit" || target === "podcasts") setActiveTab("pulpit");
      else if (target === "reader" || target === "bible") setActiveTab("reader");
    };

    window.addEventListener("aura_switch_study_tab", handleSwitchStudyTab);
    window.addEventListener("switch_study_tab", handleSwitchStudyTab);
    return () => window.removeEventListener("aura_switch_study_tab", handleSwitchStudyTab);
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/bible/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to load courses:", e);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }
    try {
      const res = await fetch("/api/bible/courses/" + courseId + "/lessons");
      if (res.ok) {
        const data = await res.json();
        setCourseLessons(prev => ({ ...prev, [courseId]: data.lessons || [] }));
        setExpandedCourse(courseId);
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const fetchStudyBreakdown = async (bookParam?: string, chapterParam?: string, verseParam?: string) => {
    const targetBook = bookParam || selectedBook;
    const targetChapter = chapterParam || selectedChapter;
    const targetVerse = verseParam || selectedVerse;

    setSelectedBook(targetBook);
    setSelectedChapter(targetChapter);
    setSelectedVerse(targetVerse);

    setStudyLoading(true);
    try {
      const res = await fetch("/api/bible/study?book=" + encodeURIComponent(targetBook) + "&chapter=" + targetChapter + "&verse=" + targetVerse);
      if (res.ok) {
        const data = await res.json();
        setStudyBreakdown({
          passageText: data.passageText || ("\"" + targetBook + " " + targetChapter + ":" + targetVerse + "\" — King James Version"),
          bookSummary: {
            author: data.bookSummary?.author || "Biblical Author",
            era: data.bookSummary?.era || "Biblical Antiquity",
            audience: data.bookSummary?.audience || "God's Covenant People"
          },
          historicalContext: {
            mindsetThen: data.historicalContext?.mindsetThen || "The original audience lived in deep reverence for God's covenant word.",
            originalIssue: data.historicalContext?.originalIssue || ("Spiritual guidance and truth in " + targetBook + " " + targetChapter + ":" + targetVerse)
          },
          thenVsNow: {
            then: data.thenVsNow?.then || "Believers looked to God's promises for light and strength.",
            now: data.thenVsNow?.now || "We apply this timeless divine wisdom to our daily walk."
          },
          dailyApplication: Array.isArray(data.dailyApplication) && data.dailyApplication.length > 0
            ? data.dailyApplication
            : [
                "Reflect on how this passage speaks to your life today.",
                "Meditate on God's faithfulness in all circumstances.",
                "Share this encouraging scripture with someone in your community."
              ],
          prayer: data.prayer || "Lord, open my eyes that I may behold wondrous things out of Thy law. Lead my steps today in Jesus' name. Amen."
        });
      }

      try {
        const sermonRes = await fetch("/api/bible/sermonindex/scripture/" + encodeURIComponent(targetBook) + "/" + targetChapter + "/" + targetVerse);
        if (sermonRes.ok) {
          const sData = await sermonRes.json();
          if (Array.isArray(sData)) setMatchingSermons(sData);
        }
      } catch (sErr) {
        console.warn("Matching sermon fetch failed:", sErr);
      }
    } catch (err) {
      console.error("Study breakdown error:", err);
    } finally {
      setStudyLoading(false);
    }
  };

  const handleShareStudy = async () => {
    if (!studyBreakdown) return;
    try {
      await fetch("/api/bible/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseRef: selectedBook + " " + selectedChapter + ":" + selectedVerse,
          passageText: studyBreakdown.passageText,
          takeaway: studyBreakdown.dailyApplication[0]
        })
      });
      window.dispatchEvent(new CustomEvent("open_share_modal", {
        detail: { type: "general", initialContent: "\"" + studyBreakdown.passageText + "\" — " + selectedBook + " " + selectedChapter + ":" + selectedVerse }
      }));
    } catch (e) {
      console.warn("Share failed:", e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Master 4-Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto shadow-xl">
        <button
          onClick={() => setActiveTab("reader")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all " + (
            activeTab === "reader"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bible</span>
        </button>

        <button
          onClick={() => setActiveTab("pulpit")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all " + (
            activeTab === "pulpit"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Radio className="w-4 h-4" />
          <span>Pulpit & Sermons</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("study");
            if (!studyBreakdown) fetchStudyBreakdown();
          }}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all " + (
            activeTab === "study"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Study Engine</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all " + (
            activeTab === "courses"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Courses</span>
        </button>

        <button
          onClick={() => setActiveTab("prayers")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ml-auto " + (
            activeTab === "prayers"
              ? "bg-rose-600 text-white shadow-lg"
              : "text-slate-400 hover:text-rose-300"
          )}
        >
          <span>🙏</span>
          <span>Prayer Wall</span>
        </button>
      </div>

      {/* TAB 1: BIBLE READER */}
      {activeTab === "reader" && (
        <div className="space-y-4">
          <BibleReader
            initialBook={selectedBook}
            initialChapter={selectedChapter}
            initialVerse={selectedVerse}
            onOpenStudyBreakdown={(b, c, v) => {
              fetchStudyBreakdown(b, c, v);
              setActiveTab("study");
            }}
            onShareToFeed={(verseRef, passageText) => {
              window.dispatchEvent(new CustomEvent("open_share_modal", {
                detail: { type: "general", initialContent: "\"" + passageText + "\" — " + verseRef }
              }));
            }}
          />
        </div>
      )}

      {/* TAB 2: PULPIT & SERMONS */}
      {activeTab === "pulpit" && (
        <div className="space-y-4">
          <PodcastFeed 
            onStudyPassage={(scriptureRef) => {
              const spaceIdx = scriptureRef.lastIndexOf(" ");
              if (spaceIdx !== -1) {
                const b = scriptureRef.slice(0, spaceIdx);
                const [c, v] = scriptureRef.slice(spaceIdx + 1).split(":");
                if (b && c) {
                  fetchStudyBreakdown(b, c, v ? v.split("-")[0] : "1");
                  setActiveTab("study");
                }
              }
            }} 
          />
        </div>
      )}

      {/* TAB 3: STUDY ENGINE */}
      {activeTab === "study" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-blue-400" />
                  <span>Expository Passage Selector</span>
                </h3>
                <p className="text-xs text-slate-400">Choose any scripture to open context, historical setting, and sermons</p>
              </div>

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-semibold w-fit">
                <button
                  onClick={() => setSelectedTestament("Old Testament")}
                  className={"px-3 py-1.5 rounded-lg transition-all " + (selectedTestament === "Old Testament" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
                >
                  Old Testament
                </button>
                <button
                  onClick={() => setSelectedTestament("New Testament")}
                  className={"px-3 py-1.5 rounded-lg transition-all " + (selectedTestament === "New Testament" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
                >
                  New Testament
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {currentBooks.map(b => (
                  <option key={b.name} value={b.name} className="bg-slate-900 text-white">{b.name}</option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                max="150"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                placeholder="Chapter"
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />

              <input
                type="number"
                min="1"
                max="176"
                value={selectedVerse}
                onChange={(e) => setSelectedVerse(e.target.value)}
                placeholder="Verse"
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={() => fetchStudyBreakdown()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Open Passage</span>
              </button>
            </div>
          </div>

          {studyLoading && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300">Retrieving expository breakdown for {selectedBook} {selectedChapter}:{selectedVerse}...</p>
            </div>
          )}

          {studyBreakdown && !studyLoading && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                    Scripture Text (KJV)
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{selectedBook} {selectedChapter}:{selectedVerse}</span>
                </div>
                <p className="text-lg sm:text-xl font-serif text-white italic leading-relaxed pt-1">
                  {studyBreakdown.passageText}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400">Book Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400">Author</p>
                    <p className="text-white font-bold mt-0.5">{studyBreakdown.bookSummary?.author}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400">Era</p>
                    <p className="text-white font-bold mt-0.5">{studyBreakdown.bookSummary?.era}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400">Audience</p>
                    <p className="text-white font-bold mt-0.5">{studyBreakdown.bookSummary?.audience}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400">Mindset of the Era</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{studyBreakdown.historicalContext?.mindsetThen}</p>
                </div>
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Original Purpose</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{studyBreakdown.historicalContext?.originalIssue}</p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400">Daily Life Application</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {(studyBreakdown.dailyApplication || []).map((app, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-blue-600/80 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 leading-relaxed">{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {matchingSermons.length > 0 && (
                <div className="bg-slate-900/70 border border-blue-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-400 fill-current" />
                      <span>Expositions on {selectedBook} {selectedChapter}:{selectedVerse}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                      SermonIndex
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchingSermons.slice(0, 4).map((s: any) => (
                      <div key={s.id} className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{s.title}</p>
                          <p className="text-[11px] text-blue-300 truncate">{s.speaker} {s.duration ? "• " + s.duration : ""}</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("pulpit")}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Pulpit</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleShareStudy}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl text-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Verse & Notes to Feed</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COURSES & LESSONS */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => setCourseViewSubTab("courses")}
                className={"flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all " + (
                  courseViewSubTab === "courses"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Full Courses</span>
              </button>
              <button
                onClick={() => setCourseViewSubTab("lessons")}
                className={"flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all " + (
                  courseViewSubTab === "lessons"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <FileText className="w-4 h-4" />
                <span>Individual Lessons</span>
              </button>
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setCourseDisplayMode("grid")}
                className={"p-2 rounded-lg transition-all " + (courseDisplayMode === "grid" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCourseDisplayMode("list")}
                className={"p-2 rounded-lg transition-all " + (courseDisplayMode === "list" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : courseViewSubTab === "courses" ? (
            <div className={courseDisplayMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
              {courses.map(course => (
                <div key={course.id} className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-blue-500/40 rounded-2xl overflow-hidden shadow-lg transition-all">
                  {course.coverImage && (
                    <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
                    </div>
                  )}

                  <button
                    onClick={() => fetchLessons(course.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-bold text-white text-base truncate">{course.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <ChevronDown className={"w-4 h-4 text-blue-400 transition-transform " + (expandedCourse === course.id ? "rotate-180" : "")} />
                    </div>
                  </button>

                  {expandedCourse === course.id && courseLessons[course.id] && (
                    <div className="bg-blue-900/10 border-t border-blue-500/20 p-4 space-y-2">
                      {courseLessons[course.id].map(lesson => (
                        <div key={lesson.id} className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                          <p className="font-semibold text-blue-200 text-sm">{lesson.title}</p>
                          {lesson.scriptureRef && (
                            <p className="text-xs text-slate-400">{lesson.scriptureRef}</p>
                          )}
                          {lesson.notes && (
                            <div className="text-xs text-slate-300 pt-1">
                              <ScriptureLinker text={lesson.notes} onOpenStudy={(ref) => {
                                const spaceIdx = ref.lastIndexOf(" ");
                                if (spaceIdx !== -1) {
                                  const b = ref.slice(0, spaceIdx);
                                  const [c, v] = ref.slice(spaceIdx + 1).split(":");
                                  fetchStudyBreakdown(b, c, v);
                                  setActiveTab("study");
                                }
                              }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.values(courseLessons).flat().length === 0 ? (
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Expand a course above to view lessons.
                </div>
              ) : (
                Object.values(courseLessons).flat().map((lesson, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 space-y-2">
                    <p className="font-bold text-white text-sm">{lesson.title}</p>
                    {lesson.scriptureRef && <p className="text-xs text-blue-400">{lesson.scriptureRef}</p>}
                    {lesson.notes && <p className="text-xs text-slate-300 leading-relaxed">{lesson.notes}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRAYER WALL */}
      {activeTab === "prayers" && (
        <div className="space-y-4">
          <PrayerWall />
        </div>
      )}
    </div>
  );
}
