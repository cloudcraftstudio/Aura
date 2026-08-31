import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  LogIn,
  UserPlus,
  Upload,
  CheckCircle2,
  Quote,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDailyQuote } from '../../data/quotes';
import { compressImage } from '../../utils/imageCompressor';
import { soundEffects } from '../../services/audio';

interface AuthModalProps {
  isOpen?: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login';
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const { promptGoogleChooser, registerWithEmail, loginWithEmail, verifyEmailOtp, resendOtp } = useAuth();
  const dailyQuote = getDailyQuote();

  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [screen, setScreen] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0]);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleClick = () => {
    soundEffects.playTap();
    promptGoogleChooser();
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerWithEmail(email.trim(), username.trim(), password.trim(), name.trim());
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginWithEmail(email.trim(), password.trim());
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Login failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter a 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmailOtp(otpEmail, otpCode);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Verification failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await resendOtp(otpEmail);
      if (result.success) {
        setOtpCode('');
      } else {
        setErrorMessage(result.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Resend error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl p-4 sm:p-6 flex min-h-screen items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        id="auth-modal-card"
        className="w-full max-w-lg my-auto rounded-[32px] bg-[#0c1024]/95 border border-white/15 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl text-white"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {mode === 'signup' ? 'Join Aura Social' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {mode === 'signup'
              ? 'Connect with real-time photo feeds, HD WebRTC calling, and encrypted chats.'
              : 'Sign in to access your saved profile, posts, stories, and conversations.'}
          </p>
        </div>

        {/* Inspirational Quote Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/20 text-left relative overflow-hidden">
          <div className="flex items-start gap-2.5">
            <Quote className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs italic text-blue-100 font-medium leading-relaxed">
                &ldquo;{dailyQuote.quote}&rdquo;
              </p>
              <p className="text-[10px] font-bold text-blue-300 mt-1">
                — {dailyQuote.author} {dailyQuote.role ? `(${dailyQuote.role})` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <button
            onClick={() => {
              setErrorMessage(null);
              setMode('signup');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Protected Account</span>
          </button>

          <button
            onClick={() => {
              setErrorMessage(null);
              setMode('login');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Google One-Click Sign In (Opens Account Chooser) */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2.5 mb-5 active:scale-[0.99] border border-white/20"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Choose Google / Gmail Account</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            or continue with email & password
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {screen === 'otp' ? (
          /* OTP Verification Screen */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-slate-300 mb-2">
                Enter the 6-digit code sent to <span className="font-semibold">{otpEmail}</span>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Verify Email'}</span>
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isSubmitting}
              className="w-full py-2 text-xs text-slate-400 hover:text-blue-400 transition-colors"
            >
              Didn't receive code? Resend
            </button>

            <button
              type="button"
              onClick={() => {
                setScreen('form');
                setOtpCode('');
                setErrorMessage(null);
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Back to Registration
            </button>
          </form>
        ) : mode === 'signup' ? (
          /* Sign Up Form */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">@</span>
                  <input
                    type="text"
                    required
                    placeholder="alexmorgan"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                placeholder="name@gmail.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
