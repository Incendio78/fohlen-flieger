'use strict';
// Canvas drawing helpers: aircraft, ball, players, text fitting.

const FONT = '"Trebuchet MS", "Segoe UI", Roboto, sans-serif';

const GOLDBALL = '<span class="gball" title="Goldener Ball">⚽</span>';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Photo cut-outs (img/planes/<id>-sprite.png, nose pointing right). Vector drawing is the fallback.
const PlaneSprites = {};
function loadPlaneSprites(ids) {
  for (const id of ids) {
    const img = new Image();
    img.onload = () => { PlaneSprites[id] = img; };
    img.src = `img/planes/${id}-sprite.png`;
  }
}
// Fractions in question strings are written "3/4"; they are rendered with a horizontal bar.
// Years like "2022/23" are excluded by the 1–3 digit limit and the lookbehind.
const FRAC_RE = /(?<![\d/])(\d{1,3})\/(\d{1,3})(?![\d/])/g;
function fracHtml(text) {
  return escapeHtml(text).replace(FRAC_RE, '<span class="frac"><span>$1</span><span>$2</span></span>');
}

const Draw = {
  rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  wrap(ctx, text, maxW) {
    const words = String(text).split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  },

  // Single line containing fractions: [{s}|{n,d}] tokens, stacked numerator/denominator.
  fracTokens(text) {
    const out = [];
    let last = 0;
    for (const m of String(text).matchAll(FRAC_RE)) {
      if (m.index > last) out.push({ s: text.slice(last, m.index) });
      out.push({ n: m[1], d: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ s: text.slice(last) });
    return out;
  },
  fracLine(ctx, text, cx, cy, maxW, maxH, size, color, weight) {
    const toks = Draw.fracTokens(text);
    const measure = sz => {
      let w = 0;
      for (const t of toks) {
        if (t.s !== undefined) { ctx.font = `${weight} ${sz}px ${FONT}`; w += ctx.measureText(t.s).width; } else {
          ctx.font = `${weight} ${sz * 0.8}px ${FONT}`;
          w += Math.max(ctx.measureText(t.n).width, ctx.measureText(t.d).width) + sz * 0.3;
        }
      }
      return w;
    };
    while (size > 12 && (measure(size) > maxW || size * 1.9 > maxH)) size--;
    let x = cx - measure(size) / 2;
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const t of toks) {
      if (t.s !== undefined) {
        ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillText(t.s, x, cy); x += ctx.measureText(t.s).width;
      } else {
        ctx.font = `${weight} ${size * 0.8}px ${FONT}`;
        const w = Math.max(ctx.measureText(t.n).width, ctx.measureText(t.d).width) + size * 0.3;
        ctx.textAlign = 'center';
        ctx.fillText(t.n, x + w / 2, cy - size * 0.48);
        ctx.fillText(t.d, x + w / 2, cy + size * 0.52);
        ctx.lineWidth = Math.max(2, size * 0.08);
        ctx.beginPath(); ctx.moveTo(x + size * 0.08, cy); ctx.lineTo(x + w - size * 0.08, cy); ctx.stroke();
        ctx.textAlign = 'left';
        x += w;
      }
    }
  },

  // Draw text centered in a box, shrinking the font until it fits.
  fitText(ctx, text, cx, cy, maxW, maxH, size = 30, color = '#111', weight = 'bold') {
    text = String(text);
    FRAC_RE.lastIndex = 0;
    if (FRAC_RE.test(text) && text.length < 30) {
      FRAC_RE.lastIndex = 0;
      return Draw.fracLine(ctx, text, cx, cy, maxW, maxH, size, color, weight);
    }
    FRAC_RE.lastIndex = 0;
    let lines;
    for (; size >= 12; size -= 1) {
      ctx.font = `${weight} ${size}px ${FONT}`;
      lines = Draw.wrap(ctx, text, maxW);
      const tooWide = lines.some(l => ctx.measureText(l).width > maxW);
      if (lines.length * size * 1.15 <= maxH && !tooWide) break;
    }
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lh = size * 1.15;
    lines.forEach((l, i) => ctx.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh));
  },

  ball(ctx, x, y, r, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    const pent = (px, py, pr) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        ctx[i ? 'lineTo' : 'moveTo'](px + Math.cos(a) * pr, py + Math.sin(a) * pr);
      }
      ctx.closePath(); ctx.fill();
    };
    pent(0, 0, r * 0.38);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      pent(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, r * 0.25);
    }
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = r * 0.08;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },

  // Simple goalkeeper / player figure. dive: -1..1 (left/right), up: 0..1 (jump height factor)
  person(ctx, x, y, s, { shirt = '#111', shorts = '#111', skin = '#f1c7a0', gloves = null, dive = 0, up = 0, arms = 0.5 } = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.rotate(dive * 1.25);
    ctx.lineCap = 'round';
    // legs
    ctx.strokeStyle = skin; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(-12 - up * 6, 52); ctx.moveTo(8, 20); ctx.lineTo(12 + up * 6, 52); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-12 - up * 6, 50); ctx.lineTo(-13 - up * 6, 56); ctx.moveTo(12 + up * 6, 50); ctx.lineTo(13 + up * 6, 56); ctx.stroke();
    // shorts
    ctx.fillStyle = shorts;
    Draw.rr(ctx, -16, 10, 32, 18, 4); ctx.fill();
    // body
    ctx.fillStyle = shirt;
    Draw.rr(ctx, -18, -28, 36, 42, 8); ctx.fill();
    // arms
    ctx.strokeStyle = shirt; ctx.lineWidth = 9;
    const ay = -20 - arms * 30;
    ctx.beginPath(); ctx.moveTo(-15, -22); ctx.lineTo(-34, ay); ctx.moveTo(15, -22); ctx.lineTo(34, ay); ctx.stroke();
    if (gloves) {
      ctx.fillStyle = gloves;
      ctx.beginPath(); ctx.arc(-35, ay - 3, 7, 0, 7); ctx.arc(35, ay - 3, 7, 0, 7); ctx.fill();
    }
    // head
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -40, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b2a1a';
    ctx.beginPath(); ctx.arc(0, -44, 13, Math.PI, 0); ctx.fill();
    ctx.restore();
  },
};

