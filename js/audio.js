'use strict';
// Tiny WebAudio synth – no sound files needed.
const Sound = {
  ctx: null,
  on: true,
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type = 'sine', vol = 0.15, delay = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.2, freq = 800, delay = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.7;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t);
  },
  success() { this.tone(660, 0.12, 'triangle'); this.tone(880, 0.12, 'triangle', 0.15, 0.1); this.tone(1320, 0.25, 'triangle', 0.15, 0.2); },
  fail() { this.tone(220, 0.25, 'sawtooth', 0.08); this.tone(160, 0.35, 'sawtooth', 0.08, 0.18); },
  kick() { this.tone(90, 0.12, 'sine', 0.4); this.noise(0.08, 0.15, 300); },
  crowd() { this.noise(1.6, 0.25, 900); this.noise(1.4, 0.15, 1800, 0.1); },
  whistle() { this.tone(2800, 0.18, 'sine', 0.08); this.tone(2800, 0.35, 'sine', 0.08, 0.22); },
  coin() { this.tone(1300, 0.06, 'square', 0.04); this.tone(1750, 0.1, 'square', 0.04, 0.06); },
  buy() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.09)); },
};
