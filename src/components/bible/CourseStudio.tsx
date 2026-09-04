import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit3,
  Edit2,
  Trash2,
  Play,
  Loader,
  Video,
  Radio,
  GraduationCap,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LiveSermonStudio } from './LiveSermonStudio';
import { PodcastLibraryStudio } from './PodcastLibraryStudio';
import { UniversalUnsplashModal } from '../common/UniversalUnsplashModal';

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
  courseId: string;
  title: string;
  scriptureRef?: string;
  notes?: string;
  mediaType?: 'youtube' | 'upload' | 'none';
  mediaUrl?: string;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function CourseStudio() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<
    'podcast' | 'create' | 'add-lesson' | 'manage' | 'live'
  >('podcast');

  // Submit loading states
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Unsplash modal state
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [unsplashTarget, setUnsplashTarget] = useState<'create-course' | 'edit-course' | null>(null);

  // Create Course state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCoverPreview, setCourseCoverPreview] = useState('');
  const [courseCategory, setCourseCategory] = useState('Theology');
  const [courseLevel, setCourseLevel] = useState('Beginner');
  const courseFileInputRef = useRef<HTMLInputElement>(null);

  // Add Lesson state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');
  const [mediaType, setMediaType] = useState<'youtube' | 'upload' | 'none'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [youtubePreview, setYoutubePreview] = useState('');
  const [courseLessons, setCourseLessons] = useState<Record<string, Lesson[]>>({});
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Edit Course Modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('Theology');
  const [editLevel, setEditLevel] = useState('Beginner');
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || submittingCourse) return;

    setSubmittingCourse(true);
    try {
      const res = await fetch('/api/bible/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseTitle.trim(),
          description: courseDesc.trim(),
          category: courseCategory,
          level: courseLevel,
          coverImage: courseCoverPreview || '',
        }),
      });

      if (res.ok) {
        setCourseTitle('');
        setCourseDesc('');
        setCourseCoverPreview('');
        await fetchCourses();
        setActiveSection('manage');
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleAddLesson = async () => {
    if (!selectedCourse || !lessonTitle.trim() || submittingLesson) return;

    setSubmittingLesson(true);
    try {
      const res = await fetch(`/api/bible/courses/${selectedCourse}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          scriptureRef: scriptureRef.trim(),
          notes: lessonNotes.trim(),
          mediaType,
          mediaUrl: mediaUrl.trim(),
        }),
      });

      if (res.ok) {
        setLessonTitle('');
        setScriptureRef('');
        setLessonNotes('');
        setMediaUrl('');
        setYoutubePreview('');
        setMediaType('none');

        // Refresh lessons for this course
        const lessonsRes = await fetch(`/api/bible/courses/${selectedCourse}/lessons`);
        const lessonsData = await lessonsRes.json();
        setCourseLessons((prev) => ({
          ...prev,
          [selectedCourse]: lessonsData.lessons || [],
        }));
        setExpandedCourseId(selectedCourse);
        setActiveSection('manage');
      }
    } catch (error) {
      console.error('Failed to add lesson:', error);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const fetchCourseLessons = async (courseId: string) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    try {
      const res = await fetch(`/api/bible/courses/${courseId}/lessons`);
      const data = await res.json();
      setCourseLessons((prev) => ({
        ...prev,
        [courseId]: data.lessons || [],
      }));
      setExpandedCourseId(courseId);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/bible/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string, courseId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await fetch(`/api/bible/courses/${courseId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCourseLessons((prev) => ({
          ...prev,
          [courseId]: (prev[courseId] || []).filter((l) => l.id !== lessonId),
        }));
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditDesc(course.description || '');
    setEditCategory(course.category || 'Theology');
    setEditLevel(course.level || 'Beginner');
    setEditCoverPreview(course.coverImage || '');
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || savingEdit) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/bible/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          category: editCategory,
          level: editLevel,
          coverImage: editCoverPreview || '',
        }),
      });

      if (res.ok) {
        setEditingCourse(null);
        await fetchCourses();
      }
    } catch (error) {
      console.error('Failed to update course:', error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCoverDirectUpload = async (target: 'create' | 'edit', file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/bible/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.mediaUrl;
        if (target === 'create') {
          setCourseCoverPreview(url);
        } else {
          setEditCoverPreview(url);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (target === 'create') setCourseCoverPreview(dataUrl);
          else setEditCoverPreview(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Cover upload error:', err);
    }
  };

  const handleSelectUnsplash = (url: string) => {
    if (unsplashTarget === 'create-course') {
      setCourseCoverPreview(url);
    } else if (unsplashTarget === 'edit-course') {
      setEditCoverPreview(url);
    }
    setUnsplashTarget(null);
  };

  const handleYoutubePreview = () => {
    const videoId = extractYouTubeId(mediaUrl);
    if (videoId) setYoutubePreview(videoId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      {/* Universal Unsplash Picker Modal */}
      <UniversalUnsplashModal
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelect={handleSelectUnsplash}
        title="Select Course Cover Artwork"
        initialQuery="bible theology cross faith church"
      />

      {/* Hidden file inputs for direct cover uploads */}
      <input
        ref={courseFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCoverDirectUpload('create', file);
        }}
      />
      <input
        ref={editFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCoverDirectUpload('edit', file);
        }}
      />

      {/* Master 5-Tab Navigation Bar matching 'The Word' */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto shadow-xl">
        <button
          type="button"
          onClick={() => setActiveSection('podcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSection === 'podcast'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Podcast & Sermons</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('create')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSection === 'create'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('add-lesson')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSection === 'add-lesson'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Add Lesson</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('manage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeSection === 'manage'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>My Courses ({courses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('live')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ml-auto ${
            activeSection === 'live'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Live Broadcast</span>
        </button>
      </div>

      {/* SECTION 1: PODCAST & SERMON LIBRARY STUDIO */}
      {activeSection === 'podcast' && (
        <div className="space-y-4">
          <PodcastLibraryStudio courses={courses} />
        </div>
      )}

      {/* SECTION 2: CREATE COURSE */}
      {activeSection === 'create' && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Create New Bible Course</h2>
                <p className="text-xs text-slate-400">Design a structured discipleship series or topical study</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
              The Word Studio
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course Title *</label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g., The Gospel of John: Expository Discipleship"
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Objective</label>
            <textarea
              rows={3}
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              placeholder="Provide a comprehensive course overview, intended audience, and theological focus..."
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Cover Art Selector: Unsplash + Direct File Upload */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                Course Cover Image
              </span>
              {courseCoverPreview && (
                <button
                  type="button"
                  onClick={() => setCourseCoverPreview('')}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove Cover
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {courseCoverPreview ? (
                <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden border border-white/20 group shadow-md">
                  <img
                    src={courseCoverPreview}
                    alt="Course Cover Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUnsplashTarget('create-course');
                        setIsUnsplashOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                    >
                      Unsplash
                    </button>
                    <button
                      type="button"
                      onClick={() => courseFileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-slate-700 text-white text-[10px] font-bold"
                    >
                      Direct
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full sm:w-48 h-28 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
                  <span>No cover selected</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setUnsplashTarget('create-course');
                    setIsUnsplashOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Choose from Unsplash</span>
                </button>

                <button
                  type="button"
                  onClick={() => courseFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Direct Image Upload</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Theology">Theology & Doctrine</option>
                <option value="Daily Walk">Christian Living & Walk</option>
                <option value="Gospels">The Four Gospels</option>
                <option value="Old Testament">Old Testament Survey</option>
                <option value="New Testament">New Testament Epistles</option>
                <option value="Prophecy">Eschatology & Prophecy</option>
                <option value="Baptist Heritage">Baptist & Church History</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Level</label>
              <select
                value={courseLevel}
                onChange={(e) => setCourseLevel(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Beginner">Foundational / Beginner</option>
                <option value="Intermediate">Intermediate Discipleship</option>
                <option value="Deep Study">Expository / Deep Study</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateCourse}
            disabled={!courseTitle.trim() || submittingCourse}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {submittingCourse && <Loader className="w-4 h-4 animate-spin" />}
            <span>{submittingCourse ? 'Publishing Course...' : 'Create Course & Begin Curriculum'}</span>
          </button>
        </div>
      )}

      {/* SECTION 3: ADD LESSON */}
      {activeSection === 'add-lesson' && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Add Curriculum Lesson</h2>
                <p className="text-xs text-slate-400">Attach scripture verses, outlines, or media to a course</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Course *</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lesson Title *</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g., Lesson 1: The Incarnation of the Word"
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Scripture Reference</label>
              <input
                type="text"
                value={scriptureRef}
                onChange={(e) => setScriptureRef(e.target.value)}
                placeholder="e.g., John 1:1-14"
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Study Notes & Outline</label>
            <textarea
              rows={3}
              value={lessonNotes}
              onChange={(e) => setLessonNotes(e.target.value)}
              placeholder="Expository breakdown, memory verses, or discussion questions..."
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Media Attachment</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="none">Text-Only Study (No Media)</option>
              <option value="youtube">YouTube Video Sermon</option>
              <option value="upload">Uploaded Audio / Video File</option>
            </select>
          </div>

          {mediaType !== 'none' && (
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              {mediaType === 'youtube' ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleYoutubePreview}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Preview
                    </button>
                  </div>

                  {youtubePreview && (
                    <div className="rounded-xl overflow-hidden aspect-video border border-white/20">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube-nocookie.com/embed/${youtubePreview}`}
                        title="YouTube preview"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setMediaFile(f);
                    }}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddLesson}
            disabled={!selectedCourse || !lessonTitle.trim() || submittingLesson}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {submittingLesson && <Loader className="w-4 h-4 animate-spin" />}
            <span>{submittingLesson ? 'Saving Lesson...' : 'Save Lesson to Curriculum'}</span>
          </button>
        </div>
      )}

      {/* SECTION 4: MY COURSES */}
      {activeSection === 'manage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Published Courses & Curriculum
            </h3>
            <button
              type="button"
              onClick={() => setActiveSection('create')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Course</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader className="w-7 h-7 animate-spin text-blue-500" />
              <p className="text-xs text-slate-400">Loading your courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-12 text-center space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-base font-bold text-white">No courses created yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Begin by creating your first discipleship or expository course using the Create Course tab.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const lessons = courseLessons[course.id] || [];
                const isExpanded = expandedCourseId === course.id;

                return (
                  <div
                    key={course.id}
                    className="bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden shadow-xl transition-all"
                  >
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {course.coverImage ? (
                          <img
                            src={course.coverImage}
                            alt={course.title}
                            className="w-20 h-20 rounded-2xl object-cover border border-white/10 flex-shrink-0 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-white">{course.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 max-w-lg">
                            {course.description || 'No description provided.'}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            {course.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {course.category}
                              </span>
                            )}
                            {course.level && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {course.level}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourse(course.id);
                            setActiveSection('add-lesson');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Add Lesson"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Lesson</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fetchCourseLessons(course.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                          title="Toggle Lessons"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(course)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-blue-300 transition-all"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Lessons list */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/30 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Curriculum Lessons ({lessons.length})
                          </span>
                        </div>

                        {lessons.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-2">
                            No lessons added yet. Click &quot;Add Lesson&quot; above to create content for this course.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-white">{lesson.title}</p>
                                  {lesson.scriptureRef && (
                                    <p className="text-[11px] text-blue-300">{lesson.scriptureRef}</p>
                                  )}
                                  {lesson.mediaType === 'youtube' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-400">
                                      <Play className="w-3 h-3 fill-current" /> Video Lesson
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(lesson.id, course.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: LIVE SERMON STREAMING */}
      {activeSection === 'live' && (
        <div className="space-y-4">
          <LiveSermonStudio />
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setEditingCourse(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-950 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Edit Course Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Cover Art in Edit Modal */}
              <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-300">Cover Artwork</span>
                {editCoverPreview && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative">
                    <img
                      src={editCoverPreview}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUnsplashTarget('edit-course');
                      setIsUnsplashOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Unsplash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-blue-400" />
                    <span>Direct Upload</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs focus:border-blue-500 outline-none"
                  >
                    <option value="Theology">Theology</option>
                    <option value="Daily Walk">Daily Walk</option>
                    <option value="Gospels">Gospels</option>
                    <option value="Old Testament">Old Testament</option>
                    <option value="New Testament">New Testament</option>
                    <option value="Baptist Heritage">Baptist Heritage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-xs focus:border-blue-500 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Deep Study">Deep Study</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
