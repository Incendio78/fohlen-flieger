'use strict';

// Cockpit view: a gate with four answer cards (2×2) approaches; steer the crosshair into the right card.
const CK = { SPREAD: 900, GATE_W: 760, GATE_H: 380, D0: 2.6, VIEW_H: 440, GATES: 12, BOOST: 0.9, PX: 260, RANGE_X: 1.5, RANGE_Y: 0.45 };

class CockpitGame extends QuizGame {
  constructor(app) {
    super(app, 'cockpit', 1000, 600);
    this.clouds = Array.from({ length: 10 }, () => this.newCloud(Math.random() * 6 + 1));
    this.worldZ = 0;
    const r = (a, b) => a + Math.random() * (b - a);
    this.houses = Array.from({ length: 40 }, () => this.newHouse(r(1, 45)));
    this.lakes = Array.from({ length: 3 }, (_, i) => ({ wx: r(-6, 6), z: 6 + i * 14, rx: r(2, 4), rz: r(2, 4) }));
  }

  newHouse(z) {
    const r = (a, b) => a + Math.random() * (b - a);
    // houses cluster in villages along the road
    const side = Math.random() < 0.5 ? -1 : 1;
    return { wx: -2.5 + side * r(0.8, 4), z: this.worldZ + z, w: r(0.5, 0.9), h: r(0.3, 0.55),
      roof: Questions.U.pick(['#b23a2a', '#8d3b2b', '#6d4c41', '#c0573e']) };
  }

  newCloud(d) {
    return { x: (Math.random() - 0.5) * 6, y: -0.15 - Math.random() * 0.5, d, s: 0.6 + Math.random() };
  }

  start() {
    this.plane = PLANES.find(p => p.id === this.app.state.plane) || PLANES[0];
    this.aim = { x: 0, y: 0 }; this.target = { x: 0, y: 0 };
    this.lives = 3; this.passed = 0; this.right = 0; this.total = 0; this.coins = 0; this.speedF = 1;
    this.gate = null; this.alt = 3000; this.over = false;
    this.el.querySelector('.q-text').textContent = 'Cockpit bereit – gleich kommt das erste Tor!';
    this.el.querySelector('.q-meta').textContent = `Cockpit: ${this.plane.name}`;
    this.feedback('Steuern: Maus/Finger zur Seite bewegen (oder Pfeiltasten). Klick auf eine Karte (oder 1–4) = Vollgas!', '');
    this.timeLeft = 0; this.timeLimit = 0;
    this.begin();
    this.status();
    this.later(() => this.spawn(), 1200);
    Sound.whistle();
  }

  status() {
    const n = Math.min(this.total + (this.gate && !this.gate.resolved ? 1 : 0), CK.GATES);
    this.setStatus(`Tor ${Math.max(1, n)} von ${CK.GATES} · noch ${CK.GATES - this.total} · ⛽ ${'■'.repeat(Math.max(0, this.lives))}${'□'.repeat(Math.max(0, 3 - this.lives))}`);
  }

  spawn() {
    const q = this.app.nextQuestion(4);
    this.setQuestion(q, 0.9 / this.speedF);
    // curves: the next gate is alternately (mostly) on the left or right
    this.side = Math.random() < 0.75 ? -(this.side || 1) : (this.side || 1);
    const offX = this.side * (0.3 + Math.random() * 0.9);
    this.gate = { q, offX, offY: (Math.random() - 0.5) * 0.25, d: CK.D0, resolved: false, hit: -1, boost: null };
    this.status();
  }

  scale() { return this.gate ? 1 / this.gate.d : 0.25; }
  center() { return { cx: this.stage.W / 2, cy: CK.VIEW_H / 2 }; }

