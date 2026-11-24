'use strict';
// Question generators for Gymnasium Klasse 7 (Mathe, Englisch, Deutsch).
// Every question: { id, subject, topic, q, choices[], answer (index), correct, explain }

const U = {
  rnd: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  fmt: n => Number(n).toLocaleString('de-DE', { maximumFractionDigits: 2 }).replace('-', '−'),
  gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; },
};
const { rnd, pick, shuffle, fmt } = U;
const sgn = n => (n < 0 ? `(${fmt(n)})` : fmt(n));

function make(subject, topic, q, correct, wrongs, explain) {
  correct = String(correct);
  const w = [];
  for (const x of wrongs.map(String)) if (x !== correct && !w.includes(x)) w.push(x);
  const choices = shuffle([correct, ...w.slice(0, 3)]);
  return { id: `${subject}|${topic}|${q}|${correct}`, subject, topic, q, choices,
    answer: choices.indexOf(correct), correct, explain: explain || '' };
}

// Numeric distractors: given candidates first, then nearby numbers as fallback.
function nums(c, cands, { pos = false, int = false } = {}) {
  const out = [];
  const add = v => {
    if (!Number.isFinite(v) || Math.abs(v - c) < 1e-9 || (pos && v <= 0) || (int && !Number.isInteger(v))) return;
    v = Math.round(v * 100) / 100;
    if (!out.includes(v)) out.push(v);
  };
  cands.forEach(add);
  [1, -1, 2, 10, -2, -10, 5].forEach(d => add(c + d));
  return out.slice(0, 3).map(fmt);
}

function termStr(k, m) {
  let s = '';
  if (k !== 0) s = (k === 1 ? '' : k === -1 ? '−' : fmt(k)) + 'x';
  if (m !== 0) s += s ? (m > 0 ? ` + ${m}` : ` − ${-m}`) : fmt(m);
  return s || '0';
}
const pm = (n, v = '') => (n >= 0 ? '+ ' : '− ') + (v && Math.abs(n) === 1 ? '' : Math.abs(n)) + v;
function frac(n, d) {
  const g = U.gcd(n, d); n /= g; d /= g;
  if (d < 0) { n = -n; d = -d; }
  return d === 1 ? fmt(n) : `${fmt(n)}/${d}`;
}

