import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  MessageCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Share2, 
  BookOpen, 
  Languages, 
  Shield, 
  HeartHandshake, 
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { createPlayableAudioBlob, base64ToUint8Array, fetchBibleTtsAudio, unlockAudioForMobile } from '../../utils/audioUtils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'king-james';
  content: string;
  timestamp: string;
  versesCited?: string[];
  hebrewGreekWords?: Array<{ word: string; transliteration?: string; language: string; definition: string }>;
  suggestedQuestions?: string[];
}

interface KingJamesTutorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOnboardingComplete?: (goals: string) => void;
  isOnboarding?: boolean;
  isInline?: boolean;
  onStudyVerse?: (verseRef: string) => void;
}

const STARTER_TOPICS = [
  {
    title: 'Melchizedek & Christ',
    query: 'Who was Melchizedek and why does the Book of Hebrews call Jesus a priest after his order?',
    category: 'Theology',
  },
  {
    title: 'Justification vs Sanctification',
    query: 'What is the biblical difference between Justification and Sanctification in the Pauline epistles?',
    category: 'Doctrine',
  },
  {
    title: 'The Whole Armor of God',
    query: 'Explain the 6 pieces of the Whole Armour of God in Ephesians 6:10-18 and their spiritual significance.',
    category: 'Exegesis',
  },
  {
    title: 'Greek Words for Love',
    query: 'What is the original Greek difference between Agape, Phileo, and Storge in the New Testament?',
    category: 'Languages',
  },
  {
    title: 'The Tabernacle Types',
    query: 'How does the wilderness Tabernacle and its furniture foreshadow the person and work of Jesus Christ?',
    category: 'Typology',
  },
  {
    title: 'Overcoming Anxiety in Scripture',
    query: 'What does Philippians 4:6-7 and 1 Peter 5:7 teach believers about casting all care upon the Lord?',
    category: 'Pastoral',
  },
];

const STUDY_MODES = [
  { id: 'general', label: 'All Biblical Knowledge', icon: GraduationCap },
  { id: 'exegesis', label: 'Verse Exegesis & Exposition', icon: BookOpen },
  { id: 'word_study', label: 'Hebrew & Greek Word Study', icon: Languages },
  { id: 'theology', label: 'Systematic Theology & Covenants', icon: Shield },
  { id: 'pastoral', label: 'Pastoral & Daily Walk', icon: HeartHandshake },
];