  // Steering like a yoke: the pointer position in the window maps directly (not relative to the current
  // heading) to a course – stable with mouse and finger. Clicking a card additionally gives full throttle.
  onPointer(type, p) {
    const g = this.gate;
    if (!g || g.resolved || g.boost || p.y > CK.VIEW_H) return;
    const { cx, cy } = this.center();
    if (type === 'down') {
      const card = this.cardAt(p);
      if (card >= 0) { this.steerTo(card); this.boost(); return; }
    }
    this.target.x = (p.x - cx) / (this.stage.W / 2) * CK.RANGE_X;
    this.target.y = (p.y - cy) / (CK.VIEW_H / 2) * CK.RANGE_Y;
    this.clampTarget();
  }
  cardAt(p) {
    const g = this.gate, { cx, cy } = this.center(), s = this.scale();
    const gx = cx + (g.offX - this.aim.x) * CK.SPREAD * s, gy = cy + (g.offY - this.aim.y) * CK.SPREAD * s;
    const gw = CK.GATE_W * s, gh = CK.GATE_H * s;
    if (Math.abs(p.x - gx) > gw / 2 || Math.abs(p.y - gy) > gh / 2) return -1;
    return (p.y > gy ? 2 : 0) + (p.x > gx ? 1 : 0);
  }
  boost() {
    const g = this.gate;
    if (!g || g.resolved || g.boost) return;
    g.boost = { t: 0, d0: g.d };
    this.timerOn = false;
    Sound.coin();
  }
  steerTo(i) {
    const g = this.gate;
    if (!g) return;
    this.target.x = g.offX + (i % 2 ? 1 : -1) * CK.GATE_W / 4 / CK.SPREAD;
    this.target.y = g.offY + (i >= 2 ? 1 : -1) * CK.GATE_H / 4 / CK.SPREAD;
  }
  clampTarget() {
    this.target.x = Math.max(-CK.RANGE_X, Math.min(CK.RANGE_X, this.target.x));
    this.target.y = Math.max(-CK.RANGE_Y, Math.min(CK.RANGE_Y, this.target.y));
  }
  onKey(e) {
    if (!this.gate || this.gate.resolved || this.gate.boost) return;
    const step = 0.08;
    if (e.key === 'ArrowLeft') this.target.x -= step;
    else if (e.key === 'ArrowRight') this.target.x += step;
    else if (e.key === 'ArrowUp') this.target.y -= step;
    else if (e.key === 'ArrowDown') this.target.y += step;
    else if (e.key >= '1' && e.key <= '4') { this.steerTo(+e.key - 1); this.boost(); }
    else if (e.key === 'Enter') this.boost();
    else return;
    e.preventDefault();
    this.clampTarget();
  }

  // Which card the crosshair is in: 0 TL, 1 TR, 2 BL, 3 BR.
  quadrant() {
    const g = this.gate;
    return (this.aim.y - g.offY > 0 ? 2 : 0) + (this.aim.x - g.offX > 0 ? 1 : 0);
  }

  onTimeout() { /* the gate arrival itself resolves the question */ }

  update(dt) {
    const g0 = this.gate;
    const k = Math.min(1, dt * (g0 && g0.boost ? 7 : 2.5));
    const prevX = this.aim.x;
    this.aim.x += (this.target.x - this.aim.x) * k;
    this.aim.y += (this.target.y - this.aim.y) * k;
    // smoothed, gentle banking (no wobble)
    const wantBank = Math.max(-0.35, Math.min(0.35, (this.aim.x - prevX) / Math.max(dt, 0.001) * 0.3));
    this.bank = (this.bank || 0) + (wantBank - (this.bank || 0)) * Math.min(1, dt * 3);
    const speed = 1.2 * this.speedF * (g0 && g0.boost && !g0.resolved ? 3 : 1);
    this.worldZ += dt * speed * 3;
    for (let i = 0; i < this.houses.length; i++) if (this.houses[i].z - this.worldZ < 1) this.houses[i] = this.newHouse(40 + Math.random() * 6);
    for (const l of this.lakes) if (l.z - this.worldZ < 0.5) { l.z = this.worldZ + 42; l.wx = (Math.random() - 0.5) * 12; }
    for (const c of this.clouds) {
      c.d -= dt * speed;
      if (c.d < 0.3) Object.assign(c, this.newCloud(7));
    }
    const g = this.gate;
    if (g && !g.resolved && g.boost) {
      g.boost.t += dt;
      g.d = g.boost.d0 - (g.boost.d0 - 1) * Math.min(1, g.boost.t / CK.BOOST);
      if (g.boost.t >= CK.BOOST) this.resolve();
    } else if (g && !g.resolved) {
      g.d = 1 + (CK.D0 - 1) * Math.max(0, this.timeLeft / this.timeLimit);
      if (g.d <= 1.0001 || this.timeLeft <= 0) this.resolve();
    } else if (g && g.resolved) {
      g.d -= dt * 2.5;
      if (g.d < 0.35) this.gate = null;
    }
    this.alt += dt * 20 * this.speedF;
  }