// ---------------------------------------------------------------- MATHE
const MATHE = {
  prozent(l) {
    const p = pick(l === 1 ? [10, 25, 50] : l === 2 ? [5, 10, 20, 25, 30, 40, 50, 75] : [12, 15, 35, 45, 60, 80]);
    let G, W;
    do { G = pick([20, 40, 60, 80, 120, 200, 240, 400, 500, 800]); W = G * p / 100; } while (W < 4 || !Number.isInteger(W));
    const t = l === 1 ? 0 : rnd(0, 2);
    if (t === 0) {
      const q = pick([
        `Haaland schießt in einer Saison ${G}-mal aufs Tor. ${p} % davon sind Tore. Wie viele Tore sind das?`,
        `Ein A380 hat ${G} Passagiere an Bord. ${p} % sitzen auf dem Oberdeck. Wie viele sind das?`,
        `Von ${G} Gladbach-Fans im Sonderzug tragen ${p} % ein Trikot. Wie viele sind das?`,
        `Berechne ${p} % von ${G}.`]);
      return make('mathe', 'prozent', q, fmt(W), nums(W, [W * 2, G - W, W + p, W / 2], { pos: true }),
        `Prozentwert W = G · p / 100 = ${G} · ${p} / 100 = ${fmt(W)}`);
    }
    if (t === 1) {
      const q = pick([
        `${fmt(W)} Fans sind ${p} % aller Zuschauer im Block. Wie viele Zuschauer sind im Block?`,
        `Die Beluga hat schon ${fmt(W)} km geschafft. Das sind ${p} % der Strecke. Wie lang ist die ganze Strecke (in km)?`,
        `${p} % von welcher Zahl sind ${fmt(W)}?`]);
      return make('mathe', 'prozent', q, fmt(G), nums(G, [W * p / 10, G * 2, G / 2, W + p], { pos: true }),
        `Grundwert G = W · 100 / p = ${fmt(W)} · 100 / ${p} = ${fmt(G)}`);
    }
    const q = pick([
      `Bruno Fernandes verwandelt ${W} von ${G} Elfmetern. Wie viel Prozent sind das?`,
      `${W} von ${G} Plätzen im Flugzeug sind Fensterplätze. Wie viel Prozent sind das?`,
      `Wie viel Prozent sind ${W} von ${G}?`]);
    return make('mathe', 'prozent', q, `${p} %`,
      nums(p, [100 - p, p * 2, W, p / 2], { pos: true }).map(s => `${s} %`),
      `p = W / G · 100 = ${W} / ${G} · 100 = ${p} %`);
  },

  rational(l) {
    const t = l === 1 ? pick([0, 1, 3]) : rnd(0, 3);
    const R = l === 1 ? 10 : l === 2 ? 15 : 25;
    if (t === 3) {
      const g = rnd(-5, 15), d = rnd(20, 60), r = g - d;
      return make('mathe', 'rational',
        `Am Boden sind es ${fmt(g)} °C. In 10 km Flughöhe ist es ${d} °C kälter. Wie kalt ist es dort oben?`,
        `${fmt(r)} °C`, nums(r, [g + d, -(g + d), d - g]).map(s => `${s} °C`), `${fmt(g)} − ${d} = ${fmt(r)}`);
    }
    const a = rnd(-R, R) || -7, b = rnd(-R, R) || 4;
    const op = ['+', '−', '·'][t];
    const r = t === 0 ? a + b : t === 1 ? a - b : a * b;
    const wr = t === 0 ? [a - b, -(a + b), Math.abs(a) + Math.abs(b)]
      : t === 1 ? [a + b, -(a - b), b - a] : [-(a * b), a + b, Math.abs(a * b) + 1];
    const ex = t === 2 ? 'Gleiche Vorzeichen → Plus, verschiedene Vorzeichen → Minus.'
      : t === 1 ? 'Eine negative Zahl subtrahieren = die Gegenzahl addieren.' : 'Denk an den Zahlenstrahl!';
    return make('mathe', 'rational', `Berechne: ${sgn(a)} ${op} ${sgn(b)}`, fmt(r), nums(r, wr), `= ${fmt(r)}. ${ex}`);
  },

  terme(l) {
    const t = l === 1 ? rnd(0, 1) : rnd(0, 2);
    if (t === 0) {
      const a = rnd(2, 9), c = rnd(-6, 8) || 2, b = rnd(-9, 9) || 3, d = rnd(-9, 9) || -4;
      const k = a + c, m = b + d;
      if (k === 0) return MATHE.terme();
      return make('mathe', 'terme', `Fasse zusammen: ${a}x ${pm(b)} ${pm(c, 'x')} ${pm(d)}`, termStr(k, m),
        [termStr(a - c, m), termStr(k, b - d), termStr(k + m, 0), termStr(k, -m)],
        'x-Glieder zusammenfassen, Zahlen zusammenfassen.');
    }
    if (t === 1) {
      const a = rnd(2, 6) * pick([1, -1]), b = rnd(-9, 9), x = rnd(-5, 6) || 2;
      const r = a * x + b;
      return make('mathe', 'terme', `Berechne den Wert von ${termStr(a, b)} für x = ${fmt(x)}.`, fmt(r),
        nums(r, [a * -x + b, a + x + b, a * x - b]), `${fmt(a)} · ${sgn(x)} ${pm(b)} = ${fmt(r)}`);
    }
    const a = rnd(2, 9) * (l === 3 ? -1 : 1), b = rnd(-9, 9) || 5;
    return make('mathe', 'terme', `Löse die Klammer auf: ${fmt(a)} · (x ${pm(b)})`, termStr(a, a * b),
      [termStr(a, b), termStr(a, -a * b), termStr(1, a * b)], 'Jedes Glied in der Klammer mit dem Faktor multiplizieren.');
  },

  gleichungen(l) {
    const t = l === 1 ? 0 : l === 2 ? pick([0, 0, 2]) : pick([1, 1, 2]);
    if (t === 2) {
      const n = rnd(2, 5), price = pick([8, 12, 15, 20, 25]), ship = pick([4, 5, 6]);
      const tot = n * price + ship;
      return make('mathe', 'gleichungen',
        `Du kaufst ${n} Gladbach-Schals und zahlst ${ship} € Versand. Insgesamt kostet das ${tot} €. Was kostet ein Schal? (${n}x + ${ship} = ${tot})`,
        `${price} €`, nums(price, [(tot + ship) / n, tot / n, tot - ship], { pos: true }).map(s => `${s} €`),
        `${n}x = ${tot} − ${ship} = ${tot - ship} → x = ${price}`);
    }
    const x = l === 1 ? rnd(1, 10) : rnd(-6, 12) || 5, a = l === 1 ? rnd(2, 5) : rnd(2, 9);
    if (t === 0) {
      const b = l === 1 ? rnd(1, 20) : rnd(-20, 20) || 7, c = a * x + b;
      return make('mathe', 'gleichungen', `Löse: ${a}x ${pm(b)} = ${fmt(c)}`, `x = ${fmt(x)}`,
        nums(x, [(c + b) / a, c - b, -x], { int: true }).map(s => `x = ${s}`), `${a}x = ${fmt(c - b)} → x = ${fmt(x)}`);
    }
    const c = rnd(1, a - 1 || 1), b = rnd(-12, 12), d = (a - c) * x + b;
    if (a === c) return MATHE.gleichungen();
    return make('mathe', 'gleichungen', `Löse: ${a}x ${pm(b)} = ${c === 1 ? '' : c}x ${pm(d)}`, `x = ${fmt(x)}`,
      nums(x, [(d + b) / (a - c), (d - b) / (a + c), -x], { int: true }).map(s => `x = ${s}`),
      `${termStr(a - c, 0)} = ${fmt(d - b)} → x = ${fmt(x)}`);
  },

  zuordnung() {
    const t = rnd(0, 2);
    if (t === 0) {
      const ctx = pick([
        { k: [40, 60, 80, 90], f: (u1, u2, v) => `${u1} Trikots kosten ${v} €. Wie viel kosten ${u2} Trikots?`, unit: '€' },
        { k: [800, 850, 900], f: (u1, u2, v) => `Ein Flugzeug fliegt in ${u1} Stunden ${fmt(v)} km. Wie weit kommt es in ${u2} Stunden (gleiche Geschwindigkeit)?`, unit: 'km' },
        { k: [15, 20, 25, 30], f: (u1, u2, v) => `${u1} Stadiontickets kosten ${v} €. Wie viel kosten ${u2} Tickets?`, unit: '€' },
        { k: [2500, 3000, 4000], f: (u1, u2, v) => `Eine Antonow An-22 verbraucht in ${u1} Stunden ${fmt(v)} kg Treibstoff (vereinfacht). Wie viel in ${u2} Stunden?`, unit: 'kg' },
      ]);
      const k = pick(ctx.k), u1 = rnd(2, 6);
      let u2; do { u2 = rnd(2, 9); } while (u2 === u1);
      const r = u2 * k;
      return make('mathe', 'zuordnung', ctx.f(u1, u2, u1 * k), `${fmt(r)} ${ctx.unit}`,
        nums(r, [r + k, r - k, u1 * k + u2]).map(s => `${s} ${ctx.unit}`),
        `Proportional (Dreisatz): 1 → ${fmt(k)}, ${u2} → ${u2} · ${fmt(k)} = ${fmt(r)}`);
    }
    if (t === 1) {
      const total = pick([24, 36, 48, 60, 72]);
      const divs = []; for (let i = 2; i <= 12; i++) if (total % i === 0) divs.push(i);
      const [n1, n2] = shuffle(divs);
      const t1 = total / n1, t2 = total / n2;
      const [text, unit] = pick([
        [`${n1} Helfer brauchen ${t1} Stunden, um die Beluga zu beladen. Wie lange brauchen ${n2} Helfer?`, 'Stunden'],
        [`Ein Getränkevorrat reicht für ${n1} Spieler ${t1} Tage. Wie lange reicht er für ${n2} Spieler?`, 'Tage']]);
      return make('mathe', 'zuordnung', text, `${fmt(t2)} ${unit}`,
        nums(t2, [t1 * n2 / n1, t1, t1 + n1 - n2], { pos: true }).map(s => `${s} ${unit}`),
        `Antiproportional: ${n1} · ${t1} = ${total}, ${total} : ${n2} = ${fmt(t2)}`);
    }
    const [a, b] = pick([
      ['Anzahl der Tickets → Gesamtpreis', 'proportional'],
      ['Anzahl der Helfer → Zeit zum Beladen eines Flugzeugs', 'antiproportional'],
      ['Alter eines Spielers → Anzahl seiner Tore', 'weder noch'],
      ['Geschwindigkeit eines Flugzeugs → Flugzeit für 1000 km', 'antiproportional'],
      ['Flugzeit (gleiche Geschwindigkeit) → geflogene Strecke', 'proportional'],
      ['Körpergröße → Schuhgröße', 'weder noch'],
      ['Liter Benzin → Preis an der Tankstelle', 'proportional'],
      ['Anzahl der Spieler → Stück Pizza pro Spieler (bei 3 Pizzen)', 'antiproportional'],
    ]);
    return make('mathe', 'zuordnung', `Welche Zuordnung ist das? ${a}`, b,
      ['proportional', 'antiproportional', 'weder noch'],
      'Proportional: doppelt → doppelt. Antiproportional: doppelt → halb.');
  },

  winkel() {
    const t = rnd(0, 3);
    const deg = v => `${v}°`;
    if (t === 0) {
      const a = rnd(30, 80), b = rnd(20, 150 - a), g = 180 - a - b;
      return make('mathe', 'winkel', `Im Dreieck ist α = ${a}° und β = ${b}°. Wie groß ist γ?`, deg(g),
        nums(g, [360 - a - b, a + b, 90 - a + b], { pos: true }).map(deg), 'Winkelsumme im Dreieck = 180°.');
    }
    if (t === 1) {
      const a = rnd(25, 155);
      return make('mathe', 'winkel', `Zwei Geraden schneiden sich. Ein Winkel ist ${a}° groß. Wie groß ist sein Nebenwinkel?`, deg(180 - a),
        nums(180 - a, [a, 360 - a, Math.abs(90 - a)], { pos: true }).map(deg), 'Nebenwinkel ergänzen sich zu 180°.');
    }
    if (t === 2) {
      const g = rnd(10, 70) * 2, r = (180 - g) / 2;
      return make('mathe', 'winkel', `Gleichschenkliges Dreieck: Der Winkel an der Spitze ist ${g}°. Wie groß ist ein Basiswinkel?`, deg(r),
        nums(r, [180 - g, g / 2, (360 - g) / 2], { pos: true }).map(deg), 'Basiswinkel sind gleich groß: (180° − Spitze) : 2.');
    }
    let a, b, c, d;
    do { a = rnd(60, 130); b = rnd(60, 130); c = rnd(60, 130); d = 360 - a - b - c; } while (d < 40 || d > 160);
    return make('mathe', 'winkel', `Ein Viereck hat die Winkel ${a}°, ${b}° und ${c}°. Wie groß ist der vierte Winkel?`, deg(d),
      nums(d, [180 - a - b - c + 180, 360 - a - b, 540 - a - b - c], { pos: true }).map(deg), 'Winkelsumme im Viereck = 360°.');
  },

  brueche(l) {
    const t = l === 1 ? pick([0, 2]) : l === 2 ? pick([0, 0, 2]) : pick([0, 1]);
    const ds = l === 3 ? [3, 4, 6, 8, 9, 12] : [2, 3, 4, 5, 6, 8, 10];
    if (t === 2) {
      const b = pick(ds), a = rnd(1, b - 1), N = b * rnd(2, 15), r = N * a / b;
      return make('mathe', 'brueche', `Wie viel sind ${frac(a, b)} von ${N}?`, fmt(r),
        nums(r, [N / b, N * a, N - r], { pos: true }), `${N} : ${b} · ${a} = ${fmt(r)}`);
    }
    const b = pick(ds), d = l === 1 ? b : pick(ds), a = rnd(1, b - 1), c = rnd(1, d - 1);
    if (t === 0) {
      const n = a * d + c * b, den = b * d;
      return make('mathe', 'brueche', `Berechne: ${a}/${b} + ${c}/${d}`, frac(n, den),
        [frac(a + c, b + d), frac(n + 1, den), frac(a + c, den), frac(n - 1, den)],
        'Erst gleichnamig machen (gemeinsamer Nenner), dann Zähler addieren, dann kürzen.');
    }
    return make('mathe', 'brueche', `Berechne: ${a}/${b} · ${c}/${d}`, frac(a * c, b * d),
      [frac(a * d, b * c), frac(a + c, b + d), frac(a * c, b + d), frac(a * c + 1, b * d)],
      'Zähler mal Zähler, Nenner mal Nenner, dann kürzen.');
  },
};

