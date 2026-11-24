'use strict';

const STORE_KEY = 'fohlen-flieger-v1';
const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DEFAULT_STATE = () => ({
  name: '', coins: 0, xp: 0, streak: 0,
  plane: 'beluga', planes: ['beluga'], cards: [],
  subjects: { kopfrechnen: true, mathe: true, englisch: true, deutsch: true },
  disabled: [], focus: [], dailyGoal: 20,
  stats: {}, mistakes: [], lvl: {}, hist: {}, balls: 0, sprintDay: '',
  cup: { comp: 0, round: 0 }, trophies: [],
  daily: { date: '', count: 0, bonus: false }, days: { last: '', count: 0 },
  bestKm: 0, sprintBest: 0, matches: { won: 0, lost: 0 }, sound: true,
});

const App = {
  state: null,
  current: null,

  init() {
    this.load();
    Sound.on = this.state.sound;
    this.penalty = new PenaltyGame(this);
    this.flight = new FlightGame(this);
    this.sprint = new SprintGame(this);
    this.games = { cockpit: new CockpitGame(this), cargo: new CargoGame(this), pass: new PassGame(this) };
    loadPlaneSprites(PLANES.map(p => p.id));
    document.getElementById('btn-home').addEventListener('click', () => {
      const game = { penalty: this.penalty, flight: this.flight, sprint: this.sprint, ...this.games }[this.current];
      if (game && game.running && !confirm('Spiel abbrechen? Die Taler für richtige Antworten behältst du – Prämien am Spielende (Sieg, Rekord, goldene Bälle) gibt es dann aber nicht.')) return;
      this.home();
    });
    document.getElementById('btn-sound').addEventListener('click', () => {
      this.state.sound = Sound.on = !Sound.on; this.save(); this.updateHud(); Sound.init(); Sound.coin();
    });
    document.getElementById('welcome-go').addEventListener('click', () => {
      const n = document.getElementById('welcome-name').value.trim();
      if (!n) return;
      this.state.name = n; this.save(); Sound.init(); this.home();
    });
    document.getElementById('welcome-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('welcome-go').click(); });
    document.addEventListener('pointerdown', () => Sound.init(), { once: true });
    this.updateHud();
    if (this.state.name) this.home(); else this.show('welcome');
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },

  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { s = null; }
    const d = DEFAULT_STATE();
    this.state = Object.assign(d, s || {});
    this.state.subjects = Object.assign(DEFAULT_STATE().subjects, (s && s.subjects) || {});
    // One-time setup (also for existing saves): focus on tenses & negations, Konjunktiv/Passiv not taught yet.
    if (!this.state.setup2) {
      const st = this.state;
      for (const k of ['deutsch|indirekt', 'deutsch|passiv', 'englisch|passive']) if (!st.disabled.includes(k)) st.disabled.push(k);
      for (const k of ['englisch|tenses', 'englisch|negation']) if (!st.focus.includes(k)) st.focus.push(k);
      st.setup2 = true;
    }
  },
  save() { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); },

  show(name) {
    if (this.current === 'penalty' && name !== 'penalty') this.penalty.stop();
    if (this.current === 'flight' && name !== 'flight') this.flight.stop();
    if (this.current === 'sprint' && name !== 'sprint') this.sprint.stop();
    if (this.games[this.current] && name !== this.current) this.games[this.current].stop();
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === `screen-${name}`));
    document.body.dataset.screen = name;
    this.current = name;
    window.scrollTo(0, 0);
  },

  // ------------------------------------------------------------ progress
  level() { return Math.floor(Math.sqrt(this.state.xp / 40)) + 1; },
  // Football ranks in general, pilot ranks while flying.
  isFlying() { return ['flight', 'cockpit', 'cargo'].includes(this.current); },
  rank(l = this.level(), pilot = this.isFlying()) {
    const list = pilot ? PILOT_RANKS : RANKS;
    return list[Math.min(l - 1, list.length - 1)];
  },
  topicLevel(sub, topic) { return Questions.LEVELED.has(sub) ? (this.state.lvl[`${sub}|${topic}`] || 1) : null; },

  touchDay() {
    const s = this.state, today = todayStr();
    if (s.daily.date !== today) s.daily = { date: today, count: 0, bonus: false };
    if (s.days.last !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      s.days.count = s.days.last === todayStr(y) ? s.days.count + 1 : 1;
      s.days.last = today;
    }
  },

  // Adaptive difficulty from the last answers of a topic (accuracy AND speed):
  // up when ≥ 5 of the last 6 are right and the typical answer is fast; down when ≤ 3 of 6 are right or answers are very slow.
  adaptLevel(q, ok, ms) {
    if (!Questions.LEVELED.has(q.subject)) return;
    const s = this.state, key = `${q.subject}|${q.topic}`;
    const max = Questions.MAX_LEVEL[q.subject] || 3;
    let l = s.lvl[key] || 1;
    const limit = this.timeFor(q) * 1000;
    const h = (s.hist[key] = [...(s.hist[key] || []), [ok ? 1 : 0, Math.round(ms / limit * 100)]].slice(-6));
    if (h.length < 6) return;
    const right = h.reduce((a, [r]) => a + r, 0);
    const times = h.filter(([r]) => r).map(([, t]) => t).sort((a, b) => a - b);
    const median = times.length ? times[Math.floor(times.length / 2)] : 100;
    let change = 0;
    if (right >= 5 && median <= 45 && l < max) change = 1;
    else if ((right <= 3 || median >= 85) && l > 1) change = -1;
    if (!change) return;
    s.lvl[key] = l + change;
    s.hist[key] = [];
    const name = Questions.SUBJECTS[q.subject].topics[q.topic];
    if (change > 0) this.toast(`📈 ${name}: Stufe ${l + 1}! Du bist schnell und sicher.`);
  },

  record(q, ok, ms, mult = 1) {
    const s = this.state;
    this.touchDay();
    const key = `${q.subject}|${q.topic}`;
    const st = s.stats[key] || (s.stats[key] = { r: 0, w: 0 });
    const levelBefore = this.level();
    let coins = 0;
    this.adaptLevel(q, ok, ms);
    if (ok) {
      st.r++;
      s.mistakes = s.mistakes.filter(m => m.id !== q.id);
      coins = Math.max(1, Math.round((5 + (ms < 8000 ? 2 : 0)) * mult));
      s.streak++;
      if (s.streak % 5 === 0) { coins += 10; this.toast(`🔥 ${s.streak} richtig in Folge! +10 🪙`); }
      s.xp += 10;
      s.daily.count++;
      if (s.daily.count >= s.dailyGoal && !s.daily.bonus) {
        s.daily.bonus = true; coins += 50;
        this.toast(`🎯 Tagesziel geschafft! +50 🪙`);
      }
    } else {
      st.w++;
      const { id, subject, topic, choices, correct, explain } = q;
      if (Questions.SUBJECTS[subject].bonus) { s.streak = 0; s.xp += 2; s.coins += coins; this.save(); this.updateHud(); return 0; }
      s.mistakes = [{ id, subject, topic, q: q.q, choices, correct, explain }, ...s.mistakes.filter(m => m.id !== id)].slice(0, 60);
      s.streak = 0;
      s.xp += 2;
    }
    s.coins += coins;
    if (this.level() > levelBefore) { this.toast(`⬆️ Aufstieg! Du bist jetzt: ${this.rank()}`); Sound.buy(); }
    this.save(); this.updateHud();
    return coins;
  },
  addCoins(n) { this.state.coins += n; this.save(); this.updateHud(); },

  // Seconds allowed for a question, scaled by the competition's time factor.
  // Harder calculations (topic + level) get extra seconds on top of the reading time.
  timeFor(q, factor = 1) {
    const l = this.topicLevel(q.subject, q.topic) || 1;
    let t;
    if (q.subject === 'kopfrechnen') {
      const [base, perLevel] = { einmaleins: [6, 2], plusminus: [7, 5], geteilt: [7, 4], punktstrich: [9, 5] }[q.topic] || [7, 3];
      t = base + perLevel * l;
    } else {
      t = Math.max(12, Math.min(35, 10 + q.q.length * 0.12 + q.choices.join('').length * 0.04));
      if (q.subject === 'mathe') {
        const extra = { gleichungen: 10, brueche: 7, prozent: 7, zuordnung: 7, terme: 5, rational: 3, winkel: 4 }[q.topic] || 4;
        t += extra + 4 * (l - 1);
      }
    }
    return Math.round(t * factor);
  },

  cupInfo() {
    const c = this.state.cup;
    const comp = COMPETITIONS[c.comp];
    if (!comp) {
      return { comp: LEGEND_LEAGUE, round: 'Spieltag', team: Questions.U.pick(TEAMS), time: LEGEND_LEAGUE.time, legend: true };
    }
    const [round, teamId] = comp.rounds[c.round];
    return { comp, round, team: TEAMS.find(t => t.id === teamId), time: comp.time, final: c.round === comp.rounds.length - 1 };
  },

  // Returns bonus coins and a message for the result screen.
  matchEnd(win, cup) {
    const s = this.state;
    if (win) s.matches.won++; else s.matches.lost++;
    let bonus = 0, msg = '';
    if (win && cup) {
      bonus = cup.team.derby ? 50 : 30;
      if (cup.legend) {
        bonus += cup.comp.prize; msg = `👑 Legenden-Sieg! +${cup.comp.prize} 🪙`;
      } else if (cup.final) {
        bonus += cup.comp.prize;
        s.trophies.push(cup.comp.name);
        s.cup = { comp: s.cup.comp + 1, round: 0 };
        const next = COMPETITIONS[s.cup.comp] || LEGEND_LEAGUE;
        msg = `${cup.comp.icon} ${cup.comp.name} GEWONNEN! +${cup.comp.prize} 🪙 – weiter geht's: ${next.name} (weniger Zeit pro Schuss!)`;
      } else {
        s.cup.round++;
        msg = `Weiter ins ${cup.comp.rounds[s.cup.round][0]}!`;
      }
    } else if (win) {
      bonus = 20;
    } else if (cup) {
      msg = 'Revanche? Das gleiche Spiel nochmal!';
    }
    s.coins += bonus; this.save(); this.updateHud();
    return { bonus, msg };
  },
  flightEnd(km) {
    if (km > this.state.bestKm) { this.state.bestKm = km; this.save(); return true; }
    return false;
  },

  pickOpponent() { return Questions.U.pick(TEAMS); },
  topicLabel(q) {
    const S = Questions.SUBJECTS[q.subject];
    const l = this.topicLevel(q.subject, q.topic);
    return `${S.icon} ${S.label} · ${S.topics[q.topic] || q.topic}${l ? ` · Stufe ${l}` : ''}`;
  },

  enabledTopics(only) {
    const s = this.state, out = [];
    for (const [sub, S] of Object.entries(Questions.SUBJECTS)) {
      if (only ? sub !== only : (!s.subjects[sub] || S.bonus)) continue;
      for (const t of Object.keys(S.topics)) {
        if (!s.disabled.includes(`${sub}|${t}`)) out.push([sub, t]);
      }
    }
    if (out.length) return out;
    const fallback = only || 'kopfrechnen';
    return Object.keys(Questions.SUBJECTS[fallback].topics).map(t => [fallback, t]);
  },

  // opts.exclude: topic keys not suited for a game (e.g. equations in the fast flight game).
  nextQuestion(max = 4, source = 'normal', only = null, opts = {}) {
    const s = this.state;
    const exclude = opts.exclude || [];
    // About every tenth question is a just-for-fun football quiz question.
    if (!only && source !== 'mistakes' && s.funQuiz !== false && Math.random() < 0.1) {
      const q = Questions.generate('fussball', 'quiz');
      if (q.id !== this.lastId) { this.lastId = q.id; return Questions.prepareQuestion(q, max); }
    }
    const pool = s.mistakes.filter(m => m.id !== this.lastId && (!only || m.subject === only) && Questions.SUBJECTS[m.subject] && !exclude.includes(m.topic));
    const pMistake = Math.min(0.25, 0.05 + 0.03 * pool.length);
    if (pool.length && (source === 'mistakes' || Math.random() < pMistake)) {
      const m = Questions.U.pick(pool.slice(0, 20));
      this.lastId = m.id;
      return Questions.prepareQuestion(m, max);
    }
    if (source === 'mistakes' && !s.mistakes.length && !this.mistakeToastShown) {
      this.mistakeToastShown = true;
      this.toast('🎉 Alle Fehler ausgebügelt! Jetzt kommen neue Fragen.');
    }
    // weight topics by error rate so weak topics come up more often
    const all = this.enabledTopics(only);
    const topics = all.filter(([, t]) => !exclude.includes(t)).length ? all.filter(([, t]) => !exclude.includes(t)) : all;
    const weights = topics.map(([sub, t]) => {
      const st = s.stats[`${sub}|${t}`];
      const f = s.focus.includes(`${sub}|${t}`) ? 3 : 1;
      if (!st) return 1.5 * f;
      const n = st.r + st.w;
      return (1 + 2 * (st.w + 1) / (n + 2)) * f;
    });
    let q;
    for (let tries = 0; tries < 6; tries++) {
      let r = Math.random() * weights.reduce((a, b) => a + b, 0), i = 0;
      while ((r -= weights[i]) > 0 && i < topics.length - 1) i++;
      const [sub, t] = topics[i];
      q = Questions.generate(sub, t, this.topicLevel(sub, t) || 1);
      if (q.id !== this.lastId) break;
    }
    this.lastId = q.id;
    return Questions.prepareQuestion(q, max);
  },

  // ------------------------------------------------------------ UI
  updateHud() {
    const s = this.state;
    if (s.daily.date !== todayStr()) s.daily = { date: todayStr(), count: 0, bonus: false };
    document.getElementById('hud-coins').textContent = `🪙 ${s.coins}`;
    document.getElementById('hud-balls').innerHTML = `${GOLDBALL} ${s.balls}`;
    document.getElementById('hud-level').textContent = `⭐ ${this.level()}`;
    document.getElementById('hud-daily').textContent = `🎯 ${Math.min(s.daily.count, s.dailyGoal)}/${s.dailyGoal}`;
    document.getElementById('btn-sound').textContent = s.sound ? '🔊' : '🔇';
  },

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3200);
  },

  home() {
    if (!this.state.name) return this.show('welcome');
    const s = this.state, l = this.level();
    const lo = 40 * (l - 1) ** 2, hi = 40 * l ** 2;
    const cup = this.cupInfo();
    const trophyCount = {};
    s.trophies.forEach(t => { trophyCount[t] = (trophyCount[t] || 0) + 1; });
    const shelf = COMPETITIONS.map(c => `<span class="trophy ${trophyCount[c.name] ? 'won' : ''}" title="${c.name}">${c.icon}<small>${c.name}</small></span>`).join('');
    const el = document.getElementById('screen-home');
    el.innerHTML = `
      <div class="hello">
        <div>
          <h1>Hallo ${escapeHtml(s.name)}! 👋</h1>
          <div class="rank">⚽ ${this.rank(l, false)} · ✈️ ${this.rank(l, true)} · Level ${l}
            <div class="bar"><i style="width:${Math.round(100 * (s.xp - lo) / (hi - lo))}%"></i></div>
          </div>
        </div>
        <div class="shelf">${shelf}</div>
        <div class="streak">🔥 ${s.days.count || 0} ${s.days.count === 1 ? 'Tag' : 'Tage'}<small>in Folge gelernt</small></div>
      </div>
      <div class="chips">
        ${Object.entries(Questions.SUBJECTS).filter(([, S]) => !S.bonus).map(([k, S]) => `<button class="chip ${s.subjects[k] ? 'on' : ''}" data-sub="${k}">${S.icon} ${S.label}</button>`).join('')}
      </div>
      <h3 class="group">⚽ Fußball</h3>
      <div class="cards">
        <button class="mode penalty" data-go="penalty">
          <span class="big">⚽</span><b>${cup.comp.icon} ${cup.comp.name}</b>
          <small>${cup.round}: Borussia – ${cup.team.name}${cup.team.derby ? ' (Derby!)' : ''}. Elfmeterschießen mit Zeitlimit!</small>
          <em>⏱ ${Math.round(cup.time * 100)} % Zeit · ${s.matches.won} Siege</em>
        </button>
        <button class="mode passgame" data-go="pass">
          <span class="big">🏟️</span><b>Passspiel</b>
          <small>Spiel den Ball zum richtigen Mitspieler – 3 Pässe, dann Torschuss!</small>
          <em>16 Fragen = 90 Minuten</em>
        </button>
        <button class="mode torjagd" data-go="sprint">
          <span class="big">⚡</span><b>Torjagd 90'</b>
          <small>Kopfrechnen auf Zeit: Jede richtige Rechnung ist ein Tor.</small>
          <em>Rekord: ${s.sprintBest} Tore · hier gibt's goldene Bälle ${GOLDBALL}</em>
        </button>
      </div>
      <h3 class="group">✈️ Fliegen</h3>
      <div class="cards">
        <button class="mode cockpitgame" data-go="cockpit">
          <span class="big">🧑‍✈️</span><b>Cockpit</b>
          <small>Steuere aus dem Cockpit durch die richtige von vier Karten – 12 Tore pro Flug.</small>
          <em>Rekord: ${s.bestCockpit || 0} Tore</em>
        </button>
        <button class="mode cargogame" data-go="cargo">
          <span class="big">📦</span><b>Mrija-Fracht</b>
          <small>Hol die richtige Kiste mit der An-225 und lande am richtigen Flughafen – 5 Lieferungen.</small>
          <em>Rekord: ${s.bestCargo || 0} Lieferungen</em>
        </button>
        <button class="mode flight" data-go="flight">
          <span class="big">✈️</span><b>Cargo-Flug</b>
          <small>Flieg durch das Tor mit der richtigen Antwort – 15 Tore pro Flug.</small>
          <em>${(PLANES.find(p => p.id === s.plane) || PLANES[0]).name} · Rekord ${s.bestKm} km</em>
        </button>
      </div>
      <h3 class="group">🏆 Sammeln & Üben</h3>
      <div class="cards">
        <button class="mode hangar" data-go="hangar">
          <span class="big">🛫</span><b>Hangar</b>
          <small>Neue Flugzeuge freischalten – größere Flieger bringen mehr Taler.</small>
          <em>${s.planes.length}/${PLANES.length} Flugzeuge</em>
        </button>
        <button class="mode album" data-go="album">
          <span class="big">🃏</span><b>Sammelalbum</b>
          <small>Die aktuelle Fohlen-Elf und Weltstars sammeln – wer schafft Jens Castrop?</small>
          <em>${s.cards.filter(id => CARDS.some(c => c.id === id)).length}/${CARDS.length} Karten</em>
        </button>
        <button class="mode mistakes" data-go="mistakes" ${s.mistakes.length ? '' : 'disabled'}>
          <span class="big">🔁</span><b>Fehler-Training</b>
          <small>Fragen, die schiefgingen, nochmal – als Freundschaftsspiel.</small>
          <em>${s.mistakes.length} offen</em>
        </button>
      </div>
      <button class="link" data-go="parents">👨‍👦 Eltern-Bereich</button>`;
    el.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.sub;
      const on = Object.values(s.subjects).filter(Boolean).length;
      if (s.subjects[k] && on === 1) return this.toast('Mindestens ein Fach muss an sein 😉');
      s.subjects[k] = !s.subjects[k]; this.save(); this.home();
    }));
    el.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      Sound.init();
      const go = b.dataset.go;
      if (go === 'penalty') this.startPenalty();
      if (go === 'mistakes') this.startPenalty('mistakes');
      if (go === 'sprint') this.startSprint();
      if (this.games[go]) this.startGame(go);
      if (go === 'flight') this.startFlight();
      if (go === 'hangar') this.hangar();
      if (go === 'album') this.album();
      if (go === 'parents') this.pinGate(() => this.parents());
    }));
    this.updateHud();
    this.show('home');
  },

  startPenalty(source = 'normal') { this.mistakeToastShown = false; this.show('penalty'); this.penalty.stage.resize(); this.penalty.start(source); },
  startFlight() { this.show('flight'); this.flight.stage.resize(); this.flight.start(); },
  startSprint() { this.show('sprint'); this.sprint.start(); },
  startGame(id) { this.show(id); this.games[id].start(); },

  hangar() {
    const s = this.state;
    const el = document.getElementById('screen-hangar');
    const next = PLANES.find(x => !s.planes.includes(x.id));
    el.innerHTML = `<h2>🛫 Hangar <small>Flugzeuge nacheinander freischalten. Größere Flugzeuge = mehr Taler pro richtiger Antwort (aber etwas schneller!)</small></h2>
      <div class="grid">${PLANES.map(p => {
        const owned = s.planes.includes(p.id), sel = s.plane === p.id;
        return `<div class="plane-card ${owned ? 'owned' : ''} ${sel ? 'sel' : ''}">
          <div class="photo"><img src="img/planes/${p.id}.jpg" alt="${p.name}" data-plane="${p.id}"></div>
          <small class="credit">${p.photo ? `Foto: ${p.photo}` : ""}</small>
          <h3>${p.name}</h3>
          <ul>${p.facts.map(f => `<li>${f}</li>`).join('')}</ul>
          <div class="row"><span>🪙 ×${p.mult}</span>
          ${sel ? '<button disabled>✔ Im Einsatz</button>'
            : owned ? `<button data-select="${p.id}">Auswählen</button>`
              : next && next.id === p.id
                ? `<button class="buy" data-buy="${p.id}" ${!this.canPay({ coins: p.price, balls: p.balls }) ? 'disabled' : ''}>Kaufen: ${this.costHtml({ coins: p.price, balls: p.balls })}</button>`
                : `<button disabled>🔒 Erst ${PLANES[PLANES.indexOf(p) - 1].name}</button>`}</div>
        </div>`;
      }).join('')}</div>`;
    el.querySelectorAll('img[data-plane]').forEach(img => img.addEventListener('error', () => {
      const cv = document.createElement('canvas');
      cv.width = 600; cv.height = 240;
      const ctx = cv.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 240); g.addColorStop(0, '#4aa3f0'); g.addColorStop(1, '#d6efff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 600, 240);
      const sprite = PlaneSprites[img.dataset.plane];
      delete PlaneSprites[img.dataset.plane];
      drawPlane(ctx, img.dataset.plane, 300, 135, 2.5, 0.3);
      if (sprite) PlaneSprites[img.dataset.plane] = sprite;
      img.replaceWith(cv);
      cv.closest('.plane-card').querySelector('.credit').textContent = '';
    }));
    el.querySelectorAll('[data-select]').forEach(b => b.addEventListener('click', () => { s.plane = b.dataset.select; this.save(); this.hangar(); }));
    el.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
      const p = PLANES.find(x => x.id === b.dataset.buy);
      const cost = { coins: p.price, balls: p.balls };
      if (!this.canPay(cost) || p !== PLANES.find(x => !s.planes.includes(x.id))) return;
      this.pay(cost); s.planes.push(p.id); s.plane = p.id; this.save(); this.updateHud();
      Sound.buy(); this.toast(`🎉 ${p.name} gehört jetzt dir!`); this.hangar();
    }));
    this.show('hangar');
  },

  // Fixed prices; the cards get more expensive in album order (see CARDS).
  cardCost(c) { return { coins: c.price, balls: c.balls }; },
  canPay(cost) { return this.state.coins >= cost.coins && this.state.balls >= cost.balls; },
  pay(cost) { this.state.coins -= cost.coins; this.state.balls -= cost.balls; },
  costHtml(cost) { return `${cost.coins} 🪙${cost.balls ? ` + ${cost.balls} ${GOLDBALL}` : ''}`; },
  addBalls(n) { this.state.balls += n; this.save(); this.updateHud(); },

  // Unlock conditions: needs.club = number of other Borussia players, needs.intl = number of international stars.
  cardProgress(c) {
    const own = id => this.state.cards.includes(id);
    if (!c.needs) return null;
    const [kind, n] = Object.entries(c.needs)[0];
    const have = CARDS.filter(x => x.id !== c.id && x.id !== 'bmg' && own(x.id) && (kind === 'club' ? x.club : !x.club)).length;
    return { have: Math.min(have, n), n, ok: have >= n, label: kind === 'club' ? 'Borussia-Spieler' : 'internationale Stars' };
  },

  album() {
    const s = this.state;
    const el = document.getElementById('screen-album');
    const owned = CARDS.filter(c => s.cards.includes(c.id));
    const pic = c => c.id === 'bmg'
      ? `<div class="pic crest"><img src="img/players/bmg.png" alt="" data-fallback="🐴"></div>`
      : c.credit ? `<div class="pic"><img src="img/players/${c.id}.jpg" alt="" data-fallback="${c.no}"></div>`
        : `<div class="pic nophoto"><span>${c.no}</span></div>`;
    el.innerHTML = `<h2>🃏 Sammelalbum <small>${owned.length}/${CARDS.length} Karten</small></h2>
      <div class="grid cards-grid">${CARDS.map(c => {
        const prog = this.cardProgress(c);
        if (s.cards.includes(c.id)) {
          return `<div class="pcard ${c.tier}">
            <div class="top"><span class="no">${c.no}</span><span class="flag">${c.flag}</span></div>
            ${pic(c)}<h3>${c.name}</h3><div class="pos">${c.pos}${c.clubName ? ` · ${c.clubName}` : ''}</div>
            ${c.highlight ? `<p class="hl">⭐ ${c.highlight}</p>` : ''}
            ${c.fact ? `<p>${c.fact}</p>` : ''}
            ${c.credit ? `<small class="credit">Foto: ${c.credit}</small>` : ''}</div>`;
        }
        const blocked = prog && !prog.ok;
        return `<div class="pcard locked ${c.tier}">
            ${pic(c)}<h3>${c.name}</h3><div class="pos">${c.pos}</div>
            ${prog ? `<p class="need">${prog.ok ? '🔓' : '🔒'} Erst ${prog.n} ${prog.label} sammeln (${prog.have}/${prog.n})</p>` : ''}
            <button data-card="${c.id}" ${!this.canPay(this.cardCost(c)) || blocked ? 'disabled' : ''}>Freischalten: ${this.costHtml(this.cardCost(c))}</button></div>`;
      }).join('')}</div>`;
    el.querySelectorAll('.pic img').forEach(img => img.addEventListener('error', () => {
      img.parentElement.classList.add('nophoto');
      img.replaceWith(Object.assign(document.createElement('span'), { textContent: img.dataset.fallback }));
    }));
    el.querySelectorAll('[data-card]').forEach(b => b.addEventListener('click', () => {
      const c = CARDS.find(x => x.id === b.dataset.card);
      const prog = this.cardProgress(c);
      const cost = this.cardCost(c);
      if (!this.canPay(cost) || (prog && !prog.ok)) return;
      this.pay(cost); s.cards.push(c.id); this.save(); this.updateHud();
      Sound.buy(); this.toast(`🎉 Neue Karte: ${c.name}!`); this.album();
    }));
    this.show('album');
  },

  // Parent area is protected by a 4–8 digit PIN (stored as a hash). The first time, the PIN is set.
  pinHash(pin) {
    let h = 5381;
    for (const ch of 'ff-salt:' + pin) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
    return h.toString(36);
  },
  pinDialog(title, hint, cb) {
    const d = document.createElement('div');
    d.className = 'pin-overlay';
    d.innerHTML = `<div class="pin-box"><h3>🔒 ${title}</h3><p>${hint}</p>
      <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off">
      <p class="pin-err"></p>
      <div class="row"><button class="primary">OK</button><button>Abbrechen</button></div></div>`;
    document.body.appendChild(d);
    const inp = d.querySelector('input'), [ok, cancel] = d.querySelectorAll('button');
    const close = () => d.remove();
    const submit = () => { const err = cb(inp.value.trim()); if (err) { d.querySelector('.pin-err').textContent = err; inp.value = ''; inp.focus(); } else close(); };
    ok.addEventListener('click', submit);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    cancel.addEventListener('click', close);
    setTimeout(() => inp.focus(), 50);
  },
  setPin(then) {
    this.pinDialog('Eltern-PIN festlegen', 'Neue PIN (4–8 Ziffern):', pin => {
      if (!/^\d{4,8}$/.test(pin)) return 'Bitte 4 bis 8 Ziffern eingeben.';
      setTimeout(() => this.pinDialog('PIN wiederholen', 'Bitte die PIN noch einmal eingeben:', pin2 => {
        if (pin2 !== pin) return 'Stimmt nicht überein – nochmal versuchen.';
        this.state.pin = this.pinHash(pin); this.save(); this.toast('🔒 PIN gespeichert'); if (then) then();
      }), 0);
    });
  },
  pinGate(then) {
    if (!this.state.pin) return this.setPin(then);
    this.pinDialog('Eltern-Bereich', 'Bitte PIN eingeben:', pin => {
      if (this.pinHash(pin) !== this.state.pin) { Sound.fail(); return 'Falsche PIN.'; }
      then();
    });
  },

  parents() {
    const s = this.state;
    const el = document.getElementById('screen-parents');
    let totR = 0, totW = 0;
    const rows = Object.entries(Questions.SUBJECTS).filter(([, S]) => !S.bonus).map(([sub, S]) => {
      const trs = Object.entries(S.topics).map(([t, label]) => {
        const st = s.stats[`${sub}|${t}`] || { r: 0, w: 0 };
        totR += st.r; totW += st.w;
        const n = st.r + st.w, pct = n ? Math.round(100 * st.r / n) : null;
        const off = s.disabled.includes(`${sub}|${t}`);
        const lv = this.topicLevel(sub, t);
        return `<tr><td><label><input type="checkbox" data-topic="${sub}|${t}" ${off ? '' : 'checked'}> ${label}</label></td>
          <td><label title="Schwerpunkt: 3× häufiger"><input type="checkbox" data-focus="${sub}|${t}" ${s.focus.includes(`${sub}|${t}`) ? 'checked' : ''}> 🎯</label></td>
          <td>${lv ? '★'.repeat(lv) + '☆'.repeat((Questions.MAX_LEVEL[sub] || 3) - lv) : '–'}</td>
          <td>${n}</td><td>${pct === null ? '–' : `<div class="bar small ${pct < 60 ? 'warn' : ''}"><i style="width:${pct}%"></i></div> ${pct} %`}</td></tr>`;
      }).join('');
      return `<h3>${S.icon} ${S.label}</h3><table><tr><th>Thema (an/aus)</th><th>Schwerpunkt</th><th>Stufe</th><th>Fragen</th><th>richtig</th></tr>${trs}</table>`;
    }).join('');
    const cup = this.cupInfo();
    el.innerHTML = `<h2>👨‍👦 Eltern-Bereich</h2>
      <div class="panel">
        <p><b>${totR + totW}</b> Fragen beantwortet, davon <b>${totR + totW ? Math.round(100 * totR / (totR + totW)) : 0} %</b> richtig ·
        Lerntage in Folge: <b>${s.days.count}</b> · Offene Fehler: <b>${s.mistakes.length}</b></p>
        <p>Pokal-Weg: <b>${cup.comp.name} – ${cup.round}</b> · Titel: <b>${s.trophies.length}</b> · Torjagd-Rekord: <b>${s.sprintBest}</b> · Flug-Rekord: <b>${s.bestKm} km</b></p>
        <p class="hint">Kopfrechnen hat 4, Mathe 3 Stufen pro Thema. Die Stufe passt sich an Fehlerquote UND Tempo an: Sind von den letzten 6 Antworten mind. 5 richtig und schnell, geht es hoch; bei 3 oder mehr Fehlern oder sehr langsamen Antworten runter. 🎯 = Schwerpunkt (kommt 3× häufiger). Goldene Bälle gibt es nur in der Torjagd (Kopfrechnen) – sie werden für Karten und Flugzeuge gebraucht.
        Themen mit vielen Fehlern kommen häufiger; falsche Antworten werden wiederholt, bis sie sitzen.</p>
      </div>
      <div class="panel two">
        <label>Name <input id="p-name" value="${escapeHtml(s.name)}"></label>
        <label>Tagesziel (richtige Antworten) <input id="p-goal" type="number" min="5" max="100" value="${s.dailyGoal}"></label>
        <label class="check"><input id="p-fun" type="checkbox" ${s.funQuiz !== false ? 'checked' : ''}> ⚽ Fußball-Quizfragen einstreuen (ca. jede 10. Frage, nur zum Spaß)</label>
      </div>
      <div class="panel">${rows}</div>
      <div class="panel actions">
        <button id="p-save" class="primary">💾 Speichern</button>
        <button id="p-clear-mistakes">Fehlerliste leeren</button>
        <button id="p-pin">🔒 PIN ändern</button>
        <button id="p-reset" class="danger">Alles zurücksetzen</button>
      </div>`;
    el.querySelector('#p-save').addEventListener('click', () => {
      s.name = el.querySelector('#p-name').value.trim() || s.name;
      s.dailyGoal = Math.max(5, Math.min(100, +el.querySelector('#p-goal').value || 20));
      s.funQuiz = el.querySelector('#p-fun').checked;
      s.disabled = [...el.querySelectorAll('[data-topic]')].filter(c => !c.checked).map(c => c.dataset.topic);
      s.focus = [...el.querySelectorAll('[data-focus]')].filter(c => c.checked).map(c => c.dataset.focus);
      this.save(); this.updateHud(); this.toast('Gespeichert ✔'); this.parents();
    });
    el.querySelector('#p-pin').addEventListener('click', () => this.setPin());
    el.querySelector('#p-clear-mistakes').addEventListener('click', () => { s.mistakes = []; this.save(); this.parents(); });
    el.querySelector('#p-reset').addEventListener('click', () => {
      if (!confirm('Wirklich ALLES zurücksetzen (Taler, Flugzeuge, Karten, Pokale, Statistik)?')) return;
      const pin = this.state.pin;
      this.state = DEFAULT_STATE(); this.state.pin = pin; this.save(); this.updateHud(); this.show('welcome');
    });
    this.show('parents');
  },

  showResult({ title, lines, again, win }) {
    const el = document.getElementById('screen-result');
    el.innerHTML = `<div class="result ${win ? 'win' : ''}">
      <h1>${title}</h1>${lines.filter(Boolean).map(l => `<p>${l}</p>`).join('')}
      <div class="row"><button class="primary" id="r-again">🔄 Nochmal</button><button id="r-home">🏠 Menü</button></div></div>`;
    el.querySelector('#r-again').addEventListener('click', again);
    el.querySelector('#r-home').addEventListener('click', () => this.home());
    if (win) Sound.buy();
    this.show('result');
  },
};

window.addEventListener('DOMContentLoaded', () => App.init());
