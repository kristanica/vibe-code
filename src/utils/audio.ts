/**
 * A simple procedural sound engine using Web Audio API
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext() {
    if (!this.ctx) {
      const win = window as Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const AudioContextClass = (win.AudioContext || win.webkitAudioContext) as typeof AudioContext;
      this.ctx = new AudioContextClass();
    }
    return this.ctx;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number, fadeOut = true) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  // SOUND PRESETS
  
  playSuccess() {
    this.playTone(523.25, 'square', 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'square', 0.1, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 'square', 0.3, 0.1), 200); // G5
  }

  playFailure() {
    this.playTone(200, 'sawtooth', 0.1, 0.1);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.4, 0.1), 100);
  }

  playCardClick() {
    this.playTone(800, 'sine', 0.05, 0.05);
  }

  playCardPlay() {
    this.playTone(400, 'triangle', 0.1, 0.1);
    this.playTone(600, 'triangle', 0.1, 0.05);
  }

  playDamage() {
    // Noise-like sound for damage
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  playLevelUp() {
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.4, 0.1), i * 150);
    });
  }

  playDraft() {
    this.playTone(1000, 'sine', 0.1, 0.05);
  }
}

export const sounds = new SoundEngine();
