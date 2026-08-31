// Web Audio API Synthesizer for instant UI feedback without external mp3 dependencies

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private ringtoneInterval: any = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft bubble/glass pop on message sent
  public playMessageSent() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play a gentle two-tone chime on message received
  public playMessageReceived() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.1); // A5
      gain2.gain.setValueAtTime(0.15, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.28);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play authentic Super Mario Bros Coin Sound (B5 -> E6 with snappy square envelope)
  public playMarioCoin() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1: B5 (987.77 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.setValueAtTime(0.12, now + 0.06);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Note 2: E6 (1318.51 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.42);

      // Gentle haptic feedback on devices with vibration support
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {}
      }
    } catch (e) {
      console.warn('Mario coin audio error:', e);
    }
  }

  // Play lovely like/sparkle chime
  public playLikeSparkle() {
    this.playMarioCoin();
  }

  // Start iconic Super Mario Bros Ringtone Loop & phone vibration
  public startRingtone() {
    this.stopRingtone();

    const playMarioRingtoneCycle = () => {
      try {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Vibrate physical phone on Android / mobile devices (Motorola Razr)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([180, 80, 180, 80, 280, 100, 350]);
          } catch {}
        }

        // Mario Overworld Theme Intro Melody:
        // E5, E5, rest, E5, rest, C5, E5, rest, G5, rest, G4
        const melody = [
          { note: 659.25, start: 0.00, dur: 0.12 }, // E5
          { note: 659.25, start: 0.15, dur: 0.12 }, // E5
          { note: 659.25, start: 0.38, dur: 0.12 }, // E5
          { note: 523.25, start: 0.52, dur: 0.12 }, // C5
          { note: 659.25, start: 0.66, dur: 0.14 }, // E5
          { note: 783.99, start: 0.95, dur: 0.22 }, // G5
          { note: 392.00, start: 1.30, dur: 0.26 }, // G4
        ];

        melody.forEach(({ note, start, dur }) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, now + start);

          gain.gain.setValueAtTime(0.001, now + start);
          gain.gain.linearRampToValueAtTime(0.18, now + start + 0.015);
          gain.gain.setValueAtTime(0.18, now + start + dur - 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + start);
          osc.stop(now + start + dur);
        });
      } catch (e) {
        console.warn('Super Mario ringtone error:', e);
      }
    };

    playMarioRingtoneCycle();
    this.ringtoneInterval = setInterval(playMarioRingtoneCycle, 2800);
  }

  public stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }

  // Super Mario 1-Up Connected Sound (E5 -> G5 -> E6 -> C6 -> D6 -> G6)
  public playCallConnected() {
    this.stopRingtone();
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1-Up Chime
      const notes = [
        { freq: 659.25, start: 0.00, dur: 0.08 }, // E5
        { freq: 783.99, start: 0.08, dur: 0.08 }, // G5
        { freq: 1318.51, start: 0.16, dur: 0.08 }, // E6
        { freq: 1046.50, start: 0.24, dur: 0.08 }, // C6
        { freq: 1174.66, start: 0.32, dur: 0.08 }, // D6
        { freq: 1567.98, start: 0.40, dur: 0.22 }, // G6
      ];

      notes.forEach(({ freq, start, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0.14, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 150]);
        } catch {}
      }
    } catch (e) {
      console.warn('Call connected audio error:', e);
    }
  }

  // Call ended / Mario pipe descent sound
  public playCallEnded() {
    this.stopRingtone();
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Authentic Mario death / game over melody (Call Terminated)
      const deathNotes = [
        { note: 587.33, start: 0.00, dur: 0.13 }, // D5
        { note: 554.37, start: 0.15, dur: 0.13 }, // C#5
        { note: 523.25, start: 0.30, dur: 0.13 }, // C5
        { note: 493.88, start: 0.45, dur: 0.22 }, // B4
        // pause
        { note: 349.23, start: 0.75, dur: 0.13 }, // F4
        { note: 369.99, start: 0.90, dur: 0.13 }, // F#4
        { note: 349.23, start: 1.05, dur: 0.13 }, // F4
        { note: 329.63, start: 1.20, dur: 0.16 }, // E4
        { note: 293.66, start: 1.38, dur: 0.16 }, // D4
        { note: 261.63, start: 1.58, dur: 0.35 }, // C4
      ];

      deathNotes.forEach(({ note, start, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(note, now + start);

        gain.gain.setValueAtTime(0.18, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch (e) {
      console.warn("Mario game over audio error:", e);
    }
  }

  // Soft acoustic tap sound for story navigation & UI switches
  public playTap() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn('Tap sound error:', e);
    }
  }

  // Futuristic cyber matrix initialization tone
  public playMatrixEnter() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [329.63, 440.0, 659.25, 880.0, 1318.51]; // E4, A4, E5, A5, E6 synth sweep
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.35);
      });
    } catch (e) {
      console.warn('Matrix sound error:', e);
    }
  }

  // Harmonious success chime for permissions granted / items saved
  public playSuccessTone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5 -> E5 -> G5 -> C6
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch (e) {
      console.warn('Success tone error:', e);
    }
  }

  // Celebratory level up / full permissions unlocked chime
  public playLevelUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51];
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.14, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch (e) {
      console.warn('Level up tone error:', e);
    }
  }
  // Super Mario Bros iconic death / game over melody (when call terminates)
  public playMarioGameOver() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Iconic sequence of notes with rhythmic timing
      const deathNotes = [
        { note: 587.33, start: 0.00, dur: 0.14 }, // D5
        { note: 554.37, start: 0.16, dur: 0.14 }, // C#5
        { note: 523.25, start: 0.32, dur: 0.14 }, // C5
        { note: 493.88, start: 0.48, dur: 0.22 }, // B4
        // short rest
        { note: 349.23, start: 0.80, dur: 0.14 }, // F4
        { note: 369.99, start: 0.96, dur: 0.14 }, // F#4
        { note: 349.23, start: 1.12, dur: 0.14 }, // F4
        { note: 329.63, start: 1.28, dur: 0.18 }, // E4
        { note: 293.66, start: 1.48, dur: 0.18 }, // D4
        { note: 261.63, start: 1.70, dur: 0.35 }, // C4
      ];

      deathNotes.forEach(({ note, start, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(note, now + start);

        gain.gain.setValueAtTime(0.14, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } catch (e) {
      console.warn("Mario game over tone error:", e);
    }
  }

}

export const soundEffects = new SoundEffectsService();
export const audioService = soundEffects;