  resolve() {
    const g = this.gate;
    g.resolved = true;
    g.hit = this.quadrant();
    const ok = g.hit === g.q.answer;
    this.total++;
    const coins = this.answer(ok, { mult: this.plane.mult });
    if (ok) {
      this.right++; this.passed++; this.coins += coins;
      this.speedF = Math.min(1.6, this.speedF * 1.05);
      this.flash = { t: 0.5, good: true };
    } else {
      this.lives--;
      this.speedF = Math.max(0.85, this.speedF * 0.92);
      this.flash = { t: 0.6, good: false };
    }
    this.status();
    if (this.lives <= 0 || this.total >= CK.GATES) { this.over = true; this.later(() => this.end(), 2200); } else this.later(() => this.spawn(), ok ? 1300 : 800);
  }

  end() {
    this.stop();
    const best = this.passed > (this.app.state.bestCockpit || 0);
    if (best) { this.app.state.bestCockpit = this.passed; this.app.save(); }
    this.app.showResult({
      title: this.lives <= 0 ? '⛽ Treibstoff leer – Notlandung!' : best ? `🏆 Neuer Rekord: ${this.passed} Tore!` : '🛬 Sicher gelandet!',
      lines: [`${this.right} von ${this.total} Toren richtig durchflogen`, `🪙 ${this.coins} Taler verdient`],
      again: () => this.app.startGame('cockpit'),
      win: best,
    });
  }

