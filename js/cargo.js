'use strict';

// An-225 cargo run (top-down): pick up the crate with the right answer, deliver it to the right airport.
// alt: 1 = cruising altitude, 0 = on the ground (shadow moves under the plane).
function drawAn225Top(ctx, x, y, ang, s, cargo, alt = 1) {
  ctx.save();
  ctx.translate(x + (3 + 30 * alt) * s, y + (4 + 40 * alt) * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = `rgba(0,0,0,${0.32 - 0.14 * alt})`;
  an225Path(ctx); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#eef1f4'; ctx.strokeStyle = '#7d8a96'; ctx.lineWidth = 1.5;
  an225Path(ctx); ctx.fill(); ctx.stroke();
  // engines
  ctx.fillStyle = '#b9c3cc';
  for (const side of [-1, 1]) for (const e of [[22, 34], [12, 58], [2, 82]]) {
    ctx.fillRect(e[0], side * e[1] - 5, 24, 10); ctx.strokeRect(e[0], side * e[1] - 5, 24, 10);
  }
  // Ukrainian-coloured stripe and cockpit
  ctx.fillStyle = '#0057b7'; ctx.fillRect(-80, -3, 160, 3);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(-80, 0, 160, 3);
  ctx.fillStyle = '#1e2c3a'; ctx.beginPath(); ctx.ellipse(92, 0, 6, 8, 0, 0, 7); ctx.fill();
  // twin fins
  ctx.fillStyle = '#c9d1d8';
  ctx.fillRect(-104, -50, 22, 6); ctx.fillRect(-104, 44, 22, 6);
  if (cargo) {
    ctx.fillStyle = '#a66a2c'; ctx.strokeStyle = '#5d3a14'; ctx.lineWidth = 2;
    ctx.fillRect(-30, -13, 44, 26); ctx.strokeRect(-30, -13, 44, 26);
    ctx.beginPath(); ctx.moveTo(-30, -13); ctx.lineTo(14, 13); ctx.moveTo(14, -13); ctx.lineTo(-30, 13); ctx.stroke();
  }
  ctx.restore();
}
function an225Path(ctx) {
  ctx.beginPath();
  // fuselage
  ctx.moveTo(100, 0); ctx.quadraticCurveTo(98, -12, 80, -13); ctx.lineTo(-90, -11); ctx.lineTo(-108, -4); ctx.lineTo(-108, 4); ctx.lineTo(-90, 11);
  ctx.lineTo(80, 13); ctx.quadraticCurveTo(98, 12, 100, 0);
  // wings
  ctx.moveTo(40, -12); ctx.lineTo(-14, -128); ctx.lineTo(-34, -128); ctx.lineTo(-10, -12);
  ctx.moveTo(40, 12); ctx.lineTo(-14, 128); ctx.lineTo(-34, 128); ctx.lineTo(-10, 12);
  // tailplane
  ctx.moveTo(-80, -10); ctx.lineTo(-100, -50); ctx.lineTo(-110, -50); ctx.lineTo(-104, -6);
  ctx.moveTo(-80, 10); ctx.lineTo(-100, 50); ctx.lineTo(-110, 50); ctx.lineTo(-104, 6);
}

const CARGO = { DELIVERIES: 5, CRUISE: 0.62, GROUND: 0.36, SPEED: 230, RWY: 90 };

class CargoGame extends QuizGame {
  constructor(app) {
    super(app, 'cargo', 1000, 600);
    const r = (a, b) => a + Math.random() * (b - a);
    this.fields = Array.from({ length: 26 }, () => ({ x: r(0, 1600), y: r(0, 600), w: r(80, 220), h: r(50, 140), a: r(-0.4, 0.4),
      c: Questions.U.pick(['#9cc46b', '#b7cf74', '#88b35d', '#c9b96b', '#a3c97a']) }));
    this.trees = Array.from({ length: 70 }, () => ({ x: r(0, 1600), y: r(0, 600), r: r(6, 12) }));
  }

  start() {
    this.p = { x: 160, y: 300, ang: 0, s: CARGO.CRUISE, alt: 1 };
    this.tgt = { x: 300, y: 300 };
    this.lives = 3; this.delivered = 0; this.right = 0; this.total = 0; this.coins = 0;
    this.items = []; this.phase = 'free'; this.carry = false; this.drops = []; this.sel = null; this.reveal = false;
    this.el.querySelector('.q-text').textContent = 'Die Mrija ist startklar! Gleich kommt die erste Ladung.';
    this.el.querySelector('.q-meta').textContent = 'Antonow An-225 „Mrija“';
    this.feedback('Tippe auf (oder neben) eine Kiste bzw. einen Flughafen – die Mrija fliegt automatisch hin.', '');
    this.timeLeft = 0; this.timeLimit = 0;
    this.status();
    this.begin();
    this.later(() => this.newPickup(), 1200);
  }
  status() {
    const n = Math.min(this.delivered + 1, CARGO.DELIVERIES);
    this.setStatus(`📦 Lieferung ${n} von ${CARGO.DELIVERIES} · noch ${CARGO.DELIVERIES - this.delivered} · ⛽ ${'■'.repeat(Math.max(0, this.lives))}${'□'.repeat(Math.max(0, 3 - this.lives))}`);
  }

  // Spread items over a jittered grid, away from the plane.
  place(kind) {
    const W = this.stage.W, slots = [], cols = kind === 'airport' ? 3 : 4;
    for (let c = 0; c < cols; c++) for (let r = 0; r < 2; r++) {
      slots.push({ x: W * (c + 0.5) / cols + (Math.random() - 0.5) * 50, y: 130 + r * 320 + (Math.random() - 0.5) * 40 });
    }
    const free = Questions.U.shuffle(slots.filter(s => Math.hypot(s.x - this.p.x, s.y - this.p.y) > 200));
    return this.q.choices.map((text, i) => ({ text, kind, x: free[i].x, y: free[i].y, ang: (Math.random() - 0.5) * 1.0, gone: false }));
  }

  newPickup() {
    this.reveal = false; this.sel = null; this.phase = 'free';
    this.setQuestion(this.app.nextQuestion(4), 1.4);
    this.items = this.place('crate');
    this.el.querySelector('.q-text').innerHTML = `📦 Hol die Kiste mit der richtigen Antwort: ${fracHtml(this.q.q)}`;
    this.status();
  }
  newDelivery() {
    this.reveal = false; this.sel = null; this.phase = 'free';
    this.setQuestion(this.app.nextQuestion(3), 1.4);
    this.items = this.place('airport');
    this.el.querySelector('.q-text').innerHTML = `🛬 Lande am Flughafen mit der richtigen Antwort: ${fracHtml(this.q.q)}`;
    this.status();
  }

  // A tap anywhere near an item selects it; elsewhere the plane just flies there.
  onPointer(type, p) {
    if (type !== 'down') return;
    if (this.timerOn && !this.sel) {
      let best = null, bd = 170;
      for (const it of this.items) {
        if (it.gone) continue;
        const ly = it.y - (it.kind === 'airport' ? 66 : 58);
        const d = Math.min(Math.hypot(it.x - p.x, it.y - p.y), Math.hypot(it.x - p.x, ly - p.y));
        if (d < bd) { bd = d; best = it; }
      }
      if (best) return this.choose(best);
    }
    if (this.phase === 'free') this.tgt = { x: p.x, y: p.y };
  }
  onKey(e) {
    if (this.timerOn && !this.sel && e.key >= '1' && e.key <= '4' && this.items[+e.key - 1]) return this.choose(this.items[+e.key - 1]);
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d || this.phase !== 'free') return;
    e.preventDefault();
    this.tgt = { x: Math.max(30, Math.min(this.stage.W - 30, this.p.x + d[0] * 120)), y: Math.max(30, Math.min(570, this.p.y + d[1] * 120)) };
  }

  choose(it) {
    this.sel = it;
    this.timerOn = false;
    Sound.coin();
    if (it.kind === 'crate') {
      this.phase = 'flyto'; this.tgt = { x: it.x, y: it.y };
      return;
    }
    // Landing: approach point on the extended runway centre line, then touchdown and roll-out.
    const W = this.stage.W;
    const inside = q => q.x > 40 && q.x < W - 40 && q.y > 40 && q.y < 560;
    const opts = [1, -1].map(sg => {
      const dx = Math.cos(it.ang) * sg, dy = Math.sin(it.ang) * sg;
      const A = { x: it.x - dx * (CARGO.RWY + 190), y: it.y - dy * (CARGO.RWY + 190) };
      // penalise approach paths that cross another airport
      let crossing = 0;
      for (const o of this.items) {
        if (o === it) continue;
        for (let k = 0; k <= 1; k += 0.1) {
          const x = A.x + (it.x - A.x) * k, y = A.y + (it.y - A.y) * k;
          if (Math.hypot(o.x - x, o.y - y) < 110) { crossing = 1500; break; }
        }
      }
      return { dx, dy, A, score: Math.hypot(A.x - this.p.x, A.y - this.p.y) + (inside(A) ? 0 : 2000) + crossing };
    }).sort((a, b) => a.score - b.score);
    const o = opts[0];
    this.land = {
      dir: Math.atan2(o.dy, o.dx), A: o.A,
      T: { x: it.x - o.dx * (CARGO.RWY - 25), y: it.y - o.dy * (CARGO.RWY - 25) },
      E: { x: it.x + o.dx * (CARGO.RWY - 15), y: it.y + o.dy * (CARGO.RWY - 15) },
    };
    this.phase = 'toA'; this.tgt = { ...o.A };
  }

  onTimeout() {
    if (this.sel) return;
    this.total++;
    this.fail(true);
  }

  arrive() {
    const it = this.sel, ok = this.items.indexOf(it) === this.q.answer;
    this.total++;
    if (!ok) return this.fail(false, it);
    this.right++;
    const coins = this.answer(true, { mult: 1.2 });
    this.coins += coins;
    if (it.kind === 'crate') {
      it.gone = true; this.carry = true; this.phase = 'free';
      this.tgt = { x: this.p.x + Math.cos(this.p.ang) * 120, y: this.p.y + Math.sin(this.p.ang) * 120 };
      this.later(() => this.newDelivery(), 900);
    } else {
      this.delivered++; this.carry = false;
      this.drops.push({ x: it.x, y: it.y, t: 0 });
      this.app.addCoins(10); this.coins += 10;
      this.feedback(`✅ Sauber gelandet und geliefert! +${coins + 10} 🪙`, 'good');
      Sound.buy();
      this.status();
      if (this.delivered >= CARGO.DELIVERIES) return this.later(() => this.end(), 2000);
      this.takeoff();
      this.later(() => this.newPickup(), 1800);
    }
  }

  takeoff() {
    const d = this.land.dir;
    this.phase = 'free';
    this.tgt = { x: Math.max(60, Math.min(this.stage.W - 60, this.p.x + Math.cos(d) * 250)), y: Math.max(60, Math.min(540, this.p.y + Math.sin(d) * 250)) };
  }

  fail(timeout, item) {
    this.answer(false, { timeout });
    if (item) item.bad = true;
    this.reveal = true;
    this.lives--; this.status();
    const kind = item ? item.kind : (this.items[0] && this.items[0].kind);
    if (item && item.kind === 'airport') this.takeoff(); else this.phase = 'free';
    if (this.lives <= 0) return this.later(() => this.end(), 1500);
    this.later(() => (kind === 'airport' ? this.newDelivery() : this.newPickup()), 1500);
  }

  end() {
    this.stop();
    const best = this.delivered > (this.app.state.bestCargo || 0);
    if (best) { this.app.state.bestCargo = this.delivered; this.app.save(); }
    const all = this.delivered >= CARGO.DELIVERIES;
    this.app.showResult({
      title: all ? `🏆 Alle ${CARGO.DELIVERIES} Lieferungen geschafft!` : `⛽ Tank leer – ${this.delivered} von ${CARGO.DELIVERIES} geliefert`,
      lines: [`${this.right} von ${this.total} Aufgaben richtig`, `🪙 ${this.coins} Taler verdient`],
      again: () => this.app.startGame('cargo'),
      win: all,
    });
  }

  steer(dt, tx, ty, speed) {
    const p = this.p, dx = tx - p.x, dy = ty - p.y, dist = Math.hypot(dx, dy);
    const want = Math.atan2(dy, dx);
    const da = ((want - p.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const turn = (2.5 + 260 / Math.max(dist, 20)) * dt;
    p.ang += Math.max(-turn, Math.min(turn, da));
    const sp = Math.min(speed, 40 + dist * 2.5) * dt;
    p.x += Math.cos(p.ang) * sp; p.y += Math.sin(p.ang) * sp;
    return dist;
  }

  update(dt) {
    const p = this.p, ease = k => k * k * (3 - 2 * k);
    const toward = (v, goal, rate) => v + (goal - v) * Math.min(1, dt * rate);
    if (this.phase === 'free') {
      if (Math.hypot(this.tgt.x - p.x, this.tgt.y - p.y) > 12) this.steer(dt, this.tgt.x, this.tgt.y, CARGO.SPEED);
      p.s = toward(p.s, CARGO.CRUISE, 1); p.alt = toward(p.alt, 1, 1);
    } else if (this.phase === 'flyto') {
      const d = this.steer(dt, this.tgt.x, this.tgt.y, CARGO.SPEED);
      p.s = toward(p.s, CARGO.CRUISE * 0.85, 2); p.alt = toward(p.alt, 0.6, 2);
      if (d < 22) { this.phase = 'busy'; this.arrive(); }
    } else if (this.phase === 'toA') {
      const d = this.steer(dt, this.land.A.x, this.land.A.y, CARGO.SPEED);
      p.s = toward(p.s, CARGO.CRUISE * 0.85, 1); p.alt = toward(p.alt, 0.7, 1);
      if (d < 30) {
        this.phase = 'final';
        this.fin = { t: 0, S: { x: p.x, y: p.y }, a0: p.ang, s0: p.s, alt0: p.alt, dur: Math.hypot(this.land.T.x - p.x, this.land.T.y - p.y) / 150 + 0.4 };
      }
    } else if (this.phase === 'final') {
      const f = this.fin; f.t += dt;
      const k = Math.min(1, f.t / f.dur), e = ease(k);
      p.x = f.S.x + (this.land.T.x - f.S.x) * k; p.y = f.S.y + (this.land.T.y - f.S.y) * k;
      const da = ((this.land.dir - f.a0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      p.ang = f.a0 + da * Math.min(1, k * 2.5);
      p.s = f.s0 + (CARGO.GROUND - f.s0) * e; p.alt = f.alt0 * (1 - e);
      if (k >= 1) { this.phase = 'roll'; this.fin = { t: 0, S: { x: p.x, y: p.y } }; Sound.kick(); }
    } else if (this.phase === 'roll') {
      const f = this.fin; f.t += dt;
      const k = Math.min(1, f.t / 1.2), e = 1 - (1 - k) * (1 - k);
      p.x = f.S.x + (this.land.E.x - f.S.x) * e; p.y = f.S.y + (this.land.E.y - f.S.y) * e;
      if (k >= 1) { this.phase = 'busy'; this.arrive(); }
    }
    for (const d of this.drops) d.t += dt;
    this.drops = this.drops.filter(d => d.t < 2);
  }

  draw(time) {
    const ctx = this.stage.begin('#93bf66');
    const W = this.stage.W, H = 600;
    ctx.fillStyle = '#93bf66'; ctx.fillRect(0, 0, W, H);
    for (const f of this.fields) {
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.fillStyle = f.c; ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h); ctx.restore();
    }
    ctx.strokeStyle = '#4f8fd6'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-20, 120); ctx.bezierCurveTo(W * 0.3, 40, W * 0.45, 420, W * 0.7, 330); ctx.bezierCurveTo(W * 0.85, 280, W * 0.95, 520, W + 20, 560); ctx.stroke();
    ctx.strokeStyle = '#d8d2c0'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, 470); ctx.lineTo(W, 380); ctx.moveTo(W * 0.4, 0); ctx.lineTo(W * 0.55, H); ctx.stroke();
    ctx.fillStyle = '#3f7d35';
    for (const t of this.trees) { ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 7); ctx.fill(); }

    for (const it of this.items) {
      if (it.gone) continue;
      const isAns = this.items.indexOf(it) === this.q.answer;
      const ring = this.reveal ? (isAns ? '#18a957' : it.bad ? '#d32f2f' : null) : (it === this.sel ? '#ffd400' : null);
      if (it.kind === 'airport') {
        ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.ang);
        ctx.fillStyle = '#5f676e'; ctx.fillRect(-CARGO.RWY, -14, CARGO.RWY * 2, 28);
        ctx.fillStyle = '#fff';
        for (const sx of [-1, 1]) for (let k = -10; k <= 10; k += 5) ctx.fillRect(sx * (CARGO.RWY - 8) - 3, k - 1.5, 6, 3);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
        ctx.beginPath(); ctx.moveTo(-CARGO.RWY + 18, 0); ctx.lineTo(CARGO.RWY - 18, 0); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#c8ccd0'; ctx.fillRect(-40, 18, 50, 22);
        ctx.fillStyle = '#ef6c00'; ctx.fillRect(20, 18, 10, 26);
        ctx.restore();
      } else {
        ctx.fillStyle = '#a66a2c'; ctx.strokeStyle = '#5d3a14'; ctx.lineWidth = 3;
        ctx.fillRect(it.x - 22, it.y - 22, 44, 44); ctx.strokeRect(it.x - 22, it.y - 22, 44, 44);
        ctx.beginPath(); ctx.moveTo(it.x - 22, it.y - 22); ctx.lineTo(it.x + 22, it.y + 22); ctx.moveTo(it.x + 22, it.y - 22); ctx.lineTo(it.x - 22, it.y + 22); ctx.stroke();
      }
      if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(it.x, it.y, it.kind === 'airport' ? 100 : 62, 0, 7); ctx.stroke(); }
      const ly = it.y - (it.kind === 'airport' ? 66 : 58);
      Draw.rr(ctx, it.x - 100, ly - 24, 200, 48, 12);
      ctx.fillStyle = ring === '#18a957' ? '#c9f7d6' : ring === '#d32f2f' ? '#ffd0d0' : 'rgba(255,255,255,.95)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = it.kind === 'airport' ? '#1565c0' : '#8d5524'; ctx.stroke();
      Draw.fitText(ctx, (it.kind === 'airport' ? '✈ ' : '') + it.text, it.x, ly, 184, 42, 26, '#102030');
    }
    // dashed approach path while landing
    if (this.land && (this.phase === 'toA' || this.phase === 'final')) {
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(this.land.A.x, this.land.A.y); ctx.lineTo(this.land.T.x, this.land.T.y); ctx.stroke(); ctx.setLineDash([]);
    }
    for (const d of this.drops) {
      const k = d.t / 2;
      ctx.globalAlpha = 1 - k;
      ctx.font = `900 40px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd400'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
      ctx.strokeText('📦 Geliefert!', d.x, d.y - 90 - k * 60); ctx.fillText('📦 Geliefert!', d.x, d.y - 90 - k * 60);
      ctx.globalAlpha = 1;
    }
    if (this.phase === 'free') {
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.tgt.x, this.tgt.y, 10 + Math.sin(time * 6) * 3, 0, 7); ctx.stroke();
    }
    drawAn225Top(ctx, this.p.x, this.p.y, this.p.ang, this.p.s, this.carry, this.p.alt);
  }
}