// ---------------------------------------------------------------- KOPFRECHNEN
// Answers are plain integers (no thousands separator) so they can be typed on the number pad.
function swapDigits(n) {
  const s = String(n);
  return s.length > 1 ? +(s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1)) : n + 5;
}
const kw = c => shuffle([...new Set([c + 10, c - 10, c + 1, c - 1, c + 2, c - 2, swapDigits(c)])]
  .filter(v => v >= 0 && v !== c)).slice(0, 3).map(String);
const KS = 'kopfrechnen';
function slipWrongs(r) {
  const len = String(r).length;
  const out = [];
  for (const step of [1, 2]) for (let k = 1; k < len; k++) {
    if (step === 2 && out.length >= 3) break;
    for (const sg of [step, -step]) {
      const v = r + sg * 10 ** k;
      if (v > 0 && String(v).length === len && String(v).slice(-1) === String(r).slice(-1)) out.push(v);
    }
  }
  const ones = out.filter(v => Math.abs(v - r) / 10 ** Math.floor(Math.log10(Math.abs(v - r))) === 1);
  const picked = [...shuffle([...new Set(ones)]), ...shuffle(out.filter(v => !ones.includes(v)))].slice(0, 3).map(String);
  return picked.length >= 3 ? picked : [...picked, ...kw(r)];
}

