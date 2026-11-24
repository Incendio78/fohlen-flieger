'use strict';

const FLIGHT_GATES = 15;

class FlightGame {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('screen-flight');
    this.stage = new Stage(document.getElementById('flight-canvas'), 1000, 600, { fitHeight: true });
    const cv = this.stage.canvas;
    const setY = e => { if (this.running) this.plane.ty = Math.max(40, Math.min(560, this.stage.toLogical(e).y)); };
    cv.addEventListener('pointerdown', e => { Sound.init(); cv.setPointerCapture(e.pointerId); setY(e); this.boost(); });
    cv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) setY(e); });
    window.addEventListener('keydown', e => {
      if (this.running && this.holding && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.release(); return; }
      if (!this.running || !this.gate) return;
      const n = this.gate.lanes.length;
      const cur = this.laneAt(this.plane.ty);
      let lane = null;
      if (e.key === 'ArrowUp' || e.key === 'w') lane = Math.max(0, cur - 1);
      if (e.key === 'ArrowDown' || e.key === 's') lane = Math.min(n - 1, cur + 1);
      if (e.key >= '1' && e.key <= String(n)) { lane = +e.key - 1; this.plane.ty = this.laneCenter(lane, n); this.boost(); }
      if (e.key === 'Enter') this.boost();
      if (e.key === 'p') this.togglePause();
      if (lane !== null) { this.plane.ty = this.laneCenter(lane, n); e.preventDefault(); }
    });
    this.el.querySelector('.btn-pause').addEventListener('click', () => this.togglePause());
    this.clouds = Array.from({ length: 14 }, () => this.newCloud(true));
  }

  newCloud(initial) {
    const layer = Math.random();
    return { x: initial ? Math.random() * 2200 : this.stage.W + 200 + Math.random() * 300, y: 20 + Math.random() * 450,
      s: 0.5 + layer * 0.9, v: 0.15 + layer * 0.5, a: 0.5 + layer * 0.4 };
  }

  start() {
    const p = PLANES.find(p => p.id === this.app.state.plane) || PLANES[0];
    this.planeInfo = p;
    this.plane = { x: 210, y: 300, ty: 300, tilt: 0 };
    this.gate = null; this.coinsItems = []; this.sparks = []; this.floaters = [];
    this.lives = 3; this.km = 0; this.speedF = 1; this.right = 0; this.total = 0; this.coins = 0;
    this.spawnIn = 1.0; this.coinIn = 2; this.shake = 0; this.paused = false;
    this.running = true; this.over = false; this.holding = false;
    this.el.querySelector('.q-text').style.visibility = '';
    this.el.querySelector('.q-text').textContent = 'Bereit zum Start … ✈️';
    this.el.querySelector('.q-meta').textContent = p.name;
    this.setFeedback('Tippe/ziehe auf dem Bild – oder nutze ↑ ↓ – um durch das richtige Tor zu fliegen.', '');
    this.status();
    this.t = performance.now();
    requestAnimationFrame(ts => this.loop(ts));
  }
  stop() { this.running = false; }
  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
    this.el.querySelector('.q-text').style.visibility = this.paused ? 'hidden' : '';
    this.el.querySelector('.btn-pause').textContent = this.paused ? '▶ Weiter' : '⏸ Pause';
  }

  // A tap on an answer = decision made: the gate rushes in (about 0.7 s) instead of a long wait.
  boost() {
    const g = this.gate;
    if (!this.running || this.paused || !g || g.resolved) return;
    g.v = Math.max(g.v, (g.x - this.plane.x) / 0.7);
    this.boostT = 0.7;
  }

  status() {
    this.el.querySelector('.q-status').textContent =
      `Tor ${Math.min(FLIGHT_GATES, this.total + (this.gate && !this.gate.resolved ? 1 : 0)) || 1} von ${FLIGHT_GATES} · noch ${FLIGHT_GATES - this.total}`;
  }
  // After a wrong answer nothing new comes until "Weiter" is pressed.
  hold() {
    this.holding = true;
    const b = document.createElement('button');
    b.className = 'primary fb-next'; b.textContent = 'Weiter ▶';
    b.addEventListener('click', () => this.release());
    this.el.querySelector('.flight-feedback').appendChild(b);
  }
  release() {
    if (!this.holding) return;
    this.holding = false;
    const b = this.el.querySelector('.fb-next'); if (b) b.remove();
    if (this.over) this.end();
  }

  setFeedback(html, cls) {
    const f = this.el.querySelector('.flight-feedback');
    f.innerHTML = html; f.className = 'flight-feedback ' + (cls || '');
  }

  laneBounds(n) { const top = 30, bottom = 570, h = (bottom - top) / n; return { top, h }; }
  laneCenter(i, n) { const { top, h } = this.laneBounds(n); return top + h * (i + 0.5); }
  laneAt(y) {
    if (!this.gate) return 0;
    const n = this.gate.lanes.length, { top, h } = this.laneBounds(n);
    return Math.max(0, Math.min(n - 1, Math.floor((y - top) / h)));
  }

  spawnGate() {
    const q = this.app.nextQuestion(3, 'normal', null, { exclude: ['gleichungen'] });
    const T = Math.max(8, this.app.timeFor(q, 0.75)) / this.speedF / this.planeInfo.speed;
    const startX = this.stage.W + 140;
    this.gate = { q, x: startX, v: (startX - this.plane.x) / T, lanes: q.choices.map(t => ({ text: t })), resolved: false, born: performance.now(), hit: -1 };
    this.el.querySelector(".q-text").innerHTML = fracHtml(q.q);
    this.el.querySelector('.q-meta').textContent = this.app.topicLabel(q);
    this.setFeedback('', '');
    this.status();
  }

  resolveGate() {
    const g = this.gate;
    g.resolved = true;
    const lane = this.laneAt(this.plane.y);
    g.hit = lane;
    const ok = lane === g.q.answer;
    this.total++;
    const earned = this.app.record(g.q, ok, performance.now() - g.born, this.planeInfo.mult);
    if (ok) {
      this.right++; this.coins += earned;
      this.speedF = Math.min(1.7, this.speedF * 1.05);
      Sound.success();
      this.burst(this.plane.x + 60, this.plane.y);
      this.floaters.push({ text: `+${earned} 🪙`, x: this.plane.x + 40, y: this.plane.y - 40, t: 0 });
      this.setFeedback(`✅ Richtig! ${g.q.explain ? `<small>${fracHtml(g.q.explain)}</small>` : ''}`, 'good');
      this.spawnIn = 2.2;
      this.spawnCoins();
    } else {
      this.lives--;
      this.speedF = Math.max(0.85, this.speedF * 0.9);
      this.shake = 0.6;
      Sound.fail();
      this.setFeedback(`❌ Richtig wäre: <b>${fracHtml(g.q.correct)}</b> ${g.q.explain ? `<small>${fracHtml(g.q.explain)}</small>` : ''}`, 'bad');
      this.spawnIn = 1.0;
      if (this.lives <= 0) this.over = true;
      this.hold();
    }
    if (this.total >= FLIGHT_GATES && this.lives > 0) { this.over = true; if (ok) setTimeout(() => this.end(), 2000); }
    this.status();
  }

  // Coins only appear between two gates, so they never cover an answer.
  spawnCoins() {
    const n = 2 + Math.floor(Math.random() * 3), y = 80 + Math.random() * 440;
    for (let i = 0; i < n; i++) this.coinsItems.push({ x: this.stage.W + 40 + i * 60, y: Math.max(50, Math.min(550, y + (Math.random() - 0.5) * 120)) });
  }

  end() {
    if (!this.running) return;
    this.stop();
    const km = Math.round(this.km);
    const best = this.app.flightEnd(km);
    this.app.showResult({
      title: this.lives <= 0 ? '⛽ Tank leer – Notlandung!' : best ? '🏆 Neuer Rekord!' : '🛬 Gelandet!',
      lines: [`${this.planeInfo.name}: ${km} km geflogen`, `${this.right} von ${this.total} Toren richtig durchflogen`, `🪙 ${this.coins} Taler verdient`],
      again: () => this.app.startFlight(),
      win: best,
    });
  }

  burst(x, y) {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 260;
      this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.8 + Math.random() * 0.6, c: Questions.U.pick(['#ffd400', '#fff', '#3dff7a']) });
    }
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.05, (ts - this.t) / 1000);
    this.t = ts;
    if (!this.paused) this.update(dt);
    this.draw(ts / 1000);
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    const p = this.plane;
    const dy = p.ty - p.y;
    p.y += dy * Math.min(1, dt * 5);
    p.tilt = Math.max(-0.3, Math.min(0.3, dy * 0.004));
    this.boostT = Math.max(0, (this.boostT || 0) - dt);
    const base = 220 * this.speedF * (this.boostT > 0 ? 3 : 1);
    this.km += dt * base / 40;
    for (const c of this.clouds) {
      c.x -= base * c.v * dt;
      if (c.x < -250) Object.assign(c, this.newCloud(false));
    }
    if (!this.over) {
      if ((!this.gate || this.gate.resolved) && !this.holding) {
        this.spawnIn -= dt;
        if (this.spawnIn <= 0) this.spawnGate();
      }
    }
    if (this.gate) {
      this.gate.x -= this.gate.v * dt;
      if (!this.gate.resolved && this.gate.x <= p.x) this.resolveGate();
      if (this.gate.x < -300) this.gate = this.gate.resolved ? null : this.gate;
    }
    for (const c of this.coinsItems) {
      c.x -= base * 1.1 * dt;
      if (!c.taken && Math.hypot(c.x - p.x - 30, c.y - p.y) < 45) {
        c.taken = true; this.app.addCoins(1); this.coins++; Sound.coin();
        this.floaters.push({ text: '+1', x: c.x, y: c.y, t: 0 });
      }
    }
    this.coinsItems = this.coinsItems.filter(c => c.x > -40 && !c.taken);
    for (const s of this.sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; }
    this.sparks = this.sparks.filter(s => s.life > 0);
    for (const f of this.floaters) f.t += dt;
    this.floaters = this.floaters.filter(f => f.t < 1.2);
    this.shake = Math.max(0, this.shake - dt);
  }

  drawCloud(ctx, x, y, s, a) {
    ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 30 * s, 0, 7); ctx.arc(x + 35 * s, y - 15 * s, 38 * s, 0, 7);
    ctx.arc(x + 75 * s, y, 30 * s, 0, 7); ctx.arc(x + 38 * s, y + 10 * s, 30 * s, 0, 7);
    ctx.fill(); ctx.globalAlpha = 1;
  }

  draw(time) {
    const st = this.stage;
    const ctx = st.begin('#7cc4ff');
    const W = st.W, H = 600;
    ctx.save();
    if (this.shake) ctx.translate(Math.sin(time * 70) * 10 * this.shake, Math.cos(time * 60) * 6 * this.shake);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#3f9cf0'); sky.addColorStop(1, '#d6efff');
    ctx.fillStyle = sky; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.fillStyle = 'rgba(255,240,150,.9)';
    ctx.beginPath(); ctx.arc(W - 120, 90, 45, 0, 7); ctx.fill();
    for (const c of this.clouds) this.drawCloud(ctx, c.x, c.y, c.s, c.a * 0.7);
    // hills
    const off = (this.km * 40 * 0.3) % 400;
    ctx.fillStyle = '#7dbb6a';
    ctx.beginPath(); ctx.moveTo(-20, H);
    for (let x = -off - 400; x < W + 400; x += 200) ctx.quadraticCurveTo(x + 100, H - 80, x + 200, H - 25);
    ctx.lineTo(W + 20, H); ctx.fill();

    // gate
    if (this.gate) {
      const g = this.gate, n = g.lanes.length, { top, h } = this.laneBounds(n);
      const colors = ['#1e88e5', '#f57c00', '#8e24aa'];
      g.lanes.forEach((l, i) => {
        const y = top + i * h;
        let col = colors[i % 3];
        if (g.resolved) col = i === g.q.answer ? '#18a957' : i === g.hit ? '#d33' : '#888';
        ctx.globalAlpha = g.resolved ? 0.55 : 0.85;
        Draw.rr(ctx, g.x - 130, y + 10, 260, h - 20, 26);
        ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fill();
        ctx.lineWidth = 8; ctx.strokeStyle = col; ctx.stroke();
        ctx.globalAlpha = 1;
        // pylons
        ctx.fillStyle = col;
        ctx.fillRect(g.x - 140, y + 4, 14, 22); ctx.fillRect(g.x + 126, y + h - 26, 14, 22);
        Draw.fitText(ctx, l.text, g.x, y + h / 2, 225, h - 44, 32, '#102030');
      });
      if (!g.resolved) {
        ctx.setLineDash([12, 12]); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3;
        for (let i = 1; i < n; i++) { ctx.beginPath(); ctx.moveTo(0, top + i * h); ctx.lineTo(W, top + i * h); ctx.stroke(); }
        ctx.setLineDash([]);
      }
    }
    // coins
    for (const c of this.coinsItems) {
      const w = Math.abs(Math.cos(time * 4 + c.y)) * 14 + 2;
      ctx.fillStyle = '#ffcf00'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, w, 16, 0, 0, 7); ctx.fill(); ctx.stroke();
    }
    // plane
    const p = this.plane;
    drawPlane(ctx, this.planeInfo.id, p.x, p.y + Math.sin(time * 2) * 3, 0.85, time, p.tilt);
    for (const s of this.sparks) { ctx.fillStyle = s.c; ctx.globalAlpha = Math.min(1, s.life); ctx.fillRect(s.x, s.y, 6, 6); }
    ctx.globalAlpha = 1;
    for (const f of this.floaters) {
      ctx.globalAlpha = 1 - f.t / 1.2; ctx.font = `bold 30px ${FONT}`; ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd400'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
      ctx.strokeText(f.text, f.x, f.y - f.t * 50); ctx.fillText(f.text, f.x, f.y - f.t * 50);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // HUD
    ctx.font = `bold 26px ${FONT}`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    Draw.rr(ctx, 12, 10, 205, 44, 12); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('⛽'.repeat(Math.max(0, this.lives)) + '·'.repeat(Math.max(0, 3 - this.lives)) + `  ×${this.planeInfo.mult}`, 22, 19);
    ctx.textAlign = 'right';
    Draw.rr(ctx, W - 262, 10, 250, 44, 12); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(`${Math.round(this.km)} km  🪙 ${this.coins}`, W - 24, 19);
    if (this.paused) {
      ctx.fillStyle = '#0d1b2a'; ctx.fillRect(-50, -50, W + 100, H + 100);
      ctx.font = `900 70px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
      ctx.fillText('PAUSE', W / 2, H / 2);
    }
  }
}