const LIVERY = {
  beluga: { body: '#f3f6fa', tail: '#1d5fb4', belly: '#dfe6ee', h: 13, bulge: 'beluga', wing: 'low', engines: 2, face: true },
  a380: { body: '#ffffff', tail: '#0b8a44', belly: '#e6ebef', h: 19, wing: 'low', engines: 2, windows: 2, stripe: '#111' },
  b747: { body: '#ffffff', tail: '#1d3f8f', belly: '#c9d3e6', h: 14, hump: true, wing: 'low', engines: 2, windows: 1, stripe: '#1d3f8f' },
  dreamlifter: { body: '#f5f6f7', tail: '#1d3f8f', belly: '#9aa4ae', h: 14, bulge: 'dream', hump: true, wing: 'low', engines: 2 },
  an22: { body: '#d4dae0', tail: '#2b62c4', belly: '#aab4be', h: 15, wing: 'high', props: 2, twin: true, stripe: '#2b62c4' },
  an225: { body: '#fbfbfb', tail: '#0057b7', belly: '#d9dee3', h: 15, wing: 'high', engines: 3, twin: true, stripe: '#0057b7', stripe2: '#ffd700' },
};

// Side view, nose to the right, centered at (x, y). Overall length ≈ 210 * s.
function drawPlane(ctx, id, x, y, s = 1, t = 0, tilt = 0) {
  const img = PlaneSprites[id];
  if (img) {
    const w = 230 * s, h = w * img.height / img.width;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }
  const L = LIVERY[id] || LIVERY.beluga;
  const h = L.h;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  const edge = 'rgba(20,30,40,.35)';

  const fin = (dx, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-56 + dx, -h + 1); ctx.lineTo(-88 + dx, -h - 38); ctx.lineTo(-104 + dx, -h - 38); ctx.lineTo(-100 + dx, -h * 0.55);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.stroke();
  };
  if (L.twin) fin(-6, shade(L.tail, -40));

  // high wing (far part) drawn behind fuselage
  const wingCol = '#9aa5b1';

  // fuselage
  const grad = ctx.createLinearGradient(0, -h, 0, h);
  grad.addColorStop(0, L.body); grad.addColorStop(0.55, L.body); grad.addColorStop(1, L.belly);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-100, -h * 0.55);
  ctx.lineTo(-60, -h);
  ctx.lineTo(62, -h);
  ctx.bezierCurveTo(88, -h, 102, -h * 0.4, 104, h * 0.15);
  ctx.bezierCurveTo(100, h * 0.8, 85, h, 62, h);
  ctx.lineTo(-45, h);
  ctx.bezierCurveTo(-70, h, -90, h * 0.2, -100, -h * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 1.2; ctx.stroke();

  if (L.hump) {
    ctx.fillStyle = L.body;
    ctx.beginPath(); ctx.ellipse(50, -h + 5, 42, 12, 0, Math.PI, 2 * Math.PI); ctx.lineTo(92, -h + 5); ctx.fill();
    ctx.beginPath(); ctx.ellipse(50, -h + 5, 42, 12, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  }
  if (L.bulge) {
    const [cx, rx, ry] = L.bulge === 'beluga' ? [-6, 82, 30] : [-12, 70, 19];
    ctx.fillStyle = L.body;
    ctx.beginPath(); ctx.ellipse(cx, -h + 6, rx, ry, 0, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, -h + 6, rx, ry, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
  }

  if (L.stripe) {
    ctx.fillStyle = L.stripe; ctx.fillRect(-85, -h * 0.05, 175, 3);
    if (L.stripe2) { ctx.fillStyle = L.stripe2; ctx.fillRect(-85, -h * 0.05 + 3, 175, 3); }
  }
  // windows
  ctx.fillStyle = '#36506b';
  const rows = L.windows === 2 ? [-h * 0.5, h * 0.2 - 4] : L.windows === 1 ? [-h * 0.42] : [];
  for (const wy of rows) for (let wx = -50; wx <= 66; wx += 8) { ctx.beginPath(); ctx.arc(wx, wy, 1.8, 0, 7); ctx.fill(); }
  if (L.hump) for (let wx = 30; wx <= 70; wx += 8) { ctx.beginPath(); ctx.arc(wx, -h - 3, 1.6, 0, 7); ctx.fill(); }
  // cockpit
  ctx.fillStyle = '#1e2c3a';
  ctx.beginPath();
  ctx.moveTo(84, -h * 0.66); ctx.lineTo(97, -h * 0.38); ctx.lineTo(91, -h * 0.28); ctx.lineTo(80, -h * 0.52);
  ctx.closePath(); ctx.fill();

  if (L.face) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(66, -h - 12, 6, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#123';
    ctx.beginPath(); ctx.arc(68, -h - 11, 3.2, 0, 7); ctx.fill();
    ctx.strokeStyle = '#123'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(86, h * 0.45); ctx.quadraticCurveTo(96, h * 0.85, 103, h * 0.3); ctx.stroke();
    ctx.fillStyle = '#4da3ff';
    ctx.beginPath(); ctx.ellipse(-30, -h - 6, 18, 6, 0, 0, 7); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1;
  }

  // tail
  fin(0, L.tail);
  ctx.fillStyle = shade(L.tail, -20);
  ctx.beginPath(); ctx.ellipse(-86, -h * 0.45, 20, 3.5, -0.1, 0, 7); ctx.fill();

  // near wing + engines
  ctx.fillStyle = wingCol; ctx.strokeStyle = edge;
  ctx.beginPath();
  if (L.wing === 'low') {
    ctx.moveTo(32, h * 0.35); ctx.lineTo(4, h * 0.35); ctx.lineTo(-42, h + 22); ctx.lineTo(-26, h + 22);
  } else {
    ctx.moveTo(34, -h + 2); ctx.lineTo(6, -h + 2); ctx.lineTo(-40, h * 0.3); ctx.lineTo(-24, h * 0.3);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();

  const engine = (ex, ey, r = 1) => {
    ctx.fillStyle = '#d5dbe1';
    ctx.beginPath(); ctx.ellipse(ex, ey, 13 * r, 5.5 * r, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4a5560';
    ctx.beginPath(); ctx.ellipse(ex + 12 * r, ey, 2.2 * r, 5 * r, 0, 0, 7); ctx.fill();
  };
  if (L.wing === 'low') {
    engine(20, h * 0.35 + 9);
    if (L.engines >= 2) engine(-2, h + 13);
  } else if (L.engines === 3) {
    engine(28, -h + 9, 0.9); engine(12, -h + 17, 0.9); engine(-4, -h + 25, 0.9);
  }
  if (L.props) {
    for (const [ex, ey] of [[28, -h + 8], [8, -h + 19]]) {
      ctx.fillStyle = '#c4ccd4';
      ctx.beginPath(); ctx.ellipse(ex, ey, 14, 5, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(60,70,80,.22)';
      ctx.beginPath(); ctx.ellipse(ex + 15, ey, 3, 17, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5;
      const a = Math.cos(t * 50) * 17, b = Math.sin(t * 50) * 17;
      ctx.beginPath(); ctx.moveTo(ex + 15, ey - a); ctx.lineTo(ex + 15, ey + a); ctx.moveTo(ex + 16, ey - b); ctx.lineTo(ex + 16, ey + b); ctx.stroke();
      ctx.strokeStyle = edge; ctx.lineWidth = 1;
    }
  }
  ctx.restore();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}
