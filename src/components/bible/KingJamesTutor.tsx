import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'king-james';
  content: string;
}

interface KingJamesTutorProps {
  isOpen: boolean;
  onClose: () => void;
  onOnboardingComplete?: (goals: string) => void;
  isOnboarding?: boolean;
}

export function KingJamesTutor({ isOpen, onClose, onOnboardingComplete, isOnboarding }: KingJamesTutorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = isOnboarding
        ? "Greetings, dear seeker. I am thy guide through the sacred scriptures. What spiritual goals dost thou wish to pursue in thy study of God's Word?"
        : "Greetings. I am the King James Study Guide. What question dost thou have about scripture, theology, or the application of God's Word to thy life?";
      setMessages([{ role: 'king-james', content: greeting }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Call backend API for real Q&A
      const res = await fetch('/api/bible/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await res.json();
      const response = data.answer || 'I could not generate a response at this time.';
      
      setMessages(prev => [...prev, { role: 'king-james', content: response }]);

      if (isOnboarding && messages.length > 2) {
        onOnboardingComplete?.(userMessage);
      }
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { role: 'king-james', content: 'Forgive me, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-blue-950/95 border border-blue-500/30 rounded-lg w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-lg text-blue-300">
              {isOnboarding ? 'Welcome to Scripture Study' : 'Ask King James'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-900/50 text-blue-100 border border-blue-500/30'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-blue-900/50 text-blue-100 border border-blue-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm">King James is contemplating thy question...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-blue-500/20 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask thy question..."
              className="flex-1 bg-blue-900/50 border border-blue-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white p-2 rounded transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