export function KingJamesTutor({
  isOpen = true,
  onClose,
  onOnboardingComplete,
  isOnboarding = false,
  isInline = false,
  onStudyVerse,
}: KingJamesTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('kj_tutor_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('general');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'initial-greeting',
        role: 'king-james',
        content: isOnboarding
          ? `### Welcome, Dear Seeker of Truth\n\nI am **King James**, your interactive AI Biblical Scholar and Study Companion. I am thoroughly versed in the Holy Scriptures, ancient historical backgrounds, theology, and the original Greek and Hebrew texts.\n\nWhat spiritual or biblical goals dost thou desire to pursue in thy study of God's Word?`
          : `### Greetings in the Name of the Lord\n\nI am **King James**, your interactive Biblical Scholar & Theological Guide. I am equipped to answer **any question** regarding the Holy Scriptures—from deep systematic theology and original Greek/Hebrew word meanings to historical contexts, prophetic covenants, and practical Christian living.\n\n*What question or scripture passage dost thou wish to explore today?*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Who was Melchizedek and what is his priesthood?',
          'What is the difference between Justification and Sanctification?',
          'Explain the Whole Armor of God in Ephesians 6',
        ],
      };
      setMessages([initialGreeting]);
    }
  }, [isOnboarding]);

  // Persist history
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('kj_tutor_history', JSON.stringify(messages.slice(-30)));
      } catch {}
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/bible/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          history: historyPayload,
          mode: selectedMode,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `kj-${Date.now()}`,
        role: 'king-james',
        content: data.answer || 'Thy inquiry is received. Let us examine the scriptures together.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        versesCited: data.versesCited || [],
        hebrewGreekWords: data.hebrewGreekWords || [],
        suggestedQuestions: data.suggestedQuestions || [],
      };

      setMessages(prev => [...prev, botMessage]);

      if (isOnboarding && messages.length >= 2) {
        onOnboardingComplete?.(query);
      }
    } catch (err) {
      console.error('Failed to get King James response:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'king-james',
        content: `### Biblical Truth & Wisdom\n\n*"Thy word is a lamp unto my feet, and a light unto my path."* (Psalm 119:105)\n\nGod's holy Word contains all things needful for life and godliness. Let us continue to examine the scriptures in faith and prayer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'What are key scripture references for this topic?',
          'What is the original Greek or Hebrew background?',
        ],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('kj_tutor_history');
    const initialGreeting: ChatMessage = {
      id: `initial-${Date.now()}`,
      role: 'king-james',
      content: `### Knowledge of the Holy Scriptures\n\nPeace be unto thee. The study record hath been renewed. What biblical doctrine, passage, character, or inquiry wouldst thou like to examine together?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'Who was Melchizedek and what is his priesthood?',
        'Explain the Beatitudes in Matthew 5',
        'What is the difference between Justification and Sanctification?',
      ],
    };
    setMessages([initialGreeting]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToFeed = (msg: ChatMessage) => {
    const cleanSnippet = msg.content.replace(/[#*_`]/g, '').slice(0, 280);
    window.dispatchEvent(
      new CustomEvent('open_share_modal', {
        detail: {
          type: 'bible_takeaway',
          title: 'Biblical Insight from King James Tutor',
          text: cleanSnippet,
          verseRef: msg.versesCited?.[0] || '2 Timothy 3:16',
        },
      })
    );
  };

  const handlePlayVoice = async (msg: ChatMessage) => {
    if (playingAudioId === msg.id) {
      audioPlayer?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    setAudioLoadingId(msg.id);
    try {
      unlockAudioForMobile(audioPlayer, null);
      const ttsResult = await fetchBibleTtsAudio(msg.content);

      if (ttsResult && ttsResult.audio) {
        const bytes = base64ToUint8Array(ttsResult.audio);
        const audioBlob = createPlayableAudioBlob(bytes, ttsResult.mimeType);
        const audioUrl = URL.createObjectURL(audioBlob);
        const player = new Audio(audioUrl);
        setAudioPlayer(player);
        setPlayingAudioId(msg.id);

        player.onended = () => {
          setPlayingAudioId(null);
          URL.revokeObjectURL(audioUrl);
        };
        player.onerror = () => {
          setPlayingAudioId(null);
          URL.revokeObjectURL(audioUrl);
        };
        await player.play();
      }
    } catch (e) {
      console.warn('Could not generate voice synthesis:', e);
    } finally {
      setAudioLoadingId(null);
    }
  };

  // Render markdown helper
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-bold text-base text-amber-300 pt-2 pb-1 border-b border-amber-500/20">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          // Heading 4
          if (trimmed.startsWith('#### ')) {
            return (
              <h4 key={idx} className="font-semibold text-blue-300 pt-1">
                {trimmed.replace('#### ', '')}
              </h4>
            );
          }
          // Blockquote (Scripture)
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-3 py-1 my-1 border-l-2 border-amber-400 bg-amber-950/20 text-amber-100 italic rounded-r">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-amber-400 mt-1">•</span>
                <span className="text-gray-200">{trimmed.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          // Numbered point
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\.\s/)?.[1] || '1';
            const rest = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue-400 font-semibold text-xs mt-0.5">{num}.</span>
                <span className="text-gray-200">{rest}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-gray-200">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const contentElement = (
    <div className={`flex flex-col ${isInline ? 'h-[720px] rounded-xl border border-blue-500/30 bg-blue-950/40 backdrop-blur-md shadow-2xl' : 'h-full bg-blue-950/95 border border-blue-500/30 rounded-xl shadow-2xl'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-blue-500/20 bg-blue-900/30 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-blue-600 flex items-center justify-center shadow-lg border border-amber-400/40">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-amber-200">AI Tutor King James</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                Biblical Scholar & Master Theologian
              </span>
            </div>
            <p className="text-xs text-blue-300">
              Answers any Bible inquiry • KJV Exegesis • Hebrew & Greek • Historical Context
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleClearHistory}
            title="Reset Conversation"
            className="p-1.5 text-gray-400 hover:text-amber-300 bg-blue-900/40 hover:bg-blue-800/60 rounded-lg border border-blue-500/20 text-xs flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Topic</span>
          </button>

          {!isInline && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white bg-blue-900/40 hover:bg-blue-800/60 rounded-lg border border-blue-500/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Pill Bar */}
      <div className="px-4 py-2 bg-blue-950/60 border-b border-blue-500/20 overflow-x-auto flex gap-2 items-center text-xs">
        <span className="text-gray-400 whitespace-nowrap font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Focus Mode:
        </span>
        {STUDY_MODES.map(mode => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500/30 to-blue-600/30 text-amber-200 border border-amber-400/40 shadow-sm font-semibold'
                  : 'bg-blue-900/30 text-gray-300 hover:text-white hover:bg-blue-800/40 border border-blue-500/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* If only 1 greeting message, render quick starter topic cards */}
        {messages.length <= 1 && (
          <div className="my-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Explore Suggested Biblical Inquiries
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTER_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(topic.query)}
                  className="text-left p-3 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 border border-blue-500/20 hover:border-amber-400/40 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-200 group-hover:text-amber-100">
                      {topic.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-800/60 text-blue-300 border border-blue-500/20">
                      {topic.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {topic.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isBot = msg.role === 'king-james';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-full sm:max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow-md ${
                  isBot
                    ? 'bg-blue-900/60 text-blue-50 border border-blue-500/30 backdrop-blur-sm'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                }`}
              >
                {/* Header for Bot */}
                {isBot && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                        <GraduationCap className="w-3 h-3 text-amber-300" />
                      </div>
                      <span className="text-xs font-bold text-amber-300">King James</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        disabled={audioLoadingId === msg.id}
                        title={playingAudioId === msg.id ? 'Stop Voice' : 'Listen to King James Voice'}
                        className={`p-1 rounded hover:bg-blue-800/60 text-amber-300 transition-colors ${
                          playingAudioId === msg.id ? 'text-amber-400 bg-amber-950/40' : ''
                        }`}
                      >
                        {audioLoadingId === msg.id ? (
                          <span className="text-[10px] animate-pulse text-amber-300">Loading...</span>
                        ) : playingAudioId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        title="Copy text"
                        className="p-1 rounded hover:bg-blue-800/60 text-gray-300 hover:text-white transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleShareToFeed(msg)}
                        title="Share takeaway to Feed"
                        className="p-1 rounded hover:bg-blue-800/60 text-gray-300 hover:text-amber-300 transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
                {isBot ? renderFormattedContent(msg.content) : <p className="text-sm">{msg.content}</p>}

                {/* Verses Cited Badges */}
                {isBot && msg.versesCited && msg.versesCited.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-blue-500/20">
                    <p className="text-[11px] font-semibold text-amber-300/90 mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Scriptures Referenced:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.versesCited.map((verse, vIdx) => (
                        <button
                          key={vIdx}
                          onClick={() => onStudyVerse?.(verse)}
                          className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 rounded-md transition-colors flex items-center gap-1"
                        >
                          <span>{verse}</span>
                          <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hebrew & Greek Word Badges */}
                {isBot && msg.hebrewGreekWords && msg.hebrewGreekWords.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-500/20">
                    <p className="text-[11px] font-semibold text-blue-300/90 mb-1.5 flex items-center gap-1">
                      <Languages className="w-3 h-3" /> Original Language Bites:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.hebrewGreekWords.map((item, wIdx) => (
                        <div
                          key={wIdx}
                          className="p-1.5 rounded bg-blue-950/40 border border-blue-500/20 text-[11px]"
                        >
                          <span className="font-bold text-amber-300">{item.word}: </span>
                          <span className="text-gray-300">{item.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Follow-up Questions */}
              {isBot && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-2 max-w-full sm:max-w-xl lg:max-w-2xl space-y-1.5 pl-2">
                  <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Deepen Thy Study (Click to ask):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((sq, sqIdx) => (
                      <button
                        key={sqIdx}
                        onClick={() => handleSendMessage(sq)}
                        className="text-left px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/70 text-blue-200 hover:text-amber-200 border border-blue-500/20 hover:border-amber-400/40 text-xs transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{sq}</span>
                        <ChevronRight className="w-3 h-3 text-amber-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-blue-900/60 text-blue-100 border border-blue-500/30 px-4 py-3 rounded-xl shadow-md flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <div>
                <p className="text-xs font-bold text-amber-300">King James is consulting the scriptures...</p>
                <p className="text-[11px] text-gray-300">Harmonizing passages, original Greek/Hebrew, and theological insight</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-blue-500/20 p-3 sm:p-4 bg-blue-900/30">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask King James anything (e.g. Melchizedek, Romans 8:28, Grace vs Works, Beatitudes)..."
            className="flex-1 bg-blue-900/50 border border-blue-500/30 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 text-sm transition-all"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-amber-500 to-blue-600 hover:from-amber-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-950"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">Inquire</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return contentElement;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl h-[85vh] max-h-[780px]">
        {contentElement}
      </div>
    </div>
  );
}