const KOPF = {
  einmaleins(l) {
    if (l >= 4) {
      const a = rnd(12, 25), b = rnd(4, 9), r = a * b, t = a - (a % 10);
      return make(KS, 'einmaleins', `${a} · ${b} = ?`, String(r), kw(r), `Tipp: ${t} · ${b} + ${a - t} · ${b} = ${t * b} + ${(a - t) * b} = ${r}`);
    }
    if (l === 3) {
      const a = rnd(11, 19), b = rnd(3, 9), r = a * b;
      return make(KS, 'einmaleins', `${a} · ${b} = ?`, String(r), kw(r), `Tipp: 10 · ${b} + ${a - 10} · ${b} = ${10 * b} + ${(a - 10) * b} = ${r}`);
    }
    const a = l === 1 ? pick([3, 4, 6, 7, 8, 9]) : rnd(2, 10), b = rnd(2, 10), r = a * b;
    if (l === 2 && Math.random() < 0.4) {
      return make(KS, 'einmaleins', `? · ${b} = ${r}`, String(a), kw(a), `${a} · ${b} = ${r}`);
    }
    return make(KS, 'einmaleins', `${a} · ${b} = ?`, String(r), kw(r), `${a} · ${b} = ${r}`);
  },
  plusminus(l) {
    let a, b;
    const plus = Math.random() < 0.5;
    if (l === 1) { a = rnd(12, 89); b = rnd(3, 9); } else if (l === 2) { a = rnd(23, 98); b = rnd(12, 69); }
    else if (l === 3) { a = rnd(120, 899); b = rnd(45, 399); } else { a = rnd(1200, 8999); b = rnd(250, 2999); }
    if (!plus && b > a) [a, b] = [b, a];
    if (l >= 3 && !plus && a - b < 100) return KOPF.plusminus(l);
    const r = plus ? a + b : a - b;
    const big = b - (b % 10), small = b % 10;
    const tip = big && small
      ? `Zerlegen: ${a} ${plus ? '+' : '−'} ${big} = ${plus ? a + big : a - big}, dann ${plus ? '+' : '−'} ${small} = ${r}`
      : `${a} ${plus ? '+' : '−'} ${b} = ${r}`;
    // From 3 digits on: wrong answers look like typical carry/borrow slips – same units digit,
    // exactly one other digit off by one, so neither estimating nor checking the last digit is enough.
    const wrongs = l >= 3 ? slipWrongs(r) : kw(r);
    return make(KS, 'plusminus', `${a} ${plus ? '+' : '−'} ${b} = ?`, String(r), wrongs, tip);
  },
  geteilt(l) {
    const [b, r] = l === 1 ? [rnd(2, 10), rnd(2, 10)] : l === 2 ? [rnd(2, 9), rnd(11, 25)] : l === 3 ? [rnd(11, 25), rnd(3, 12)] : [rnd(3, 9), rnd(26, 120)];
    const a = b * r;
    return make(KS, 'geteilt', `${a} : ${b} = ?`, String(r), kw(r), `Probe: ${r} · ${b} = ${a}`);
  },
  punktstrich(l) {
    const t = l === 1 ? rnd(0, 1) : l === 2 ? rnd(2, 3) : l === 3 ? rnd(3, 5) : rnd(4, 6);
    let q, r, naive;
    if (t === 0) { const a = rnd(2, 20), b = rnd(2, 9), c = rnd(2, 9); q = `${a} + ${b} · ${c}`; r = a + b * c; naive = (a + b) * c; }
    if (t === 1) { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 20); q = `${a} · ${b} + ${c}`; r = a * b + c; naive = a * (b + c); }
    if (t === 2) { const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9); q = `(${a} + ${b}) · ${c}`; r = (a + b) * c; naive = a + b * c; }
    if (t === 3) {
      const a = rnd(4, 9), b = rnd(4, 9), c = rnd(2, 5), d = rnd(2, Math.min(9, Math.floor(a * b / c)));
      q = `${a} · ${b} − ${c} · ${d}`; r = a * b - c * d; naive = (a * b - c) * d;
    }
    if (t === 4) { const a = rnd(3, 9), b = rnd(3, 9), c = rnd(3, 9), d = rnd(3, 9); q = `${a} · ${b} + ${c} · ${d}`; r = a * b + c * d; naive = (a * b + c) * d; }
    if (t === 6) { const a = rnd(6, 15), b = rnd(2, 5), c = rnd(2, 9), d = rnd(2, 9); q = `(${a} − ${b}) · ${c} + ${d}`; r = (a - b) * c + d; naive = a - b * c + d; }
    if (t === 5) { const a = rnd(3, 9), b = rnd(3, 9); q = `100 − ${a} · ${b}`; r = 100 - a * b; naive = (100 - a) * b; }
    const wrongs = [naive, ...kw(r).map(Number)].filter(v => v >= 0 && v !== r).map(String);
    return make(KS, 'punktstrich', `${q} = ?`, String(r), wrongs, 'Punkt vor Strich: erst · und :, dann + und − (Klammern zuerst!).');
  },
};

// ---------------------------------------------------------------- ENGLISCH
const VERBS = `be was/were been sein|begin began begun beginnen|break broke broken brechen|bring brought brought bringen|buy bought bought kaufen|catch caught caught fangen|choose chose chosen wählen|come came come kommen|do did done tun|drink drank drunk trinken|drive drove driven fahren|eat ate eaten essen|fall fell fallen fallen|feel felt felt fühlen|find found found finden|fly flew flown fliegen|forget forgot forgotten vergessen|get got got bekommen|give gave given geben|go went gone gehen|hear heard heard hören|hit hit hit schlagen|keep kept kept behalten|know knew known wissen|leave left left verlassen|lose lost lost verlieren|make made made machen|meet met met treffen|pay paid paid bezahlen|put put put legen|ride rode ridden reiten|run ran run rennen|say said said sagen|see saw seen sehen|sell sold sold verkaufen|send sent sent schicken|shoot shot shot schießen|sing sang sung singen|sit sat sat sitzen|sleep slept slept schlafen|speak spoke spoken sprechen|spend spent spent ausgeben|swim swam swum schwimmen|take took taken nehmen|teach taught taught unterrichten|tell told told erzählen|think thought thought denken|throw threw thrown werfen|wear wore worn tragen|win won won gewinnen|write wrote written schreiben`
  .split('|').map(s => s.split(' '));