  // Ground scenery: perspective projection, world units (wx lateral, z distance ahead).
  drawGround(ctx, hy, vx) {
    const W = this.stage.W, P = CK.PX;
    const sy = d => hy + P / d, sx = (wx, d) => vx + wx * P / d;
    // field stripes
    for (let k = Math.floor(this.worldZ / 3) * 3 + 3; k < this.worldZ + 45; k += 3) {
      const d0 = k - this.worldZ, d1 = d0 + 1.5;
      if (d0 < 0.5) continue;
      ctx.fillStyle = 'rgba(120,170,80,.35)';
      ctx.fillRect(-W, sy(d1), W * 3, sy(d0) - sy(d1));
    }
    // lakes
    for (const l of [...this.lakes].sort((a, b) => b.z - a.z)) {
      const d = l.z - this.worldZ; if (d < 0.6) continue;
      const yN = sy(Math.max(0.5, d - l.rz)), yF = sy(d + l.rz);
      ctx.fillStyle = '#4d8fd8';
      ctx.beginPath(); ctx.ellipse(sx(l.wx, d), (yN + yF) / 2, l.rx * P / d, Math.max(1, (yN - yF) / 2), 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // river (winding)
    const riverX = z => 2 + 4 * Math.sin(z * 0.12);
    ctx.fillStyle = '#4f8fd6';
    ctx.beginPath();
    const pts = [];
    for (let d = 0.8; d < 45; d *= 1.12) pts.push(d);
    pts.forEach((d, i) => { const z = this.worldZ + d; const x = sx(riverX(z) - 0.6, d), y = sy(d); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    [...pts].reverse().forEach(d => { const z = this.worldZ + d; ctx.lineTo(sx(riverX(z) + 0.6, d), sy(d)); });
    ctx.closePath(); ctx.fill();
    // main road with moving centre dashes
    ctx.fillStyle = '#6b6f73';
    ctx.beginPath(); ctx.moveTo(sx(-2.8, 0.8), sy(0.8)); ctx.lineTo(sx(-2.8, 60), sy(60)); ctx.lineTo(sx(-2.2, 60), sy(60)); ctx.lineTo(sx(-2.2, 0.8), sy(0.8)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff';
    for (let k = Math.ceil(this.worldZ); k < this.worldZ + 40; k += 1) {
      const d = k - this.worldZ; if (d < 0.8) continue;
      ctx.lineWidth = Math.max(0.5, 6 / d);
      ctx.beginPath(); ctx.moveTo(sx(-2.5, d), sy(d)); ctx.lineTo(sx(-2.5, d + 0.4), sy(d + 0.4)); ctx.stroke();
    }
    // cross roads
    for (let k = Math.ceil(this.worldZ / 12) * 12; k < this.worldZ + 50; k += 12) {
      const d = k - this.worldZ; if (d < 0.8) continue;
      ctx.fillStyle = '#7a7e82';
      ctx.fillRect(-W, sy(d + 0.2), W * 3, Math.max(1, sy(d - 0.2) - sy(d + 0.2)));
    }
    // houses (far to near)
    for (const h of [...this.houses].sort((a, b) => b.z - a.z)) {
      const d = h.z - this.worldZ; if (d < 0.8) continue;
      const x = sx(h.wx, d), y = sy(d), w = h.w * P / d, hh = h.h * P / d;
      ctx.fillStyle = '#efe6d6'; ctx.fillRect(x - w / 2, y - hh, w, hh);
      ctx.fillStyle = h.roof;
      ctx.beginPath(); ctx.moveTo(x - w * 0.6, y - hh); ctx.lineTo(x, y - hh - w * 0.45); ctx.lineTo(x + w * 0.6, y - hh); ctx.closePath(); ctx.fill();
    }
  }

  draw(time) {
    const ctx = this.stage.begin('#0b1622');
    const W = this.stage.W, H = 600;
    const { cx, cy } = this.center();
    const s = this.scale();
    // outside world, rotated by bank around the view center
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, CK.VIEW_H); ctx.clip();
    ctx.translate(cx, cy); ctx.rotate(-(this.bank || 0)); ctx.translate(-cx, -cy);
    const hy = cy + 40 - this.aim.y * 260;
    const sky = ctx.createLinearGradient(0, hy - 500, 0, hy);
    sky.addColorStop(0, '#1d6fd1'); sky.addColorStop(1, '#bfe3ff');
    ctx.fillStyle = sky; ctx.fillRect(-W, hy - 1200, W * 3, 1200);
    const gr = ctx.createLinearGradient(0, hy, 0, hy + 500);
    gr.addColorStop(0, '#8fb96b'); gr.addColorStop(1, '#3d7a32');
    ctx.fillStyle = gr; ctx.fillRect(-W, hy, W * 3, 1200);
    this.drawGround(ctx, hy, cx - this.aim.x * 400);
    // clouds
    for (const c of [...this.clouds].sort((a, b) => b.d - a.d)) {
      const cs = 1 / c.d, x = cx + (c.x - this.aim.x) * CK.SPREAD * cs, y = hy + (c.y - 0.05) * CK.SPREAD * cs;
      ctx.globalAlpha = Math.min(0.85, (7 - c.d) / 3);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, y, 90 * c.s * cs, 30 * c.s * cs, 0, 0, 7);
      ctx.ellipse(x + 50 * c.s * cs, y - 18 * c.s * cs, 60 * c.s * cs, 30 * c.s * cs, 0, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // gate with 2×2 answer cards
    const g = this.gate;
    if (g && g.d > 0.35) {
      const gx = cx + (g.offX - this.aim.x) * CK.SPREAD * s, gy = cy + (g.offY - this.aim.y) * CK.SPREAD * s;
      const gw = CK.GATE_W * s, gh = CK.GATE_H * s;
      ctx.globalAlpha = g.resolved ? Math.max(0, Math.min(1, (g.d - 0.35) * 2)) : 1;
      ctx.lineWidth = 14 * s; ctx.strokeStyle = '#ff8f00';
      Draw.rr(ctx, gx - gw / 2 - 10 * s, gy - gh / 2 - 10 * s, gw + 20 * s, gh + 20 * s, 24 * s); ctx.stroke();
      g.q.choices.forEach((c, i) => {
        const x = gx + (i % 2 ? 0 : -gw / 2) + 6 * s, y = gy + (i >= 2 ? 0 : -gh / 2) + 6 * s;
        const w = gw / 2 - 12 * s, h = gh / 2 - 12 * s;
        let fill = 'rgba(255,255,255,.9)';
        if (g.resolved) fill = i === g.q.answer ? 'rgba(160,255,190,.95)' : i === g.hit ? 'rgba(255,170,170,.95)' : 'rgba(255,255,255,.5)';
        Draw.rr(ctx, x, y, w, h, 16 * s); ctx.fillStyle = fill; ctx.fill();
        ctx.lineWidth = 3 * s; ctx.strokeStyle = '#0d47a1'; ctx.stroke();
        if (s > 0.2) Draw.fitText(ctx, c, x + w / 2, y + h / 2, w - 24 * s, h - 14 * s, Math.max(22, 60 * s), '#102030');
      });
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // flash on result
    if (this.flash && this.flash.t > 0) {
      this.flash.t -= 1 / 60;
      ctx.fillStyle = this.flash.good ? 'rgba(61,255,122,.25)' : 'rgba(255,60,60,.3)';
      ctx.fillRect(0, 0, W, CK.VIEW_H);
    }
    // crosshair (flight path marker)
    ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.moveTo(cx - 34, cy); ctx.lineTo(cx - 14, cy); ctx.moveTo(cx + 14, cy); ctx.lineTo(cx + 34, cy);
    ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy - 26); ctx.stroke();

    // cockpit frame
    ctx.fillStyle = '#1b232b';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 34); ctx.quadraticCurveTo(W / 2, 4, 0, 34); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.22, 20); ctx.lineTo(W * 0.25, 20); ctx.lineTo(W * 0.19, CK.VIEW_H); ctx.lineTo(W * 0.155, CK.VIEW_H); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.78, 20); ctx.lineTo(W * 0.75, 20); ctx.lineTo(W * 0.81, CK.VIEW_H); ctx.lineTo(W * 0.845, CK.VIEW_H); ctx.fill();
    ctx.fillRect(0, 0, 26, CK.VIEW_H); ctx.fillRect(W - 26, 0, 26, CK.VIEW_H);
    // instrument panel
    const pg = ctx.createLinearGradient(0, CK.VIEW_H, 0, H);
    pg.addColorStop(0, '#2c3640'); pg.addColorStop(1, '#151b21');
    ctx.fillStyle = pg; ctx.fillRect(0, CK.VIEW_H, W, H - CK.VIEW_H);
    ctx.fillStyle = '#0e1318'; ctx.fillRect(0, CK.VIEW_H, W, 6);

    // attitude indicator
    const ax = W / 2 - 330, ay = CK.VIEW_H + 84, ar = 64;
    ctx.save(); ctx.beginPath(); ctx.arc(ax, ay, ar, 0, 7); ctx.clip();
    ctx.translate(ax, ay); ctx.rotate(-(this.bank || 0));
    ctx.fillStyle = '#3f8ee8'; ctx.fillRect(-ar * 2, -ar * 2, ar * 4, ar * 2 + this.aim.y * 60);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-ar * 2, this.aim.y * 60, ar * 4, ar * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-ar, this.aim.y * 60); ctx.lineTo(ar, this.aim.y * 60); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax - 36, ay); ctx.lineTo(ax - 12, ay); ctx.lineTo(ax, ay + 10); ctx.lineTo(ax + 12, ay); ctx.lineTo(ax + 36, ay); ctx.stroke();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ax, ay, ar, 0, 7); ctx.stroke();

