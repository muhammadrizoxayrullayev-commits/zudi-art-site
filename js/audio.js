// ==========================================================================
// ROMANTIC PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO API)
// Zero external mp3 dependencies — works instantly offline & across devices
// ==========================================================================

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.musicInterval = null;
    this.masterGain = null;

    // Romantic Chord Progression (Hz frequencies)
    // Cmaj7 -> Am9 -> Fmaj7 -> Gsus4
    this.chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7   (A3, C4, E4, G4)
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [196.00, 261.63, 293.66, 392.00]  // Gsus4 (G3, C4, D4, G4)
    ];
    this.currentChord = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMusic() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Play initial chord and start interval
    this.playNextArpeggio();
    this.musicInterval = setInterval(() => {
      this.playNextArpeggio();
    }, 4500);
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playNextArpeggio() {
    if (!this.isPlaying || !this.ctx) return;
    const notes = this.chords[this.currentChord];
    this.currentChord = (this.currentChord + 1) % this.chords.length;

    // Arpeggiate notes with warm piano/rhodes synth tone
    notes.forEach((freq, idx) => {
      const delay = idx * 0.45;
      this.playPianoNote(freq, delay, 3.5);
    });
  }

  playPianoNote(freq, delay = 0, duration = 2.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;

    // Sine + subtle Triangle for romantic soft piano warmth
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08); // Soft attack
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  playFootstep() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playHeartChime() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const chimeFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Sweet love harp chime)

    chimeFreqs.forEach((freq, idx) => {
      const noteTime = now + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });
  }
}

