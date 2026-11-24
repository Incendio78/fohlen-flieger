'use strict';

// "Torjagd 90'": mental arithmetic against the clock, answers typed on a number pad.
const SPRINT_SECONDS = 90;
const SPRINT_RATINGS = [
  [0, 'Aufwärmen 🏃'], [8, 'Kreisliga-Knipser ⚽'], [15, 'Bundesliga-Stürmer 💪'],
  [22, 'Nationalspieler 🇩🇪'], [30, 'Haaland-Niveau 🤖'], [41, 'Lewandowski-Rekord! 🏆'],
];

class SprintGame {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('screen-sprint');
    this.qEl = this.el.querySelector('.sprint-q');
    this.fbEl = this.el.querySelector('.sprint-fb');
    this.metaEl = this.el.querySelector('.sprint-meta');
    this.clockEl = this.el.querySelector('.clock');
    this.goalsEl = this.el.querySelector('.goals');
    this.bestEl = this.el.querySelector('.best');
    this.boardEl = this.el.querySelector('.sprint-board');
    this.timerBar = this.el.querySelector('.timer i');
    this.el.querySelectorAll('.keypad button').forEach(b => b.addEventListener('pointerdown', e => {
      e.preventDefault();
      this.key(b.dataset.k);
    }));
    window.addEventListener('keydown', e => {
      if (!this.running) return;
      if (e.key >= '0' && e.key <= '9') this.key(e.key);
      else if (e.key === 'Backspace') this.key('del');
      else if (e.key === 'Enter') this.key('ok');
    });
  }

  start() {
    this.left = SPRINT_SECONDS;
    this.goals = 0; this.wrong = 0; this.coins = 0;
    this.input = ''; this.locked = false;
    this.running = true;
    this.showBalls();
    this.goalsEl.textContent = '⚽ 0';
    this.fbEl.textContent = 'Tippe das Ergebnis ein – los geht\'s!';
    this.fbEl.className = 'sprint-fb';
    this.next();
    this.last = performance.now();
    clearInterval(this.tick);
    this.tick = setInterval(() => this.update(), 100);
    Sound.whistle();
  }
  showBalls() {
    this.bestEl.innerHTML = `Rekord ${this.app.state.sprintBest} · ${GOLDBALL} ${Math.floor(Math.max(0, this.goals - this.wrong) / 5)}`;
  }
  stop() { this.running = false; clearInterval(this.tick); clearTimeout(this.lockT); }

  next() {
    this.q = this.app.nextQuestion(2, 'normal', 'kopfrechnen');
    this.input = '';
    this.qStart = performance.now();
    this.metaEl.textContent = this.app.topicLabel(this.q);
    this.render();
  }

  render(showCorrect = false) {
    const val = showCorrect ? this.q.correct : (this.input || '?');
    const cls = showCorrect ? 'in bad' : this.input ? 'in' : 'in empty';
    this.qEl.innerHTML = escapeHtml(this.q.q).replace('?', `<span class="${cls}">${escapeHtml(val)}</span>`);
  }

  key(k) {
    if (this.running && this.locked && k === 'ok') return this.release();
    if (!this.running || this.locked) return;
    Sound.init();
    if (k === 'del') this.input = this.input.slice(0, -1);
    else if (k === 'ok') { if (this.input) this.check(); return; }
    else if (this.input.length < 5) this.input += k;
    this.render();
    if (this.input.length >= this.q.correct.length) this.check();
  }

  check() {
    const ok = this.input === this.q.correct;
    this.coins += this.app.record(this.q, ok, performance.now() - this.qStart, 0.4);
    if (ok) {
      this.goals++;
      this.goalsEl.textContent = `⚽ ${this.goals}`;
      this.showBalls();
      this.boardEl.classList.remove('flash'); void this.boardEl.offsetWidth; this.boardEl.classList.add('flash');
      Sound.kick(); Sound.coin();
      this.fbEl.textContent = Questions.U.pick(['TOR! ⚽', 'Treffer!', 'Drin!', 'Wie Haaland!', 'Stark!', 'Tooor!']);
      this.fbEl.className = 'sprint-fb good';
      this.next();
    } else {
      this.wrong++; this.showBalls();
      Sound.fail();
      this.locked = true;
      this.render(true);
      this.fbEl.innerHTML = `❌ Du: ${escapeHtml(this.input)} – <small>${escapeHtml(this.q.explain)}</small> <button class="primary fb-next">Weiter ▶</button>`;
      this.fbEl.className = 'sprint-fb bad';
      this.fbEl.querySelector('.fb-next').addEventListener('click', () => this.release());
    }
  }

  // The clock stands still while the correct answer is shown.
  release() {
    if (!this.locked) return;
    this.locked = false;
    this.fbEl.textContent = ''; this.fbEl.className = 'sprint-fb';
    if (this.running) this.next();
  }

  update() {
    const now = performance.now();
    if (!this.locked) this.left -= (now - this.last) / 1000;
    this.last = now;
    const minute = Math.min(90, Math.floor((SPRINT_SECONDS - this.left) * 90 / SPRINT_SECONDS));
    this.clockEl.textContent = `${minute}'`;
    const frac = Math.max(0, this.left / SPRINT_SECONDS);
    this.timerBar.style.width = `${frac * 100}%`;
    this.timerBar.classList.toggle('low', frac < 0.2);
    if (this.left <= 0) this.end();
  }

  end() {
    this.stop();
    Sound.whistle();
    const s = this.app.state;
    const record = this.goals > s.sprintBest;
    if (record) { s.sprintBest = this.goals; this.app.addCoins(20); this.coins += 20; }
    // Golden balls: 1 per 5 goals (wrong answers count against), +2 for a record, +1 for the first Torjagd of the day.
    const first = s.sprintDay !== todayStr();
    const balls = Math.floor(Math.max(0, this.goals - this.wrong) / 5) + (record && this.goals >= 5 ? 2 : 0) + (first && this.goals >= 5 ? 1 : 0);
    if (this.goals >= 5) s.sprintDay = todayStr();
    this.app.addBalls(balls);
    const rating = SPRINT_RATINGS.filter(([n]) => this.goals >= n).pop()[1];
    this.app.showResult({
      title: record ? `🏆 Neuer Rekord: ${this.goals} Tore!` : `Abpfiff: ${this.goals} Tore`,
      lines: [
        `Bewertung: <b>${rating}</b>`,
        `${this.goals} richtig, ${this.wrong} falsch`,
        `🪙 ${this.coins} Taler verdient${record ? ' (inkl. 20 Rekordprämie)' : ''}`,
        `<b>${GOLDBALL} ${balls} ${balls === 1 ? 'goldener Ball' : 'goldene Bälle'} verdient!</b> <small>(1 pro 5 Tore, Fehler zählen dagegen${first ? ', +1 für die erste Torjagd heute' : ''}${record ? ', +2 Rekord' : ''})</small>`,
        'Zum Vergleich: Robert Lewandowski schoss 2020/21 in einer Bundesliga-Saison 41 Tore – Rekord!',
      ],
      again: () => this.app.startSprint(),
      win: record,
    });
  }
}
