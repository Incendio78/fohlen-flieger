'use strict';

// Top-down football: pass to the teammate with the right answer; win the ball back by running into the right space.
const PF = { L: 40, T: 30, H: 540 };
const OUR_BASE = [[0.05, 0.5], [0.24, 0.28], [0.24, 0.72], [0.42, 0.5], [0.58, 0.22], [0.6, 0.78]];
const OPP_BASE = [[0.95, 0.5], [0.76, 0.3], [0.76, 0.7], [0.6, 0.5], [0.45, 0.25], [0.45, 0.75]];
const OUR_NUMBERS = ['1', '4', '2', '17', '38', '11'];
const PASS_QUESTIONS = 16;

class PassGame extends QuizGame {
  constructor(app) { super(app, 'pass', 1000, 600); }

  fw() { return this.stage.W - PF.L * 2; }
  toPx(fx, fy) { return { x: PF.L + fx * this.fw(), y: PF.T + fy * PF.H }; }

  start() {
    this.opp = this.app.pickOpponent();
    this.score = { me: 0, opp: 0 };
    this.right = 0; this.total = 0; this.coins = 0; this.asked = 0;
    this.ours = OUR_BASE.map(([x, y], i) => ({ x, y, tx: x, ty: y, no: OUR_NUMBERS[i] }));
    this.theirs = OPP_BASE.map(([x, y]) => ({ x, y, tx: x, ty: y }));
    this.labels = []; this.spaces = []; this.anim = null; this.banner = null;
    this.el.querySelector('.q-meta').textContent = `Borussia – ${this.opp.name}`;
    this.timeLeft = 0; this.timeLimit = 0;
    this.begin();
    Sound.whistle();
    this.kickoff('us');
  }
  status() {
    const min = Math.min(90, Math.round(this.asked * 90 / PASS_QUESTIONS));
    this.setStatus(`⚽ BMG ${this.score.me} : ${this.score.opp} ${this.opp.short} · ${min}' · Frage ${Math.max(1, this.asked)} von ${PASS_QUESTIONS} · Pässe ${this.passes}/3`);
  }

  formation(shift, jitter = 0.04) {
    const j = () => (Math.random() - 0.5) * jitter * 2;
    this.ours.forEach((p, i) => {
      const [bx, by] = OUR_BASE[i];
      p.tx = i === 0 ? bx : Math.min(0.9, Math.max(0.08, bx + shift + j()));
      p.ty = i === 0 ? by : Math.min(0.95, Math.max(0.05, by + j()));
    });
    this.theirs.forEach((p, i) => {
      const [bx, by] = OPP_BASE[i];
      p.tx = i === 0 ? bx : Math.min(0.92, Math.max(0.1, bx + shift * 0.8 + j()));
      p.ty = i === 0 ? by : Math.min(0.95, Math.max(0.05, by + j()));
    });
    this.moving = 1.0;
  }

  kickoff(side) {
    this.possession = side; this.passes = 0; this.oppAdvance = 0;
    this.ours.forEach((p, i) => { [p.x, p.y] = OUR_BASE[i]; p.x = Math.min(p.x, 0.48); });
    this.theirs.forEach((p, i) => { [p.x, p.y] = OPP_BASE[i]; p.x = Math.max(p.x, 0.52); });
    if (side === 'us') { this.holder = 3; this.ours[3].x = 0.5; this.ours[3].y = 0.5; } else { this.carrier = 3; this.theirs[3].x = 0.5; this.theirs[3].y = 0.5; }
    this.ours.forEach(p => { p.tx = p.x; p.ty = p.y; });
    this.theirs.forEach(p => { p.tx = p.x; p.ty = p.y; });
    this.ball = side === 'us' ? { ...this.ours[3] } : { ...this.theirs[3] };
    this.status();
    this.later(() => this.ask(), 900);
  }

