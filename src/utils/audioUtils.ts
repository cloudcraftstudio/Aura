/**
 * Production-ready Audio Utilities for Mobile Web, Android WebView, and Capacitor
 * Handles magic-byte audio format detection, standard RIFF/WAV packaging,
 * mobile autoplay audio session unlock, and cross-platform endpoints.
 */

// 44-byte silent PCM WAV header encoded as data URI for instant user-gesture unlocking
export const SILENT_WAV_URI =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export interface BibleTtsResponse {
  audio: string;
  mimeType: string;
  format?: string;
  source?: string;
}

// Client-side cache for verse audio to avoid re-fetching when re-reading or navigating
const clientAudioCache = new Map<string, BibleTtsResponse>();

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts raw 16-bit little-endian PCM audio into a standard 44-byte RIFF/WAVE Blob.
 */
export function pcmToWavBlob(pcmBytes: Uint8Array, sampleRate: number = 24000): Blob {
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  const dataSize = pcmBytes.byteLength;

  // 00 - "RIFF"
  view.setUint32(0, 0x52494646, false);
  // 04 - Size
  view.setUint32(4, 36 + dataSize, true);
  // 08 - "WAVE"
  view.setUint32(8, 0x57415645, false);

  // 12 - "fmt "
  view.setUint32(12, 0x666d7420, false);
  // 16 - Subchunk1Size (16 for PCM)
  view.setUint32(16, 16, true);
  // 20 - AudioFormat (1 for PCM)
  view.setUint16(20, 1, true);
  // 22 - NumChannels (1 = Mono)
  view.setUint16(22, 1, true);
  // 24 - SampleRate
  view.setUint32(24, sampleRate, true);
  // 28 - ByteRate = SampleRate * NumChannels * BitsPerSample / 8
  view.setUint32(28, sampleRate * 1 * 2, true);
  // 32 - BlockAlign = NumChannels * BitsPerSample / 8
  view.setUint16(32, 2, true);
  // 34 - BitsPerSample = 16
  view.setUint16(34, 16, true);

  // 36 - "data"
  view.setUint32(36, 0x64617461, false);
  // 40 - Subchunk2Size
  view.setUint32(40, dataSize, true);

  return new Blob([wavHeader, pcmBytes], { type: 'audio/wav' });
}

/**
 * Inspects audio binary stream magic bytes and packages it into the
 * correct browser-decodable Blob (audio/mpeg, audio/wav, or PCM-wrapped WAV).
 */
export function createPlayableAudioBlob(bytes: Uint8Array, mimeHint?: string): Blob {
  if (bytes.length >= 4) {
    // RIFF WAVE header: 'R' 'I' 'F' 'F'
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      return new Blob([bytes], { type: 'audio/wav' });
    }
    // MP3 ID3 header: 'I' 'D' '3'
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      return new Blob([bytes], { type: 'audio/mpeg' });
    }
    // MP3 frame sync word: 0xFF followed by high 3 bits = 1 (e.g. 0xFB, 0xF3, 0xF2)
    if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) {
      return new Blob([bytes], { type: 'audio/mpeg' });
    }
  }

  if (mimeHint?.includes('mpeg') || mimeHint?.includes('mp3')) {
    return new Blob([bytes], { type: 'audio/mpeg' });
  }

  if (mimeHint?.includes('wav')) {
    return new Blob([bytes], { type: 'audio/wav' });
  }

  // Pure PCM without header: wrap into standard RIFF/WAV
  return pcmToWavBlob(bytes, 24000);
}

/**
 * Resolves the active backend base URL across web and native Android environments
 */
export function getAudioApiBase(): string {
  if (typeof window !== 'undefined') {
    const isCapacitorNative =
      !!(window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:';

    if (isCapacitorNative) {
      return 'https://webcraftstudio.cloud';
    }

    const origin = window.location.origin;
    if (origin && origin.startsWith('http')) {
      return origin;
    }
  }
  return '';
}

/**
 * Crucial for mobile browsers & Android WebView:
 * Calling play()/pause() synchronously during a user tap event unlocks
 * the audio pipeline so subsequent async playback is not blocked by autoplay restrictions.
 */
export function unlockAudioForMobile(
  audioEl?: HTMLAudioElement | null,
  audioContext?: AudioContext | null
): void {
  try {
    if (audioEl) {
      // Use silent WAV URI so browser doesn't throw unsupported source error
      audioEl.src = SILENT_WAV_URI;
      audioEl.volume = 1.0;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioEl.pause();
          })
          .catch(() => {
            // Silence any harmless abort errors
          });
      }
    }

    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  } catch (e) {
    console.warn('Audio unlock warning:', e);
  }
}

/**
 * Robust TTS Fetch with multi-endpoint failover and in-memory caching
 */
export async function fetchBibleTtsAudio(text: string): Promise<BibleTtsResponse | null> {
  const cleanKey = text.slice(0, 300);
  if (clientAudioCache.has(cleanKey)) {
    return clientAudioCache.get(cleanKey)!;
  }

  const base = getAudioApiBase();
  // Build prioritized list of endpoints
  const endpoints: string[] = [];

  // 1. Current origin relative routes (most reliable in web and preview)
  endpoints.push('/api/bible-study/audio');
  endpoints.push('/api/bible/audio');

  // 2. Base URL routes if base is set
  if (base) {
    endpoints.push(`${base}/api/bible-study/audio`);
    endpoints.push(`${base}/api/bible/audio`);
  }

  // 3. Fallback to production cloud VPS
  endpoints.push('https://webcraftstudio.cloud/api/bible-study/audio');
  endpoints.push('https://webcraftstudio.cloud/api/bible/audio');

  const uniqueEndpoints = Array.from(new Set(endpoints));

  for (const url of uniqueEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!res.ok) continue;

      const data = await res.json();
      const base64Audio = data.audio || data.audioData;
      if (base64Audio) {
        const responseObj: BibleTtsResponse = {
          audio: base64Audio,
          mimeType: data.mimeType || (data.format === 'audio/pcm' ? 'audio/wav' : data.format || 'audio/mpeg'),
          format: data.format,
          source: data.source
        };
        clientAudioCache.set(cleanKey, responseObj);
        return responseObj;
      }
    } catch (err) {
      console.warn(`TTS fetch failed for ${url}, trying next endpoint:`, err);
    }
  }

  return null;
}

/**
 * Fallback Speech Synthesis if offline or cloud service is temporarily busy
 */
export function playSpeechSynthesisFallback(
  text: string,
  onEnded?: () => void,
  onError?: (err?: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/Verse \d+\.\s*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 0.95;

    // Pick a dignified English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Male') ||
            v.name.includes('Google') ||
            v.name.includes('UK'))
      ) || voices.find(v => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      if (onEnded) onEnded();
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (onError) onError(e);
      else if (onEnded) onEnded();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('SpeechSynthesis failed:', err);
    return false;
  }
}