    // data readouts
    ctx.fillStyle = '#3dff7a'; ctx.font = `bold 20px monospace`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const lx = W / 2 + 250;
    ctx.fillText(`SPD ${Math.round(420 * this.speedF)} kt`, lx, CK.VIEW_H + 24);
    ctx.fillText(`ALT ${Math.round(this.alt)} ft`, lx, CK.VIEW_H + 54);
    ctx.fillText(`TOR ${Math.min(CK.GATES, this.total + 1)}/${CK.GATES}`, lx, CK.VIEW_H + 84);
    ctx.fillText(`FUEL ${'■'.repeat(Math.max(0, this.lives))}${'□'.repeat(Math.max(0, 3 - this.lives))}`, lx, CK.VIEW_H + 114);

    // navigation display: distance to the next gate (deliberately no answers here)
    const r = { x: W / 2 - 230, y: CK.VIEW_H + 14, w: 460, h: 140 };
    Draw.rr(ctx, r.x - 6, r.y - 6, r.w + 12, r.h + 12, 10); ctx.fillStyle = '#05080b'; ctx.fill();
    ctx.fillStyle = '#3dff7a'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('NAV', r.x + 10, r.y + 8);
    ctx.strokeStyle = 'rgba(61,255,122,.35)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + r.h - 6, i * 40, Math.PI, 2 * Math.PI); ctx.stroke(); }
    if (g && !g.resolved) {
      const k = (g.d - 1) / (CK.D0 - 1);
      const px = r.x + r.w / 2 + (g.offX - this.aim.x) * 120, py = r.y + r.h - 6 - 18 - k * 100;
      ctx.fillStyle = '#ff8f00'; ctx.fillRect(px - 14, py - 4, 28, 8);
      ctx.fillStyle = '#3dff7a'; ctx.textAlign = 'right';
      ctx.fillText(`${(k * 4.2 + 0.1).toFixed(1)} km`, r.x + r.w - 10, r.y + 8);
    }
    ctx.fillStyle = '#ffd400';
    ctx.beginPath(); const bx = r.x + r.w / 2, by = r.y + r.h - 8; ctx.moveTo(bx, by - 14); ctx.lineTo(bx - 8, by); ctx.lineTo(bx + 8, by); ctx.closePath(); ctx.fill();
  }
}