  ask() {
    if (this.asked >= PASS_QUESTIONS) return this.end();
    this.asked++;
    this.anim = null; this.spaces = []; this.labels = [];
    const q = this.app.nextQuestion(4);
    if (this.possession === 'us') {
      const mates = [1, 2, 3, 4, 5].filter(i => i !== this.holder);
      this.labels = Questions.U.shuffle(mates).slice(0, q.choices.length).map((pi, i) => ({ pi, text: q.choices[i] }));
      this.offerForward();
      this.clearLanes();
      this.setQuestion(q, 1.1);
      this.el.querySelector('.q-text').innerHTML = `⚽ Pass zum Mitspieler mit der richtigen Antwort: ${fracHtml(q.q)}`;
    } else {
      const c = this.theirs[this.carrier];
      const ys = Questions.U.shuffle([0.18, 0.4, 0.62, 0.84]);
      this.spaces = q.choices.map((text, i) => ({ text, x: Math.max(0.12, c.x - 0.16 - (i % 2) * 0.1), y: ys[i] }));
      this.setQuestion(q, 1.1);
      this.el.querySelector('.q-text').innerHTML = `🛡️ Hol dir den Ball! Lauf in den Raum mit der richtigen Antwort: ${fracHtml(q.q)}`;
    }
    this.status();
  }

  // Teammates offer themselves sideways or ahead of the ball (no long back passes), each in its own lane.
  offerForward() {
    const h = this.ours[this.holder];
    const lanes = [0.14, 0.38, 0.62, 0.86].sort((a, b) => Math.abs(a - h.y) - Math.abs(b - h.y)).slice(0, this.labels.length);
    const mates = this.labels.map(l => this.ours[l.pi]).sort((a, b) => a.y - b.y);
    lanes.sort((a, b) => a - b).forEach((y, i) => {
      const m = mates[i];
      m.tx = Math.max(0.12, Math.min(0.86, h.x + 0.04 + Math.random() * 0.2));
      m.ty = Math.abs(y - h.y) < 0.12 ? Math.max(0.08, Math.min(0.92, y + (y > h.y ? 0.12 : -0.12))) : y;
    });
    this.moving = Math.max(this.moving || 0, 1.4);
  }

