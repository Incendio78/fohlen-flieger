'use strict';

// Scales a fixed logical coordinate system onto a responsive canvas.
class Stage {
  constructor(canvas, W, H, { fitHeight = false } = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.baseW = W; this.W = W; this.H = H; this.fitHeight = fitHeight;
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
  }
  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
    this.canvas.style.width = r.width + 'px'; this.canvas.style.height = r.height + 'px';
    if (this.fitHeight) {
      this.scale = r.height / this.H;
      this.W = Math.max(this.baseW, r.width / this.scale);
    } else this.scale = Math.min(r.width / this.W, r.height / this.H);
    this.ox = (r.width - this.W * this.scale) / 2; this.oy = (r.height - this.H * this.scale) / 2;
    this.dpr = dpr;
  }
  begin(bg) {
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (bg) { c.fillStyle = bg; c.fillRect(0, 0, this.canvas.width, this.canvas.height); }
    const k = this.dpr * this.scale;
    c.setTransform(k, 0, 0, k, this.dpr * this.ox, this.dpr * this.oy);
    return c;
  }
  toLogical(ev) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left - this.ox) / this.scale, y: (ev.clientY - r.top - this.oy) / this.scale };
  }
}

const ease = t => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a, b, t) => a + (b - a) * t;

class PenaltyGame {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('screen-penalty');
    this.timerBar = this.el.querySelector('.timer i');
    this.timerText = this.el.querySelector('.timer-text');
    this.stage = new Stage(document.getElementById('penalty-canvas'), 1000, 620);
    this.crowd = Array.from({ length: 260 }, () => ({
      x: Math.random() * 1000, y: 12 + Math.random() * 90,
      c: Questions.U.pick(['#0b8a44', '#ffffff', '#111111', '#0b8a44', '#e8e8e8']), p: Math.random() * 6,
    }));
    this.stage.canvas.addEventListener('pointerdown', e => this.tap(e));
    document.getElementById('pen-next').addEventListener('click', () => this.next());
    window.addEventListener('keydown', e => {
      if (!this.running) return;
      if (this.state === 'aim' && e.key >= '1' && e.key <= '4') this.choose(+e.key - 1);
      if (this.state === 'result' && (e.key === 'Enter' || e.key === ' ')) this.next();
    });
  }

  start(source = 'normal') {
    this.source = source;
    if (source === 'mistakes') {
      this.cup = null; this.opp = this.app.pickOpponent(); this.timeFactor = 1.3;
    } else {
      this.cup = this.app.cupInfo(); this.opp = this.cup.team; this.timeFactor = this.cup.time;
    }
    this.score = { me: 0, opp: 0 };
    this.shots = { me: [], opp: [] };
    this.round = 0; this.coins = 0; this.right = 0; this.total = 0;
    this.particles = []; this.floaters = [];
    this.running = true;
    this.t = performance.now();
    Sound.whistle();
    this.newRound();
    requestAnimationFrame(ts => this.loop(ts));
  }
  stop() { this.running = false; clearTimeout(this.autoNext); }

  get mode() { return this.round % 2 === 0 ? 'shoot' : 'keep'; }

  newRound() {
    this.q = this.app.nextQuestion(4, this.source);
    const pos = [[310, 215], [690, 215], [310, 340], [690, 340]];
    this.targets = this.q.choices.map((c, i) => ({ text: c, x: pos[i][0], y: pos[i][1], w: 340, h: 105 }));
    this.state = 'aim';
    this.anim = null;
    this.chosen = -1;
    this.qStart = performance.now();
    this.timeLimit = this.app.timeFor(this.q, this.timeFactor);
    this.timeLeft = this.timeLimit;
    const mode = this.mode;
    const count = this.round < 10
      ? `Elfmeter ${this.round + 1} von 10`
      : 'Sudden Death!';
    this.el.querySelector('.q-mode').textContent = `${count} · ` + (mode === 'shoot'
      ? '⚽ Du schießt! Tippe auf die richtige Antwort.'
      : `🧤 ${this.opp.short} schießt! Spring in die Ecke mit der richtigen Antwort.`);
    this.el.querySelector('.q-meta').textContent = this.app.topicLabel(this.q);
    this.el.querySelector(".q-text").innerHTML = fracHtml(this.q.q);
    this.el.querySelector('.feedback').classList.add('hidden');
    this.renderScore();
  }

  renderScore() {
    const dots = arr => {
      const n = Math.max(5, arr.length);
      return Array.from({ length: n }, (_, i) => `<i class="${arr[i] === undefined ? '' : arr[i] ? 'hit' : 'miss'}"></i>`).join('');
    };
    const title = this.cup ? `${this.cup.comp.icon} ${this.cup.comp.name} · ${this.cup.round}` : '🤝 Freundschaftsspiel (Fehler-Training)';
    this.el.querySelector('.scoreboard').innerHTML = `
      <div class="comp">${title}</div>
      <div class="team me"><b>BMG</b><span class="dots">${dots(this.shots.me)}</span></div>
      <div class="score">${this.score.me} : ${this.score.opp}</div>
      <div class="team opp"><span class="dots">${dots(this.shots.opp)}</span><b style="--tc:${this.opp.color}">${this.opp.short}</b></div>`;
  }

  tap(e) {
    Sound.init();
    if (!this.running) return;
    if (this.state === 'result') return;
    if (this.state !== 'aim') return;
    const p = this.stage.toLogical(e);
    const i = this.targets.findIndex(t => Math.abs(p.x - t.x) <= t.w / 2 && Math.abs(p.y - t.y) <= t.h / 2);
    if (i >= 0) this.choose(i);
  }

  choose(i) {
    if (i >= this.targets.length) return;
    const timeout = i < 0;
    const ok = i === this.q.answer;
    const ms = performance.now() - this.qStart;
    this.chosen = i;
    this.ok = ok;
    this.timeout = timeout;
    this.total++; if (ok) this.right++;
    const earned = this.app.record(this.q, ok, ms);
    this.coins += earned;
    if (earned) this.floaters.push({ text: `+${earned} 🪙`, x: 500, y: 470, t: 0 });

    const mode = this.mode;
    const center = { x: 500, y: 330 };
    let ballT, keeperT;
    if (timeout) {
      // too slow: weak shot straight at the keeper / keeper frozen in the middle
      ballT = mode === 'shoot' ? center : this.targets[this.q.answer];
      keeperT = center;
    } else if (mode === 'shoot') {
      ballT = this.targets[i];
      keeperT = ok ? Questions.U.pick(this.targets.filter((_, j) => j !== i)) : this.targets[i];
    } else {
      ballT = this.targets[this.q.answer];
      keeperT = this.targets[i];
    }
    this.anim = { t: 0, ball: ballT, keeper: keeperT };
    this.state = 'anim';
    Sound.kick();
  }

  finishShot() {
    const mode = this.mode, ok = this.ok;
    if (mode === 'shoot') { this.shots.me.push(ok); if (ok) this.score.me++; } else { this.shots.opp.push(!ok); if (!ok) this.score.opp++; }
    this.renderScore();
    const goodNews = ok;
    if (goodNews) {
      Sound.success(); if (mode === 'shoot') Sound.crowd();
      this.burst(this.anim.ball.x, this.anim.ball.y);
    } else Sound.fail();
    this.banner = { text: this.timeout ? 'Zu langsam!' : mode === 'shoot' ? (ok ? 'TOOOR!' : 'Gehalten …') : (ok ? 'GEHALTEN!' : 'Gegentor …'), good: ok, t: 0 };
    this.state = 'result';
    const fb = this.el.querySelector('.feedback');
    fb.classList.remove('hidden');
    fb.classList.toggle('good', ok); fb.classList.toggle('bad', !ok);
    fb.querySelector('.fb-text').innerHTML = ok
      ? `✅ Richtig! ${this.q.explain ? `<small>${fracHtml(this.q.explain)}</small>` : ''}`
      : `${this.timeout ? '⏱ Zeit abgelaufen!' : '❌'} Richtig wäre: <b>${fracHtml(this.q.correct)}</b>${this.q.explain ? `<small>${fracHtml(this.q.explain)}</small>` : ''}`;
    if (ok && this.source !== 'mistakes') this.autoNext = setTimeout(() => this.next(), 2500);
  }

  next() {
    if (this.state !== 'result') return;
    clearTimeout(this.autoNext);
    this.round++;
    if (this.isOver()) this.end(); else this.newRound();
  }

  isOver() {
    const m = this.shots.me.length, o = this.shots.opp.length;
    const { me, opp } = this.score;
    if (m <= 5 && o <= 5) {
      if (me > opp + (5 - o) || opp > me + (5 - m)) return true;
      return m === 5 && o === 5 && me !== opp;
    }
    if (m === o && me !== opp) return true;
    return m >= 10 && m === o;
  }

  end() {
    this.stop();
    const win = this.score.me > this.score.opp, draw = this.score.me === this.score.opp;
    const { bonus, msg } = this.app.matchEnd(win, this.cup);
    this.app.showResult({
      title: win ? (this.opp.derby ? '🏆 Derbysieg!' : '🏆 Gewonnen!') : draw ? 'Unentschieden' : 'Knapp verloren',
      lines: [
        `Borussia ${this.score.me} : ${this.score.opp} ${this.opp.name}`,
        `${this.right} von ${this.total} Fragen richtig`,
        `🪙 ${this.coins + bonus} Taler verdient${bonus ? ` (inkl. ${bonus} Siegprämie)` : ''}`,
        msg && `<b>${msg}</b>`,
      ],
      again: () => this.app.startPenalty(this.source),
      win,
    });
  }

  burst(x, y) {
    const cols = ['#0b8a44', '#ffffff', '#111111', '#ffd400'];
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, v = 150 + Math.random() * 350;
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, c: Questions.U.pick(cols), life: 1.4 + Math.random() });
    }
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.05, (ts - this.t) / 1000);
    this.t = ts;
    this.update(dt);
    this.draw(ts / 1000);
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    if (this.state === 'aim') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.choose(-1); }
    }
    if (this.anim && this.state === 'anim') {
      this.anim.t += dt / 1.15;
      if (this.anim.t >= 1) { this.anim.t = 1; this.finishShot(); }
    }
    for (const p of this.particles) { p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const f of this.floaters) f.t += dt;
    this.floaters = this.floaters.filter(f => f.t < 1.5);
    if (this.banner) this.banner.t += dt;
  }

  draw(time) {
    const frac = this.timeLimit ? Math.max(0, this.timeLeft / this.timeLimit) : 1;
    this.timerBar.style.width = `${frac * 100}%`;
    this.timerBar.classList.toggle('low', frac < 0.3);
    this.timerText.textContent = this.state === 'aim' ? `⏱ ${Math.ceil(this.timeLeft)} s` : '';
    const ctx = this.stage.begin('#155f2e');
    const W = 1000;
    const cheer = this.state === 'result' && this.ok;
    // stands
    const sg = ctx.createLinearGradient(0, 0, 0, 110);
    sg.addColorStop(0, '#1a1f24'); sg.addColorStop(1, '#2d343b');
    ctx.fillStyle = sg; ctx.fillRect(-500, -200, W + 1000, 310);
    for (const c of this.crowd) {
      const jump = cheer ? Math.abs(Math.sin(time * 9 + c.p)) * 6 : Math.sin(time * 2 + c.p) * 1;
      ctx.fillStyle = c.c;
      ctx.beginPath(); ctx.arc(c.x, c.y - jump, 4.2, 0, 7); ctx.fill();
    }
    // ad boards
    ctx.fillStyle = '#0b8a44'; ctx.fillRect(-500, 110, W + 1000, 30);
    ctx.fillStyle = '#fff'; ctx.font = `bold 18px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const ad = '  FOHLEN & FLIEGER  •  LERNEN MACHT STARK  •  ELF FREUNDE  •  ';
    const adW = ctx.measureText(ad).width;
    for (let x = -((time * 60) % adW) - 500; x < W + 500; x += adW) ctx.fillText(ad, x, 126);
    // grass
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? '#2f9a46' : '#38a852';
      ctx.fillRect(-500, 140 + i * 40, W + 1000, 40);
    }
    // lines
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-500, 420); ctx.lineTo(W + 500, 420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 420); ctx.lineTo(30, 485); ctx.lineTo(970, 485); ctx.lineTo(970, 420); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(500, 565, 9, 4, 0, 0, 7); ctx.fill();
    // goal net
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(120, 160, 760, 260);
    const shake = this.state === 'result' && this.mode === 'shoot' && this.ok ? Math.sin(time * 40) * 3 * Math.max(0, 1 - this.banner.t) : 0;
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 120; x <= 880; x += 20) { ctx.moveTo(x + shake, 160); ctx.lineTo(x - shake, 420); }
    for (let y = 160; y <= 420; y += 20) { ctx.moveTo(120, y + shake); ctx.lineTo(880, y - shake); }
    ctx.stroke();

    // targets
    this.targets.forEach((t, i) => {
      let alpha = 0.92, fill = '#ffffff', stroke = '#0b8a44';
      if (this.state !== 'aim') {
        alpha = 0.45;
        if (i === this.q.answer && this.state === 'result') { alpha = 0.95; fill = '#c9f7d6'; stroke = '#18a957'; }
        else if (i === this.chosen) { alpha = 0.95; fill = this.ok ? '#c9f7d6' : '#ffd0d0'; stroke = this.ok ? '#18a957' : '#d33'; }
      }
      ctx.globalAlpha = alpha;
      Draw.rr(ctx, t.x - t.w / 2, t.y - t.h / 2, t.w, t.h, 16);
      ctx.fillStyle = fill; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = stroke; ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = stroke; ctx.font = `bold 16px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(String(i + 1), t.x - t.w / 2 + 10, t.y - t.h / 2 + 8);
      Draw.fitText(ctx, t.text, t.x, t.y, t.w - 40, t.h - 16, 30, '#14261b');
    });

    // goal posts on top of net
    ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
    ctx.fillRect(110, 150, 12, 272); ctx.fillRect(878, 150, 12, 272); ctx.fillRect(110, 150, 780, 12);

    // keeper
    const kMe = this.mode === 'keep';
    const kStyle = kMe ? { shirt: '#0b8a44', shorts: '#111', gloves: '#ffd400' } : { shirt: this.opp.color === '#f5f5f5' ? '#7b2cbf' : '#f39c12', shorts: '#222', gloves: '#fff' };
    let kx = 500 + Math.sin(time * 2) * 6, ky = 360, dive = 0, up = 0, arms = 0.6;
    if (this.anim) {
      const kt = ease((this.anim.t - 0.25) / 0.55);
      const tx = this.anim.keeper.x, ty = this.anim.keeper.y;
      kx = lerp(500, tx + (tx < 500 ? 40 : -40), kt);
      // jump: rises in an arc, ends at the height of the chosen corner
      ky = lerp(360, ty + 30, kt) - Math.sin(kt * Math.PI) * (ty < 280 ? 70 : 40);
      dive = (tx < 500 ? -1 : 1) * kt * (ty < 280 ? 0.75 : 1);
      up = kt; arms = lerp(0.6, 1, kt);
    }
    // in front of the answer cards; slightly see-through while waiting so the card texts stay readable
    ctx.globalAlpha = this.anim ? 1 : 0.85;
    Draw.person(ctx, kx, ky, this.anim ? 1.35 : 1.2, { ...kStyle, dive, up, arms: this.anim ? arms : 0.35 });
    ctx.globalAlpha = 1;


    // shooter + ball
    const sStyle = this.mode === 'shoot' ? { shirt: '#fff', shorts: '#111' } : { shirt: this.opp.color, shorts: '#fff' };
    let bx = 500, by = 555, br = 17, rot = 0;
    let sx = 430, sy = 545;
    if (this.anim) {
      const run = ease(this.anim.t / 0.25);
      sx = lerp(430, 478, run); sy = lerp(545, 548, run);
      const bt = ease((this.anim.t - 0.22) / 0.6);
      const target = this.anim.ball;
      bx = lerp(500, target.x, bt);
      by = lerp(555, target.y, bt) - Math.sin(bt * Math.PI) * 60;
      br = lerp(17, 11, bt);
      rot = bt * 12;
    }
    Draw.person(ctx, sx, sy, 0.9, sStyle);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(bx, Math.max(by + br, this.anim ? by + br : 572), br, br * 0.35, 0, 0, 7); ctx.fill();
    Draw.ball(ctx, bx, by, br, rot);

    // confetti
    for (const p of this.particles) { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 7, 7); }
    // floating coins
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.5);
      ctx.font = `bold 34px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd400';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
      ctx.strokeText(f.text, f.x, f.y - f.t * 60); ctx.fillText(f.text, f.x, f.y - f.t * 60);
      ctx.globalAlpha = 1;
    }
    // banner
    if (this.state === 'result' && this.banner) {
      const s = Math.min(1, this.banner.t * 4);
      ctx.save(); ctx.translate(500, 290); ctx.scale(0.6 + s * 0.4, 0.6 + s * 0.4);
      ctx.font = `900 92px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(this.banner.text, 0, 0);
      ctx.fillStyle = this.banner.good ? '#3dff7a' : '#ff5b5b'; ctx.fillText(this.banner.text, 0, 0);
      ctx.restore();
    }
  }
}