const EN_BANK = {
  tenses: [
    ['Haaland ___ two goals last Saturday.', 'scored', 'has scored', 'scores', 'is scoring', '„last Saturday“ → simple past.'],
    ['Cristiano Ronaldo ___ for five different clubs so far.', 'has played', 'played', 'plays', 'is played', '„so far“ → present perfect.'],
    ['I ___ in an A380 yet.', "haven't flown", "didn't fly", "don't fly", "haven't flew", '„yet“ → present perfect: have + 3. Form (fly – flew – flown).'],
    ['The first Boeing 747 ___ in 1969.', 'flew', 'has flown', 'flies', 'has flew', 'Jahreszahl in der Vergangenheit → simple past.'],
    ['Gladbach ___ the Bundesliga for the first time in 1970.', 'won', 'has won', 'wins', 'winned', '„in 1970“ → simple past (win – won – won).'],
    ['We ___ at the stadium since two o’clock.', 'have been', 'were', 'are', 'was', '„since“ → present perfect.'],
    ['When ___ the Beluga at the airport?', 'did you see', 'have you seen', 'do you saw', 'have you saw', 'Fragen mit „When …?“ → simple past.'],
    ['Look! The Dreamlifter ___.', 'has just landed', 'just has land', 'is just land', 'has just land', '„just“ → present perfect: has + 3. Form.'],
    ['Yesterday Bruno Fernandes ___ a great pass.', 'made', 'has made', 'makes', 'maked', '„Yesterday“ → simple past (make – made – made).'],
    ['___ a Bundesliga game live?', 'Have you ever seen', 'Did you ever saw', 'Have you ever saw', 'Do you ever seen', '„ever“ → present perfect (see – saw – seen).'],
    ['Two years ago my dad ___ me to my first football game.', 'took', 'has taken', 'takes', 'taked', '„ago“ → simple past.'],
    ['The A380 ___ its first flight in 2005.', 'made', 'has made', 'makes', 'did made', 'Jahreszahl → simple past.'],
    ['I ___ my homework. Can I play now?', 'have finished', 'finish', 'has finished', 'finished have', 'Ergebnis ist jetzt wichtig → present perfect.'],
  ],
  future: [
    ['Look at those dark clouds! It ___ rain.', 'is going to', 'will to', 'goes to', 'is go to', 'Man sieht schon Anzeichen → going to-future.'],
    ['I think Gladbach ___ the next game.', 'will win', 'wins will', 'will wins', 'is win', 'Vermutung („I think“) → will-future.'],
    ['We have our tickets: we ___ fly to Hamburg next week.', 'are going to', 'will to', 'going to', 'are go to', 'Plan steht schon fest → going to-future.'],
    ['Wait, I ___ help you with your bag!', "'ll", 'am', 'going to', 'will to', 'Spontane Entscheidung → will (I’ll).'],
    ['Perhaps it ___ snow tomorrow.', 'will', 'is', 'wills', 'going', '„perhaps“ = Vermutung → will.'],
    ['My brother has bought new boots. He ___ play in the team next season.', 'is going to', 'will to', 'goes', 'going', 'Absicht/Plan → going to.'],
    ['In the year 2050 planes ___ electric engines.', 'will have', 'have will', 'will has', 'are have', 'Vorhersage → will + Grundform.'],
  ],
  compare: [
    ['The An-225 was ___ plane in the world.', 'the biggest', 'the most big', 'the bigger', 'biggest than', 'big – bigger – the biggest (Doppelkonsonant!).'],
    ['The A380 is ___ than the Boeing 747.', 'bigger', 'more big', 'biggest', 'more bigger', 'Komparativ + than.'],
    ['Haaland is ___ than most defenders.', 'faster', 'more fast', 'fastest', 'more faster', 'Kurze Adjektive: -er.'],
    ['That was the ___ game of the season!', 'most exciting', 'excitingest', 'more exciting', 'most excitinger', 'Lange Adjektive: the most + Adjektiv.'],
    ['My new football boots are ___ than my old ones.', 'better', 'gooder', 'more good', 'best', 'good – better – the best.'],
    ['The weather today is ___ than yesterday.', 'worse', 'badder', 'more bad', 'worst', 'bad – worse – the worst.'],
    ['The Beluga is not as fast ___ a fighter jet.', 'as', 'than', 'like', 'then', 'as … as = so … wie.'],
    ['Ronaldo plays ___.', 'brilliantly', 'brilliant', 'brillianter', 'brilliantful', 'Wie spielt er? → Adverb (-ly).'],
    ['The pilot landed the plane ___.', 'safely', 'safe', 'safety', 'safed', 'Wie landete er? → Adverb.'],
    ['Bruno speaks English very ___.', 'well', 'good', 'goodly', 'best', 'Das Adverb zu good ist well.'],
    ['The A380 is a ___ plane.', 'huge', 'hugely', 'huger', 'hugly', 'Beschreibt ein Nomen (plane) → Adjektiv.'],
    ['The goalkeeper reacted very ___.', 'quickly', 'quick', 'quicker', 'quickful', 'Wie reagierte er? → Adverb.'],
    ['The 747 is one of the ___ famous planes ever.', 'most', 'more', 'much', 'mostly', 'Superlativ: the most famous.'],
  ],
  grammar: [
    ['If Gladbach wins today, we ___ a party.', 'will have', 'would had', 'have had', 'had', 'if-Satz Typ 1: if + simple present → Hauptsatz mit will.'],
    ['If it ___ tomorrow, the game will be cancelled.', 'rains', 'will rain', 'rained', 'raining', 'Im if-Satz (Typ 1) steht simple present – kein will!'],
    ['You will miss the plane if you ___ hurry up.', "don't", "won't", "didn't", 'not', 'if-Satz Typ 1: simple present (don’t).'],
    ['If you train every day, you ___ better.', 'will get', 'got', 'gets', 'getting', 'if-Satz Typ 1 → will + Grundform.'],
    ['Haaland is the player ___ scored the goal.', 'who', 'which', 'whose', 'where', 'who → für Personen.'],
    ['The Beluga is a plane ___ carries parts of other planes.', 'which', 'who', 'whose', 'where', 'which → für Dinge.'],
    ["That's the boy ___ dad is a pilot.", 'whose', "who's", 'who', 'which', 'whose = dessen/deren.'],
    ['The Borussia-Park is the stadium ___ Gladbach plays.', 'where', 'which', 'who', 'whose', 'where → für Orte.'],
    ["There aren't ___ tickets left.", 'any', 'some', 'no', 'none', 'Verneinung → any.'],
    ['Can I have ___ water, please?', 'some', 'any', 'many', 'a', 'Bitten/Angebote → some.'],
    ['How ___ goals did Ronaldo score?', 'many', 'much', 'more', 'lot', 'zählbar (goals) → many.'],
    ['How ___ fuel does an A380 need?', 'much', 'many', 'more', 'lots', 'nicht zählbar (fuel) → much.'],
    ['___ Haaland play for Norway?', 'Does', 'Do', 'Is', 'Has', 'he/she/it → Does.'],
    ['Where ___ the planes land?', 'do', 'does', 'are', 'is', 'Plural (the planes) → do.'],
    ['The goalkeeper ___ like rain.', "doesn't", "don't", "isn't", 'not', 'he/she/it → doesn’t.'],
  ],
};

