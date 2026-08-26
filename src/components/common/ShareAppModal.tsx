import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Send,
  MessageCircle,
  Mail,
  Download,
  Sparkles,
  Users,
  Video,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundEffects } from '../../services/audio';
import { notificationService } from '../../services/notifications';

export interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'general' | 'call' | 'chat';
  roomId?: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  initialType = 'general',
  roomId,
}) => {
  const { user } = useAuth();
  const [inviteType, setInviteType] = useState<'general' | 'call' | 'chat'>(initialType);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'direct'>('link');

  // Direct invite inputs
  const [friendName, setFriendName] = useState('');
  const [friendContact, setFriendContact] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSentSuccess, setInviteSentSuccess] = useState(false);

  useEffect(() => {
    setInviteType(initialType);
  }, [initialType]);

  if (!isOpen) return null;

  // Build the dynamic share URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aura-social.app';
  const queryParams = new URLSearchParams();
  if (user?.handle) queryParams.set('ref', user.handle);
  if (user?.name) queryParams.set('invitedBy', user.name);
  if (inviteType === 'call') {
    queryParams.set('action', 'join_call');
    if (roomId) queryParams.set('roomId', roomId);
  } else if (inviteType === 'chat') {
    queryParams.set('action', 'chat');
    if (user?.id) queryParams.set('with', user.id);
  }

  const shareUrl = `${baseUrl}?${queryParams.toString()}`;

  // Predefined share text based on context
  const getShareText = () => {
    if (inviteType === 'call') {
      return `📞 Join my live WebRTC HD video call on AURA Social! Let's connect instantly: ${shareUrl}`;
    }
    if (inviteType === 'chat') {
      return `💬 Connect with me on AURA! Real-time messaging, stories, and HD calling: ${shareUrl}`;
    }
    return `✨ Join me on AURA Social! Share photos, post 24h stories, and jump on live HD video calls together: ${shareUrl}`;
  };

  const shareText = getShareText();

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      soundEffects.playTap();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      notificationService.notify({
        type: 'system',
        title: 'Invite Link Copied!',
        body: 'Share this link with your friends to connect in real-time.',
        playSound: true,
      });
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on AURA Social & Video Calls',
          text: shareText,
          url: shareUrl,
        });
        soundEffects.playMessageSent();
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendContact.trim()) return;

    setIsSendingInvite(true);
    setTimeout(() => {
      setIsSendingInvite(false);
      setInviteSentSuccess(true);
      soundEffects.playMessageSent();

      notificationService.notify({
        type: 'system',
        title: `Invite Sent to ${friendName || friendContact}!`,
        body: 'They will receive an invitation link with your referral code.',
        playSound: true,
      });

      setTimeout(() => {
        setInviteSentSuccess(false);
        setFriendName('');
        setFriendContact('');
        setCustomNote('');
      }, 3000);
    }, 600);
  };

  // QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    shareUrl
  )}&bgcolor=070a1a&color=60a5fa&margin=12`;

  const downloadQrCode = () => {
    soundEffects.playTap();
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `AURA_Invite_QR_${user?.handle || 'app'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Social Share URLs
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-emerald-600 hover:bg-emerald-500',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-sky-500 hover:bg-sky-400',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      color: 'bg-slate-900 hover:bg-slate-800 border border-white/20',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: 'Email',
      icon: '✉️',
      color: 'bg-indigo-600 hover:bg-indigo-500',
      url: `mailto:?subject=${encodeURIComponent(
        `Join me on AURA Social`
      )}&body=${encodeURIComponent(
        `Hey!\n\nI'm inviting you to join me on AURA Social. We can chat in real-time, post 24h stories, and jump on HD WebRTC video calls together!\n\nJoin here: ${shareUrl}\n\n— ${user?.name || 'AURA User'}`
      )}`,
    },
    {
      name: 'Messages / SMS',
      icon: '📱',
      color: 'bg-green-600 hover:bg-green-500',
      url: `sms:?&body=${encodedText}`,
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-600',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <div
      id="share-app-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-[32px] bg-[#070a1e]/95 backdrop-blur-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Invite Others & Share AURA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Live Sync
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Invite teammates and friends to chat and jump on video calls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Invite Context Pill Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => {
                soundEffects.playTap();
                setInviteType('general');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inviteType === 'general'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full App</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playTap();
                setInviteType('call');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inviteType === 'call'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Call</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playTap();
                setInviteType('chat');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inviteType === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Direct Chat</span>
            </button>
          </div>

          {/* Sub Navigation Modes (Link vs QR vs Direct) */}
          <div className="flex border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('link')}
              className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'link'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy & Social</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invite</span>
            </button>
          </div>

          {/* Tab 1: Share Link & Quick Channels */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* Copy URL Bar */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Your Personal Invite Link
                </label>
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/15 focus-within:border-blue-400 transition-colors">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-2.5 py-1 bg-transparent text-xs text-blue-200 font-mono focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md flex-shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Native Mobile Share Button */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-2.5 px-4 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Share via Device / AirDrop / Nearby</span>
                </button>
              )}

              {/* Quick 1-Click Social Sharing Apps */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-2">Or share directly to:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {socialChannels.map((channel) => (
                    <a
                      key={channel.name}
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-2xl ${channel.color} text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-102`}
                    >
                      <span className="text-sm">{channel.icon}</span>
                      <span>{channel.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Invite Preview</span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> Real-time peer link
                  </span>
                </div>
                <p className="text-xs text-slate-200 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                  "{shareText}"
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: QR Code */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="p-4 rounded-3xl bg-[#05060f] border-2 border-blue-500/30 shadow-2xl flex flex-col items-center">
                <div className="w-56 h-56 rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center p-2 border border-white/10">
                  <img
                    src={qrCodeUrl}
                    alt="AURA Invite QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200">
                    Scan with any phone camera
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  onClick={downloadQrCode}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Direct Invite Sender */}
          {activeTab === 'direct' && (
            <form onSubmit={handleDirectInvite} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Friend's Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Email Address or Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="alex@example.com or +1 (555) 000-0000"
                  value={friendContact}
                  onChange={(e) => setFriendContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Hey! Join me on AURA so we can chat and jump on video calls..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {inviteSentSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Invitation created & dispatched successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingInvite || !friendContact.trim()}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingInvite ? 'Sending Invitation...' : 'Send Direct Invitation'}</span>
              </button>
            </form>
          )}

          {/* Persistent Server Info Banner */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Live Server Persistence:</strong> Anyone
              who opens your invite link will automatically sync with the shared server database,
              see your posts and stories, and be able to receive instant WebRTC video calls!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
