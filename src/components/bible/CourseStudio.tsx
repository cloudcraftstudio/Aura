import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Edit2, Trash2, Play, Loader, Video, Music } from 'lucide-react';
import { LiveSermonStudio } from './LiveSermonStudio';
import { PodcastLibraryStudio } from './PodcastLibraryStudio';

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
  const [activeSection, setActiveSection] = useState<'create' | 'add-lesson' | 'manage' | 'live' | 'podcast'>('create');

  // Submit loading states
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Create Course state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCover, setCourseCover] = useState<File | null>(null);
  const [courseCoverPreview, setCourseCoverPreview] = useState('');
  const [courseCategory, setCourseCategory] = useState('Theology');
  const [courseLevel, setCourseLevel] = useState('Beginner');

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

  // Edit Course Modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('Theology');
  const [editLevel, setEditLevel] = useState('Beginner');
  const [editCover, setEditCover] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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
          title: courseTitle,
          description: courseDesc,
          category: courseCategory,
          level: courseLevel
        })
      });

      if (res.ok) {
        setCourseTitle('');
        setCourseDesc('');
        setCourseCover(null);
        setCourseCoverPreview('');
        fetchCourses();
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
          title: lessonTitle,
          scriptureRef,
          notes: lessonNotes,
          mediaType,
          mediaUrl
        })
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
        setCourseLessons(prev => ({
          ...prev,
          [selectedCourse]: lessonsData.lessons
        }));
      }
    } catch (error) {
      console.error('Failed to add lesson:', error);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const fetchCourseLessons = async (courseId: string) => {
    if (courseLessons[courseId]) return;
    try {
      const res = await fetch(`/api/bible/courses/${courseId}/lessons`);
      const data = await res.json();
      setCourseLessons(prev => ({ ...prev, [courseId]: data.lessons }));
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string, courseId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await fetch(`/api/bible/lessons/${lessonId}`, { method: 'DELETE' });
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: (prev[courseId] || []).filter(l => l.id !== lessonId)
      }));
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.title || '');
    setEditDesc(course.description || '');
    setEditCategory(course.category || 'Theology');
    setEditLevel(course.level || 'Beginner');
    setEditCoverPreview(course.coverImage || '');
    setEditCover(null);
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editTitle.trim()) return;

    setSavingEdit(true);
    try {
      let finalCover = editCoverPreview;
      if (editCover) {
        const formData = new FormData();
        formData.append('file', editCover);
        const upRes = await fetch('/api/bible/upload', {
          method: 'POST',
          body: formData,
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalCover = upData.url;
        }
      }

      const res = await fetch(`/api/bible/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          coverImage: finalCover,
          category: editCategory,
          level: editLevel,
        }),
      });

      if (res.ok) {
        setEditingCourse(null);
        await fetchCourses();
      }
    } catch (err) {
      console.error('Failed to update course:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course and all its lessons?')) return;
    try {
      await fetch(`/api/bible/courses/${courseId}`, { method: 'DELETE' });
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setCourseLessons(prev => { const next = { ...prev }; delete next[courseId]; return next; });
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseCover(file);
      const reader = new FileReader();
      reader.onload = (event) => setCourseCoverPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMediaFile(file);
  };

  const handleYoutubePreview = () => {
    const videoId = extractYouTubeId(mediaUrl);
    if (videoId) setYoutubePreview(videoId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Section Navigation */}
      <div className="flex gap-4 mb-6 border-b border-blue-500/30 overflow-x-auto">
        <button
          onClick={() => setActiveSection('create')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeSection === 'create'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Plus className="inline mr-2 w-5 h-5" />
          Create Course
        </button>
        <button
          onClick={() => setActiveSection('add-lesson')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeSection === 'add-lesson'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Plus className="inline mr-2 w-5 h-5" />
          Add Lesson
        </button>
        <button
          onClick={() => setActiveSection('manage')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeSection === 'manage'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Edit2 className="inline mr-2 w-5 h-5" />
          My Courses
        </button>
        <button
          onClick={() => setActiveSection('live')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeSection === 'live'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Video className="inline mr-2 w-5 h-5" />
          Live Sermon
        </button>
        <button
          onClick={() => setActiveSection('podcast')}
          className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
            activeSection === 'podcast'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Music className="inline mr-2 w-5 h-5" />
          Podcast Library
        </button>
      </div>

      {/* Create Course Section */}
      {activeSection === 'create' && (
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-blue-300">Create New Course</h2>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Course Title</label>
            <input
              type="text"
              value={courseTitle}
              onChange={e => setCourseTitle(e.target.value)}
              placeholder="e.g., The Gospel of John"
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={courseDesc}
              onChange={e => setCourseDesc(e.target.value)}
              placeholder="Course description..."
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 h-24"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
            />
            {courseCoverPreview && (
              <div className="mt-3">
                <img src={courseCoverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={courseCategory}
                onChange={e => setCourseCategory(e.target.value)}
                className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
              >
                <option>Theology</option>
                <option>Daily Walk</option>
                <option>Gospels</option>
                <option>Old Testament</option>
                <option>New Testament</option>
                <option>Prophecy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Level</label>
              <select
                value={courseLevel}
                onChange={e => setCourseLevel(e.target.value)}
                className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Deep Study</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateCourse}
            disabled={!courseTitle.trim() || submittingCourse}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            {submittingCourse && <Loader className="w-4 h-4 animate-spin" />}
            {submittingCourse ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      )}

      {/* Add Lesson Section */}
      {activeSection === 'add-lesson' && (
        <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-blue-300">Add Lesson / Sermon</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Lesson Title</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={e => setLessonTitle(e.target.value)}
              placeholder="e.g., The New Birth"
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Scripture Reference</label>
            <input
              type="text"
              value={scriptureRef}
              onChange={e => setScriptureRef(e.target.value)}
              placeholder="e.g., John 3:1-21"
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Study Notes</label>
            <textarea
              value={lessonNotes}
              onChange={e => setLessonNotes(e.target.value)}
              placeholder="Reflection and study notes..."
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500 h-24"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Media Type</label>
            <select
              value={mediaType}
              onChange={e => setMediaType(e.target.value as any)}
              className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
            >
              <option value="none">None</option>
              <option value="youtube">YouTube Video</option>
              <option value="upload">Upload File</option>
            </select>
          </div>

          {mediaType !== 'none' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {mediaType === 'youtube' ? 'YouTube URL' : 'Media File'}
              </label>
              {mediaType === 'youtube' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={handleYoutubePreview}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Insert / Preview Video
                  </button>
                  {youtubePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">Preview:</p>
                      <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube-nocookie.com/embed/${youtubePreview}`}
                        title="YouTube preview"
                        className="rounded"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="file"
                  accept="video/*,audio/*,image/*"
                  onChange={handleMediaFileChange}
                  className="w-full bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white"
                />
              )}
            </div>
          )}

          <button
            onClick={handleAddLesson}
            disabled={!selectedCourse || !lessonTitle.trim() || submittingLesson}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            {submittingLesson && <Loader className="w-4 h-4 animate-spin" />}
            {submittingLesson ? 'Adding...' : 'Add Lesson'}
          </button>
        </div>
      )}

      {/* Manage Courses Section */}
      {activeSection === 'manage' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No courses created yet. Create your first course!
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="bg-blue-950/30 border border-blue-500/30 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                      {course.coverImage && (
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-blue-300">{course.title}</h3>
                      <p className="text-sm text-gray-400">{course.description}</p>
                      <div className="flex gap-2 mt-2">
                        {course.category && <span className="text-xs bg-blue-600/50 px-2 py-1 rounded">{course.category}</span>}
                        {course.level && <span className="text-xs bg-indigo-600/50 px-2 py-1 rounded">{course.level}</span>}
                      </div>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(course)}
                        className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        title="Edit course details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { fetchCourseLessons(course.id); setSelectedCourse(course.id); }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View lessons"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete course"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {courseLessons[course.id] && (
                    <div className="mt-4 space-y-2 border-t border-blue-500/20 pt-4">
                      <p className="text-sm text-gray-400 font-semibold">Lessons ({courseLessons[course.id].length})</p>
                      {courseLessons[course.id].map(lesson => (
                        <div key={lesson.id} className="bg-blue-900/20 p-3 rounded border border-blue-500/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-blue-200">{lesson.title}</p>
                              {lesson.scriptureRef && <p className="text-xs text-gray-400">{lesson.scriptureRef}</p>}
                              {lesson.mediaType === 'youtube' && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-400">
                                  <Play className="w-3 h-3" />
                                  YouTube Video
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id, course.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete lesson"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Live Sermon Tab */}
      {activeSection === 'live' && (
        <LiveSermonStudio />
      )}

      {/* Podcast Library Tab */}
      {activeSection === 'podcast' && (
        <PodcastLibraryStudio courses={courses} />
      )}
    
      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                Edit Course
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="Theology">Theology</option>
                    <option value="Bible Study">Bible Study</option>
                    <option value="Baptist Heritage">Baptist Heritage</option>
                    <option value="Discipleship">Discipleship</option>
                    <option value="Christian Living">Christian Living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Level</label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Cover Image</label>
                {editCoverPreview && (
                  <div className="mb-2 w-full h-32 rounded-xl overflow-hidden border border-white/10 relative">
                    <img src={editCoverPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setEditCover(f);
                      setEditCoverPreview(URL.createObjectURL(f));
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

</div>
  );
}
