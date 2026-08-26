import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, ShieldCheck, ChevronRight, Mail, KeyRound } from 'lucide-react';
import { UserProfile } from '../../types';
import { Avatar } from '../common/Avatar';
import { soundEffects } from '../../services/audio';

export interface KnownGoogleAccount {
  email: string;
  name: string;
  avatarUrl: string;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  knownAccounts: KnownGoogleAccount[];
  onSelectAccount: (account: { email: string; name: string; avatarUrl?: string }) => void;
  onUseAnotherAccount: () => void;
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  knownAccounts,
  onSelectAccount,
  onUseAnotherAccount,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const cleanEmail = customEmail.trim();
    const cleanName = customName.trim() || cleanEmail.split('@')[0];
    soundEffects.playTap();
    onSelectAccount({
      email: cleanEmail,
      name: cleanName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    });
  };

  return (
    <div
      id="google-chooser-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        id="google-account-chooser-card"
        className="w-full max-w-md rounded-[28px] bg-[#0c1024]/95 border border-white/20 shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-6 text-white relative overflow-hidden backdrop-blur-2xl"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Choose a Google Account</h3>
            <p className="text-xs text-slate-400">to continue to Aura Social</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Select which Google account you want to sign in with, or specify another Gmail account:
        </p>

        {/* List of Detected / Known Accounts */}
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
          {knownAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                soundEffects.playTap();
                onSelectAccount({
                  email: acc.email,
                  name: acc.name,
                  avatarUrl: acc.avatarUrl,
                });
              }}
              className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-blue-500/40 text-left transition-all flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={acc.avatarUrl} name={acc.name} size="md" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                    {acc.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Toggle Custom Account Entry */}
        <AnimatePresence>
          {showCustomInput ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCustomSubmit}
              className="p-3.5 rounded-2xl bg-white/5 border border-blue-500/30 space-y-3 mb-4"
            >
              <div className="flex items-center justify-between text-xs text-blue-300 font-semibold">
                <span>Sign in with specific Gmail / Google account</span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Google / Gmail Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Continue with this account</span>
              </button>
            </motion.form>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                setShowCustomInput(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>Use another Google account</span>
            </button>
          )}
        </AnimatePresence>

        {/* Security Footer Note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Your profile details, posts, and saved stories remain tied to your chosen email.</span>
        </div>
      </motion.div>
    </div>
  );
};
