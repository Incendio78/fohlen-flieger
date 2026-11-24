'use strict';

// Shared base for canvas games with a question box, countdown bar and feedback line.
class QuizGame {
  constructor(app, id, W, H) {
    this.app = app;
    this.el = document.getElementById(`screen-${id}`);
    this.stage = new Stage(this.el.querySelector('canvas'), W, H, { fitHeight: true });
    this.timerBar = this.el.querySelector('.timer i');
    this.timerText = this.el.querySelector('.timer-text');
    const cv = this.stage.canvas;
    cv.addEventListener('pointerdown', e => {
      Sound.init();
      cv.setPointerCapture(e.pointerId);
      this.pointerDown = true;
      if (this.running && !this.paused) this.onPointer('down', this.stage.toLogical(e));
    });
    cv.addEventListener('pointermove', e => {
      if (this.running && !this.paused && (this.pointerDown || e.pointerType === 'mouse')) this.onPointer(this.pointerDown ? 'drag' : 'hover', this.stage.toLogical(e));
    });
    cv.addEventListener('pointerup', () => { this.pointerDown = false; });
    window.addEventListener('keydown', e => {
      if (!this.running) return;
      if (this.holding && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.release(); return; }
      if (e.key === 'p') this.togglePause();
      else if (!this.paused) this.onKey(e);
    });
    const pause = this.el.querySelector('.btn-pause');
    if (pause) pause.addEventListener('click', () => this.togglePause());
  }

  onPointer() {}
  onKey() {}
  onTimeout() {}
  update() {}
  draw() {}

  begin() {
    this.el.querySelector('.q-text').style.visibility = '';
    this.running = true; this.paused = false; this.timerOn = false; this.holding = false; this.pending = null;
    this.stage.resize();
    this.t = performance.now();
    requestAnimationFrame(ts => this.loop(ts));
  }
  stop() { this.running = false; clearTimeout(this.to); }
  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    this.el.querySelector('.q-text').style.visibility = this.paused ? 'hidden' : '';
    const b = this.el.querySelector('.btn-pause');
    if (b) b.textContent = this.paused ? '▶ Weiter' : '⏸ Pause';
  }
  // While holding (after a wrong answer) the next step waits for the "Weiter" button.
  later(fn, ms) {
    clearTimeout(this.to);
    if (this.holding) { this.pending = fn; return; }
    this.to = setTimeout(() => { if (this.running) fn(); }, ms);
  }
  hold() {
    this.holding = true; this.pending = null;
    const f = this.el.querySelector('.flight-feedback');
    const b = document.createElement('button');
    b.className = 'primary fb-next'; b.textContent = 'Weiter ▶';
    b.addEventListener('click', () => this.release());
    f.appendChild(b);
  }
  release() {
    if (!this.holding) return;
    this.holding = false;
    const b = this.el.querySelector('.fb-next');
    if (b) b.remove();
    const fn = this.pending; this.pending = null;
    if (fn && this.running) fn();
  }

  setQuestion(q, factor = 1) {
    this.q = q;
    this.el.querySelector('.q-meta').textContent = this.app.topicLabel(q);
    this.el.querySelector('.q-text').innerHTML = fracHtml(q.q);
    this.timeLimit = this.app.timeFor(q, factor);
    this.timeLeft = this.timeLimit;
    this.timerOn = true;
    this.qStart = performance.now();
    this.feedback('', '');
  }
  setStatus(html) { this.el.querySelector('.q-status').innerHTML = html; }
  feedback(html, cls) {
    const f = this.el.querySelector('.flight-feedback');
    f.innerHTML = html; f.className = `flight-feedback ${cls || ''}`;
  }

  // Records the answer, shows feedback and returns earned coins.
  answer(ok, { mult = 1, timeout = false } = {}) {
    this.timerOn = false;
    const q = this.q;
    const coins = this.app.record(q, ok, performance.now() - this.qStart, mult);
    const ex = q.explain ? `<small>${fracHtml(q.explain)}</small>` : '';
    if (ok) { this.feedback(`✅ Richtig! +${coins} 🪙 ${ex}`, 'good'); Sound.success(); } else {
      this.feedback(`${timeout ? '⏱ Zeit abgelaufen!' : '❌'} Richtig wäre: <b>${fracHtml(q.correct)}</b> ${ex}`, 'bad');
      Sound.fail();
      this.hold();
    }
    return coins;
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.05, (ts - this.t) / 1000);
    this.t = ts;
    if (!this.paused) {
      if (this.timerOn) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.timerOn = false; this.onTimeout(); }
      }
      this.update(dt);
    }
    const frac = this.timeLimit ? Math.max(0, this.timeLeft / this.timeLimit) : 0;
    this.timerBar.style.width = `${(this.timerOn || this.timeLeft > 0 ? frac : 0) * 100}%`;
    this.timerBar.classList.toggle('low', frac < 0.3);
    this.timerText.textContent = this.timerOn ? `⏱ ${Math.ceil(this.timeLeft)} s` : '';
    this.draw(ts / 1000);
    if (this.paused) {
      const ctx = this.stage.ctx;
      ctx.fillStyle = '#0d1b2a'; ctx.fillRect(-50, -50, this.stage.W + 100, this.stage.H + 100);
      ctx.font = `900 70px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
      ctx.fillText('PAUSE', this.stage.W / 2, this.stage.H / 2);
    }
    requestAnimationFrame(t => this.loop(t));
  }
}