function regularize(v) {
  if (v.endsWith('e')) return v + 'd';
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
  return v + 'ed';
}

const ENGLISCH = {
  verbs() {
    const [inf, past, pp, de] = pick(VERBS);
    const t = rnd(0, 2);
    const fake = [regularize(inf), inf + inf.slice(-1) + 'ed', past.split('/')[0] + 'ed', inf + 'en', inf + 's'];
    if (t === 0) return make('englisch', 'verbs', `Simple past von „${inf}“ (${de})?`, past, [pp, ...fake], `${inf} – ${past} – ${pp}`);
    if (t === 1) return make('englisch', 'verbs', `3. Form (past participle) von „${inf}“ (${de})?`, pp, [past, ...fake], `${inf} – ${past} – ${pp}`);
    return make('englisch', 'verbs', `Was heißt „${de}“ auf Englisch – mit allen drei Formen?`, `${inf} – ${past} – ${pp}`,
      [`${inf} – ${regularize(inf)} – ${regularize(inf)}`, `${inf} – ${pp} – ${past}`, `${inf} – ${past} – ${regularize(inf)}`], '');
  },
};
for (const topic of Object.keys(EN_BANK)) ENGLISCH[topic] = () => bankQ('englisch', topic, EN_BANK[topic]);

function bankQ(subject, topic, bank) {
  const [q, c, w1, w2, w3, ex] = pick(bank);
  return make(subject, topic, q, c, [w1, w2, w3].filter(Boolean), ex);
}

// ---------------------------------------------------------------- DEUTSCH
const WORTARTEN = [
  ['Der *schnelle* Stürmer läuft los.', 'Adjektiv'], ['Haaland *schießt* aufs Tor.', 'Verb'],
  ['Die *Fans* singen laut.', 'Nomen'], ['Der Ball liegt *unter* der Bank.', 'Präposition'],
  ['Wir spielen, *weil* es Spaß macht.', 'Konjunktion'], ['*Er* trifft immer.', 'Pronomen'],
  ['Das Flugzeug landet *morgen*.', 'Adverb'], ['*Die* Beluga ist riesig.', 'Artikel'],
  ['Ich trainiere, *obwohl* es regnet.', 'Konjunktion'], ['Der Pilot fliegt *nach* Toulouse.', 'Präposition'],
  ['Wir haben *heute* ein Spiel.', 'Adverb'], ['Der Torwart *hält* den Elfmeter.', 'Verb'],
  ['Das *riesige* Flugzeug rollt zur Startbahn.', 'Adjektiv'], ['*Sie* jubeln nach dem Tor.', 'Pronomen'],
  ['Die Mannschaft trainiert *dort*.', 'Adverb'], ['Der *Schiedsrichter* pfeift.', 'Nomen'],
  ['*Ein* Airbus startet.', 'Artikel'], ['Die *Freude* ist groß.', 'Nomen'],
];
const SATZGLIEDER = [
  ['*Der Torwart* hält den Ball.', 'Subjekt'], ['Der Trainer gibt *dem Spieler* einen Tipp.', 'Dativobjekt'],
  ['Der Trainer gibt dem Spieler *einen Tipp*.', 'Akkusativobjekt'], ['Haaland *schießt* ein Tor.', 'Prädikat'],
  ['*Am Samstag* spielt Gladbach.', 'Adverbiale (Zeit)'], ['Die Beluga landet *in Hamburg*.', 'Adverbiale (Ort)'],
  ['*Wegen des Regens* fällt das Training aus.', 'Adverbiale (Grund)'], ['Der Pilot fliegt *sehr vorsichtig*.', 'Adverbiale (Art und Weise)'],
  ['*Die Fans* feiern die Mannschaft.', 'Subjekt'], ['Ronaldo schenkt *dem Kind* sein Trikot.', 'Dativobjekt'],
  ['Ronaldo schenkt dem Kind *sein Trikot*.', 'Akkusativobjekt'], ['Wir *fliegen* nach Toulouse.', 'Prädikat'],
  ['Nach dem Spiel gehen wir *ins Restaurant*.', 'Adverbiale (Ort)'], ['*Nach dem Spiel* gehen wir ins Restaurant.', 'Adverbiale (Zeit)'],
];
const SG_ALL = ['Subjekt', 'Prädikat', 'Akkusativobjekt', 'Dativobjekt', 'Adverbiale (Zeit)', 'Adverbiale (Ort)', 'Adverbiale (Grund)', 'Adverbiale (Art und Weise)'];
const WA_ALL = ['Nomen', 'Verb', 'Adjektiv', 'Adverb', 'Pronomen', 'Präposition', 'Konjunktion', 'Artikel'];