  // Push opponents out of the passing lanes so no pass runs straight through a player.
  clearLanes() {
    const fw = this.fw(), h = this.ours[this.holder], minD = 46;
    for (const [oi, o] of this.theirs.entries()) {
      if (!oi) continue;
      for (const l of this.labels) {
        const m = this.ours[l.pi];
        const ax = h.x * fw, ay = h.y * PF.H, bx = m.tx * fw, by = m.ty * PF.H, px = o.tx * fw, py = o.ty * PF.H;
        const vx = bx - ax, vy = by - ay, len2 = vx * vx + vy * vy || 1;
        const k = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2));
        const cx = ax + vx * k, cy = ay + vy * k, d = Math.hypot(px - cx, py - cy);
        if (d < minD && k > 0.05 && k < 0.95) {
          let nx = -vy, ny = vx; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          if ((px - cx) * nx + (py - cy) * ny < 0) { nx = -nx; ny = -ny; }
          o.tx = Math.max(0.1, Math.min(0.92, (cx + nx * minD) / fw));
          o.ty = Math.max(0.05, Math.min(0.95, (cy + ny * minD) / PF.H));
          if (o.ty <= 0.05 || o.ty >= 0.95) o.ty = Math.max(0.05, Math.min(0.95, (cy - ny * minD) / PF.H));
        }
      }
    }
    this.moving = Math.max(this.moving || 0, 1.2);
  }

  onPointer(type, p) {
    if (type !== 'down' || !this.timerOn || this.anim) return;
    if (this.possession === 'us') {
      const hit = this.labels.find(l => {
        const pl = this.toPx(this.ours[l.pi].x, this.ours[l.pi].y);
        return Math.abs(p.x - pl.x) < 90 && p.y > pl.y - 75 && p.y < pl.y + 25;
      });
      if (hit) this.pass(hit);
    } else {
      const hit = this.spaces.find(sp => { const c = this.toPx(sp.x, sp.y); return Math.hypot(p.x - c.x, p.y - c.y) < 60; });
      if (hit) this.run(hit);
    }
  }
  onKey(e) {
    if (!this.timerOn || this.anim || !(e.key >= '1' && e.key <= '4')) return;
    const i = +e.key - 1;
    if (this.possession === 'us' && this.labels[i]) this.pass(this.labels[i]);
    if (this.possession === 'them' && this.spaces[i]) this.run(this.spaces[i]);
  }

  pass(label) {
    const ok = this.labels.indexOf(label) === this.q.answer;
    this.total++; if (ok) this.right++;
    this.coins += this.answer(ok);
    const from = this.ours[this.holder], to = this.ours[label.pi];
    Sound.kick();
    if (ok) {
      this.anim = { kind: 'pass', t: 0, from: { x: from.x, y: from.y }, to, ok: true, onEnd: () => {
        this.holder = label.pi; this.passes++;
        if (this.passes >= 3) return this.shoot();
        this.labels = []; this.formation(this.passes * 0.1); this.status();
        this.later(() => this.ask(), 1500);
      } };
    } else {
      // nearest opponent to the pass line intercepts
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      let best = 1;
      this.theirs.forEach((o, i) => { if (i && Math.hypot(o.x - mid.x, o.y - mid.y) < Math.hypot(this.theirs[best].x - mid.x, this.theirs[best].y - mid.y)) best = i; });
      const thief = this.theirs[best];
      thief.tx = mid.x; thief.ty = mid.y; this.moving = 0.6;
      this.anim = { kind: 'pass', t: 0, from: { x: from.x, y: from.y }, to: { x: mid.x, y: mid.y }, onEnd: () => this.lose(best) };
    }
  }

  onTimeout() {
    this.total++;
    this.answer(false, { timeout: true });
    if (this.possession === 'us') {
      let best = 1;
      const h = this.ours[this.holder];
      this.theirs.forEach((o, i) => { if (i && Math.hypot(o.x - h.x, o.y - h.y) < Math.hypot(this.theirs[best].x - h.x, this.theirs[best].y - h.y)) best = i; });
      this.theirs[best].tx = h.x; this.theirs[best].ty = h.y; this.moving = 0.6;
      this.later(() => this.lose(best), 700);
    } else this.oppAttack();
  }

  lose(i) {
    this.possession = 'them'; this.carrier = i; this.passes = 0; this.labels = [];
    this.banner = { text: 'Ballverlust!', good: false, t: 0 };
    this.formation(-0.05);
    this.status();
    this.later(() => this.ask(), 2600);
  }

  run(space) {
    const ok = this.spaces.indexOf(space) === this.q.answer;
    this.total++; if (ok) this.right++;
    this.coins += this.answer(ok);
    // nearest outfield player sprints into the chosen space
    let best = 1;
    this.ours.forEach((o, i) => { if (i && Math.hypot(o.x - space.x, o.y - space.y) < Math.hypot(this.ours[best].x - space.x, this.ours[best].y - space.y)) best = i; });
    const runner = this.ours[best];
    runner.tx = space.x; runner.ty = space.y; this.moving = 0.7;
    this.anim = { kind: 'run', t: 0, onEnd: () => {
      if (ok) {
        const c = this.theirs[this.carrier];
        this.anim = { kind: 'pass', t: 0, from: { x: c.x, y: c.y }, to: runner, onEnd: () => {
          this.possession = 'us'; this.holder = best; this.passes = 0; this.spaces = [];
          this.banner = { text: 'Ball erobert!', good: true, t: 0 };
          this.formation(0); this.status();
          this.later(() => this.ask(), 1800);
        } };
      } else this.oppAttack();
    } };
  }

  oppAttack() {
    this.spaces = [];
    this.oppAdvance++;
    if (this.oppAdvance >= 3) return this.oppGoal();
    const c = this.theirs[this.carrier];
    c.tx = Math.max(0.15, c.x - 0.15); c.ty = Math.min(0.85, Math.max(0.15, c.y + (Math.random() - 0.5) * 0.2));
    this.formation(-0.1 * this.oppAdvance);
    this.theirs[this.carrier].tx = c.tx; this.theirs[this.carrier].ty = c.ty;
    this.anim = { kind: 'run', t: 0, onEnd: () => this.later(() => this.ask(), 1600) };
  }

  shoot() {
    const h = this.ours[this.holder];
    // dribble into the penalty area first, then shoot
    h.tx = 0.84; h.ty = Math.max(0.36, Math.min(0.64, h.y)); this.moving = 1.6;
    const keeper = this.theirs[0];
    this.theirs.forEach((o, i) => { if (i && o.tx > 0.6) { o.tx = Math.min(0.86, o.tx + 0.05); } });
    this.anim = { kind: 'run', t: 0, dur: 1.5, onEnd: () => this.finishShot(h, keeper) };
  }
  finishShot(h) {
    Sound.kick();
    this.anim = { kind: 'pass', t: 0, from: { x: h.x, y: h.y }, to: { x: 1.005, y: 0.5 + (Math.random() - 0.5) * 0.1 }, onEnd: () => {
      this.score.me++;
      this.banner = { text: 'TOOOR!', good: true, t: 0 };
      Sound.crowd(); Sound.success();
      this.status();
      this.later(() => this.kickoff('them'), 2400);
    } };
  }
  oppGoal() {
    const c = this.theirs[this.carrier];
    c.tx = 0.16; c.ty = Math.max(0.36, Math.min(0.64, c.y)); this.moving = 1.6;
    this.anim = { kind: 'run', t: 0, dur: 1.5, onEnd: () => this.oppShot(c) };
  }
  oppShot(c) {
    Sound.kick();
    this.anim = { kind: 'pass', t: 0, from: { x: c.x, y: c.y }, to: { x: -0.005, y: 0.5 }, onEnd: () => {
      this.score.opp++;
      this.banner = { text: 'Gegentor …', good: false, t: 0 };
      this.status();
      this.later(() => this.kickoff('us'), 2400);
    } };
  }

  end() {
    this.stop();
    const win = this.score.me > this.score.opp;
    const bonus = win ? 40 : 0;
    if (bonus) this.app.addCoins(bonus);
    this.app.showResult({
      title: win ? '🏆 Sieg!' : this.score.me === this.score.opp ? '🤝 Unentschieden' : 'Knapp verloren',
      lines: [`Borussia ${this.score.me} : ${this.score.opp} ${this.opp.name}`, `${this.right} von ${this.total} Fragen richtig`,
        `🪙 ${this.coins + bonus} Taler verdient${bonus ? ' (inkl. 40 Siegprämie)' : ''}`],
      again: () => this.app.startGame('pass'),
      win,
    });
  }

  update(dt) {
    if (this.moving > 0) {
      this.moving -= dt;
      const k = Math.min(1, dt * 3);
      for (const p of [...this.ours, ...this.theirs]) { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; }
    }
    if (this.anim) {
      const a = this.anim;
      if (a.kind === 'pass' && !a.dur) {
        const fw = this.fw();
        a.dur = 0.6 + Math.hypot((a.to.x - a.from.x) * fw, (a.to.y - a.from.y) * PF.H) / 380;
      }
      a.t += dt / (a.dur || 0.9);
      if (a.kind === 'pass') {
        const e = Math.min(1, a.t), sm = e * (2 - e);
        this.ball = { x: a.from.x + (a.to.x - a.from.x) * sm, y: a.from.y + (a.to.y - a.from.y) * sm };
      }
      if (a.t >= 1) { this.anim = null; a.onEnd(); }
    }
    if (this.anim && this.anim.kind === 'pass') {
      // ball position set by the pass animation
    } else if (this.possession === 'us' && this.ours[this.holder]) {
      const h = this.ours[this.holder]; this.ball = { x: h.x + 0.012, y: h.y + 0.02 };
    } else if (this.possession === 'them' && this.theirs[this.carrier]) {
      const c = this.theirs[this.carrier]; this.ball = { x: c.x - 0.012, y: c.y + 0.02 };
    }
    if (this.banner) { this.banner.t += dt; if (this.banner.t > 1.8) this.banner = null; }
  }

  draw(time) {
    const ctx = this.stage.begin('#2e8b3e');
    const W = this.stage.W, fw = this.fw();
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#2f9a46' : '#38a852'; ctx.fillRect(PF.L + i * fw / 12, PF.T, fw / 12 + 1, PF.H); }
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3;
    ctx.strokeRect(PF.L, PF.T, fw, PF.H);
    ctx.beginPath(); ctx.moveTo(W / 2, PF.T); ctx.lineTo(W / 2, PF.T + PF.H); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, PF.T + PF.H / 2, 60, 0, 7); ctx.stroke();
    for (const side of [0, 1]) {
      const x0 = side ? PF.L + fw : PF.L, dir = side ? -1 : 1;
      ctx.strokeRect(Math.min(x0, x0 + dir * fw * 0.14), PF.T + PF.H * 0.2, fw * 0.14, PF.H * 0.6);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillRect(side ? x0 : x0 - 14, PF.T + PF.H * 0.4, 14, PF.H * 0.2);
    }
    // defensive spaces
    this.spaces.forEach((sp, i) => {
      const c = this.toPx(sp.x, sp.y);
      const isAns = i === this.q.answer;
      ctx.fillStyle = !this.timerOn && isAns ? 'rgba(61,255,122,.35)' : 'rgba(255,255,255,.18)';
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.arc(c.x, c.y, 56, 0, 7); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      Draw.rr(ctx, c.x - 80, c.y - 24, 160, 48, 12); ctx.fillStyle = 'rgba(255,255,255,.93)'; ctx.fill();
      Draw.fitText(ctx, sp.text, c.x, c.y, 148, 42, 24, '#102030');
    });
    const drawP = (p, fill, edge, no, hl) => {
      const c = this.toPx(p.x, p.y);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(c.x + 3, c.y + 5, 17, 9, 0, 0, 7); ctx.fill();
      if (hl) { ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c.x, c.y, 24 + Math.sin(time * 6) * 2, 0, 7); ctx.stroke(); }
      ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(c.x, c.y, 17, 0, 7); ctx.fill(); ctx.stroke();
      if (no) { ctx.fillStyle = '#111'; ctx.font = `bold 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(no, c.x, c.y + 1); }
    };
    const oppCol = this.opp.color === '#f5f5f5' ? '#7b2cbf' : this.opp.color;
    this.theirs.forEach((p, i) => drawP(p, oppCol, '#222', '', this.possession === 'them' && i === this.carrier));
    this.ours.forEach((p, i) => drawP(p, '#fff', '#0b8a44', p.no, this.possession === 'us' && i === this.holder && !this.anim));
    // pass labels above teammates
    this.labels.forEach((l, i) => {
      const c = this.toPx(this.ours[l.pi].x, this.ours[l.pi].y);
      const reveal = !this.timerOn && i === this.q.answer;
      Draw.rr(ctx, c.x - 85, c.y - 72, 170, 46, 12);
      ctx.fillStyle = reveal ? '#c9f7d6' : 'rgba(255,255,255,.95)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#0b8a44'; ctx.stroke();
      Draw.fitText(ctx, l.text, c.x, c.y - 49, 156, 40, 24, '#102030');
    });
    if (this.ball) { const b = this.toPx(this.ball.x, this.ball.y); Draw.ball(ctx, b.x, b.y, 9, time * 8); }
    if (this.banner) {
      const s = Math.min(1, this.banner.t * 4);
      ctx.save(); ctx.translate(W / 2, 300); ctx.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
      ctx.font = `900 80px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(this.banner.text, 0, 0);
      ctx.fillStyle = this.banner.good ? '#3dff7a' : '#ff5b5b'; ctx.fillText(this.banner.text, 0, 0);
      ctx.restore();
    }
  }
}