const KOMMA = [
  'Ich hoffe, dass Gladbach heute gewinnt.', 'Wenn es regnet, spielen wir in der Halle.',
  'Die Beluga landet, weil sie neue Flügel bringt.', 'Haaland jubelt, nachdem er getroffen hat.',
  'Ich lerne Vokabeln, obwohl ich lieber Fußball spiele.', 'Weil der Wind stark ist, wartet der Pilot.',
  'Bevor das Spiel beginnt, singen die Fans.', 'Wir fliegen nach Toulouse, um die Beluga zu sehen.',
  'Er rennt los, als der Pfiff ertönt.', 'Der Trainer sagt, dass ich heute spiele.',
];
const DASS = [
  ['Ich hoffe, ___ Gladbach heute gewinnt.', 'dass'], ['Das Flugzeug, ___ dort landet, ist eine Beluga.', 'das'],
  ['Weißt du, ___ der A380 zwei Decks hat?', 'dass'], ['___ Tor war unglaublich!', 'Das'],
  ['Das Trikot, ___ ich mir wünsche, ist von Haaland.', 'das'], ['Es ist klar, ___ wir mehr trainieren müssen.', 'dass'],
  ['Der Trainer sagt, ___ ich heute spiele.', 'dass'], ['Hast du ___ gesehen?', 'das'],
  ['___ Ronaldo so lange spielt, ist beeindruckend.', 'Dass'], ['Ich glaube, ___ es morgen regnet.', 'dass'],
  ['Das Spiel, ___ wir gestern gesehen haben, war spannend.', 'das'], ['Ich wusste nicht, ___ die An-22 Propeller hat.', 'dass'],
];
const TEMPUS = [
  ['Gladbach hat das Spiel gewonnen.', 'Perfekt'], ['Die Beluga flog nach Hamburg.', 'Präteritum'],
  ['Haaland wird morgen spielen.', 'Futur I'], ['Er hatte das Tor schon geschossen.', 'Plusquamperfekt'],
  ['Der Pilot startet den Motor.', 'Präsens'], ['Wir sind nach Toulouse geflogen.', 'Perfekt'],
  ['Die Fans sangen die ganze Nacht.', 'Präteritum'], ['Ich werde Pilot werden.', 'Futur I'],
  ['Nachdem wir gegessen hatten, …', 'Plusquamperfekt'], ['Der A380 landet gleich.', 'Präsens'],
];
const TEMPUS_ALL = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I'];

const DE_BANK = {
  passiv: [
    ['Forme ins Passiv um: „Der Torwart hält den Ball.“', 'Der Ball wird vom Torwart gehalten.', 'Der Ball wurde vom Torwart gehalten.', 'Der Ball hat vom Torwart gehalten.', 'Der Torwart wird den Ball halten.', 'Präsens Passiv: wird + Partizip II.'],
    ['Forme ins Passiv um: „Die Fans feiern den Sieg.“', 'Der Sieg wird von den Fans gefeiert.', 'Der Sieg wurde von den Fans gefeiert.', 'Der Sieg wird die Fans gefeiert.', 'Die Fans werden den Sieg feiern.', 'Präsens Passiv: wird + Partizip II.'],
    ['Forme ins Passiv um: „Airbus baute den A380.“', 'Der A380 wurde von Airbus gebaut.', 'Der A380 wird von Airbus gebaut.', 'Der A380 hat Airbus gebaut.', 'Airbus wurde den A380 gebaut.', 'Präteritum Passiv: wurde + Partizip II.'],
    ['Forme ins Passiv um: „Der Schiedsrichter pfeift das Spiel an.“', 'Das Spiel wird vom Schiedsrichter angepfiffen.', 'Das Spiel wurde vom Schiedsrichter angepfiffen.', 'Der Schiedsrichter wird angepfiffen.', 'Das Spiel pfeift den Schiedsrichter an.', 'Präsens Passiv: wird + Partizip II.'],
    ['Aktiv oder Passiv? „Die Beluga wird in Hamburg beladen.“', 'Passiv', 'Aktiv', '', '', 'werden + Partizip II → Passiv.'],
    ['Aktiv oder Passiv? „Der Pilot landet die Maschine.“', 'Aktiv', 'Passiv', '', '', 'Der Handelnde (Pilot) ist Subjekt → Aktiv.'],
    ['Aktiv oder Passiv? „Das Tor wurde von Haaland geschossen.“', 'Passiv', 'Aktiv', '', '', 'wurde + Partizip II → Passiv.'],
    ['Aktiv oder Passiv? „Die Fans werden laut.“', 'Aktiv', 'Passiv', '', '', 'Kein Partizip II – „werden“ ist hier Vollverb → Aktiv.'],
  ],
  rechtschreibung: [
    ['Welche Schreibweise ist richtig?', 'der Fußball', 'der Fusball', 'der Fuszball', 'der Fußbal', 'Nach langem Vokal (u) → ß.'],
    ['Welche Schreibweise ist richtig?', 'Er weiß es.', 'Er weis es.', 'Er weiss es.', 'Er weiz es.', 'Nach ei → ß.'],
    ['Welche Schreibweise ist richtig?', 'das Schloss', 'das Schloß', 'das Schlos', 'das Schlohs', 'Nach kurzem Vokal → ss.'],
    ['Welche Schreibweise ist richtig?', 'die Maschine', 'die Maschiene', 'die Maschinne', 'die Mashine', 'Fremdwort: Maschine ohne ie!'],
    ['Welche Schreibweise ist richtig?', 'vielleicht', 'vieleicht', 'fielleicht', 'vielleich', 'viel + leicht.'],
    ['Welche Schreibweise ist richtig?', 'der Standard', 'der Standart', 'der Schtandard', 'der Standarth', 'Standard endet mit d.'],
    ['Welche Schreibweise ist richtig?', 'endlich', 'entlich', 'endtlich', 'ändlich', 'von „Ende“ → endlich.'],
    ['Ergänze: „Ihr ___ die Besten!“', 'seid', 'seit', 'seidt', 'seiht', 'seid = Verb (sein); seit = Zeit.'],
    ['Ergänze: „___ gestern regnet es.“', 'Seit', 'Seid', 'Seith', 'Seitd', 'seit = Zeitangabe.'],
    ['Ergänze: „Gladbach hat ___ gewonnen!“', 'wieder', 'wider', 'wiedder', 'wiederr', 'wieder = noch einmal; wider = gegen.'],
    ['Ergänze: „Beim ___ bin ich der Beste.“', 'Elfmeterschießen', 'elfmeterschießen', 'Elfmeter schießen', 'Elfmeterschiesen', 'Nach „beim“ wird das Verb zum Nomen → groß.'],
    ['Ergänze: „Das ___ macht mir Spaß.“', 'Fliegen', 'fliegen', 'Fligen', 'Fliehgen', 'Artikel davor → Nominalisierung → groß.'],
    ['Ergänze: „Ich habe etwas ___ erlebt.“', 'Tolles', 'tolles', 'Tolless', 'tollles', 'Nach „etwas“ wird das Adjektiv großgeschrieben.'],
  ],
  stilmittel: [
    ['„Er rennt wie ein Blitz.“ – Welches sprachliche Bild ist das?', 'Vergleich', 'Metapher', 'Personifikation', 'Übertreibung', 'Mit „wie“ → Vergleich.'],
    ['„Haaland ist eine Tormaschine.“', 'Metapher', 'Vergleich', 'Personifikation', 'Alliteration', 'Bild ohne „wie“ → Metapher.'],
    ['„Der Wind flüstert in den Bäumen.“', 'Personifikation', 'Metapher', 'Vergleich', 'Übertreibung', 'Ding bekommt menschliche Eigenschaft.'],
    ['„Ich habe dir das schon tausendmal gesagt!“', 'Übertreibung', 'Vergleich', 'Personifikation', 'Alliteration', 'Übertreibung (Hyperbel).'],
    ['„Fohlen fliegen flink zum Finale.“', 'Alliteration', 'Metapher', 'Vergleich', 'Personifikation', 'Gleicher Anfangslaut → Alliteration.'],
    ['„Die Beluga ist so groß wie ein Wal.“', 'Vergleich', 'Metapher', 'Alliteration', 'Personifikation', '„so … wie“ → Vergleich.'],
    ['„Das Stadion kocht.“', 'Metapher', 'Vergleich', 'Alliteration', 'Übertreibung', 'Bildhafte Bedeutung ohne „wie“ → Metapher.'],
  ],
};

const mark = s => s.replace(/\*(.+?)\*/, '„$1“');
const DEUTSCH = {
  dassdas() {
    const [s, c] = pick(DASS);
    const opts = c[0] === c[0].toUpperCase() ? ['Das', 'Dass'] : ['das', 'dass'];
    return make('deutsch', 'dassdas', `Ergänze: ${s}`, c, opts,
      c.toLowerCase() === 'das' ? '„das“ kann man durch „dies(es)“ oder „welches“ ersetzen.' : '„dass“ ist eine Konjunktion – leitet einen Nebensatz ein.');
  },
  wortarten() {
    const [s, c] = pick(WORTARTEN);
    return make('deutsch', 'wortarten', `Welche Wortart hat das markierte Wort? ${mark(s)}`, c, shuffle(WA_ALL), '');
  },
  satzglieder() {
    const [s, c] = pick(SATZGLIEDER);
    return make('deutsch', 'satzglieder', `Welches Satzglied ist markiert? ${mark(s)}`, c, shuffle(SG_ALL),
      'Frage: Wer/Was? → Subjekt, Wem? → Dativobjekt, Wen/Was? → Akkusativobjekt, Wann/Wo/Warum/Wie? → Adverbiale.');
  },
  komma() {
    const s = pick(KOMMA);
    const words = s.replace(',', '').split(' ');
    const right = s.split(' ').findIndex(w => w.endsWith(','));
    const build = i => words.map((w, j) => (j === i ? w + ',' : w)).join(' ');
    const wrong = shuffle([...Array(words.length - 1).keys()].filter(i => i !== right)).map(build);
    return make('deutsch', 'komma', 'Wo steht das Komma richtig?', s, wrong, 'Haupt- und Nebensatz werden durch Komma getrennt.');
  },
  tempus() {
    const [s, c] = pick(TEMPUS);
    return make('deutsch', 'tempus', `Welche Zeitform? „${s}“`, c, shuffle(TEMPUS_ALL), '');
  },
};
for (const topic of Object.keys(DE_BANK)) DEUTSCH[topic] = () => bankQ('deutsch', topic, DE_BANK[topic]);

const SUBJECTS = {
  kopfrechnen: { label: 'Kopfrechnen', icon: '🧠', gen: KOPF, topics: {
    einmaleins: 'Einmaleins', plusminus: 'Plus & Minus', geteilt: 'Geteilt', punktstrich: 'Punkt vor Strich' } },
  mathe: { label: 'Mathe', icon: '🔢', gen: MATHE, topics: {
    prozent: 'Prozentrechnung', rational: 'Rationale Zahlen', terme: 'Terme', gleichungen: 'Gleichungen',
    zuordnung: 'Zuordnungen & Dreisatz', winkel: 'Winkel & Dreiecke', brueche: 'Brüche' } },
  englisch: { label: 'Englisch', icon: '🇬🇧', gen: ENGLISCH, topics: {
    verbs: 'Irregular verbs', tenses: 'Simple past / Present perfect', future: 'will / going to',
    compare: 'Comparison & adverbs', grammar: 'If-clauses, relatives & more' } },
  deutsch: { label: 'Deutsch', icon: '📖', gen: DEUTSCH, topics: {
    dassdas: 'das / dass', wortarten: 'Wortarten', satzglieder: 'Satzglieder', komma: 'Kommasetzung',
    tempus: 'Zeitformen', passiv: 'Aktiv / Passiv', rechtschreibung: 'Rechtschreibung', stilmittel: 'Sprachliche Bilder' } },
};
// Topics whose generators scale with the difficulty level (1–3).
const LEVELED = new Set(['kopfrechnen', 'mathe']);
const MAX_LEVEL = { kopfrechnen: 4, mathe: 3 };

// Re-shuffle a stored question and optionally cut it down to maxChoices options.
function prepareQuestion(q, maxChoices = 4) {
  const correct = q.correct;
  const wrongs = shuffle(q.choices.filter(c => c !== correct)).slice(0, maxChoices - 1);
  const choices = shuffle([correct, ...wrongs]);
  return { ...q, choices, answer: choices.indexOf(correct) };
}

const Questions = { SUBJECTS, U, prepareQuestion, LEVELED, MAX_LEVEL,
  generate(subject, topic, level = 1) {
    return SUBJECTS[subject].gen[topic](level);
  },
};
if (typeof module !== 'undefined') module.exports = Questions;
